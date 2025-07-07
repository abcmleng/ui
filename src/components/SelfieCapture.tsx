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
        <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200 px-2 py-1">
          <div className="flex justify-center">
            <img className="h-4" src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg" alt="IDMerit Logo" />
          </div>
        </div>

        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center p-2 min-h-0">
          <div className="w-full max-w-xs bg-white rounded-xl shadow p-3">
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
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-2 py-1">
          <div className="flex justify-center items-center gap-1">
            <span className="text-[10px] text-gray-500">Powered by</span>
            <img className="h-3" src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg" alt="IDMerit Logo" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200 px-2 py-1">
        <div className="flex justify-center">
          <img className="h-6" src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg" alt="IDMerit Logo" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center p-2 min-h-0 overflow-hidden">
        <div className="w-full max-w-xs mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Title */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2 text-center">
              <Camera className="w-5 h-5 mx-auto mb-1 text-white" />
              <h1 className="text-sm font-semibold text-white mb-0.5">Take Your Selfie</h1>
              <p className="text-blue-100 text-[10px]">Position your face within the oval frame</p>
            </div>

            {/* Camera Feed */}
            <div className="p-2">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-[3/4] mb-2">
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
                    <div className="border-2 border-white/60 rounded-full w-60 h-80 shadow" />
                  </div>


                    {isLoading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      </div>
                    )}
                  </>
                ) : (
                  <img src={capturedImage.url} alt="Captured selfie" className="w-full h-full object-cover" />
                )}
              </div>

              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-2 py-1 rounded text-[11px] mb-2">
                  {uploadError}
                </div>
              )}

              {/* Buttons */}
              <div className="space-y-1">
                {!capturedImage ? (
                  <button
                    onClick={handleCapture}
                    disabled={!isStreaming || isCapturing}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium py-2 px-3 rounded-md transition-all duration-200 flex items-center justify-center gap-1 shadow text-xs"
                  >
                    {isCapturing ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                        Capturing...
                      </>
                    ) : (
                      <>
                        <Camera className="w-3 h-3" />
                        Take Selfie
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleRetake}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium py-2 px-3 rounded-md transition-all duration-200 shadow text-xs"
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
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-2 py-1">
        <div className="flex justify-center items-center gap-1">
          <span className="text-[10px] text-gray-500">Powered by</span>
          <img className="h-6" src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg" alt="IDMerit Logo" />
        </div>
      </div>
    </div>
  );
};
