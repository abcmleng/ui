import React, { useEffect, useState } from 'react';
import { Scan } from 'lucide-react';
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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState<CaptureError | null>(null);

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
      setOcrStatus(null);
      setScannedData(null);
      setCaptureError(null);

      try {
        const response = await kycApiService.processMRZDocument(blob, verificationId);
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
    startCamera('environment');
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
              onRetry={handleRetry}
              onBack={handleRetry}
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-green-50 to-teal-100">
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
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Title Section */}
            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 py-4 text-center">
              <Scan className="w-8 h-8 mx-auto mb-2 text-white" />
              <h1 className="text-lg font-bold text-white mb-1">Scan MRZ Code</h1>
              <p className="text-green-100 text-xs">Position the MRZ area at the bottom of your ID</p>
            </div>

            {/* Camera Section */}
            <div className="p-3">
              <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-[4/3] mb-3">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-60 h-14 border-3 border-white/60 rounded-lg flex items-center justify-center shadow-lg">
                    <div className="text-white/80 text-center">
                      <Scan className="w-5 h-5 mx-auto mb-1" />
                      <p className="text-xs font-medium">MRZ Scan Area</p>
                    </div>
                  </div>
                </div>

                {(isLoading || isScanning) && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent mx-auto mb-2"></div>
                      <p className="text-xs">{isScanning ? 'Scanning...' : 'Loading camera...'}</p>
                    </div>
                  </div>
                )}
              </div>

              {ocrStatus === 'SUCCESSFUL' && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-lg mb-3 text-xs text-center font-semibold">
                  MRZ Status: SUCCESSFUL
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-3 text-xs">
                  {error}
                </div>
              )}

              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-3 text-xs">
                  {uploadError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {ocrStatus !== 'SUCCESSFUL' ? (
                  <button
                    onClick={handleScan}
                    disabled={!isStreaming || isScanning}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-sm"
                  >
                    {isScanning ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Scan className="w-4 h-4" />
                        Scan MRZ
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleRetry}
                    className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-sm"
                  >
                    Retry
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