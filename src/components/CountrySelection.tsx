import React from 'react';
import { Globe } from 'lucide-react';
import metadata from '../helper/metadata.json';

interface CountrySelectionProps {
  selectedCountryCode: string | null;
  onSelectCountryCode: (countryCode: string) => void;
  onNext: () => void;
}

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
    const value = event.target.value;
    onSelectCountryCode(value);
    if (value) {
      setTimeout(() => onNext(), 100);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-emerald-50 to-teal-100 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex justify-center">
          <img
            className="h-8"
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Title Section */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 text-center">
              <Globe className="w-12 h-12 mx-auto mb-4 text-white" />
              <h1 className="text-2xl font-bold text-white mb-2">Select Your Country</h1>
              <p className="text-emerald-100 text-sm">Choose your country to continue verification</p>
            </div>

            {/* Selection Section */}
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Country of Document
                </label>
                <select
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-200 bg-white shadow-sm"
                  value={selectedCountryCode || ''}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select a country
                  </option>
                  {countries.map(([code, name]) => (
                    <option key={code} value={code} className="py-2">
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCountryCode && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-emerald-800 font-medium text-sm">
                      Country selected: {countries.find(([code]) => code === selectedCountryCode)?.[1]}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex justify-center items-center gap-2">
          <span className="text-sm text-gray-500">Powered by</span>
          <img
            className="h-5"
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
          />
        </div>
      </div>
    </div>
  );
};