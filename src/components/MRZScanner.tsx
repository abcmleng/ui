import React, { useEffect, useState } from 'react';
import { Scan, RotateCcw } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { kycApiService } from '../services/kycApi';
import { ErrorPage, CaptureError } from './ErrorPage';

interface MRZScannerProps {
  onScan: (mrzData: string) => void;
  onNext: () => void;
  verificationId: string;
  onError?: (errorMessage: string) => void;
}

export const MRZScanner: React.FC<MRZScannerProps> = ({ onScan, onNext, verificationId, onError }) => {
  const {
    videoRef,
    isStreaming,
    isLoading,
    error,
    startCamera,
    stopCamera,
  } = useCamera();

  const [scannedData, setScannedData] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState<CaptureError | null>(null);

  const styles = {
    header: {
      width: '100%',
      height: '60px',
      backgroundColor: '#ffffff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderBottom: '1px solid #eaeaea',
      flexShrink: 0,
    },
    logo: {
      height: '40px',
    },
    footer: {
      width: '100%',
      height: '50px',
      backgroundColor: '#ffffff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderTop: '1px solid #eaeaea',
      flexShrink: 0,
    },
    footerText: {
      marginRight: '8px',
      fontSize: '14px',
      color: '#666666',
    },
    footerImg: {
      height: '24px',
    },
  };

  useEffect(() => {
    startCamera('environment');
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleScan = async () => {
    setIsScanning(true);

    if (!videoRef.current) {
      const errorMsg = 'Camera not available';
      setUploadError(errorMsg);
      setCaptureError({
        type: 'camera',
        message: errorMsg,
        tips: ['Ensure your camera is connected and accessible.', 'Try refreshing the page.'],
      });
      setIsScanning(false);
      onError?.(errorMsg);
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      const errorMsg = 'Failed to get canvas context';
      setUploadError(errorMsg);
      setCaptureError({
        type: 'processing',
        message: errorMsg,
        tips: ['Try restarting the application.', 'Ensure your browser supports canvas.'],
      });
      setIsScanning(false);
      onError?.(errorMsg);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        const errorMsg = 'Failed to capture image';
        setUploadError(errorMsg);
        setCaptureError({
          type: 'processing',
          message: errorMsg,
          tips: ['Try again.', 'Ensure good lighting conditions.'],
        });
        setIsScanning(false);
        onError?.(errorMsg);
        return;
      }

      setUploadError(null);
      setIsUploading(true);
      setOcrStatus(null);
      setScannedData(null);
      setCaptureError(null);

      try {
        const response = await kycApiService.processMRZDocument(blob, verificationId);
        console.log("MRZ response -> ", response);
        if (response.success && response.data?.status === 'success') {
          const mrzData = JSON.stringify(response.data.parsed_data, null, 2);
          setScannedData(mrzData);
          setOcrStatus('SUCCESSFUL');
          onScan(mrzData);
          stopCamera();
          onNext();
        } else {
          const errorMsg = 'OCR failed or status not successful.';
          setUploadError(errorMsg);
          setCaptureError({
            type: 'processing',
            message: errorMsg,
            tips: ['Ensure MRZ area is clearly visible.', 'Try again with better lighting.'],
          });
          setOcrStatus(null);
          onError?.(errorMsg);
        }
      } catch (error: any) {
        const errorMsg = error?.message || 'Network error. Please try again.';
        setUploadError(errorMsg);
        setCaptureError({
          type: 'network',
          message: errorMsg,
          tips: ['Check your internet connection.', 'Try again later.'],
        });
        onError?.(errorMsg);
      } finally {
        setIsUploading(false);
        setIsScanning(false);
      }
    }, 'image/jpeg');
  };

  const handleRetry = () => {
    setScannedData(null);
    setOcrStatus(null);
    setIsScanning(false);
    setUploadError(null);
    setCaptureError(null);
    startCamera('environment'); // restart camera
  };

  const handleNext = () => {
    if (!scannedData) return;
    stopCamera();
    onNext();
  };

  if (captureError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <header style={styles.header}>
          <img
            style={styles.logo}
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
          />
        </header>
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-3xl overflow-hidden p-6">
            <ErrorPage
              error={captureError}
              onRetry={handleRetry}
              onBack={handleRetry}
            />
          </div>
        </div>
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
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <header style={styles.header}>
        <img
          style={styles.logo}
          src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
          alt="IDMerit Logo"
        />
      </header>
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-3xl overflow-hidden">
        <div className="p-6 text-center bg-gradient-to-r from-green-500 to-teal-600 text-white">
          <Scan className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Scan MRZ Code</h2>
          <p className="text-green-100">Position the MRZ area at the bottom of your ID</p>
        </div>

          <div className="p-6">
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden mb-6 aspect-[4/3]">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-20 border-4 border-white/50 rounded-lg flex items-center justify-center">
                  <div className="text-white/70 text-center">
                    <Scan className="w-8 h-8 mx-auto mb-1" />
                    <p className="text-xs">MRZ Scan Area</p>
                  </div>
                </div>
              </div>

              {(isLoading || isScanning) && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                    <p>{isScanning ? 'Scanning...' : 'Loading camera...'}</p>
                  </div>
                </div>
              )}
            </div>

            {ocrStatus === 'SUCCESSFUL' && (
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded text-sm mb-2 text-center font-semibold">
                MRZ Status: SUCCESSFUL
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">{error}</div>
            )}

            {uploadError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {uploadError}
              </div>
            )}

            <div className="flex gap-3">
              {ocrStatus !== 'SUCCESSFUL' ? (
                <button
                  onClick={handleScan}
                  disabled={!isStreaming || isScanning}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isScanning ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Scan className="w-5 h-5" />
                  )}
                  {isScanning ? 'Scanning...' : 'Scan MRZ'}
                </button>
              ) : (
                <button
                  onClick={handleRetry}
                  disabled={isUploading}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Retry
                </button>
              )}
            </div>
          </div>
          </div>
        </div>
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
