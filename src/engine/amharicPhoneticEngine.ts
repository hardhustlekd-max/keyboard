/**
 * Windows 10 Amharic Phonetic Composition Engine
 * 
 * Implements the exact key combination rules used in Windows 10 Amharic Power Phonetic Keyboard layout.
 * Supports consonant families, 7 Orders + Labialized forms, digraph transformations,
 * Ethiopic punctuation, and Ethiopic numbers.
 * Designed with zero external dependencies for maximum speed and lightweight Android IME compatibility.
 */

import { AmharicSyllableFamily } from '../types';

// Complete dictionary of Amharic Syllable Families mapping English base keys to Ethiopic Orders
export const AMHARIC_FAMILIES: Record<string, AmharicSyllableFamily> = {
  h: {
    consonant: 'h',
    name: 'ሀ (Ha)',
    orders: { 1: 'ሀ', 2: 'ሁ', 3: 'ሂ', 4: 'ሃ', 5: 'ሄ', 6: 'ህ', 7: 'ሆ', labialized: 'ኋ' },
  },
  H: {
    consonant: 'H',
    name: 'ሐ (Ha - Shift+H)',
    orders: { 1: 'ሐ', 2: 'ሑ', 3: 'ሒ', 4: 'ሓ', 5: 'ሔ', 6: 'ሕ', 7: 'ሖ', labialized: 'ሗ' },
  },
  l: {
    consonant: 'l',
    name: 'ለ (La)',
    orders: { 1: 'ለ', 2: 'ሉ', 3: 'ሊ', 4: 'ላ', 5: 'ሌ', 6: 'ል', 7: 'ሎ', labialized: 'ሏ' },
  },
  m: {
    consonant: 'm',
    name: 'መ (Ma)',
    orders: { 1: 'መ', 2: 'ሙ', 3: 'ሚ', 4: 'ማ', 5: 'ሜ', 6: 'ም', 7: 'ሞ', labialized: 'ሟ' },
  },
  r: {
    consonant: 'r',
    name: 'ረ (Ra)',
    orders: { 1: 'ረ', 2: 'ሩ', 3: 'ሪ', 4: 'ራ', 5: 'ሬ', 6: 'ር', 7: 'ሮ', labialized: 'ሯ' },
  },
  s: {
    consonant: 's',
    name: 'ሰ (Sa)',
    orders: { 1: 'ሰ', 2: 'ሱ', 3: 'ሲ', 4: 'ሳ', 5: 'ሴ', 6: 'ስ', 7: 'ሶ', labialized: 'ሷ' },
  },
  S: {
    consonant: 'S',
    name: 'ሠ (Sa - Shift+S)',
    orders: { 1: 'ሠ', 2: 'ሡ', 3: 'ሢ', 4: 'ሣ', 5: 'ሤ', 6: 'ሥ', 7: 'ሦ', labialized: 'ሧ' },
  },
  q: {
    consonant: 'q',
    name: 'ቀ (Qa)',
    orders: { 1: 'ቀ', 2: 'ቁ', 3: 'ቂ', 4: 'ቃ', 5: 'ቄ', 6: 'ቅ', 7: 'ቆ', labialized: 'ቋ' },
  },
  b: {
    consonant: 'b',
    name: 'በ (Ba)',
    orders: { 1: 'በ', 2: 'ቡ', 3: 'ቢ', 4: 'ባ', 5: 'ቤ', 6: 'ብ', 7: 'ቦ', labialized: 'ቧ' },
  },
  v: {
    consonant: 'v',
    name: 'ቨ (Va)',
    orders: { 1: 'ቨ', 2: 'ቩ', 3: 'ቪ', 4: 'ቫ', 5: 'ቬ', 6: 'ቭ', 7: 'ቮ', labialized: 'ቯ' },
  },
  t: {
    consonant: 't',
    name: 'ተ (Ta)',
    orders: { 1: 'ተ', 2: 'ቱ', 3: 'ቲ', 4: 'ታ', 5: 'ቴ', 6: 'ት', 7: 'ቶ', labialized: 'ቷ' },
  },
  ch: {
    consonant: 'ch',
    name: 'ቸ (Cha - c+h)',
    orders: { 1: 'ቸ', 2: 'ቹ', 3: 'ቺ', 4: 'ቻ', 5: 'ቼ', 6: 'ች', 7: 'ቾ', labialized: 'ቿ' },
  },
  n: {
    consonant: 'n',
    name: 'ነ (Na)',
    orders: { 1: 'ነ', 2: 'ኑ', 3: 'ኒ', 4: 'ና', 5: 'ኔ', 6: 'ን', 7: 'ኖ', labialized: 'ኗ' },
  },
  N: {
    consonant: 'N',
    name: 'ኘ (Nya - Shift+N)',
    orders: { 1: 'ኘ', 2: 'ኙ', 3: 'ኚ', 4: 'ኛ', 5: '፜', 6: 'ኝ', 7: 'ኞ', labialized: '፝' },
  },
  ny: {
    consonant: 'ny',
    name: 'ኘ (Nya - n+y)',
    orders: { 1: 'ኘ', 2: 'ኙ', 3: 'ኚ', 4: 'ኛ', 5: '፜', 6: 'ኝ', 7: 'ኞ', labialized: '፝' },
  },
  a: {
    consonant: 'a',
    name: 'አ (Vowel A)',
    orders: { 1: 'አ', 2: 'ኡ', 3: 'ኢ', 4: 'ኣ', 5: 'ኤ', 6: 'እ', 7: 'ኦ', labialized: 'ኧ' },
  },
  A: {
    consonant: 'A',
    name: 'ዐ (Vowel Ayn - Shift+A)',
    orders: { 1: 'ዐ', 2: 'ዑ', 3: 'ዒ', 4: 'ዓ', 5: 'ዔ', 6: 'ዕ', 7: 'ዖ' },
  },
  k: {
    consonant: 'k',
    name: 'ከ (Ka)',
    orders: { 1: 'ከ', 2: 'ኩ', 3: 'ኪ', 4: 'ካ', 5: 'ኬ', 6: 'ክ', 7: 'ኮ', labialized: 'ኳ' },
  },
  w: {
    consonant: 'w',
    name: 'ወ (Wa)',
    orders: { 1: 'ወ', 2: 'ዉ', 3: 'ዊ', 4: 'ዋ', 5: 'ዌ', 6: 'ው', 7: 'ዎ' },
  },
  x: {
    consonant: 'x',
    name: 'ዐ (Ayn)',
    orders: { 1: 'ዐ', 2: 'ዑ', 3: 'ዒ', 4: 'ዓ', 5: 'ዔ', 6: 'ዕ', 7: 'ዖ' },
  },
  z: {
    consonant: 'z',
    name: 'ዘ (Za)',
    orders: { 1: 'ዘ', 2: 'ዙ', 3: 'ዚ', 4: 'ዛ', 5: 'ዜ', 6: 'ዝ', 7: 'ዞ', labialized: 'ዟ' },
  },
  Z: {
    consonant: 'Z',
    name: 'ዠ (Zha - Shift+Z)',
    orders: { 1: 'ዠ', 2: 'ዡ', 3: 'ዢ', 4: 'ዣ', 5: 'ዤ', 6: 'ዥ', 7: 'ዦ', labialized: 'ዧ' },
  },
  zh: {
    consonant: 'zh',
    name: 'ዠ (Zha - z+h)',
    orders: { 1: 'ዠ', 2: 'ዡ', 3: 'ዢ', 4: 'ዣ', 5: 'ዤ', 6: 'ዥ', 7: 'ዦ', labialized: 'ዧ' },
  },
  y: {
    consonant: 'y',
    name: 'የ (Ya)',
    orders: { 1: 'የ', 2: 'ዩ', 3: 'ዪ', 4: 'ያ', 5: 'ዬ', 6: 'ይ', 7: 'ዮ' },
  },
  d: {
    consonant: 'd',
    name: 'ደ (Da)',
    orders: { 1: 'ደ', 2: 'ዱ', 3: 'ዲ', 4: 'ዳ', 5: 'ዴ', 6: 'ድ', 7: 'ዶ', labialized: 'ዷ' },
  },
  j: {
    consonant: 'j',
    name: 'ጀ (Ja)',
    orders: { 1: 'ጀ', 2: 'ጁ', 3: 'ጂ', 4: 'ጃ', 5: 'ጄ', 6: 'ጅ', 7: 'ጆ', labialized: 'ጇ' },
  },
  g: {
    consonant: 'g',
    name: 'ገ (Ga)',
    orders: { 1: 'ገ', 2: 'ጉ', 3: 'ጊ', 4: 'ጋ', 5: 'ጌ', 6: 'ግ', 7: 'ጎ', labialized: 'ጓ' },
  },
  T: {
    consonant: 'T',
    name: 'ጠ (Ta - Shift+T)',
    orders: { 1: 'ጠ', 2: 'ጡ', 3: 'ጢ', 4: 'ጣ', 5: 'ጤ', 6: 'ጥ', 7: 'ጦ', labialized: 'ጧ' },
  },
  C: {
    consonant: 'C',
    name: 'ጨ (Cha - Shift+C)',
    orders: { 1: 'ጨ', 2: 'ጩ', 3: 'ጪ', 4: 'ጫ', 5: 'ጬ', 6: 'ጭ', 7: 'ጮ', labialized: 'ጯ' },
  },
  P: {
    consonant: 'P',
    name: 'ጰ (Pa - Shift+P)',
    orders: { 1: 'ጰ', 2: 'ጱ', 3: 'ጲ', 4: 'ጳ', 5: 'ጴ', 6: 'ጵ', 7: 'ጶ', labialized: 'ጷ' },
  },
  ts: {
    consonant: 'ts',
    name: 'ጸ (Tsa - t+s)',
    orders: { 1: 'ጸ', 2: 'ጹ', 3: 'ጺ', 4: 'ጻ', 5: 'ጼ', 6: 'ጽ', 7: 'ጾ', labialized: 'ጿ' },
  },
  TS: {
    consonant: 'TS',
    name: 'ጸ (Tsa - Shift TS)',
    orders: { 1: 'ጸ', 2: 'ጹ', 3: 'ጺ', 4: 'ጻ', 5: 'ጼ', 6: 'ጽ', 7: 'ጾ', labialized: 'ጿ' },
  },
  tz: {
    consonant: 'tz',
    name: 'ፀ (Tza - t+z)',
    orders: { 1: 'ፀ', 2: 'ፁ', 3: 'ፂ', 4: 'ፃ', 5: 'ፄ', 6: 'ፅ', 7: 'ፆ' },
  },
  f: {
    consonant: 'f',
    name: 'ፈ (Fa)',
    orders: { 1: 'ፈ', 2: 'ፉ', 3: 'ፊ', 4: 'ፋ', 5: 'ፌ', 6: 'ፍ', 7: 'ፎ', labialized: 'ፏ' },
  },
  p: {
    consonant: 'p',
    name: 'ፐ (Pa)',
    orders: { 1: 'ፐ', 2: 'ፑ', 3: 'ፒ', 4: 'ፓ', 5: 'ፔ', 6: 'ፕ', 7: 'ፖ', labialized: 'ፗ' },
  },
};

