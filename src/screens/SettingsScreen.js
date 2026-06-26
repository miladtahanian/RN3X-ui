import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Animated,
  Linking,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { settingsApi } from '../api/settings';
import { serverApi } from '../api/server';
import { colors, spacing } from '../utils/colors';
import { storage } from '../utils/storage';
import { LANGUAGES } from '../utils/i18n';

const APP_VERSION = '1.0.3';
const GITHUB_REPO = 'miladtahanian/RN3X-ui';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return (i >= 3 ? value.toFixed(2) : value.toFixed(1)) + ' ' + sizes[i];
}

function AnimatedSection({ children, delay = 0, style }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

function InfoRow({ label, value, valueColor }) {
  if (value == null) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor && { color: valueColor }]} numberOfLines={1}>{String(value)}</Text>
    </View>
  );
}

function ActionButton({ icon, label, onPress, color }) {
  return (
    <TouchableOpacity style={[styles.actionBtn, color && { borderColor: color + '40' }]} onPress={onPress} activeOpacity={0.7}>
      {icon && <Text style={[styles.actionBtnIcon, color && { color }]}>{icon}</Text>}
      <Text style={[styles.actionBtnText, color && { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SectionTitle({ label }) {
  return <Text style={styles.sectionTitle}>{label}</Text>;
}

function InfoCard({ children, style }) {
  return <View style={[styles.infoCard, style]}>{children}</View>;
}

export default function SettingsScreen() {
  const { username, logout, serverUrl, accounts, removeAccount, loadAccounts } = useAuth();
  const { t, locale, changeLanguage } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);

  const [accountsModal, setAccountsModal] = useState(false);
  const [adminModal, setAdminModal] = useState(false);
  const [adminOldUser, setAdminOldUser] = useState('');
  const [adminOldPass, setAdminOldPass] = useState('');
  const [adminNewUser, setAdminNewUser] = useState('');
  const [adminNewPass, setAdminNewPass] = useState('');
  const [adminUpdating, setAdminUpdating] = useState(false);
  const [showServer, setShowServer] = useState(false);
  const [subPort, setSubPort] = useState('');
  const [subPath, setSubPath] = useState('');

  useEffect(() => {
    loadSettings();
    storage.getSubPort().then(val => { if (val) setSubPort(val); });
    storage.getSubPath().then(val => { if (val) setSubPath(val); });
  }, []);

  const handleSubPortChange = (val) => {
    setSubPort(val);
    storage.saveSubPort(val);
  };

  const handleSubPathChange = (val) => {
    setSubPath(val);
    storage.saveSubPath(val);
  };

  const loadSettings = async () => {
    try {
      const data = await settingsApi.getAll();
      if (data.success) setSettings(data.obj);
    } catch (e) {
      console.log('Settings error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(t('settings.logoutTitle'), t('settings.logoutMsg'), [
      { text: t('settings.cancel'), style: 'cancel' },
      { text: t('settings.logoutConfirm'), style: 'destructive', onPress: logout },
    ]);
  };

  const handleConfirm = (title, msg, onConfirm) => {
    Alert.alert(title, msg, [
      { text: t('settings.cancel'), style: 'cancel' },
      { text: t('settings.logoutConfirm'), onPress: onConfirm },
    ]);
  };

  const handleRestartPanel = () => {
    handleConfirm(t('settings.restartTitle'), t('settings.restartMsg'), async () => {
      try {
        await settingsApi.restartPanel();
        Alert.alert(t('settings.success'), t('settings.restartSuccess'));
      } catch (e) {
        Alert.alert(t('settings.error'), t('settings.restartError'));
      }
    });
  };

  const handleRestartXray = () => {
    handleConfirm(t('settings.restartXrayTitle'), t('settings.restartXrayMsg'), async () => {
      try {
        await serverApi.restartXray();
        Alert.alert(t('settings.success'), t('settings.restartXraySuccess'));
      } catch (e) {
        Alert.alert(t('settings.error'), t('settings.restartXrayError'));
      }
    });
  };

  const handleTestTgBot = async () => {
    try {
      const res = await settingsApi.testTgBot();
      Alert.alert(t('settings.success'), res.msg || t('settings.operationSuccess'));
    } catch (e) {
      Alert.alert(t('settings.error'), t('settings.operationError'));
    }
  };

  const handleTestSmtp = async () => {
    try {
      const res = await settingsApi.testSmtp();
      Alert.alert(t('settings.success'), res.msg || t('settings.operationSuccess'));
    } catch (e) {
      Alert.alert(t('settings.error'), t('settings.operationError'));
    }
  };

  const handleUpdateAdmin = async () => {
    if (!adminOldUser || !adminOldPass || !adminNewUser || !adminNewPass) {
      Alert.alert(t('settings.error'), t('login.fillFields'));
      return;
    }
    setAdminUpdating(true);
    try {
      await settingsApi.updateUser({
        oldUsername: adminOldUser,
        oldPassword: adminOldPass,
        newUsername: adminNewUser,
        newPassword: adminNewPass,
      });
      Alert.alert(t('settings.success'), t('settings.updateAdminSuccess'));
      setAdminModal(false);
      setAdminOldUser('');
      setAdminOldPass('');
      setAdminNewUser('');
      setAdminNewPass('');
    } catch (e) {
      Alert.alert(t('settings.error'), t('settings.updateAdminError'));
    } finally {
      setAdminUpdating(false);
    }
  };

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    setUpdateInfo(null);
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const latestTag = (data.tag_name || '').replace(/^v/i, '');
      const currentTag = APP_VERSION.replace(/^v/i, '');
      const hasUpdate = latestTag.localeCompare(currentTag, undefined, { numeric: true }) > 0;
      setUpdateInfo({
        latestVersion: data.tag_name,
        hasUpdate,
        downloadUrl: data.html_url,
        assets: data.assets || [],
        publishedAt: data.published_at,
      });
    } catch (e) {
      Alert.alert(t('settings.error'), t('settings.checkFailed'));
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleLanguageChange = (code) => {
    changeLanguage(code);
  };

  const s = (key) => t('settings.' + key);
  const yesNo = (val) => val ? s('enabled') : s('disabled');

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AnimatedSection delay={0}>
        <SectionTitle label={s('language')} />
        <View style={styles.langRow}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.langBtn, locale === lang.code && styles.langBtnActive]}
              onPress={() => handleLanguageChange(lang.code)}
              activeOpacity={0.7}
            >
              <Text style={[styles.langBtnText, locale === lang.code && styles.langBtnTextActive]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </AnimatedSection>

      <AnimatedSection delay={100}>
        <SectionTitle label={s('connectionInfo')} />
        <InfoCard>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{s('server')}</Text>
            <View style={styles.serverValueRow}>
              <Text style={[styles.infoValue, !showServer && styles.infoValueHidden]} numberOfLines={1}>
                {showServer ? serverUrl : serverUrl ? serverUrl.slice(0, 8) + '...' : ''}
              </Text>
              <TouchableOpacity onPress={() => setShowServer(!showServer)} style={styles.eyeBtn} activeOpacity={0.6}>
                <Text style={styles.eyeIcon}>{showServer ? '\uD83D\uDC41' : '\uD83D\uDC41\u200D\uD83D\uDDE8'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <InfoRow label={s('username')} value={username} />
          <InfoRow label={s('currentVersion')} value={'v' + APP_VERSION} />
        </InfoCard>
      </AnimatedSection>

      {settings && (
        <>
          <AnimatedSection delay={150}>
            <SectionTitle label={s('panelSettings')} />
            <InfoCard>
              <InfoRow label={s('pageSize')} value={settings.pageSize} />
              <InfoRow label={s('expiryWarning')} value={settings.expireDiff != null ? settings.expireDiff + ' ' + t('dashboard.d') : null} />
              <InfoRow label={s('dateFormat')} value={settings.datepicker} />
              <InfoRow label={s('trafficDiff')} value={settings.trafficDiff != null ? formatBytes(settings.trafficDiff) : null} />
            </InfoCard>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <SectionTitle label={s('webSettings')} />
            <InfoCard>
              <InfoRow label={s('webPort')} value={settings.webPort} />
              <InfoRow label={s('webDomain')} value={settings.webDomain} />
              <InfoRow label={s('webBasePath')} value={settings.webBasePath} />
              <InfoRow label={s('webCertFile')} value={settings.webCertFile || (settings.webKeyFile ? s('enabled') : null)} />
            </InfoCard>
          </AnimatedSection>

          <AnimatedSection delay={250}>
            <SectionTitle label={s('securitySettings')} />
            <InfoCard>
              <InfoRow label={s('sessionMaxAge')} value={settings.sessionMaxAge != null ? settings.sessionMaxAge + 's' : null} />
              <InfoRow label={s('twoFactorAuth')} value={yesNo(settings.twoFactorEnable)} valueColor={settings.twoFactorEnable ? colors.success : colors.textMuted} />
            </InfoCard>
          </AnimatedSection>

          {settings.tgBotEnable && (
            <AnimatedSection delay={300}>
              <SectionTitle label={s('tgBot')} />
              <InfoCard>
                <InfoRow label={s('tgBotStatus')} value={yesNo(settings.tgBotEnable)} valueColor={settings.tgBotEnable ? colors.success : colors.textMuted} />
                <InfoRow label={s('tgBotToken')} value={settings.tgBotToken ? settings.tgBotToken.slice(0, 10) + '...' : '-'} />
                <InfoRow label={s('tgBotChatId')} value={settings.tgBotChatId} />
              </InfoCard>
            </AnimatedSection>
          )}

          {settings.subEnable && (
            <AnimatedSection delay={350}>
              <SectionTitle label={s('subSettings')} />
              <InfoCard>
                <InfoRow label={s('subEnable')} value={yesNo(settings.subEnable)} valueColor={settings.subEnable ? colors.success : colors.textMuted} />
                <InfoRow label={s('subPort')} value={settings.subPort} />
                <InfoRow label={s('subPath')} value={settings.subPath} />
                <InfoRow label={s('subURI')} value={settings.subURI} />
                <InfoRow label={s('subTitle')} value={settings.subTitle} />
              </InfoCard>
            </AnimatedSection>
          )}

        </>
      )}

      <AnimatedSection delay={390}>
        <SectionTitle label={s('subSettings')} />
        <InfoCard>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{s('subPort')}</Text>
            <TextInput
              style={styles.subInputInline}
              placeholder="2096"
              placeholderTextColor={colors.textMuted}
              value={subPort}
              onChangeText={handleSubPortChange}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{s('subPath')}</Text>
            <TextInput
              style={styles.subInputInline}
              placeholder="/sub/"
              placeholderTextColor={colors.textMuted}
              value={subPath}
              onChangeText={handleSubPathChange}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <Text style={styles.subHint}>
            {subPort || subPath ? s('subSave') : s('subHint')}
          </Text>
        </InfoCard>
      </AnimatedSection>

      <AnimatedSection delay={400}>
        <SectionTitle label={s('operations')} />
        <ActionButton icon={'\u21BB'} label={s('restartPanel')} onPress={handleRestartPanel} />
        <ActionButton icon={'\u26A1'} label={s('restartXray')} onPress={handleRestartXray} />
        {settings?.tgBotEnable && (
          <ActionButton icon={'\uD83D\uDCE8'} label={s('testTgBot')} onPress={handleTestTgBot} />
        )}
        {settings?.smtpEnable && (
          <ActionButton icon={'\u2709\uFE0F'} label={s('testSmtp')} onPress={handleTestSmtp} />
        )}
        <ActionButton icon={'\uD83D\uDCC1'} label={t('accounts.manageAccounts')} onPress={() => { loadAccounts(); setAccountsModal(true); }} />
        <ActionButton icon={'\uD83D\uDD11'} label={s('updateAdmin')} onPress={() => setAdminModal(true)} />
      </AnimatedSection>

      <AnimatedSection delay={450}>
        <SectionTitle label={s('versionCheck')} />
        <InfoCard>
          <InfoRow label={s('currentVersion')} value={'v' + APP_VERSION} />
          {updateInfo && (
            <InfoRow
              label={s('latestVersion')}
              value={updateInfo.latestVersion}
              valueColor={updateInfo.hasUpdate ? colors.warning : colors.success}
            />
          )}
          {updateInfo?.hasUpdate && (
            <TouchableOpacity
              style={styles.downloadBtn}
              onPress={() => Linking.openURL(updateInfo.downloadUrl)}
              activeOpacity={0.7}
            >
              <Text style={styles.downloadBtnText}>{s('download')} {updateInfo.latestVersion}</Text>
            </TouchableOpacity>
          )}
          {updateInfo && !updateInfo.hasUpdate && (
            <Text style={styles.updateStatus}>{s('upToDate')}</Text>
          )}
          <TouchableOpacity
            style={[styles.checkBtn, checkingUpdate && styles.checkBtnDisabled]}
            onPress={handleCheckUpdate}
            disabled={checkingUpdate}
            activeOpacity={0.7}
          >
            <Text style={styles.checkBtnText}>
              {checkingUpdate ? s('checking') : (updateInfo ? s('checkUpdate') : s('checkUpdate'))}
            </Text>
          </TouchableOpacity>
        </InfoCard>
      </AnimatedSection>

      <AnimatedSection delay={500}>
        <SectionTitle label={s('developer')} />
        <InfoCard>
          <Text style={styles.aboutText}>{s('developerDesc')}</Text>
          <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL('https://github.com/miladtahanian/RN3X-ui')}>
            <Text style={styles.linkIcon}>{'\uD83D\uDCC1'}</Text>
            <Text style={styles.linkText}>{s('sourceCode')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL('https://github.com/miladtahanian')}>
            <Text style={styles.linkIcon}>{'\uD83D\uDCBB'}</Text>
            <Text style={styles.linkText}>{s('github')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.linkRow, { borderBottomWidth: 0 }]} onPress={() => Linking.openURL('mailto:miladtahanianofficial@gmail.com')}>
            <Text style={styles.linkIcon}>{'\u2709\uFE0F'}</Text>
            <Text style={styles.linkText}>{s('email')}</Text>
          </TouchableOpacity>
        </InfoCard>
      </AnimatedSection>

      <AnimatedSection delay={550}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutBtnIcon}>{'\u21AA'}</Text>
          <Text style={styles.logoutBtnText}>{s('logout')}</Text>
        </TouchableOpacity>
      </AnimatedSection>

      <AnimatedSection delay={600} style={styles.footer}>
        <Text style={styles.footerText}>{t('app.version')}</Text>
        <Text style={styles.footerText}>{t('app.desc')}</Text>
      </AnimatedSection>

      <Modal visible={accountsModal} transparent animationType="fade" onRequestClose={() => setAccountsModal(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.modalContent, { maxHeight: '70%' }]}>
            <Text style={styles.modalTitle}>
              <Ionicons name="server-outline" size={18} color={colors.text} /> {t('accounts.manageAccounts')}
            </Text>
            {accounts.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
                <Ionicons name="server-outline" size={48} color={colors.textMuted} />
                <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: spacing.md, textAlign: 'center' }}>
                  {t('accounts.noAccounts')}
                </Text>
              </View>
            ) : (
              accounts.map((acc) => (
                <View key={acc.id} style={styles.settingsAccountRow}>
                  <View style={styles.settingsAccountInfo}>
                    <Text style={styles.settingsAccountName} numberOfLines={1}>{acc.name}</Text>
                    <Text style={styles.settingsAccountDetail} numberOfLines={1}>{acc.username}@{acc.url.replace(/^https?:\/\//, '')}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.settingsAccountDelete}
                    onPress={() => {
                      Alert.alert(t('accounts.deleteTitle'), t('accounts.deleteMsg', { name: acc.name }), [
                        { text: t('accounts.cancel'), style: 'cancel' },
                        {
                          text: t('accounts.confirmDelete'),
                          style: 'destructive',
                          onPress: async () => {
                            await removeAccount(acc.id);
                          },
                        },
                      ]);
                    }}
                    activeOpacity={0.6}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setAccountsModal(false)} activeOpacity={0.7}>
                <Text style={styles.modalCancelText}>{t('common.close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={adminModal} transparent animationType="fade" onRequestClose={() => setAdminModal(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{s('updateAdminTitle')}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={s('updateAdminOldUser')}
              placeholderTextColor={colors.textMuted}
              value={adminOldUser}
              onChangeText={setAdminOldUser}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.modalInput}
              placeholder={s('updateAdminOldPass')}
              placeholderTextColor={colors.textMuted}
              value={adminOldPass}
              onChangeText={setAdminOldPass}
              secureTextEntry
            />
            <TextInput
              style={styles.modalInput}
              placeholder={s('updateAdminNewUser')}
              placeholderTextColor={colors.textMuted}
              value={adminNewUser}
              onChangeText={setAdminNewUser}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.modalInput}
              placeholder={s('updateAdminNewPass')}
              placeholderTextColor={colors.textMuted}
              value={adminNewPass}
              onChangeText={setAdminNewPass}
              secureTextEntry
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setAdminModal(false)} activeOpacity={0.7}>
                <Text style={styles.modalCancelText}>{s('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, adminUpdating && styles.checkBtnDisabled]}
                onPress={handleUpdateAdmin}
                disabled={adminUpdating}
                activeOpacity={0.7}
              >
                <Text style={styles.modalConfirmText}>{adminUpdating ? s('checking') : s('updateAdminBtn')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  langRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  langBtn: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: spacing.md - 2,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  langBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  langBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  langBtnTextActive: {
    color: colors.primary,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '50',
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  infoValueHidden: {
    color: colors.textMuted,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  serverValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    justifyContent: 'flex-end',
  },
  eyeBtn: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md + 4,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  actionBtnIcon: {
    fontSize: 18,
    color: colors.text,
    width: 28,
    textAlign: 'center',
  },
  actionBtnText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.error + '12',
    borderRadius: 12,
    padding: spacing.md + 6,
    borderWidth: 1.5,
    borderColor: colors.error + '50',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  logoutBtnIcon: {
    fontSize: 20,
    color: colors.error,
  },
  logoutBtnText: {
    color: colors.error,
    fontSize: 17,
    fontWeight: '800',
  },
  aboutText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '50',
    gap: spacing.sm,
  },
  linkIcon: {
    fontSize: 16,
  },
  linkText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  downloadBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  downloadBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  updateStatus: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  checkBtn: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '50',
  },
  checkBtnDisabled: {
    opacity: 0.6,
  },
  checkBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    width: '85%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.md - 2,
    color: colors.text,
    fontSize: 14,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modalCancelBtn: {
    flex: 1,
    borderRadius: 10,
    padding: spacing.md - 2,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  modalConfirmBtn: {
    flex: 1,
    borderRadius: 10,
    padding: spacing.md - 2,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  modalConfirmText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  settingsAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.md - 2,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingsAccountInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  settingsAccountName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  settingsAccountDetail: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  settingsAccountDelete: {
    padding: spacing.sm,
  },
  subInput: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.md - 2,
    color: colors.text,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: 'monospace',
  },
  subInputInline: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    color: colors.text,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'right',
    minWidth: 160,
    fontFamily: 'monospace',
  },
  subHint: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: spacing.xs,
  },
});
