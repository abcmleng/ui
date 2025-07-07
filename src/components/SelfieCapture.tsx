import React, { useEffect, useState } from 'react';
import { Camera, RotateCcw, User } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { CapturedImage } from '../types/kyc';
import { kycApiService } from '../services/kycApi';
import { ErrorPage, CaptureError } from './ErrorPage';

interface SelfieCaptureProps {
  onCapture?: (image: CapturedImage) => void;
  onNext: () => void;
  verificationId: string;
  onError?: (errorMessage: string) => void;
}

export const SelfieCapture: React.FC<SelfieCaptureProps> = ({
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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState<CaptureError | null>(null);

  useEffect(() => {
    startCamera('user');
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = async () => {
    setIsCapturing(true);
    const result = await captureImage();
    if (result) {
      const image: CapturedImage = { blob: result.blob, url: result.url, timestamp: new Date() };
      setCapturedImage(image);
      onCapture?.(image);
      await handleUpload(image);
    }
    setIsCapturing(false);
  };

  const handleUpload = async (image: CapturedImage) => {
    setUploadError(null);
    setCaptureError(null);
    try {
      const response = await kycApiService.processImage({
        image: image.blob,
        type: 'selfie',
        verificationId,
      });
      if (!response || !response.live) throw new Error('No face detected. Please try again.');
      if (response.live === 'FAKE') throw new Error(response.message || 'Fake face detected.');
      if (response.live !== 'REAL') throw new Error(response.message || 'Face verification failed.');

      stopCamera();
      onNext();
    } catch (error: any) {
      const msg = error?.message || 'Network error. Please try again.';
      setUploadError(msg);
      setCaptureError({
        type: 'network',
        message: msg,
        tips: ['Check your internet connection.', 'Try again later.'],
      });
      onError?.(msg);
    }
  };

  const handleRetake = () => {
    if (capturedImage) URL.revokeObjectURL(capturedImage.url);
    setCapturedImage(null);
    setUploadError(null);
    setCaptureError(null);
    startCamera('user');
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
            <h1 className="text-xl font-semibold text-slate-900">Take Your Selfie</h1>
            <p className="text-sm text-slate-600 mt-1">Position your face within the oval frame</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 min-h-0">
        <div className="w-full max-w-sm mx-auto flex flex-col h-full">
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
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  
                  {/* Face Guide Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none camera-overlay">
                    <div className="relative">
                      <div className="w-40 h-48 border-3 border-white/70 rounded-full shadow-lg"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <User className="w-12 h-12 text-white/50" />
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
                  alt="Captured selfie" 
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

          {/* Action Buttons */}
          <div className="space-y-3">
            {!capturedImage ? (
              <button
                onClick={handleCapture}
                disabled={!isStreaming || isCapturing}
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
                    <span>Take Selfie</span>
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