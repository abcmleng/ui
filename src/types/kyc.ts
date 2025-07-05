export interface KYCStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface CapturedImage {
  blob: Blob;
  url: string;
  timestamp: Date;
}

export interface ProcessingStatus {
  selfie: 'pending' | 'processing' | 'completed' | 'failed';
  documentFront: 'pending' | 'processing' | 'completed' | 'failed';
  documentBack: 'pending' | 'processing' | 'completed' | 'failed';
  mrz: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface KYCData {
  selfie?: CapturedImage;
  documentFront?: CapturedImage;
  documentBack?: CapturedImage;
  mrzData?: string;
  verificationId: string;
  processingStatus?: ProcessingStatus;
  apiResponses?: {
    selfie?: any;
    documentFront?: any;
    documentBack?: any;
    mrz?: any;
  };
}

export type KYCStepType = 'selfie' | 'document-front' | 'document-back' | 'mrz' | 'complete';