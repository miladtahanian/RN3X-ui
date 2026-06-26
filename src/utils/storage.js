import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SERVER_URL: '@3xui_server_url',
  SESSION_COOKIE: '@3xui_session_cookie',
  USERNAME: '@3xui_username',
  LANGUAGE: '@3xui_language',
  ACCOUNTS: '@3xui_accounts',
  SUB_PORT: '@3xui_sub_port',
  SUB_PATH: '@3xui_sub_path',
  API_TOKEN: '@3xui_api_token',
};

let accountsCache = null;

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
  async getAccounts() {
    if (accountsCache) return accountsCache;
    const raw = await AsyncStorage.getItem(KEYS.ACCOUNTS);
    const accounts = raw ? JSON.parse(raw) : [];
    accountsCache = accounts;
    return accounts;
  },
  async saveAccount(account) {
    const accounts = await this.getAccounts();
    const idx = accounts.findIndex((a) => a.id === account.id);
    if (idx >= 0) {
      accounts[idx] = { ...accounts[idx], ...account };
    } else {
      accounts.push(account);
    }
    accountsCache = accounts;
    await AsyncStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
  },
  async deleteAccount(id) {
    const accounts = await this.getAccounts();
    const filtered = accounts.filter((a) => a.id !== id);
    accountsCache = filtered;
    await AsyncStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(filtered));
  },
  async saveSubPort(port) {
    await AsyncStorage.setItem(KEYS.SUB_PORT, port);
  },
  async getSubPort() {
    return AsyncStorage.getItem(KEYS.SUB_PORT);
  },
  async saveSubPath(path) {
    await AsyncStorage.setItem(KEYS.SUB_PATH, path);
  },
  async getSubPath() {
    return AsyncStorage.getItem(KEYS.SUB_PATH);
  },
  async saveApiToken(token) {
    await AsyncStorage.setItem(KEYS.API_TOKEN, token);
  },
  async getApiToken() {
    return AsyncStorage.getItem(KEYS.API_TOKEN);
  },
  async clearSession() {
    const { LANGUAGE, ACCOUNTS, SUB_PORT, SUB_PATH, API_TOKEN, ...rest } = KEYS;
    await AsyncStorage.multiRemove(Object.values(rest));
  },
  async clearAll() {
    accountsCache = null;
    const { LANGUAGE, SUB_PORT, SUB_PATH, API_TOKEN, ...rest } = KEYS;
    await AsyncStorage.multiRemove(Object.values(rest));
  },
};
