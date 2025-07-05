import React from 'react';
import metadata from '../helper/metadata.json';

interface CountrySelectionProps {
  selectedCountryCode: string | null;
  onSelectCountryCode: (countryCode: string) => void;
  onNext: () => void;
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'center', // center horizontally
    alignItems: 'center', // center vertically
    padding: '0.75rem 1rem',
    borderRadius: '0 0 0.5rem 0.5rem',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  logo: {
    height: '30px',
  },
  footer: {
    marginTop: 'auto',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
  },
  footerText: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  footerImg: {
    height: '20px',
  },
  containerText: {
    marginBottom: '0.75rem',
    fontWeight: '600',
    fontSize: '1.25rem',
    color: '#111827', // Tailwind gray-900
    textAlign: 'center' as const,
    userSelect: 'none' as const,
  },
};

export const CountrySelection: React.FC<CountrySelectionProps> = ({
  selectedCountryCode,
  onSelectCountryCode,
  onNext,
}) => {
  // Extract unique countries with country_code and country name
  const countries = Array.from(
    new Map(
      (metadata as { country: string; country_code: string }[]).map((item) => [
        item.country_code,
        item.country,
      ])
    ).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]));

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onSelectCountryCode(event.target.value);
  };

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
            <h2 className="text-2xl font-extrabold mb-2 text-center">Select Your Country</h2>
            <p className="text-center text-sm max-w-xs">
              Please choose your country from the options below.
            </p>
          </div>
          <div className="p-6">
            <p style={styles.containerText}>Select Your Country</p>

            <select
              className="w-full py-4 rounded-xl border border-emerald-300 text-emerald-900 font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-300"
              value={selectedCountryCode || ''}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select a country
              </option>
              {countries.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
            <button
              className="mt-4 w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl disabled:opacity-50"
              onClick={onNext}
              disabled={!selectedCountryCode}
            >
              Next
            </button>
          </div>
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
