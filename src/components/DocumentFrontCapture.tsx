import React, { useEffect, useState } from 'react';
import { CreditCard, RotateCcw, Camera } from 'lucide-react';
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
      <div className="h-screen w-full flex flex-col bg-slate-50 safe-area-inset">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 flex-shrink-0">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-center">
              <img
                className="h-8"
                src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
                alt="IDMerit"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center p-4 min-h-0">
          <div className="w-full max-w-md animate-fade-in">
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
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 flex-shrink-0">
          <div className="max-w-md mx-auto px-4 py-3 text-center">
            <span className="text-sm text-slate-500">Powered by IDMerit</span>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 safe-area-inset">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 flex-shrink-0">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-center mb-2">
            <img
              className="h-8"
              src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
              alt="IDMerit"
            />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-slate-900">Document Front</h1>
            <p className="text-sm text-slate-600 mt-1">Align your document within the frame</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 min-h-0">
        <div className="w-full max-w-md mx-auto flex flex-col h-full">
          {/* Camera Container */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-200 p-4 mb-4 min-h-0">
            <div className="relative bg-slate-900 rounded-xl overflow-hidden h-full min-h-[320px]">
              {!capturedImage ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Document Guide Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center camera-overlay">
                    <div className="relative">
                      <div className="w-64 h-40 border-3 border-white/70 rounded-lg shadow-lg"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <CreditCard className="w-12 h-12 text-white/50" />
                      </div>
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                        <p className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                          Align document here
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Loading Overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-10 w-10 border-3 border-white border-t-transparent mx-auto mb-3"></div>
                        <p className="text-sm font-medium">Starting camera...</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <img
                  src={capturedImage.url}
                  alt="Document front"
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Status Messages */}
          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm animate-fade-in">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>{uploadError}</span>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-lg mb-4 text-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent flex-shrink-0"></div>
                <span>Processing document...</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!capturedImage ? (
              <button
                onClick={handleCapture}
                disabled={!isStreaming || isCapturing || isUploading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg btn-touch focus-ring"
              >
                {isCapturing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Capturing...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    <span>Capture Document</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleRetake}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg btn-touch focus-ring"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Retake Photo</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 flex-shrink-0">
        <div className="max-w-md mx-auto px-4 py-3 text-center">
          <span className="text-sm text-slate-500">Powered by IDMerit</span>
        </div>
      </footer>
    </div>
  );
};