// Ethiopic Punctuation Mappings
export const ETHIOPIC_PUNCTUATION: Record<string, string> = {
  '::': '፡', // Wordspace
  ':::': '።', // Full stop
  ',': '፥',
  ';': '፤',
  '?': '፧',
  ':': '፡',
};

// Ethiopic Numerals Mappings
export const ETHIOPIC_NUMERALS: Record<string, string> = {
  '1': '፩',
  '2': '፪',
  '3': '፫',
  '4': '፬',
  '5': '፭',
  '6': '፮',
  '7': '፯',
  '8': '፰',
  '9': '፱',
  '10': '፲',
  '20': '፳',
  '30': '፴',
  '40': '፵',
  '50': '፶',
  '60': '፷',
  '70': '፰',
  '80': '፹',
  '90': '፺',
  '100': '፻',
};

export interface CompositionResult {
  /** Text that should replace the active buffer or be inserted */
  outputChar: string;
  /** Length of the input buffer consumed (so the caller knows how many chars to delete before inserting outputChar) */
  replaceLength: number;
  /** New state of the key composition buffer */
  newBuffer: string;
}

/**
 * Core Windows 10 Amharic Phonetic Composition Engine
 * 
 * @param key - The new key pressed (e.g., 's', 'u', 'h', 'a', 'C', etc.)
 * @param currentBuffer - The currently active uncommitted QWERTY buffer (e.g. "s", "ch", "k")
 * @returns CompositionResult with updated output character and new buffer state
 */
