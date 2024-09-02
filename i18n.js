import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translations from "./Translations/translations.json"


const deviceLang = Localization.getLocales()[0].languageCode.slice(0,2);
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: translations.en,
      },
      ar: {
        translation: translations.ar,
      },
    },
    compatibilityJSON: 'v3',
    lng: deviceLang,
    interpolation: {
      escapeValue: false // react already safes from xss
    }
});


export const changeLanguage = (language) => {

  i18n.changeLanguage(language);
  
  const isRTL = language === 'ar';
  I18nManager.forceRTL(isRTL);
  I18nManager.allowRTL(isRTL);
  
//   if (I18nManager.isRTL !== isRTL) {
//     Updates.reloadAsync();
//   }
};

export default i18n;