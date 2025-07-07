import React, { useEffect, useState } from 'react';
import { CheckCircle, Download, RefreshCw } from 'lucide-react';
import { KYCData } from '../types/kyc';

interface ThankYouProps {
  kycData: KYCData;
  onRestart: () => void;
  scannerType?: 'mrz' | 'barcode' | null;
}

export const ThankYou: React.FC<ThankYouProps> = ({ kycData, onRestart, scannerType }) => {
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsProcessing(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDownloadReport = () => {
    const report = {
      verificationId: kycData.verificationId,
      timestamp: new Date().toISOString(),
      status: 'completed',
      documents: {
        selfie: !!kycData.selfie,
        documentFront: !!kycData.documentFront,
        documentBack: !!kycData.documentBack,
        mrzScan: !!kycData.mrzData
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kyc-verification-${kycData.verificationId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          <h1 className="text-lg font-semibold text-gray-900 mt-2">
            {isProcessing ? 'Processing...' : 'Verification Complete!'}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center p-4 min-h-0">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {isProcessing ? (
              <div className="text-center">
                <div className="mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                </div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Processing Verification</h2>
                <p className="text-gray-600 mb-4">
                  Please wait while we verify your documents...
                </p>
                <div className="bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-600 rounded-full h-2 animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            ) : (
              <>
                {/* Success Icon */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-gray-600">
                    Your KYC verification has been successfully processed
                  </p>
                  {scannerType === 'mrz' && (
                    <p className="text-green-600 font-medium mt-1">MRZ Scan Completed</p>
                  )}
                  {scannerType === 'barcode' && (
                    <p className="text-green-600 font-medium mt-1">Barcode Scan Completed</p>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-green-800 mb-3">Verification Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Verification ID:</span>
                      <span className="font-mono text-green-700 text-xs">{kycData.verificationId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Selfie:</span>
                      <span className="text-green-600">✓ Captured</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Document Front:</span>
                      <span className="text-green-600">✓ Captured</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Document Back:</span>
                      <span className="text-green-600">✓ Captured</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID Scan:</span>
                      <span className="text-green-600">✓ Completed</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadReport}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Report
                  </button>
                  
                  <button
                    onClick={onRestart}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Start New Verification
                  </button>
                </div>

                <div className="mt-4 text-center text-sm text-gray-500">
                  <p>Verification completed successfully</p>
                </div>
              </>
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