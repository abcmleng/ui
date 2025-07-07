import React, { useEffect, useState } from 'react';
import { Camera, RotateCcw } from 'lucide-react';
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
      <div className="h-screen w-full flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
          <div className="max-w-md mx-auto text-center">
            <img
              className="h-8 mx-auto"
              src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
              alt="IDMerit Logo"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4 min-h-0">
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
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
          <div className="max-w-md mx-auto text-center">
            <span className="text-sm text-gray-500">Powered by IDMerit</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="max-w-md mx-auto text-center">
          <img
            className="h-8 mx-auto"
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
          />
          <h1 className="text-lg font-semibold text-gray-900 mt-2">Take Your Selfie</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 min-h-0">
        <div className="w-full max-w-md mx-auto flex flex-col h-full">
          {/* Camera Area */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 min-h-0">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden h-full min-h-[300px]">
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
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-2 border-white/60 rounded-full w-32 h-40" />
                  </div>
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                    </div>
                  )}
                </>
              ) : (
                <img src={capturedImage.url} alt="Captured selfie" className="w-full h-full object-cover" />
              )}
            </div>
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {uploadError}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!capturedImage ? (
              <button
                onClick={handleCapture}
                disabled={!isStreaming || isCapturing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isCapturing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Capturing...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Take Photo
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleRetake}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className="max-w-md mx-auto text-center">
          <span className="text-sm text-gray-500">Powered by IDMerit</span>
        </div>
      </div>
    </div>
  );
};