export function processAmharicKey(key: string, currentBuffer: string): CompositionResult {
  const combined = currentBuffer + key;

  // Handle double colon / punctuation combinations
  if (key === ':' && currentBuffer === ':') {
    return { outputChar: '፡', replaceLength: 1, newBuffer: '' };
  }
  if (key === ':' && currentBuffer === '::') {
    return { outputChar: '።', replaceLength: 1, newBuffer: '' };
  }
  if (key === ',' && ETHIOPIC_PUNCTUATION[',']) {
    return { outputChar: '፥', replaceLength: currentBuffer.length, newBuffer: '' };
  }
  if (key === ';' && ETHIOPIC_PUNCTUATION[';']) {
    return { outputChar: '፤', replaceLength: currentBuffer.length, newBuffer: '' };
  }
  if (key === '?' && ETHIOPIC_PUNCTUATION['?']) {
    return { outputChar: '፧', replaceLength: currentBuffer.length, newBuffer: '' };
  }

  // Handle Digraphs (e.g. c+h -> ch -> ቸ, z+h -> zh -> ዠ, n+y -> ny -> ኘ, t+s -> ts -> ጸ, t+z -> tz -> ፀ)
  if (combined === 'ch' || combined === 'c' || combined === 'zh' || combined === 'ny' || combined === 'ts' || combined === 'tz') {
    if (combined === 'c') {
      // 'c' alone previews ቸ order 1 in Windows 10 Phonetic
      return { outputChar: AMHARIC_FAMILIES.ch.orders[1], replaceLength: currentBuffer.length, newBuffer: 'ch' };
    }
    if (AMHARIC_FAMILIES[combined]) {
      const char = AMHARIC_FAMILIES[combined].orders[1];
      return { outputChar: char, replaceLength: currentBuffer.length, newBuffer: combined };
    }
  }

  // If we have an active consonant buffer (e.g. "s", "ch", "k", "t", "T", "m", etc.)
  if (currentBuffer && AMHARIC_FAMILIES[currentBuffer]) {
    const family = AMHARIC_FAMILIES[currentBuffer];

    // Vowel modifier keys for Orders 1-7
    if (key === 'u' || key === 'U') {
      return { outputChar: family.orders[2], replaceLength: 1, newBuffer: '' };
    }
    if (key === 'i') {
      return { outputChar: family.orders[3], replaceLength: 1, newBuffer: '' };
    }
    if (key === 'a') {
      return { outputChar: family.orders[4], replaceLength: 1, newBuffer: '' };
    }
    if (key === 'e' || key === 'E') {
      return { outputChar: family.orders[5], replaceLength: 1, newBuffer: '' };
    }
    if (key === 'I') {
      // 6th order explicitly via capital I
      return { outputChar: family.orders[6], replaceLength: 1, newBuffer: '' };
    }
    if (key === 'o' || key === 'O') {
      return { outputChar: family.orders[7], replaceLength: 1, newBuffer: '' };
    }
    if ((key === 'w' || key === 'W') && family.orders.labialized) {
      // 8th order / labialized (e.g., s + w -> ሷ)
      return { outputChar: family.orders.labialized, replaceLength: 1, newBuffer: '' };
    }

    // Special case: "wa" after consonant (e.g. "k" + "w" + "a" -> ኳ)
    if (currentBuffer.endsWith('w') && key === 'a') {
      const baseConsonant = currentBuffer.slice(0, -1);
      if (AMHARIC_FAMILIES[baseConsonant]?.orders.labialized) {
        return {
          outputChar: AMHARIC_FAMILIES[baseConsonant].orders.labialized!,
          replaceLength: 1,
          newBuffer: '',
        };
      }
    }
  }

  // If the key is a new base consonant key (e.g. 's', 'l', 'm', 'r', 'H', 'S', etc.)
  if (AMHARIC_FAMILIES[key]) {
    const family = AMHARIC_FAMILIES[key];
    // In Windows 10 Phonetic, typing a base consonant key outputs Order 1 (e.g. 's' -> 'ሰ')
    // and keeps the buffer active so subsequent vowel can modify it
    return {
      outputChar: family.orders[1],
      replaceLength: 0, // Insert new character
      newBuffer: key,
    };
  }

  // Handle standalone vowels at word start (e.g. 'a' -> 'አ', 'e' -> 'ኤ', 'u' -> 'ኡ', 'i' -> 'ኢ', 'o' -> 'ኦ')
  if (key === 'a') return { outputChar: 'አ', replaceLength: currentBuffer.length, newBuffer: 'a' };
  if (key === 'u') return { outputChar: 'ኡ', replaceLength: currentBuffer.length, newBuffer: '' };
  if (key === 'i') return { outputChar: 'ኢ', replaceLength: currentBuffer.length, newBuffer: '' };
  if (key === 'e') return { outputChar: 'ኤ', replaceLength: currentBuffer.length, newBuffer: '' };
  if (key === 'o') return { outputChar: 'ኦ', replaceLength: currentBuffer.length, newBuffer: '' };
  if (key === 'A') return { outputChar: 'ዐ', replaceLength: currentBuffer.length, newBuffer: 'A' };

  // Fallback for non-Amharic keys (numbers, spaces, punctuation)
  return {
    outputChar: key,
    replaceLength: 0,
    newBuffer: '',
  };
}

/**
 * Helper to get the Amharic preview character for a QWERTY key cap display
 */
export function getAmharicKeycapPreview(key: string, isShift: boolean): string {
  const targetKey = isShift ? key.toUpperCase() : key.toLowerCase();

  // Custom shift overrides for keycap visuals
  if (isShift) {
    if (key === 's') return 'ሠ';
    if (key === 'h') return 'ሐ';
    if (key === 't') return 'ጠ';
    if (key === 'c') return 'ጨ';
    if (key === 'p') return 'ጰ';
    if (key === 'z') return 'ዠ';
    if (key === 'n') return 'ኘ';
    if (key === 'a') return 'ዐ';
  }

  if (AMHARIC_FAMILIES[targetKey]) {
    return AMHARIC_FAMILIES[targetKey].orders[1];
  }

  return '';
}
