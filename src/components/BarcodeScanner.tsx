import React, { useEffect, useState } from 'react';
import { Scan } from 'lucide-react';
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
      <div className="h-screen flex flex-col bg-slate-50">
        {/* Header */}
        <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex justify-center">
            <img
              className="h-8"
              src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
              alt="IDMerit Logo"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
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
            <span className="text-sm text-gray-500">Powered by</span>
            <img
              className="h-5"
              src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
              alt="IDMerit Logo"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-yellow-50 to-amber-100">
      {/* Header */}
      <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex justify-center">
          <img
            className="h-8"
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 min-h-0">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Title Section */}
            <div className="bg-gradient-to-r from-yellow-600 to-amber-600 px-6 py-6 text-center">
              <Scan className="w-10 h-10 mx-auto mb-3 text-white" />
              <h1 className="text-xl font-bold text-white mb-2">Scan Barcode</h1>
              <p className="text-yellow-100 text-sm">Align the barcode within the frame</p>
            </div>

            {/* Camera Section */}
            <div className="p-4">
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-[4/3] mb-4">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-72 h-20 border-4 border-white/60 rounded-lg flex items-center justify-center shadow-lg">
                    <div className="text-white/80 text-center">
                      <Scan className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-xs font-medium">Barcode Scan Area</p>
                    </div>
                  </div>
                </div>

                {(isLoading || isScanning) && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-2"></div>
                      <p className="text-sm">{isScanning ? 'Scanning...' : 'Loading camera...'}</p>
                    </div>
                  </div>
                )}
              </div>

              {ocrStatus === 'SUCCESSFUL' && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-lg mb-4 text-sm text-center font-semibold">
                  Barcode Status: SUCCESSFUL
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-4 text-sm">
                  {uploadError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {ocrStatus !== 'SUCCESSFUL' ? (
                  <button
                    onClick={handleScan}
                    disabled={!isStreaming || isScanning}
                    className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isScanning ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Scan className="w-5 h-5" />
                        Scan Barcode
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleRetry}
                    className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
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
          <span className="text-sm text-gray-500">Powered by</span>
          <img
            className="h-5"
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
          />
        </div>
      </div>
    </div>
  );
};