import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Alert, ActivityIndicator,
  TouchableOpacity, Linking,
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { colors, spacing } from '../utils/colors';
import {
  AnimatedSection, InfoCard, InfoRow, SectionTitle, ActionButton,
} from '../components/SettingsComponents';
import { APP_VERSION } from '../constants';

const GITHUB_REPO = 'miladtahanian/RN3X-ui';

export default function SettingsAboutScreen() {
  const { t } = useLanguage();
  const { logout } = useAuth();

  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);

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

  const handleLogout = () => {
    Alert.alert(t('settings.logoutTitle'), t('settings.logoutMsg'), [
      { text: t('settings.cancel'), style: 'cancel' },
      { text: t('settings.logoutConfirm'), style: 'destructive', onPress: logout },
    ]);
  };

  const s = (key) => t('settings.' + key);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AnimatedSection delay={0}>
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

      <AnimatedSection delay={50}>
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

      <AnimatedSection delay={100}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutBtnIcon}>{'\u21AA'}</Text>
          <Text style={styles.logoutBtnText}>{s('logout')}</Text>
        </TouchableOpacity>
      </AnimatedSection>

      <AnimatedSection delay={150} style={styles.footer}>
        <Text style={styles.footerText}>{t('app.version')}</Text>
        <Text style={styles.footerText}>{t('app.desc')}</Text>
      </AnimatedSection>
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
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
