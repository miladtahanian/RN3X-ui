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
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { settingsApi } from '../api/settings';
import { colors, spacing } from '../utils/colors';
import { LANGUAGES } from '../utils/i18n';

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

export default function SettingsScreen() {
  const { username, logout, serverUrl } = useAuth();
  const { t, locale, changeLanguage } = useLanguage();
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

  const handleLogout = () => {
    Alert.alert(t('settings.logoutTitle'), t('settings.logoutMsg'), [
      { text: t('settings.cancel'), style: 'cancel' },
      { text: t('settings.logoutConfirm'), style: 'destructive', onPress: logout },
    ]);
  };

  const handleRestartPanel = () => {
    Alert.alert(t('settings.restartTitle'), t('settings.restartMsg'), [
      { text: t('settings.cancel'), style: 'cancel' },
      {
        text: t('settings.restartConfirm'),
        onPress: async () => {
          try {
            await settingsApi.restartPanel();
            Alert.alert(t('settings.success'), t('settings.restartSuccess'));
          } catch (e) {
            Alert.alert(t('settings.error'), t('settings.restartError'));
          }
        },
      },
    ]);
  };

  const handleLanguageChange = (code) => {
    changeLanguage(code);
  };

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
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
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
        <Text style={styles.sectionTitle}>{t('settings.connectionInfo')}</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('settings.server')}</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{serverUrl}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('settings.username')}</Text>
            <Text style={styles.infoValue}>{username}</Text>
          </View>
        </View>
      </AnimatedSection>

      {settings && (
        <AnimatedSection delay={200}>
          <Text style={styles.sectionTitle}>{t('settings.panelSettings')}</Text>
          <View style={styles.infoCard}>
            {settings.pageSize != null && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('settings.pageSize')}</Text>
                <Text style={styles.infoValue}>{settings.pageSize}</Text>
              </View>
            )}
            {settings.expireDiff != null && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('settings.expiryWarning')}</Text>
                <Text style={styles.infoValue}>{settings.expireDiff}</Text>
              </View>
            )}
            {settings.datepicker && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('settings.dateFormat')}</Text>
                <Text style={styles.infoValue}>{settings.datepicker}</Text>
              </View>
            )}
          </View>
        </AnimatedSection>
      )}

      <AnimatedSection delay={300}>
        <Text style={styles.sectionTitle}>{t('settings.operations')}</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={handleRestartPanel} activeOpacity={0.7}>
          <Text style={styles.actionBtnIcon}>{'\u21BB'}</Text>
          <Text style={styles.actionBtnText}>{t('settings.restartPanel')}</Text>
        </TouchableOpacity>
      </AnimatedSection>

      <AnimatedSection delay={350}>
        <Text style={styles.sectionTitle}>{t('settings.developer')}</Text>
        <View style={styles.infoCard}>
          <Text style={styles.aboutText}>{t('settings.developerDesc')}</Text>
          <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL('https://github.com/miladtahanian')}>
            <Text style={styles.linkIcon}>{'\uD83D\uDCC1'}</Text>
            <Text style={styles.linkText}>{t('settings.github')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL('https://t.me/miladtahanian')}>
            <Text style={styles.linkIcon}>{'\uD83D\uDCE8'}</Text>
            <Text style={styles.linkText}>{t('settings.telegram')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.linkRow, { borderBottomWidth: 0 }]} onPress={() => Linking.openURL('mailto:miladtahanianofficial@gmail.com')}>
            <Text style={styles.linkIcon}>{'\u2709\uFE0F'}</Text>
            <Text style={styles.linkText}>{t('settings.email')}</Text>
          </TouchableOpacity>
        </View>
      </AnimatedSection>

      <AnimatedSection delay={400}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutBtnIcon}>{'\u21AA'}</Text>
          <Text style={styles.logoutBtnText}>{t('settings.logout')}</Text>
        </TouchableOpacity>
      </AnimatedSection>

      <AnimatedSection delay={450} style={styles.footer}>
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
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  actionBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
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
    textAlign:'center',
    justifyContent:'center',
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
  linkValue: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '500',
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
