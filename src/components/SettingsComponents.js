import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { colors, spacing } from '../utils/colors';

export function AnimatedSection({ children, delay = 0, style }) {
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

export function InfoRow({ label, value, valueColor }) {
  if (value == null) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor && { color: valueColor }]} numberOfLines={1}>{String(value)}</Text>
    </View>
  );
}

export function ActionButton({ icon, label, onPress, color }) {
  return (
    <TouchableOpacity style={[styles.actionBtn, color && { borderColor: color + '40' }]} onPress={onPress} activeOpacity={0.7}>
      {icon && <Text style={[styles.actionBtnIcon, color && { color }]}>{icon}</Text>}
      <Text style={[styles.actionBtnText, color && { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function SectionTitle({ label }) {
  return <Text style={styles.sectionTitle}>{label}</Text>;
}

export function InfoCard({ children, style }) {
  return <View style={[styles.infoCard, style]}>{children}</View>;
}

export function SettingsNavButton({ icon, label, onPress, subtitle }) {
  return (
    <TouchableOpacity style={styles.navBtn} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.navBtnContent}>
        <Text style={styles.navBtnIcon}>{icon}</Text>
        <View style={styles.navBtnTextWrap}>
          <Text style={styles.navBtnLabel}>{label}</Text>
          {subtitle ? <Text style={styles.navBtnSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <Text style={styles.navBtnArrow}>{'\u203A'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
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
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md + 2,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  navBtnIcon: {
    fontSize: 20,
    width: 32,
    textAlign: 'center',
  },
  navBtnTextWrap: {
    flex: 1,
  },
  navBtnLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  navBtnSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  navBtnArrow: {
    fontSize: 24,
    color: colors.textMuted,
    fontWeight: '700',
  },
});
