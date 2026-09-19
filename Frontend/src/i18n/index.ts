import { I18n } from 'i18n-js';
import en from './translations/en';
import si from './translations/si';
import ta from './translations/ta';

const i18n = new I18n({
  en,
  si,
  ta,
});

i18n.defaultLocale = 'en';
i18n.locale = 'en';
i18n.enableFallback = true;

export default i18n;
