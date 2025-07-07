import React from 'react';
import { Globe, ChevronDown, MapPin } from 'lucide-react';
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
            <h1 className="text-xl font-semibold text-slate-900">Select Your Country</h1>
            <p className="text-sm text-slate-600 mt-1">Choose your country to continue verification</p>
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
                <Globe className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Document Country</h2>
              <p className="text-slate-600">Select the country where your document was issued</p>
            </div>

            {/* Country Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Country of Document
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none btn-touch transition-all duration-200 hover:border-slate-300"
                    value={selectedCountryCode || ''}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Choose a country...
                    </option>
                    {countries.map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Selected Country Confirmation */}
              {selectedCountryCode && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-green-800 font-medium">
                        {countries.find(([code]) => code === selectedCountryCode)?.[1]}
                      </p>
                      <p className="text-green-600 text-sm">Country selected successfully</p>
                    </div>
                  </div>
                </div>
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