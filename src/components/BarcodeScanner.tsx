import React, { useEffect, useState } from 'react';
import { Scan, RotateCcw } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { kycApiService } from '../services/kycApi';
import { ErrorPage, CaptureError } from './ErrorPage';

interface BarcodeScannerProps {
  onScan: (barcodeData: string) => void;
  onNext: () => void;
  verificationId: string;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onNext, verificationId }) => {
  const {
    videoRef,
    isStreaming,
    isLoading,
    error,
    startCamera,
    stopCamera
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
          tips: ['Try again.', 'Ensure good lighting and camera focus.'],
        });
        setIsScanning(false);
        return;
      }

      setUploadError(null);
      setOcrStatus(null);
      setScannedData(null);
      setCaptureError(null);

      try {
        const response = await kycApiService.processBarcodeDocument(blob, verificationId);

        if (response.success && response.data?.status === 'success') {
          const barcodeData = JSON.stringify(response.data.parsed_data, null, 2);
          setScannedData(barcodeData);
          setOcrStatus('SUCCESSFUL');
          onScan(barcodeData);
          stopCamera();
          onNext();
        } else {
          const errorMsg = 'Barcode processing failed or status not successful.';
          setUploadError(errorMsg);
          setCaptureError({
            type: 'processing',
            message: errorMsg,
            tips: ['Ensure barcode is clearly visible.', 'Try again with better lighting or angle.'],
          });
          setOcrStatus(null);
        }
      } catch (error: any) {
        const errorMsg = error?.message || 'Network error. Please try again.';
        setUploadError(errorMsg);
        setCaptureError({
          type: 'network',
          message: errorMsg,
          tips: ['Check your internet connection.', 'Try again later.'],
        });
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
              onRetry={handleRetry}
              onBack={handleRetry}
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
          <h1 className="text-lg font-semibold text-gray-900 mt-2">Scan Barcode</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 min-h-0">
        <div className="w-full max-w-md mx-auto flex flex-col h-full">
          {/* Camera Area */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 min-h-0">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden h-full min-h-[300px]">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-white/60 rounded-lg w-48 h-16 flex items-center justify-center">
                  <Scan className="w-5 h-5 text-white/80 mr-2" />
                  <span className="text-white/80 text-sm">Barcode Area</span>
                </div>
              </div>

              {(isLoading || isScanning) && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-2"></div>
                    <p className="text-sm">{isScanning ? 'Scanning...' : 'Loading camera...'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Messages */}
          {ocrStatus === 'SUCCESSFUL' && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg mb-4 text-sm text-center font-medium">
              Barcode Status: SUCCESSFUL
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {uploadError}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {ocrStatus !== 'SUCCESSFUL' ? (
              <button
                onClick={handleScan}
                disabled={!isStreaming || isScanning}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Scanning...
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4" />
                    Scan Barcode
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleRetry}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retry
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