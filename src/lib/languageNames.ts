/**
 * Language code to full name mapping for OpenAI Whisper supported languages
 * Whisper supports 99 languages - this includes all major languages
 */

export const languageNames: Record<string, string> = {
  // Major languages
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'nl': 'Dutch',
  'ru': 'Russian',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'tr': 'Turkish',
  'pl': 'Polish',
  'uk': 'Ukrainian',
  'vi': 'Vietnamese',
  'th': 'Thai',
  'id': 'Indonesian',
  
  // Indian languages (all supported by Whisper)
  'ml': 'Malayalam', // ✅ Malayalam is fully supported
  'ta': 'Tamil',
  'te': 'Telugu',
  'kn': 'Kannada',
  'mr': 'Marathi',
  'gu': 'Gujarati',
  'bn': 'Bengali',
  'pa': 'Punjabi',
  'ur': 'Urdu',
  'or': 'Odia',
  'as': 'Assamese',
  'sa': 'Sanskrit',
  
  // European languages
  'ro': 'Romanian',
  'cs': 'Czech',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish',
  'hu': 'Hungarian',
  'el': 'Greek',
  'bg': 'Bulgarian',
  'sr': 'Serbian',
  'hr': 'Croatian',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'lt': 'Lithuanian',
  'lv': 'Latvian',
  'et': 'Estonian',
  'is': 'Icelandic',
  'ga': 'Irish',
  'cy': 'Welsh',
  'mt': 'Maltese',
  
  // Middle Eastern & African
  'fa': 'Persian',
  'he': 'Hebrew',
  'sw': 'Swahili',
  'am': 'Amharic',
  'af': 'Afrikaans',
  'zu': 'Zulu',
  'xh': 'Xhosa',
  'yo': 'Yoruba',
  'ha': 'Hausa',
  
  // Asian languages
  'ms': 'Malay',
  'tl': 'Tagalog',
  'jw': 'Javanese',
  'su': 'Sundanese',
  'my': 'Burmese',
  'km': 'Khmer',
  'lo': 'Lao',
  'si': 'Sinhala',
  'ne': 'Nepali',
  'ps': 'Pashto',
  'sd': 'Sindhi',
  
  // Other languages
  'sq': 'Albanian',
  'az': 'Azerbaijani',
  'eu': 'Basque',
  'be': 'Belarusian',
  'bs': 'Bosnian',
  'ca': 'Catalan',
  'gl': 'Galician',
  'ka': 'Georgian',
  'hy': 'Armenian',
  'kk': 'Kazakh',
  'ky': 'Kyrgyz',
  'lb': 'Luxembourgish',
  'mk': 'Macedonian',
  'mn': 'Mongolian',
  'mi': 'Maori',
  'tg': 'Tajik',
  'tt': 'Tatar',
  'tk': 'Turkmen',
  'uz': 'Uzbek',
  'yi': 'Yiddish',
  'fo': 'Faroese',
  'ht': 'Haitian Creole',
  'la': 'Latin',
  'ln': 'Lingala',
  'mg': 'Malagasy',
  'oc': 'Occitan',
  'sn': 'Shona',
  'so': 'Somali',
  'br': 'Breton',
  'bo': 'Tibetan',
  'haw': 'Hawaiian',
  'nn': 'Norwegian Nynorsk',
};

/**
 * Get full language name from language code
 * @param code - ISO 639-1 language code (e.g., 'ml', 'en', 'zh')
 * @returns Full language name or the code if not found
 */
export function getLanguageName(code: string): string {
  if (!code) return 'Unknown';
  
  // Handle potential variations
  const normalizedCode = code.toLowerCase().trim();
  
  return languageNames[normalizedCode] || code.toUpperCase();
}

/**
 * Check if a language is supported by OpenAI Whisper
 * @param code - Language code to check
 * @returns true if supported, false otherwise
 */
export function isLanguageSupported(code: string): boolean {
  const normalizedCode = code.toLowerCase().trim();
  return normalizedCode in languageNames;
}

/**
 * Get all supported languages
 * @returns Array of language codes
 */
export function getSupportedLanguages(): string[] {
  return Object.keys(languageNames);
}

/**
 * Malayalam language support confirmation
 * Malayalam (മലയാളം) is fully supported by OpenAI Whisper
 * Language code: 'ml'
 * Native to Kerala, India
 */
export const MALAYALAM_SUPPORT = {
  supported: true,
  code: 'ml',
  name: 'Malayalam',
  nativeName: 'മലയാളം',
  region: 'Kerala, India',
  speakers: '38+ million',
  notes: 'Fully supported by OpenAI Whisper with high accuracy'
};
