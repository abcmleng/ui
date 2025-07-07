export interface KYCApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface ProcessImageRequest {
  image: Blob;
  type: 'selfie';
  verificationId: string;
}

export interface ProcessDocumentRequest {
  image: Blob;
  type: 'document-front' | 'document-back';
  verificationId: string;
}

export interface ProcessMRZRequest {
  mrzData: string;
  verificationId: string;
}

export interface SubmitVerificationRequest {
  verificationId: string;
  selfieProcessed: boolean;
  documentFrontProcessed: boolean;
  documentBackProcessed: boolean;
  mrzProcessed: boolean;
}

class KYCApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api';
    console.log('[KYC API] Base URL:', this.baseUrl);
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<KYCApiResponse> {
    const fullUrl = `${this.baseUrl}${endpoint}`;

    console.log('[KYC API] Request:');
    console.log('  URL:', fullUrl);
    console.log('  Method:', options.method || 'GET');
    console.log('  Headers:', {
      Accept: 'application/json',
      ...(options.headers || {}),
    });

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          Accept: 'application/json',
          ...(options.headers || {}),
        },
      });

      console.log('[KYC API] Response Status:', response.status, response.statusText);

      const responseBody = await response.json();
      console.log('[KYC API] Response Body:', responseBody);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return responseBody;
    } catch (error) {
      console.error('[KYC API] Request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to process request',
      };
    }
  }

  // 📸 Liveness (Selfie)
  async processImage(request: ProcessImageRequest): Promise<KYCApiResponse> {
    const formData = new FormData();
    const filename = `${request.type}-${request.verificationId}.jpg`;

    formData.append('file', request.image, filename);
    formData.append('type', request.type);
    formData.append('verificationId', request.verificationId);
    formData.append('token', 'MAhWBfKK');
    formData.append('latitude', '0');
    formData.append('longitude', '0');

    console.log('[processImage] FormData:');
    formData.forEach((value, key) => console.log(`  ${key}:`, value));

    return this.makeRequest('/ocr/liveness', {
      method: 'POST',
      body: formData,
    });
  }


  // 📄 Document Front/Back
  async processDocument(request: ProcessDocumentRequest): Promise<KYCApiResponse> {
    const formData = new FormData();
    const filename = `${request.type}-${request.verificationId}.jpg`;

    formData.append('data', request.image, filename);
    formData.append('uuid', request.verificationId);
    formData.append('server_key', 'Sandy_Local');
    formData.append('token', 'MAhWBfKK');
    formData.append('country', 'USA');
    formData.append('tenant_name', 'Demo company');
    formData.append('isBackSide', request.type === 'document-back' ? '1' : '0');
    formData.append('document_type', 'PP');

    console.log(`[processDocument] FormData (${request.type}):`);
    formData.forEach((value, key) => console.log(`  ${key}:`, value));

    return this.makeRequest('/bq/image_request', {
      method: 'POST',
      body: formData,
    });
  }


  // 🧾 OCR
  async processOCRDocument(image: Blob, uuid: string): Promise<KYCApiResponse> {
    const formData = new FormData();
    const filename = `ocr-${uuid}.jpg`;

    formData.append('file', image, filename);
    formData.append('uuid', uuid);
    formData.append('server_key', 'ml_local');
    formData.append('engine_language', '1');
    formData.append('latitude', '0');
    formData.append('persistLoc', '0');
    formData.append('metadataIndex', '-1');
    formData.append('longitude', '0');

    console.log('[processOCRDocument] Submitting OCR data...');
    return this.makeRequest('/ocr/document', {
      method: 'POST',
      body: formData,
    });
  }

  
  // 🔍 MRZ (Local Engine)
  async processMRZDocument(image: Blob, uuid: string): Promise<KYCApiResponse> {
    const formData = new FormData();
    const filename = `mrz-${uuid}.jpg`;
 
    formData.append('data', image, filename);
    formData.append('uuid', uuid);
    formData.append('server_key', 'WebApp_Test');
    formData.append('type_data', 'mrz');
 
    const mrzUrl = '/api/3/getparces';
 
    console.log('[processMRZDocument] Submitting MRZ scan...');
    console.log('[processMRZDocument] API URL:', mrzUrl);
 
    try {
      const response = await fetch(mrzUrl, {
        method: 'POST',
        body: formData,
      });
 
      console.log('[processMRZDocument] Response Status:', response.status);
 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
 
      const responseBody = await response.json();
 
      return {
        success: true,
        message: responseBody.message || '',
        data: responseBody,
      };
    } catch (error) {
      console.error('[processMRZDocument] API call failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to process MRZ request',
      };
    }
  }
  
 






  // 🔍 OCR (Local Engine)
  async processBarcodeDocument(image: Blob, uuid: string): Promise<KYCApiResponse> {
    const formData = new FormData();
    const filename = `mrz-${uuid}.jpg`;
 
    formData.append('data', image, filename);
    formData.append('uuid', uuid);
    formData.append('server_key', 'WebApp_Test');
    formData.append('type_data', 'barcode');
 
 
    const ocrUrl = '/api/3/getparces';
 
    console.log('[processBarcodeDocument] Submitting Barcode scan...');
    console.log('[processBarcodeDocument] API URL:', ocrUrl);
 
    try {
      const response = await fetch(ocrUrl, {
        method: 'POST',
        body: formData,
      });
 
      console.log('[processBarcodeDocument] Response Status:', response.status);
 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
 
      const responseBody = await response.json();
 
      return {
        success: true,
        message: responseBody.message || '',
        data: responseBody,
      };
    } catch (error) {
      console.error('[processMRZDocument] API call failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to process MRZ request',
      };
    }
  }
  
 










  // 📤 Submit Final Verification
  async submitVerification(request: SubmitVerificationRequest): Promise<KYCApiResponse> {
    console.log('[submitVerification] Request:', request);

    return this.makeRequest('/kyc/submit-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  }

  // 🔄 Get Verification Status
  async getVerificationStatus(verificationId: string): Promise<KYCApiResponse> {
    console.log('[getVerificationStatus] ID:', verificationId);

    return this.makeRequest(`/kyc/verification-status/${verificationId}`, {
      method: 'GET',
    });
  }
}

export const kycApiService = new KYCApiService();
