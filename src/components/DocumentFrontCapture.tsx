import React, { useEffect, useState } from 'react';
import { CreditCard, RotateCcw } from 'lucide-react';
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
      <div className="h-screen w-full flex flex-col bg-gray-50 safe-area-all">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0 safe-area-top">
          <div className="max-w-md mx-auto text-center">
            <img
              className="h-8 mx-auto"
              src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
              alt="IDMerit Logo"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4 min-h-0 safe-area-x">
          <div className="w-full max-w-md">
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

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0 safe-area-bottom">
          <div className="max-w-md mx-auto text-center">
            <span className="text-sm text-gray-500">Powered by IDMerit</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 safe-area-all">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0 safe-area-top">
        <div className="max-w-md mx-auto text-center">
          <img
            className="h-8 mx-auto"
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
          />
          <h1 className="text-lg font-semibold text-gray-900 mt-2">Document Front</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 min-h-0 safe-area-x">
        <div className="w-full max-w-md mx-auto flex flex-col h-full">
          {/* Camera Area */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 min-h-0">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden h-full min-h-[280px]">
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
                    <div className="border-2 border-white/60 rounded-lg w-48 h-32 flex items-center justify-center">
                      <CreditCard className="w-8 h-8 text-white/80" />
                    </div>
                  </div>
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
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
          </div>

          {/* Status Messages */}
          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {uploadError}
            </div>
          )}

          {isUploading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-600 p-3 rounded-lg mb-4 text-sm text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                Processing document...
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mobile-portrait-adjust">
            {!capturedImage ? (
              <button
                onClick={handleCapture}
                disabled={!isStreaming || isCapturing || isUploading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-4 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[48px]"
              >
                {isCapturing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Capturing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Capture Document
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleRetake}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-4 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[48px]"
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0 safe-area-bottom">
        <div className="max-w-md mx-auto text-center">
          <span className="text-sm text-gray-500">Powered by IDMerit</span>
        </div>
      </div>
    </div>
  );
};