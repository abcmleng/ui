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
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-emerald-50 to-cyan-100 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex justify-center">
          <img
            className="h-8"
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {isProcessing ? (
              <div className="p-8 text-center">
                <div className="mb-6">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto"></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Processing Verification</h2>
                <p className="text-gray-600 mb-6">
                  Please wait while we verify your documents...
                </p>
                <div className="bg-gray-100 rounded-full h-2">
                  <div className="bg-emerald-500 rounded-full h-2 animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            ) : (
              <>
                {/* Success Section */}
                <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-8 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-white" />
                  <h1 className="text-2xl font-bold text-white mb-2">Verification Complete!</h1>
                  <p className="text-emerald-100 text-sm">
                    Your KYC verification has been successfully processed
                  </p>
                  {scannerType === 'mrz' && (
                    <p className="text-emerald-100 font-semibold mt-2">MRZ Scan Completed</p>
                  )}
                  {scannerType === 'barcode' && (
                    <p className="text-emerald-100 font-semibold mt-2">Barcode Scan Completed</p>
                  )}
                </div>

                {/* Summary Section */}
                <div className="p-6">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-emerald-800 mb-3">Verification Summary</h3>
                    <div className="space-y-2 text-sm">
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
                  <div className="space-y-3">
                    <button
                      onClick={handleDownloadReport}
                      className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Download className="w-5 h-5" />
                      Download Report
                    </button>
                    
                    <button
                      onClick={onRestart}
                      className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl border-2 border-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Start New Verification
                    </button>
                  </div>

                  <div className="mt-6 text-center text-xs text-gray-500">
                    <p>Verification completed successfully</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-3">
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