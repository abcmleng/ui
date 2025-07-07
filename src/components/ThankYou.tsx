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
    <div className="h-screen flex flex-col bg-gradient-to-br from-emerald-50 to-cyan-100">
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
            {isProcessing ? (
              <div className="p-6 text-center">
                <div className="mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-3 border-emerald-500 border-t-transparent mx-auto"></div>
                </div>
                <h2 className="text-lg font-bold text-gray-800 mb-3">Processing Verification</h2>
                <p className="text-gray-600 mb-4 text-sm">
                  Please wait while we verify your documents...
                </p>
                <div className="bg-gray-100 rounded-full h-2">
                  <div className="bg-emerald-500 rounded-full h-2 animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            ) : (
              <>
                {/* Success Section */}
                <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-4 text-center">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 text-white" />
                  <h1 className="text-lg font-bold text-white mb-1">Verification Complete!</h1>
                  <p className="text-emerald-100 text-xs">
                    Your KYC verification has been successfully processed
                  </p>
                  {scannerType === 'mrz' && (
                    <p className="text-emerald-100 font-semibold mt-1 text-xs">MRZ Scan Completed</p>
                  )}
                  {scannerType === 'barcode' && (
                    <p className="text-emerald-100 font-semibold mt-1 text-xs">Barcode Scan Completed</p>
                  )}
                </div>

                {/* Summary Section */}
                <div className="p-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                    <h3 className="font-semibold text-emerald-800 mb-2 text-sm">Verification Summary</h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Verification ID:</span>
                        <span className="font-mono text-emerald-700 text-xs">{kycData.verificationId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Selfie:</span>
                        <span className="text-emerald-600">✓ Captured</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Document Front:</span>
                        <span className="text-emerald-600">✓ Captured</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Document Back:</span>
                        <span className="text-emerald-600">✓ Captured</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID Scan:</span>
                        <span className="text-emerald-600">✓ Completed</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={handleDownloadReport}
                      className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download Report
                    </button>
                    
                    <button
                      onClick={onRestart}
                      className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg border-2 border-gray-200 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Start New Verification
                    </button>
                  </div>

                  <div className="mt-4 text-center text-xs text-gray-500">
                    <p>Verification completed successfully</p>
                  </div>
                </div>
              </>
            )}
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