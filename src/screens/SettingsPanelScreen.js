import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { settingsApi } from '../api/settings';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing } from '../utils/colors';
import { AnimatedSection, InfoCard, InfoRow, SectionTitle } from '../components/SettingsComponents';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return (i >= 3 ? value.toFixed(2) : value.toFixed(1)) + ' ' + sizes[i];
}

export default function SettingsPanelScreen() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

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
      {settings && (
        <>
          <AnimatedSection delay={0}>
            <SectionTitle label={s('panelSettings')} />
            <InfoCard>
              <InfoRow label={s('pageSize')} value={settings.pageSize} />
              <InfoRow label={s('expiryWarning')} value={settings.expireDiff != null ? settings.expireDiff + ' ' + t('dashboard.d') : null} />
              <InfoRow label={s('dateFormat')} value={settings.datepicker} />
              <InfoRow label={s('trafficDiff')} value={settings.trafficDiff != null ? formatBytes(settings.trafficDiff) : null} />
            </InfoCard>
          </AnimatedSection>

          <AnimatedSection delay={50}>
            <SectionTitle label={s('webSettings')} />
            <InfoCard>
              <InfoRow label={s('webPort')} value={settings.webPort} />
              <InfoRow label={s('webDomain')} value={settings.webDomain} />
              <InfoRow label={s('webBasePath')} value={settings.webBasePath} />
              <InfoRow label={s('webCertFile')} value={settings.webCertFile || (settings.webKeyFile ? s('enabled') : null)} />
            </InfoCard>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <SectionTitle label={s('securitySettings')} />
            <InfoCard>
              <InfoRow label={s('sessionMaxAge')} value={settings.sessionMaxAge != null ? settings.sessionMaxAge + 's' : null} />
              <InfoRow label={s('twoFactorAuth')} value={yesNo(settings.twoFactorEnable)} valueColor={settings.twoFactorEnable ? colors.success : colors.textMuted} />
            </InfoCard>
          </AnimatedSection>

          {settings.tgBotEnable && (
            <AnimatedSection delay={150}>
              <SectionTitle label={s('tgBot')} />
              <InfoCard>
                <InfoRow label={s('tgBotStatus')} value={yesNo(settings.tgBotEnable)} valueColor={settings.tgBotEnable ? colors.success : colors.textMuted} />
                <InfoRow label={s('tgBotToken')} value={settings.tgBotToken ? settings.tgBotToken.slice(0, 10) + '...' : '-'} />
                <InfoRow label={s('tgBotChatId')} value={settings.tgBotChatId} />
              </InfoCard>
            </AnimatedSection>
          )}
        </>
      )}
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
});
