import React from 'react';
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

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    borderRadius: '0 0 0.5rem 0.5rem',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    height: '48px', // smaller height
  },
  logo: {
    height: '24px', // smaller logo
  },
  footer: {
    marginTop: 'auto',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.25rem 1rem',
    height: '36px', // smaller height
  },
  footerText: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  footerImg: {
    height: '16px',
  },
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 px-6">
      {/* HEADER */}
      <header style={styles.header}>
        <img
          style={styles.logo}
          src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
          alt="IDMerit Logo"
        />
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-md">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-white flex flex-col items-center">
            <h2 className="text-2xl font-extrabold mb-2">Select Document Type</h2>
            <p className="text-center text-sm max-w-xs">
              Please choose your document type from the options below.
            </p>
          </div>
          <ul className="p-6 space-y-4">
            {documentTypes.length === 0 ? (
              <li>No document types available for the selected country.</li>
            ) : (
              documentTypes.map((docType) => (
                <li key={docType.value}>
                  <button
                    className={`w-full py-4 rounded-xl border font-semibold ${
                      selectedDocumentType === docType.value
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400'
                    } transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-300`}
                    onClick={() => {
                      onSelectDocumentType(docType.value);
                      onNext();
                    }}
                  >
                    {docType.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <span style={styles.footerText}>Powered by</span>
        <img
          style={styles.footerImg}
          src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
          alt="IDMerit Logo"
        />
      </footer>
    </div>
  );
};
