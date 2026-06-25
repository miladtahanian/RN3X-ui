import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SERVER_URL: '@3xui_server_url',
  SESSION_COOKIE: '@3xui_session_cookie',
  USERNAME: '@3xui_username',
  LANGUAGE: '@3xui_language',
};

export const storage = {
  async saveServerUrl(url) {
    await AsyncStorage.setItem(KEYS.SERVER_URL, url);
  },
  async getServerUrl() {
    return AsyncStorage.getItem(KEYS.SERVER_URL);
  },
  async saveSession(cookie) {
    await AsyncStorage.setItem(KEYS.SESSION_COOKIE, cookie);
  },
  async getSession() {
    return AsyncStorage.getItem(KEYS.SESSION_COOKIE);
  },
  async saveUsername(username) {
    await AsyncStorage.setItem(KEYS.USERNAME, username);
  },
  async getUsername() {
    return AsyncStorage.getItem(KEYS.USERNAME);
  },
  async saveLanguage(lang) {
    await AsyncStorage.setItem(KEYS.LANGUAGE, lang);
  },
  async getLanguage() {
    return AsyncStorage.getItem(KEYS.LANGUAGE);
  },
  async clearAll() {
    const { LANGUAGE, ...rest } = KEYS;
    await AsyncStorage.multiRemove(Object.values(rest));
  },
};
