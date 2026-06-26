import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity,
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing } from '../utils/colors';
import { storage } from '../utils/storage';
import { setBearerToken } from '../api/client';
import { AnimatedSection, InfoCard, SectionTitle } from '../components/SettingsComponents';

export default function SettingsApiScreen() {
  const { t } = useLanguage();
  const [apiToken, setApiToken] = useState('');
  const [showApiToken, setShowApiToken] = useState(false);

  useEffect(() => {
    storage.getApiToken().then(val => { if (val) { setApiToken(val); setBearerToken(val); } });
  }, []);

  const handleApiTokenChange = (val) => {
    setApiToken(val);
    storage.saveApiToken(val);
    setBearerToken(val || null);
  };

  const s = (key) => t('settings.' + key);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AnimatedSection delay={0}>
        <SectionTitle label={s('apiToken')} />
        <InfoCard>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{s('apiTokenLabel')}</Text>
            <TouchableOpacity onPress={() => setShowApiToken(!showApiToken)} style={styles.eyeBtn} activeOpacity={0.6}>
              <Text style={styles.eyeIcon}>{showApiToken ? '\uD83D\uDC41' : '\uD83D\uDC41\u200D\uD83D\uDDE8'}</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.apiTokenInput}
            placeholder={s('apiTokenPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={apiToken}
            onChangeText={handleApiTokenChange}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={!showApiToken}
          />
          <Text style={styles.subHint}>{s('apiTokenHint')}</Text>
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
  eyeBtn: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 16,
  },
  apiTokenInput: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.md - 2,
    color: colors.text,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: 'monospace',
    marginTop: spacing.sm,
  },
  subHint: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: spacing.xs,
  },
});
