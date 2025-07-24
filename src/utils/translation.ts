import { NPCTraderLanguageFile, DEFAULT_LANGUAGE_CONTENT, SupportedLanguage } from '../types/config';

// DeepL API configuration
const DEEPL_API_KEY = '774d119e-b7b4-4bfb-8279-f4b96572b0dc:fx';
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

// CORS proxy for development (remove in production)
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

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
 * Translates text using DeepL API with CORS proxy
 */
async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    // For browser requests, we need to use a CORS proxy or backend service
    const url = `${CORS_PROXY}${encodeURIComponent(DEEPL_API_URL)}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        text: [text],
        target_lang: targetLanguage,
        source_lang: 'EN',
        preserve_formatting: true,
        tag_handling: 'xml'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepL API error: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const result = await response.json();

    if (!result.translations || !result.translations[0]) {
      throw new Error('Invalid response from DeepL API');
    }

    return result.translations[0].text;
  } catch (error) {
    console.error('Translation error:', error);
    
    // More specific error messages
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to DeepL API. Check your internet connection.');
    }
    
    if (error instanceof Error && error.message.includes('CORS')) {
      throw new Error('CORS error: Direct browser access to DeepL API is restricted. Consider using a backend service.');
    }
    
    throw error;
  }
}

/**
 * Alternative translation method using direct fetch with timeout and retry
 */
async function translateTextDirect(text: string, targetLanguage: string, retries = 2): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(DEEPL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
          'Accept': 'application/json',
          'User-Agent': 'NPCTrader-Config/1.0'
        },
        body: JSON.stringify({
          text: [text],
          target_lang: targetLanguage,
          source_lang: 'EN',
          preserve_formatting: true,
          tag_handling: 'xml'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (!result.translations || !result.translations[0]) {
        throw new Error('Invalid response from DeepL API');
      }

      return result.translations[0].text;
    } catch (error) {
      if (attempt === retries) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout: DeepL API took too long to respond');
        }
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Preserves placeholders and formatting in translation
 */
function preprocessText(text: string): string {
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

        // Try direct translation first, then fallback to CORS proxy
        let translated: string;
        try {
          translated = await translateTextDirect(preprocessed, targetLanguage.deeplCode);
        } catch (directError) {
          console.warn(`Direct translation failed for "${key}", trying CORS proxy:`, directError);
          translated = await translateText(preprocessed, targetLanguage.deeplCode);
        }

        // Postprocess to restore placeholders
        translatedContent[key] = postprocessText(translated);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

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
 * Validates DeepL API connectivity with fallback methods
 */
export async function validateDeepLAPI(): Promise<{ valid: boolean; error?: string }> {
  try {
    const testText = 'Hello world';
    
    // Try direct connection first
    try {
      await translateTextDirect(testText, 'ES');
      return { valid: true };
    } catch (directError) {
      console.warn('Direct API validation failed, trying CORS proxy:', directError);
      
      // Fallback to CORS proxy
      try {
        await translateText(testText, 'ES');
        return { valid: true };
      } catch (proxyError) {
        throw proxyError;
      }
    }
  } catch (error) {
    let errorMessage = 'API validation failed';
    
    if (error instanceof Error) {
      if (error.message.includes('CORS')) {
        errorMessage = 'CORS error: DeepL API cannot be accessed directly from browser. Consider using a backend service.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error: Check your internet connection and API key.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Timeout error: DeepL API is not responding.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      valid: false,
      error: errorMessage
    };
  }
}
