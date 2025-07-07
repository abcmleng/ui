import React from 'react';
import { AlertCircle, Camera, Wifi, RotateCcw, ArrowLeft, AlertTriangle } from 'lucide-react';

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
      return <Camera className="w-8 h-8 text-red-500" />;
    case 'network':
      return <Wifi className="w-8 h-8 text-red-500" />;
    case 'validation':
      return <AlertTriangle className="w-8 h-8 text-amber-500" />;
    default:
      return <AlertCircle className="w-8 h-8 text-red-500" />;
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

const getErrorColor = (type: CaptureError['type']) => {
  switch (type) {
    case 'validation':
      return 'amber';
    default:
      return 'red';
  }
};

export const ErrorPage: React.FC<ErrorPageProps> = ({ error, onRetry, onBack }) => {
  const colorScheme = getErrorColor(error.type);
  
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 animate-fade-in">
      {/* Error Icon & Title */}
      <div className="text-center mb-6">
        <div className={`w-20 h-20 bg-${colorScheme}-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm`}>
          {getErrorIcon(error.type)}
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          {getErrorTitle(error.type)}
        </h2>
        <p className="text-slate-600 leading-relaxed">
          {error.message}
        </p>
      </div>

      {/* Tips Section */}
      {error.tips.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center">
              <span className="text-blue-700 text-xs">💡</span>
            </div>
            Tips for better results
          </h3>
          <ul className="space-y-2">
            {error.tips.map((tip, index) => (
              <li key={index} className="text-sm text-blue-800 flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl border-2 border-slate-200 transition-all duration-200 flex items-center justify-center gap-2 btn-touch focus-ring"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
        <button
          onClick={onRetry}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg btn-touch focus-ring"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
};