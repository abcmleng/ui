import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
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
    <div className="h-screen w-full flex flex-col bg-gray-50 safe-area-all">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0 safe-area-top">
        <div className="max-w-md mx-auto text-center">
          <img
            className="h-8 mx-auto"
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
          />
          <h1 className="text-lg font-semibold text-gray-900 mt-2">Select Your Country</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center p-4 min-h-0 safe-area-x">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Icon */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-gray-600">Choose your country to continue verification</p>
            </div>

            {/* Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country of Document
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none min-h-[48px]"
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
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Selected Country Display */}
            {selectedCountryCode && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-800 font-medium text-sm">
                    Selected: {countries.find(([code]) => code === selectedCountryCode)?.[1]}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0 safe-area-bottom">
        <div className="max-w-md mx-auto text-center">
          <span className="text-sm text-gray-500">Powered by IDMerit</span>
        </div>
      </div>
    </div>
  );
};