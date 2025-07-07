import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
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
      <div className="h-screen flex flex-col bg-slate-50">
        {/* Header */}
        <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200 px-4 py-2">
          <div className="flex justify-center">
            <img
              className="h-6"
              src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
              alt="IDMerit Logo"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-3 min-h-0">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-4">
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
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-center items-center gap-2">
            <span className="text-xs text-gray-500">Powered by</span>
            <img
              className="h-4"
              src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
              alt="IDMerit Logo"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200 px-4 py-2">
        <div className="flex justify-center">
          <img
            className="h-6"
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center p-3 min-h-0 overflow-hidden">
        <div className="w-full max-w-sm mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Title Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-4 text-center">
              <Camera className="w-8 h-8 mx-auto mb-2 text-white" />
              <h1 className="text-lg font-bold text-white mb-1">Take Your Selfie</h1>
              <p className="text-blue-100 text-xs">Position your face within the oval frame</p>
            </div>

            {/* Camera Section */}
            <div className="p-3">
              <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-[3/4] mb-3">
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
                      <div className="border-3 border-white/60 rounded-full w-40 h-48 shadow-lg" />
                    </div>
                    {isLoading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
                      </div>
                    )}
                  </>
                ) : (
                  <img src={capturedImage.url} alt="Captured selfie" className="w-full h-full object-cover" />
                )}
              </div>

              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-3 text-xs">
                  {uploadError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {!capturedImage ? (
                  <button
                    onClick={handleCapture}
                    disabled={!isStreaming || isCapturing}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-sm"
                  >
                    {isCapturing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Capturing...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4" />
                        Take Selfie
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleRetake}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg text-sm"
                  >
                    Retake Photo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-center items-center gap-2">
          <span className="text-xs text-gray-500">Powered by</span>
          <img
            className="h-4"
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
          />
        </div>
      </div>
    </div>
  );
};