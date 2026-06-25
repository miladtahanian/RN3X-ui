import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGES, t as translate, tWithVars } from '../utils/i18n';

const LanguageContext = createContext(null);

const STORAGE_KEY = '@3xui_language';

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState('fa');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved && LANGUAGES.find((l) => l.code === saved)) {
        setLocale(saved);
      }
    } catch (e) {
      console.log('Language load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = useCallback(async (code) => {
    const lang = LANGUAGES.find((l) => l.code === code);
    if (!lang) return;
    await AsyncStorage.setItem(STORAGE_KEY, code);
    I18nManager.forceRTL(lang.direction === 'rtl');
    I18nManager.allowRTL(lang.direction === 'rtl');
    setLocale(code);
  }, []);

  const t = useCallback((key, vars) => {
    if (vars) return tWithVars(key, vars, locale);
    return translate(key, locale);
  }, [locale]);

  const direction = LANGUAGES.find((l) => l.code === locale)?.direction || 'ltr';

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t, direction, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
