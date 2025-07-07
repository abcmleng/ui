import React, { useState, useEffect } from 'react';
import { SelfieCapture } from './SelfieCapture';
import { DocumentFrontCapture } from './DocumentFrontCapture';
import { DocumentBackCapture } from './DocumentBackCapture';
import { MRZScanner } from './MRZScanner';
import { BarcodeScanner } from './BarcodeScanner';
import { ThankYou } from './ThankYou';
import { CountrySelection } from './CountrySelection';
import { DocumentSelection } from './DocumentSelection';
import metadata from '../helper/metadata.json';
import { KYCData, CapturedImage, ProcessingStatus } from '../types/kyc';
import { kycApiService } from '../services/kycApi';

interface MetadataItem {
  id: number;
  barcode: string;
  country: string;
  country_code: string;
  date_format: string;
  type: string;
  alternative_text: string;
  is_live: number;
  engine_language: number;
  is_country_european: number;
  version: number;
  tenant_name: string;
  server_key: string;
}

// Barcode and MRZ classification
const MRZ_TYPES = ['TD1','TD2','TD3','TD1 F','TD2 F','TD2 B','TD3 B','TD3 F'];
const BARCODE_TYPES = ['PDF417','PDF417 B','PDF417 F','QR B','QR F','QR AADHAAR','ITF B','ITF F'];

const STEPS = ['selfie','country_selection','document_type','document-front','document-back','Scanning','complete',
];

export const KYCFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string | null>(null);
  const [scannerType, setScannerType] = useState<'mrz' | 'barcode' | null>(null);
  const [kycData, setKycData] = useState<KYCData>({
    verificationId: `KYC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    processingStatus: {
      selfie: 'pending',
      documentFront: 'pending',
      documentBack: 'pending',
      mrz: 'pending',
    },
    apiResponses: {},
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentStep === 3) {
      if (selectedCountryCode && selectedDocumentType) {
        const meta = (metadata as MetadataItem[]).find(
          (item) =>
            item.country_code === selectedCountryCode &&
            (item.type.toLowerCase() === selectedDocumentType.toLowerCase() ||
             item.alternative_text.toLowerCase() === selectedDocumentType.toLowerCase())
        );

        if (meta) {
          const barcode = meta.barcode.toUpperCase();

          if (MRZ_TYPES.includes(barcode)) {
            setScannerType('mrz');
          } else if (BARCODE_TYPES.includes(barcode)) {
            setScannerType('barcode');
          } else {
            setScannerType(null);
          }
        } else {
          setScannerType(null);
        }
      }
    }
  }, [currentStep, selectedCountryCode, selectedDocumentType]);

  const handleSelfieCapture = (image: CapturedImage) => {
    setKycData((prev) => ({
      ...prev,
      selfie: image,
      processingStatus: {
        ...prev.processingStatus!,
        selfie: 'processing',
      },
    }));
    setError(null);
  };

  const handleDocumentFrontCapture = (image: CapturedImage) => {
    setKycData((prev) => ({
      ...prev,
      documentFront: image,
      processingStatus: {
        ...prev.processingStatus!,
        documentFront: 'processing',
      },
    }));
  };

  const handleDocumentBackCapture = (image: CapturedImage) => {
    setKycData((prev) => ({
      ...prev,
      documentBack: image,
      processingStatus: {
        ...prev.processingStatus!,
        documentBack: 'processing',
      },
    }));
  };

  const handleMRZScan = async (mrzData: string) => {
    setLoading(true);
    setKycData((prev) => ({
      ...prev,
      mrzData,
      processingStatus: {
        ...prev.processingStatus!,
        mrz: 'processing',
      },
    }));

    const selfieProcessed = !!kycData.selfie;
    const documentFrontProcessed = !!kycData.documentFront;
    const documentBackProcessed = !!kycData.documentBack;
    const mrzProcessed = scannerType === 'mrz' || scannerType === 'barcode';

    try {
      const response = await kycApiService.submitVerification({
        verificationId: kycData.verificationId,
        selfieProcessed,
        documentFrontProcessed,
        documentBackProcessed,
        mrzProcessed,
      });
      console.log('[submitVerification] Response:', response);
      setError(null);
    } catch (error: any) {
      console.error('[submitVerification] Error:', error);
      setError(error?.message || 'Verification submission failed. Please try again.');
    } finally {
      setLoading(false);
    }

    nextStep();
  };

  const nextStep = () => {
    setCurrentStep((prev) => {
      console.log('Current step before increment:', prev);
      let next = prev + 1;

      if (
        STEPS[prev] === 'document-front' &&
        selectedDocumentType?.toLowerCase() === 'pp'
      ) {
        next = prev + 2;
      }

      next = Math.min(next, STEPS.length - 1);
      console.log('Next step:', next);
      return next;
    });
  };

  const restartFlow = () => {
    if (kycData.selfie) URL.revokeObjectURL(kycData.selfie.url);
    if (kycData.documentFront) URL.revokeObjectURL(kycData.documentFront.url);
    if (kycData.documentBack) URL.revokeObjectURL(kycData.documentBack.url);

    setCurrentStep(0);
    setSelectedCountryCode(null);
    setSelectedDocumentType(null);
    setScannerType(null);
    setKycData({
      verificationId: `KYC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      processingStatus: {
        selfie: 'pending',
        documentFront: 'pending',
        documentBack: 'pending',
        mrz: 'pending',
      },
      apiResponses: {},
    });
  };

  const renderCurrentStep = () => {
    switch (STEPS[currentStep]) {
      case 'selfie':
        return (
          <SelfieCapture
            onCapture={handleSelfieCapture}
            onNext={nextStep}
            verificationId={kycData.verificationId}
            onError={setError}
          />
        );
      case 'country_selection':
        return (
          <CountrySelection
            selectedCountryCode={selectedCountryCode}
            onSelectCountryCode={setSelectedCountryCode}
            onNext={nextStep}
          />
        );
      case 'document_type':
        return (
          <DocumentSelection
            selectedCountryCode={selectedCountryCode}
            selectedDocumentType={selectedDocumentType}
            onSelectDocumentType={setSelectedDocumentType}
            onNext={nextStep}
          />
        );
      case 'document-front':
        return (
          <DocumentFrontCapture
            onCapture={handleDocumentFrontCapture}
            onNext={nextStep}
            verificationId={kycData.verificationId}
            onError={setError}
          />
        );
      case 'document-back':
        return (
          <DocumentBackCapture
            onCapture={handleDocumentBackCapture}
            onNext={nextStep}
            verificationId={kycData.verificationId}
            onError={setError}
          />
        );
      case 'Scanning':
        if (scannerType === 'mrz') {
          return (
            <div>
              {loading && (
                <div className="text-center text-blue-600 font-semibold mb-4">
                  Processing...
                </div>
              )}
              <MRZScanner
                onScan={handleMRZScan}
                onNext={nextStep}
                verificationId={kycData.verificationId}
              />
            </div>
          );
        } else if (scannerType === 'barcode') {
          return (
            <div>
              {loading && (
                <div className="text-center text-blue-600 font-semibold mb-4">
                  Processing...
                </div>
              )}
              <BarcodeScanner
                onScan={handleMRZScan}
                onNext={nextStep}
                verificationId={kycData.verificationId}
              />
            </div>
          );
        } else {
          return <div>Unsupported barcode type for scanning.</div>;
        }
      case 'complete':
        return <ThankYou kycData={kycData} onRestart={restartFlow} scannerType={scannerType} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentStep()}
    </div>
  );
};
