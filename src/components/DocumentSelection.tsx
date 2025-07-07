import React from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import metadata from '../helper/metadata.json';

interface DocumentSelectionProps {
  selectedCountryCode: string | null;
  selectedDocumentType: string | null;
  onSelectDocumentType: (docType: string) => void;
  onNext: () => void;
}

const typeLabelMap: Record<string, string> = {
  PP: 'Passport',
  DL: 'Driving License',
  NI: 'National ID',
  AADHAAR: 'Aadhaar',
};

export const DocumentSelection: React.FC<DocumentSelectionProps> = ({
  selectedCountryCode,
  selectedDocumentType,
  onSelectDocumentType,
  onNext,
}) => {
  // Filter document types based on selected country code from metadata
  const documentTypes = React.useMemo(() => {
    if (!selectedCountryCode) return [];

    const docs = (metadata as { country_code: string; type: string; alternative_text: string }[])
      .filter((item) => item.country_code === selectedCountryCode)
      .map((item) => {
        const type = item.type || item.alternative_text || '';
        const label = typeLabelMap[type.toUpperCase()] || item.alternative_text || type;
        return {
          label,
          value: type,
        };
      });

    // Remove duplicates by value
    const uniqueDocs = Array.from(new Map(docs.map(doc => [doc.value.toLowerCase(), doc])).values());

    return uniqueDocs;
  }, [selectedCountryCode]);

  const handleDocumentSelect = (docType: string) => {
    onSelectDocumentType(docType);
    setTimeout(() => onNext(), 100);
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
          <h1 className="text-lg font-semibold text-gray-900 mt-2">Select Document Type</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center p-4 min-h-0">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Icon */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-gray-600">Choose the type of document you want to verify</p>
            </div>

            {/* Document Options */}
            {documentTypes.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500">No document types available for the selected country.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documentTypes.map((docType) => (
                  <button
                    key={docType.value}
                    className="w-full p-4 border border-gray-200 rounded-lg text-left hover:border-blue-300 hover:bg-blue-50 transition-all group focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => handleDocumentSelect(docType.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-700">
                          {docType.label}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Verify your {docType.label.toLowerCase()}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                    </div>
                  </button>
                ))}
              </div>
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