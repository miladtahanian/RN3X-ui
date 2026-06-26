import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Alert, Modal, TextInput,
  KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { settingsApi } from '../api/settings';
import { serverApi } from '../api/server';
import { colors, spacing } from '../utils/colors';
import { AnimatedSection, ActionButton, SectionTitle } from '../components/SettingsComponents';

export default function SettingsOperationsScreen() {
  const { t } = useLanguage();
  const { accounts, removeAccount, loadAccounts } = useAuth();

  const [accountsModal, setAccountsModal] = useState(false);
  const [adminModal, setAdminModal] = useState(false);
  const [adminOldUser, setAdminOldUser] = useState('');
  const [adminOldPass, setAdminOldPass] = useState('');
  const [adminNewUser, setAdminNewUser] = useState('');
  const [adminNewPass, setAdminNewPass] = useState('');
  const [adminUpdating, setAdminUpdating] = useState(false);

  const [settings, setSettings] = useState(null);

  React.useEffect(() => {
    settingsApi.getAll().then(data => {
      if (data.success) setSettings(data.obj);
    }).catch(() => {});
  }, []);

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

  const s = (key) => t('settings.' + key);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AnimatedSection delay={0}>
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
  checkBtnDisabled: {
    opacity: 0.6,
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
});
