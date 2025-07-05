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

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '0 0 0.5rem 0.5rem',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    height: '36px',
  },
  logo: {
    height: '18px',
  },
  footer: {
    marginTop: 'auto',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    padding: '0.125rem 0.5rem',
    height: '28px',
  },
  footerText: {
    fontSize: '0.625rem', // smaller font
    color: '#6b7280',
  },
  footerImg: {
    height: '14px',
  },
};

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
    error,
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
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-3xl overflow-hidden p-6">
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
    <div className="flex flex-col min-h-screen p-4 bg-gray-50">
      {/* SMALL HEADER */}
      <header style={styles.header}>
        <img
          style={styles.logo}
          src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
          alt="IDMerit Logo"
        />
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex flex-col items-center justify-center">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-3xl overflow-hidden">
            <div className="p-4 text-center bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              <CreditCard className="w-10 h-10 mx-auto mb-2" />
              <h2 className="text-xl font-bold mb-1">Document Front</h2>
              <p className="text-purple-100 text-sm">Align your ID front within the frame</p>
            </div>

            <div className="p-4">
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden mb-4 aspect-[4/3]">
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
                      <div className="w-72 h-48 border-4 border-white/50 rounded-2xl flex items-center justify-center">
                        <div className="text-white/70 text-center">
                          <CreditCard className="w-14 h-14 mx-auto mb-1" />
                          <p className="text-xs">Align ID front</p>
                        </div>
                      </div>
                    </div>
                    {isLoading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
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

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-3 text-sm">
                  {error}
                </div>
              )}

              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-3 text-sm">
                  {uploadError}
                </div>
              )}

              <div className="flex flex-col gap-2">
                {isUploading && (
                  <div className="text-center text-purple-600 font-semibold mb-1 text-sm">
                    Processing...
                  </div>
                )}
                <div className="flex gap-2">
                  {!capturedImage && (
                    <button
                      onClick={handleCapture}
                      disabled={!isStreaming || isCapturing || isUploading}
                      className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg text-sm"
                    >
                      {isCapturing ? 'Capturing...' : 'Capture Document'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SMALL FOOTER */}
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
