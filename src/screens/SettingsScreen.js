import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing } from '../utils/colors';
import { LANGUAGES } from '../utils/i18n';
import {
  AnimatedSection, InfoCard, InfoRow, SectionTitle, SettingsNavButton,
} from '../components/SettingsComponents';
import { APP_VERSION } from '../constants';

export default function SettingsScreen() {
  const { t, locale, changeLanguage } = useLanguage();
  const { username, serverUrl } = useAuth();
  const navigation = useNavigation();
  const [showServer, setShowServer] = useState(false);

  const handleLanguageChange = (code) => {
    changeLanguage(code);
  };

  const s = (key) => t('settings.' + key);

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

      <AnimatedSection delay={50}>
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

      <AnimatedSection delay={100}>
        <SectionTitle label={t('nav.settings')} />
        <SettingsNavButton
          icon={'\u2699\uFE0F'}
          label={s('panelSettings')}
          subtitle={s('panelSettingsDesc')}
          onPress={() => navigation.navigate('SettingsPanel')}
        />
        <SettingsNavButton
          icon={'\uD83D\uDCCB'}
          label={s('subSettings')}
          subtitle={s('subSettingsDesc')}
          onPress={() => navigation.navigate('SettingsSub')}
        />
        <SettingsNavButton
          icon={'\uD83D\uDD10'}
          label={s('apiToken')}
          subtitle={s('apiTokenDesc')}
          onPress={() => navigation.navigate('SettingsApi')}
        />
        <SettingsNavButton
          icon={'\u269B'}
          label={s('operations')}
          subtitle={s('operationsDesc')}
          onPress={() => navigation.navigate('SettingsOperations')}
        />
        <SettingsNavButton
          icon={'\u2139\uFE0F'}
          label={s('about')}
          subtitle={s('aboutDesc')}
          onPress={() => navigation.navigate('SettingsAbout')}
        />
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
});
