/**
 * Types for Amharic Android Keyboard & IME Engine
 * Supports Windows 10 Amharic Phonetic mappings and Android 2.4+ IME specs
 */

export type LanguageMode = 'english' | 'amharic';

export interface KeyMap {
  base: string; // e.g., 'h', 's', 'm'
  shift?: string; // e.g., 'H', 'S', 'M'
  label: string; // Display on keycap
  amharicPreview?: string; // Quick preview of 1st order Amharic char
}

export interface PhoneticMapping {
  keyCombo: string;
  order: number;
  amharicChar: string;
  description: string;
}

export interface AmharicSyllableFamily {
  consonant: string;
  name: string;
  orders: {
    1: string; // e.g. ሀ (Ä / default)
    2: string; // e.g. ሁ (U)
    3: string; // e.g. ሂ (I)
    4: string; // e.g. ሃ (A)
    5: string; // e.g. ሄ (E)
    6: string; // e.g. ህ (short / consonant)
    7: string; // e.g. ሆ (O)
    labialized?: string; // e.g. ኋ (wa)
  };
}

export type ThemeMode = 'light' | 'dark' | 'retro-gingerbread' | 'material-blue';

export interface AndroidCodeFile {
  filename: string;
  path: string;
  language: 'java' | 'xml' | 'groovy' | 'json';
  description: string;
  content: string;
}
