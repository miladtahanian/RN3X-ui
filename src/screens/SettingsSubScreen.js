import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, TextInput,
} from 'react-native';
import { settingsApi } from '../api/settings';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing } from '../utils/colors';
import { storage } from '../utils/storage';
import { AnimatedSection, InfoCard, InfoRow, SectionTitle } from '../components/SettingsComponents';

export default function SettingsSubScreen() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subPort, setSubPort] = useState('');
  const [subPath, setSubPath] = useState('');

  useEffect(() => {
    loadSettings();
    storage.getSubPort().then(val => { if (val) setSubPort(val); });
    storage.getSubPath().then(val => { if (val) setSubPath(val); });
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

  const handleSubPortChange = (val) => {
    setSubPort(val);
    storage.saveSubPort(val);
  };

  const handleSubPathChange = (val) => {
    setSubPath(val);
    storage.saveSubPath(val);
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
      {settings?.subEnable && (
        <AnimatedSection delay={0}>
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

      <AnimatedSection delay={settings?.subEnable ? 50 : 0}>
        <SectionTitle label={s('localOverride')} />
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
