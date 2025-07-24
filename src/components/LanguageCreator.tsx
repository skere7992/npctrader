import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../types/config';
import { 
  translateLanguageFile, 
  downloadLanguageFile, 
  TranslationProgress,
  validateDeepLAPI 
} from '../utils/translation';
import { Globe, Download, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface LanguageCreatorProps {
  className?: string;
}

export const LanguageCreator: React.FC<LanguageCreatorProps> = ({ className = '' }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState<TranslationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [apiValidated, setApiValidated] = useState<boolean | null>(null);

  const handleLanguageSelect = (languageCode: string) => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
    setSelectedLanguage(language || null);
    setError(null);
    setSuccess(false);
  };

  const validateAPI = async () => {
    setError(null);
    const result = await validateDeepLAPI();
    setApiValidated(result.valid);
    if (!result.valid) {
      setError(result.error || 'API validation failed');
    }
  };

  const handleCreateLanguageFile = async () => {
    if (!selectedLanguage) {
      setError('Please select a target language');
      return;
    }

    setIsTranslating(true);
    setError(null);
    setSuccess(false);
    setTranslationProgress(null);

    try {
      // Validate API first if not already validated
      if (apiValidated === null) {
        const validation = await validateDeepLAPI();
        setApiValidated(validation.valid);
        if (!validation.valid) {
          throw new Error(validation.error || 'DeepL API validation failed');
        }
      }

      // Start translation
      const result = await translateLanguageFile(
        selectedLanguage,
        (progress) => setTranslationProgress(progress)
      );

      if (result.success && result.translatedContent) {
        // Download the translated file
        downloadLanguageFile(result.translatedContent, selectedLanguage.code);
        setSuccess(true);
        setTranslationProgress(null);
      } else {
        throw new Error(result.error || 'Translation failed');
      }

    } catch (error) {
      console.error('Translation error:', error);
      setError(error instanceof Error ? error.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className={`bg-brand-charcoal/30 rounded-lg p-6 border border-brand-green/20 ${className}`}>
      <h3 className="text-lg font-semibold text-brand-cream mb-4 flex items-center">
        <Globe className="w-5 h-5 mr-2" />
        Custom Language File Creator
      </h3>
      
      <div className="space-y-4">
        {/* Language Selector */}
        <div>
          <label className="block text-sm font-medium text-brand-cream mb-2">
            Target Language
          </label>
          <select
            value={selectedLanguage?.code || ''}
            onChange={(e) => handleLanguageSelect(e.target.value)}
            className="w-full px-3 py-2 bg-brand-charcoal border border-brand-green rounded text-brand-cream focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
            disabled={isTranslating}
          >
            <option value="">Select a language...</option>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name} ({lang.code})
              </option>
            ))}
          </select>
        </div>

        {/* API Status */}
        {apiValidated !== null && (
          <div className={`flex items-center p-3 rounded ${
            apiValidated 
              ? 'bg-brand-green/20 text-brand-green' 
              : 'bg-brand-rust-red/20 text-brand-rust-red'
          }`}>
            {apiValidated ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <AlertCircle className="w-4 h-4 mr-2" />
            )}
            <span className="text-sm">
              {apiValidated ? 'DeepL API connection verified' : 'DeepL API connection failed'}
            </span>
          </div>
        )}

        {/* Progress Indicator */}
        {isTranslating && translationProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-brand-cream">
              <span>Translating: {translationProgress.currentKey}</span>
              <span>{translationProgress.current} / {translationProgress.total}</span>
            </div>
            <div className="w-full bg-brand-charcoal rounded-full h-2">
              <div 
                className="bg-brand-green h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(translationProgress.current / translationProgress.total) * 100}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-start p-3 bg-brand-rust-red/20 border border-brand-rust-red/50 rounded text-brand-rust-red">
            <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">Translation Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center p-3 bg-brand-green/20 border border-brand-green/50 rounded text-brand-green">
            <CheckCircle className="w-4 h-4 mr-2" />
            <div className="text-sm">
              <p className="font-medium">Translation Complete!</p>
              <p>Language file has been downloaded successfully.</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {apiValidated === null && (
            <button
              onClick={validateAPI}
              disabled={isTranslating}
              className="flex items-center px-4 py-2 bg-brand-blue hover:bg-brand-blue/80 rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Globe className="w-4 h-4 mr-2" />
              Test API Connection
            </button>
          )}

          <button
            onClick={handleCreateLanguageFile}
            disabled={!selectedLanguage || isTranslating}
            className="flex items-center px-4 py-2 bg-brand-green hover:bg-brand-green/80 rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTranslating ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isTranslating ? 'Creating...' : 'Create Custom Language File'}
          </button>
        </div>

        {/* Information */}
        <div className="text-xs text-brand-grey bg-brand-charcoal/20 p-3 rounded">
          <p className="mb-2">
            <strong>How it works:</strong>
          </p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Select your target language from the dropdown</li>
            <li>Click "Create Custom Language File" to start translation</li>
            <li>The system will translate all NPC dialogue using DeepL API</li>
            <li>Placeholders like {'{0}'}, {'{1}'} and formatting will be preserved</li>
            <li>Download will start automatically when translation is complete</li>
            <li>Upload the file to your Rust server's language folder</li>
          </ul>
        </div>
      </div>
    </div>
  );
};