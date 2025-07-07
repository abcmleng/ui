import React from 'react';
import { AlertCircle, Camera, Wifi, RotateCcw, ArrowLeft } from 'lucide-react';

export interface CaptureError {
  type: 'camera' | 'processing' | 'network' | 'validation' | string;
  message: string;
  tips: string[];
}

interface ErrorPageProps {
  error: CaptureError;
  onRetry: () => void;
  onBack: () => void;
}

const getErrorIcon = (type: CaptureError['type']) => {
  switch (type) {
    case 'camera':
      return <Camera className="w-12 h-12 text-red-500" />;
    case 'network':
      return <Wifi className="w-12 h-12 text-red-500" />;
    default:
      return <AlertCircle className="w-12 h-12 text-red-500" />;
  }
};

const getErrorTitle = (type: CaptureError['type']) => {
  switch (type) {
    case 'camera':
      return 'Camera Access Required';
    case 'processing':
      return 'Processing Failed';
    case 'network':
      return 'Connection Error';
    case 'validation':
      return 'Validation Error';
    default:
      return 'Something Went Wrong';
  }
};

export const ErrorPage: React.FC<ErrorPageProps> = ({ error, onRetry, onBack }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Error Icon */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          {getErrorIcon(error.type)}
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {getErrorTitle(error.type)}
        </h2>
        <p className="text-gray-600">
          {error.message}
        </p>
      </div>

      {/* Tips */}
      {error.tips.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">Tips for better results:</h3>
          <ul className="space-y-1">
            {error.tips.map((tip, index) => (
              <li key={index} className="text-sm text-blue-800 flex items-start">
                <span className="text-blue-500 mr-2 mt-1">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
        <button
          onClick={onRetry}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
};