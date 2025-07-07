import React from 'react';
import { FileText, ChevronRight, CreditCard, BookOpen, IdCard } from 'lucide-react';
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

const getDocumentIcon = (type: string) => {
  switch (type.toUpperCase()) {
    case 'PP':
      return <BookOpen className="w-6 h-6" />;
    case 'DL':
      return <CreditCard className="w-6 h-6" />;
    case 'NI':
    case 'AADHAAR':
      return <IdCard className="w-6 h-6" />;
    default:
      return <FileText className="w-6 h-6" />;
  }
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
    <div className="h-screen w-full flex flex-col bg-slate-50 safe-area-inset">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 flex-shrink-0">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-center mb-2">
            <img
              className="h-8"
              src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
              alt="IDMerit"
            />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-slate-900">Select Document Type</h1>
            <p className="text-sm text-slate-600 mt-1">Choose the type of document you want to verify</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center p-4 min-h-0">
        <div className="w-full max-w-md mx-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            {/* Icon Section */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <FileText className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Document Type</h2>
              <p className="text-slate-600">Select the document you'd like to verify</p>
            </div>

            {/* Document Options */}
            <div className="space-y-3">
              {documentTypes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No documents available</p>
                  <p className="text-slate-400 text-sm mt-1">No document types found for the selected country</p>
                </div>
              ) : (
                documentTypes.map((docType) => (
                  <button
                    key={docType.value}
                    className="w-full p-4 border-2 border-slate-200 rounded-xl text-left hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 btn-touch"
                    onClick={() => handleDocumentSelect(docType.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors duration-200">
                          <div className="text-slate-600 group-hover:text-blue-600">
                            {getDocumentIcon(docType.value)}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors duration-200">
                            {docType.label}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">
                            Verify your {docType.label.toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors duration-200" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 flex-shrink-0">
        <div className="max-w-md mx-auto px-4 py-3 text-center">
          <span className="text-sm text-slate-500">Powered by IDMerit</span>
        </div>
      </footer>
    </div>
  );
};