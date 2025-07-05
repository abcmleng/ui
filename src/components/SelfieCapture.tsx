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

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'center', // center horizontally
    alignItems: 'center', // center vertically
    padding: '0.75rem 1rem',
    borderRadius: '0 0 0.5rem 0.5rem',
    gap: '0.5rem',
    color: '#000', // black text
    fontWeight: '600',
    fontSize: '1.125rem', // ~18px
  },
  logo: {
    height: '30px',
  },
  footer: {
    marginTop: 'auto',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
  },
  footerText: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  footerImg: {
    height: '20px',
  },
  captureText: {
    position: 'absolute',
    top: '8px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'white',
    fontWeight: '600',
    fontSize: '1.25rem',
    zIndex: 10,
    userSelect: 'none',
  },
};

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
      <div className="flex flex-col items-center justify-center min-h-screen p-3">
        <div className="w-full max-w-sm mx-auto p-4 rounded-xl bg-white">
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
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 px-6">
      {/* HEADER */}
      <header style={styles.header}>
        <img
          style={styles.logo}
          src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
          alt="IDMerit Logo"
        />
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex flex-col items-center justify-center p-3 overflow-hidden">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-md flex flex-col">
          <div className="relative bg-gray-900 rounded-xl overflow-hidden flex-grow aspect-[3/4]">
            {/* Capture Selfie Text */}
            <p style={styles.captureText}>Capture Selfie</p>

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
                  <div className="border-2 border-white/50 rounded-full w-[16rem] h-[21.3rem]" />
                </div>
                {isLoading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                  </div>
                )}
              </>
            ) : (
              <img src={capturedImage.url} alt="Captured selfie" className="w-full h-full object-cover" />
            )}
          </div>

          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md m-3 text-sm">
              {uploadError}
            </div>
          )}

          <div className="flex gap-2 px-3 pb-4 pt-3">
            {!capturedImage ? (
              <button
                onClick={handleCapture}
                disabled={!isStreaming || isCapturing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 rounded-lg text-sm transition"
              >
                {isCapturing ? 'Capturing...' : 'Take Selfie'}
              </button>
            ) : (
              <button
                onClick={handleRetake}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg text-sm transition"
              >
                Retake
              </button>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <span style={styles.footerText}>Powered by</span>
        <img
          style={styles.footerImg}
          src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
          alt="IDMerit Logo"
        />
      </footer>
    </div>
  );
};
