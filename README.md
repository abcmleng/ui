# KYC Verification Application

A modern React-based KYC (Know Your Customer) verification application with camera integration for selfie capture, document scanning, and MRZ (Machine Readable Zone) processing.

## Features

- **Selfie Capture**: Front-facing camera for identity verification
- **Document Scanning**: Capture front and back of ID documents
- **MRZ Scanning**: Extract data from Machine Readable Zone
- **API Integration**: Send captured images to backend for processing
- **Progress Tracking**: Visual progress indicator throughout the flow
- **Responsive Design**: Works on desktop and mobile devices

## API Integration

The application integrates with your backend API to process captured images and data. Configure your API endpoint in the environment variables.

### API Endpoints

The application expects the following endpoints on your backend:

#### 1. Process Image
```
POST /api/kyc/process-image
Content-Type: multipart/form-data

Body:
- image: File (JPEG/PNG)
- type: string ('selfie' | 'document-front' | 'document-back')
- verificationId: string

Response:
{
  "success": boolean,
  "message": string,
  "data": any (optional),
  "error": string (optional)
}
```

#### 2. Process MRZ Data
```
POST /api/kyc/process-mrz
Content-Type: application/json

Body:
{
  "mrzData": string,
  "verificationId": string
}

Response:
{
  "success": boolean,
  "message": string,
  "data": any (optional),
  "error": string (optional)
}
```

#### 3. Submit Verification
```
POST /api/kyc/submit-verification
Content-Type: application/json

Body:
{
  "verificationId": string,
  "selfieProcessed": boolean,
  "documentFrontProcessed": boolean,
  "documentBackProcessed": boolean,
  "mrzProcessed": boolean
}

Response:
{
  "success": boolean,
  "message": string,
  "data": any (optional),
  "error": string (optional)
}
```

#### 4. Get Verification Status
```
GET /api/kyc/verification-status/{verificationId}

Response:
{
  "success": boolean,
  "message": string,
  "data": {
    "status": string,
    "processingResults": any
  },
  "error": string (optional)
}
```

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file and configure your API endpoint:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your API base URL:
   ```
   VITE_API_BASE_URL=https://your-api-domain.com/api
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

- `VITE_API_BASE_URL`: Your backend API base URL

## Backend Requirements

Your backend should handle:

1. **Image Processing**: Receive and process selfie and document images
2. **MRZ Processing**: Parse and validate MRZ data
3. **Verification Logic**: Implement your KYC verification business logic
4. **Data Storage**: Store verification data securely
5. **Status Tracking**: Track verification progress and results

## Security Considerations

- Images are sent as multipart form data to your secure backend
- Verification IDs are generated client-side but should be validated server-side
- Implement proper authentication and authorization on your API endpoints
- Consider implementing rate limiting and request validation
- Ensure HTTPS is used for all API communications

## Browser Compatibility

- Modern browsers with camera API support
- HTTPS required for camera access in production
- Mobile browsers supported

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

MIT License