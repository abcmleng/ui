import React, { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { CapturedImage } from '../types/kyc';
import { kycApiService } from '../services/kycApi';
import { ErrorPage, CaptureError } from './ErrorPage';

interface DocumentFrontCaptureProps {
  onCapture: (image: CapturedImage) => void;
  onNext: () => void;
  verificationId: string;
  onError?: (errorMessage: string) => void;
}

export const DocumentFrontCapture: React.FC<DocumentFrontCaptureProps> = ({
  onCapture,
  onNext,
  verificationId,
  onError,
}) => {
  const {
    videoRef,
    isStreaming,
    isLoading,
    startCamera,
    stopCamera,
    captureImage,
  } = useCamera();

  const [capturedImage, setCapturedImage] = useState<CapturedImage | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isClearImage, setIsClearImage] = useState(false);
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
        timestamp: new Date(),
      };
      setCapturedImage(image);
      onCapture(image);
      await handleCheckQuality(image);
    } else {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.url);
    }
    setCapturedImage(null);
    setUploadError(null);
    setIsClearImage(false);
    setCaptureError(null);
    startCamera('environment');
  };

  const handleCheckQuality = async (image: CapturedImage) => {
    if (!image) return;

    setIsUploading(true);
    setUploadError(null);
    setIsClearImage(false);
    setCaptureError(null);

    try {
      const response = await kycApiService.processDocument({
        image: image.blob,
        type: 'document-front',
        verificationId,
      });

      if (response.message === 'CLEAR IMAGE') {
        setIsClearImage(true);

        const uuid =
          'ML_' +
          (crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 15));

        const ocrResponse = await kycApiService.processOCRDocument(
          image.blob,
          uuid
        );
        stopCamera();
        onCapture(image);
        onNext();
      } else {
        setUploadError(response.message || 'Document is not clear. Please retake.');
        setCaptureError({
          type: 'validation',
          message: response.message || 'Document is not clear. Please retake.',
          tips: ['Ensure the document is fully visible.', 'Avoid glare or shadows.'],
        });
        if (onError) onError(response.message || 'Document is not clear. Please retake.');
      }
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
      <div className="fixed inset-0 flex flex-col bg-slate-50 overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
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
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-purple-50 to-pink-100 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex justify-center">
          <img
            className="h-8"
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Title Section */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-8 text-center">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-white" />
              <h1 className="text-2xl font-bold text-white mb-2">Document Front</h1>
              <p className="text-purple-100 text-sm">Align your ID front within the frame</p>
            </div>

            {/* Camera Section */}
            <div className="p-6">
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-[4/3] mb-6">
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
                      <div className="w-80 h-52 border-4 border-white/60 rounded-2xl flex items-center justify-center shadow-lg">
                        <div className="text-white/80 text-center">
                          <CreditCard className="w-16 h-16 mx-auto mb-2" />
                          <p className="text-sm font-medium">Align ID Front</p>
                        </div>
                      </div>
                    </div>
                    {isLoading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                      </div>
                    )}
                  </>
                ) : (
                  <img
                    src={capturedImage.url}
                    alt="Document front"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                  {uploadError}
                </div>
              )}

              {isUploading && (
                <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-lg mb-4 text-sm text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    Processing document...
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {!capturedImage && (
                  <button
                    onClick={handleCapture}
                    disabled={!isStreaming || isCapturing || isUploading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isCapturing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Capturing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Capture Document
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex justify-center items-center gap-2">
          <span className="text-sm text-gray-500">Powered by</span>
          <img
            className="h-5"
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
          />
        </div>
      </div>
    </div>
  );
};