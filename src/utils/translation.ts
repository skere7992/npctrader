import { NPCTraderLanguageFile, DEFAULT_LANGUAGE_CONTENT, SupportedLanguage } from '../types/config';

// DeepL API configuration
const DEEPL_API_KEY = '0feb9bff-7c03-41ff-9d34-fa108b2a910e:fx';
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

// Multiple CORS proxies for better reliability
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/'
];

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
 * Translates text using DeepL API with multiple CORS proxy fallbacks
 */
async function translateText(text: string, targetLanguage: string): Promise<string> {
  let lastError: Error | null = null;

  // Try each CORS proxy
  for (const proxy of CORS_PROXIES) {
    try {
      console.log(`Attempting translation with proxy: ${proxy}`);
      
      const url = `${proxy}${encodeURIComponent(DEEPL_API_URL)}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
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
        throw new Error('Invalid response format from DeepL API');
      }

      console.log(`Translation successful with proxy: ${proxy}`);
      return result.translations[0].text;
      
    } catch (error) {
      console.warn(`Proxy ${proxy} failed:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error');
      // Continue to next proxy
    }
  }

  // If all proxies failed, throw the last error
  if (lastError) {
    if (lastError.name === 'AbortError') {
      throw new Error('Request timeout: All CORS proxies took too long to respond');
    }
    if (lastError.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to DeepL API through any proxy. Check your internet connection and API key.');
    }
    throw new Error(`All CORS proxies failed. Last error: ${lastError.message}`);
  }
  
  throw new Error('Translation failed: No proxies available');
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

        // Use CORS proxy method (more reliable for browser)
        const translated = await translateText(preprocessed, targetLanguage.deeplCode);

        // Postprocess to restore placeholders
        translatedContent[key] = postprocessText(translated);

        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 800));

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
 * Validates DeepL API connectivity with multiple fallback methods
 */
export async function validateDeepLAPI(): Promise<{ valid: boolean; error?: string }> {
  try {
    console.log('Validating DeepL API with key:', DEEPL_API_KEY.substring(0, 8) + '...');
    
    const testText = 'Hello world';
    
    // Try direct connection first (will likely fail due to CORS)
    try {
      console.log('Attempting direct API connection...');
      await translateTextDirect(testText, 'ES');
      console.log('Direct API connection successful!');
      return { valid: true };
    } catch (directError) {
      console.warn('Direct API connection failed (expected due to CORS):', directError);
      
      // Fallback to CORS proxies
      try {
        console.log('Attempting CORS proxy connections...');
        await translateText(testText, 'ES');
        console.log('CORS proxy connection successful!');
        return { valid: true };
      } catch (proxyError) {
        console.error('All connection methods failed:', proxyError);
        throw proxyError;
      }
    }
  } catch (error) {
    let errorMessage = 'API validation failed';
    
    if (error instanceof Error) {
      if (error.message.includes('HTTP 403') || error.message.includes('Authentication failed')) {
        errorMessage = 'Invalid API key: Please check your DeepL API key is correct and active.';
      } else if (error.message.includes('HTTP 456')) {
        errorMessage = 'Quota exceeded: Your DeepL API usage limit has been reached.';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'CORS error: Browser security restrictions prevent direct API access.';
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = 'Network error: Check your internet connection and firewall settings.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Timeout error: DeepL API or proxies are not responding.';
      } else if (error.message.includes('All CORS proxies failed')) {
        errorMessage = 'Connection failed: All proxy services are unavailable. Try again later or check your internet connection.';
      } else {
        errorMessage = `API Error: ${error.message}`;
      }
    }
    
    console.error('API validation failed:', errorMessage);
    return {
      valid: false,
      error: errorMessage
    };
  }
}
