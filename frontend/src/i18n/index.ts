import { TranslationSchema } from './schema';
import { en } from './locales/en';
import { kn } from './locales/kn';
import { hi } from './locales/hi';
import { ta } from './locales/ta';
import { te } from './locales/te';
import { ml } from './locales/ml';
import { mr } from './locales/mr';
import { bn } from './locales/bn';
import { gu } from './locales/gu';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { zh } from './locales/zh';
import { ja } from './locales/ja';

export const translations: Record<string, TranslationSchema> = {
  en,
  kn,
  hi,
  ta,
  te,
  ml,
  mr,
  bn,
  gu,
  es,
  fr,
  de,
  zh,
  ja
};

export const supportedLanguages = [
  { value: "en",  label: "English",                  flag: "🇺🇸" },
  { value: "kn",  label: "ಕನ್ನಡ (Kannada)",          flag: "🇮🇳" },
  { value: "hi",  label: "हिन्दी (Hindi)",             flag: "🇮🇳" },
  { value: "ta",  label: "தமிழ் (Tamil)",              flag: "🇮🇳" },
  { value: "te",  label: "తెలుగు (Telugu)",            flag: "🇮🇳" },
  { value: "ml",  label: "മലയാളം (Malayalam)",         flag: "🇮🇳" },
  { value: "mr",  label: "मराठी (Marathi)",             flag: "🇮🇳" },
  { value: "bn",  label: "বাংলা (Bengali)",             flag: "🇧🇩" },
  { value: "gu",  label: "ગુજરાતી (Gujarati)",         flag: "🇮🇳" },
  { value: "es",  label: "Español (Spanish)",          flag: "🇪🇸" },
  { value: "fr",  label: "Français (French)",          flag: "🇫🇷" },
  { value: "de",  label: "Deutsch (German)",           flag: "🇩🇪" },
  { value: "zh",  label: "中文 (Chinese)",              flag: "🇨🇳" },
  { value: "ja",  label: "日本語 (Japanese)",           flag: "🇯🇵" },
];
