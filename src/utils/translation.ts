import { NPCTraderLanguageFile, DEFAULT_LANGUAGE_CONTENT, SupportedLanguage } from '../types/config';

// DeepL API configuration
const DEEPL_API_KEY = import.meta.env.VITE_DEEPL_API_KEY;
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

export interface TranslationProgress {
  current: number;
  total: number;
  currentKey: string;
}

export interface TranslationResult {
  success: boolean;
  translatedContent?: NPCTraderLanguageFile;
  error?: string;
}

/**
 * Translates text using DeepL API
 */
async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!DEEPL_API_KEY) {
    throw new Error('DeepL API key is not configured. Please set the VITE_DEEPL_API_KEY environment variable.');
  }

  const formData = new FormData();
  formData.append('auth_key', DEEPL_API_KEY);
  formData.append('text', text);
  formData.append('target_lang', targetLanguage);
  formData.append('source_lang', 'EN');
  formData.append('preserve_formatting', '1');
  formData.append('tag_handling', 'xml');

  try {
    const response = await fetch(DEEPL_API_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.translations || !result.translations[0]) {
      throw new Error('Invalid response from DeepL API');
    }

    return result.translations[0].text;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

/**
 * Preserves placeholders and formatting in translation
 */
function preprocessText(text: string): string {
  // Replace placeholders with XML tags to preserve them
  let processed = text;
  
  // Preserve {0}, {1}, etc. placeholders
  processed = processed.replace(/\{(\d+)\}/g, '<placeholder>$1</placeholder>');
  
  // Preserve \\n escape sequences  
  processed = processed.replace(/\\n/g, '<newline></newline>');
  
  return processed;
}

/**
 * Restores placeholders and formatting after translation
 */
function postprocessText(text: string): string {
  let processed = text;
  
  // Restore placeholders
  processed = processed.replace(/<placeholder>(\d+)<\/placeholder>/g, '{$1}');
  
  // Restore newlines
  processed = processed.replace(/<newline><\/newline>/g, '\\n');
  
  return processed;
}

/**
 * Translates the entire NPCTrader language file
 */
export async function translateLanguageFile(
  targetLanguage: SupportedLanguage,
  onProgress?: (progress: TranslationProgress) => void
): Promise<TranslationResult> {
  try {
    const translatedContent: Record<string, string> = {};
    const entries = Object.entries(DEFAULT_LANGUAGE_CONTENT);
    const total = entries.length;

    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      
      // Report progress
      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          currentKey: key
        });
      }

      try {
        // Preprocess text to preserve placeholders
        const preprocessed = preprocessText(value);
        
        // Translate the text
        const translated = await translateText(preprocessed, targetLanguage.deeplCode);
        
        // Postprocess to restore placeholders
        translatedContent[key] = postprocessText(translated);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error translating key "${key}":`, error);
        // Keep original text if translation fails
        translatedContent[key] = value;
      }
    }

    return {
      success: true,
      translatedContent: translatedContent as NPCTraderLanguageFile
    };

  } catch (error) {
    console.error('Translation process error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown translation error'
    };
  }
}

/**
 * Downloads the translated language file
 */
export function downloadLanguageFile(content: NPCTraderLanguageFile, languageCode: string): void {
  const fileName = `NPCTrader_${languageCode}.json`;
  const jsonContent = JSON.stringify(content, null, 2);
  
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  
  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Validates DeepL API connectivity
 */
export async function validateDeepLAPI(): Promise<{ valid: boolean; error?: string }> {
  try {
    const testText = 'Hello world';
    await translateText(testText, 'ES');
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'API validation failed'
    };
  }
}