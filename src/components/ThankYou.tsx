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
    // Simulate processing time
    const timer = setTimeout(() => {
      setIsProcessing(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDownloadReport = () => {
    // In production, this would generate a proper verification report
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-3xl  overflow-hidden">
          {isProcessing ? (
            <div className="p-8 text-center">
              <div className="mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Processing Verification</h2>
              <p className="text-gray-600">
                Please wait while we verify your documents...
              </p>
              <div className="mt-6 bg-gray-100 rounded-full h-2">
                <div className="bg-emerald-500 rounded-full h-2 animate-pulse" style={{ width: '70%' }}></div>
              </div>
            </div>
          ) : (
            <>
              <div className="p-6 text-center bg-gradient-to-r from-emerald-500 to-cyan-600 text-white">
                <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Verification Complete!</h2>
                <p className="text-emerald-100">
                  Your KYC verification has been successfully processed
                </p>
                {scannerType === 'mrz' && (
                  <p className="text-emerald-100 font-semibold mt-2">MRZ Scan Completed</p>
                )}
                {scannerType === 'barcode' && (
                  <p className="text-emerald-100 font-semibold mt-2">Barcode Scan Completed</p>
                )}
              </div>

              <div className="p-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-emerald-800 mb-3">Verification Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Verification ID:</span>
                      <span className="font-mono text-emerald-700">{kycData.verificationId}</span>
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
                      <span className="text-gray-600">ID card Scan:</span>
                      <span className="text-emerald-600">✓ Completed</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleDownloadReport}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Verification Report
                  </button>
                  
                  <button
                    onClick={onRestart}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl border-2 border-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Start New Verification
                  </button>
                </div>

                <div className="mt-6 text-center text-xs text-gray-500">
                  <p>Verification completed</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};