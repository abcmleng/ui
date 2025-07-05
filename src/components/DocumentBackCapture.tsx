import React, { useEffect, useState } from 'react';
import { CreditCard, RotateCcw, Check, Upload } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { CapturedImage } from '../types/kyc';
import { kycApiService } from '../services/kycApi';
import { ErrorPage, CaptureError } from './ErrorPage';

interface DocumentBackCaptureProps {
  onCapture: (image: CapturedImage) => void;
  onNext: () => void;
  verificationId: string;
  onError?: (errorMessage: string) => void;
}

export const DocumentBackCapture: React.FC<DocumentBackCaptureProps> = ({
  onCapture,
  onNext,
  verificationId,
  onError
}) => {
  const {
    videoRef,
    isStreaming,
    isLoading,
    error,
    startCamera,
    stopCamera,
    captureImage
  } = useCamera();

  const [capturedImage, setCapturedImage] = useState<CapturedImage | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isClearImage, setIsClearImage] = useState(false);
  const [apiImageUrl, setApiImageUrl] = useState<string | null>(null);

  const [captureError, setCaptureError] = useState<CaptureError | null>(null);

  useEffect(() => {
    startCamera('environment');
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = async () => {
    setIsCapturing(true);
    const result = await captureImage();

    if (result) {
      const image: CapturedImage = {
        blob: result.blob,
        url: result.url,
        timestamp: new Date()
      };
      setCapturedImage(image);
      onCapture(image);
      await handleCheckQuality(image); // Pass image to handleCheckQuality
    }
    setIsCapturing(false);
  };

  const handleRetake = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.url);
    }
    setCapturedImage(null);
    setUploadError(null);
    setIsClearImage(false);
    setApiImageUrl(null);
    setCaptureError(null);
    startCamera('environment');
  };

  const handleCheckQuality = async (image: CapturedImage) => {
    if (!image) return;

    setIsUploading(true);
    setUploadError(null);
    setIsClearImage(false);
    setApiImageUrl(null);
    setCaptureError(null);

    try {
      const response = await kycApiService.processDocument({
        image: image.blob,
        type: 'document-back',
        verificationId
      });

      console.log(`[DocumentBackCapture] [API RESPONSE]`, response);

      if (response.message === 'CLEAR IMAGE') {
        setIsClearImage(true);

        // Generate UUID prefixed with "ML_"
        const uuid = 'ML_' + (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15));

        // Call OCR API
        const ocrResponse = await kycApiService.processOCRDocument(image.blob, uuid);
        console.log('[DocumentBackCapture] OCR API Response:', ocrResponse);

        stopCamera();
        onNext(); // Proceed to next step after successful quality check
      } else {
        setUploadError(response.message || 'Document is not clear. Please retake.');
        setCaptureError({
          type: 'validation',
          message: response.message || 'Document is not clear. Please retake.',
          tips: ['Ensure the document is fully visible.', 'Avoid glare or shadows.'],
        });
        if (onError) onError(response.message || 'Document is not clear. Please retake.');
      }

      // Removed usage of response.image as it does not exist on KYCApiResponse
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Network error. Please try again.';
      setUploadError(errorMessage);
      setCaptureError({
        type: 'network',
        message: errorMessage,
        tips: ['Check your internet connection.', 'Try again later.'],
      });
      if (onError) onError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  if (captureError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-3xl  overflow-hidden p-6">
            <ErrorPage
              error={captureError}
              onRetry={() => {
                setCaptureError(null);
                handleRetake();
              }}
              onBack={() => {
                setCaptureError(null);
                handleRetake();
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-3xl overflow-hidden">
            <div className="p-6 text-center bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              <CreditCard className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Document Back</h2>
              <p className="text-purple-100">
                Align your ID back within the frame
              </p>
            </div>

          <div className="p-6">
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden mb-6 aspect-[4/3]">
              {!capturedImage ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-80 h-52 border-4 border-white/50 rounded-2xl flex items-center justify-center">
                      <div className="text-white/70 text-center">
                        <CreditCard className="w-16 h-16 mx-auto mb-2" />
                        <p className="text-sm">Align ID back</p>
                      </div>
                    </div>
                  </div>
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                  )}
                </>
              ) : (
                <img
                  src={capturedImage.url}
                  alt="Document back"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {uploadError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {uploadError}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {isUploading && (
                <div className="text-center text-purple-600 font-semibold mb-2">
                  Processing...
                </div>
              )}
              <div className="flex gap-3">
                {!capturedImage ? (
                  <button
                    onClick={handleCapture}
                    disabled={!isStreaming || isCapturing || isUploading}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2"
                  >
                    {isCapturing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <CreditCard className="w-5 h-5" />
                    )}
                    {isCapturing ? 'Capturing...' : 'Capture Document'}
                  </button>
                ) : (
                  <>
                    {!isClearImage ? (
                      null
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
