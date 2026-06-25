import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Share,
  Animated,
} from 'react-native';
import { clientsApi } from '../api/clients';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing } from '../utils/colors';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return (i >= 3 ? value.toFixed(2) : value.toFixed(1)) + ' ' + sizes[i];
}

function formatDate(ts) {
  if (!ts) return '-';
  const d = new Date(ts);
  return d.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function InfoRow({ label, value, valueColor }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function AnimatedCard({ children, delay = 0, style }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

export default function ClientDetailScreen({ route }) {
  const { client: initialClient } = route.params;
  const { t, direction } = useLanguage();
  const [client, setClient] = useState(initialClient);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    try {
      const [detailData, linksData] = await Promise.all([
        clientsApi.get(initialClient.email).catch(() => null),
        clientsApi.getLinks(initialClient.email).catch(() => ({ success: true, obj: [] })),
      ]);
      if (detailData?.success) setClient(detailData.obj);
      if (linksData?.success) setLinks(linksData.obj || []);
    } catch (e) {
      console.log('Detail error:', e);
    } finally {
      setLoading(false);
    }
  };

  const up = client.up || 0;
  const down = client.down || 0;
  const totalGB = client.totalGB || 0;
  const totalBytes = totalGB * 1024 * 1024 * 1024;
  const usedPercent = totalBytes > 0 ? ((up + down) / totalBytes) * 100 : 0;
  const remaining = totalBytes - (up + down);
  const expired = client.expiryTime && client.expiryTime < Date.now();
  const daysLeft = client.expiryTime
    ? Math.floor((client.expiryTime - Date.now()) / 86400000)
    : null;

  const handleShareLink = async (link) => {
    try {
      await Share.share({ message: link });
    } catch (e) {
      console.log(e);
    }
  };

  const getStatusText = () => {
    const status = client.enable !== false ? t('clientDetail.active') : t('clientDetail.inactive');
    if (expired) return `${status} | ${t('clientDetail.expired')}`;
    if (daysLeft !== null) return `${status} | ${daysLeft} ${t('clientDetail.daysLeft')}`;
    return status;
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
      <AnimatedCard delay={0} style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{(client.email || '?')[0].toUpperCase()}</Text>
          </View>
          <View style={styles.headerTextContent}>
            <Text style={styles.email}>{client.email}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, client.enable !== false ? styles.active : styles.inactive]} />
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
          </View>
        </View>
      </AnimatedCard>

      <AnimatedCard delay={100} style={styles.card}>
        <Text style={styles.cardTitle}>{t('clientDetail.trafficUsage')}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(usedPercent, 100)}%`,
                  backgroundColor: usedPercent > 80 ? colors.error : usedPercent > 50 ? colors.warning : colors.primary,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{usedPercent.toFixed(1)}%</Text>
        </View>
        <InfoRow label={t('clientDetail.upload')} value={formatBytes(up)} valueColor={colors.success} />
        <InfoRow label={t('clientDetail.download')} value={formatBytes(down)} valueColor={colors.warning} />
        <InfoRow label={t('clientDetail.used')} value={formatBytes(up + down)} />
        <InfoRow label={t('clientDetail.totalVolume')} value={formatBytes(totalBytes)} />
        <InfoRow
          label={t('clientDetail.remaining')}
          value={formatBytes(Math.max(0, remaining))}
          valueColor={remaining > 0 ? colors.success : colors.error}
        />
      </AnimatedCard>

      <AnimatedCard delay={200} style={styles.card}>
        <Text style={styles.cardTitle}>{t('clientDetail.userDetails')}</Text>
        <InfoRow label={t('clientDetail.id')} value={client.id?.toString() || '-'} />
        <InfoRow label={t('clientDetail.limitIp')} value={client.limitIP?.toString() || '\u221E'} />
        <InfoRow label={t('clientDetail.createDate')} value={formatDate(client.createTime)} />
        <InfoRow
          label={t('clientDetail.expiry')}
          value={formatDate(client.expiryTime)}
          valueColor={expired ? colors.error : null}
        />
        {client.subId && <InfoRow label={t('clientDetail.subId')} value={client.subId} />}
      </AnimatedCard>

      {links.length > 0 && (
        <AnimatedCard delay={300} style={styles.card}>
          <Text style={styles.cardTitle}>{t('clientDetail.connectionLinks')}</Text>
          {links.map((link, i) => (
            <TouchableOpacity key={i} style={styles.linkItem} onPress={() => handleShareLink(link)} activeOpacity={0.7}>
              <View style={styles.linkIcon}>
                <Text style={styles.linkIconText}>{'\u21D2'}</Text>
              </View>
              <Text style={styles.linkText} numberOfLines={1}>{link}</Text>
              <View style={styles.shareBadge}>
                <Text style={styles.shareText}>{t('clientDetail.share')}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </AnimatedCard>
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
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  avatarLetter: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
  },
  headerTextContent: {
    flex: 1,
  },
  email: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  active: {
    backgroundColor: colors.success,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
  inactive: {
    backgroundColor: colors.error,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
    width: 50,
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '50',
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 13,
    color: colors.textMuted,
    marginRight: 6,
    width: 18,
    textAlign: 'center',
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  infoValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm + 2,
    borderRadius: 10,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.info + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  linkIconText: {
    fontSize: 14,
    color: colors.info,
  },
  linkText: {
    flex: 1,
    color: colors.info,
    fontSize: 12,
  },
  shareBadge: {
    backgroundColor: colors.primary + '25',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: spacing.sm,
  },
  shareText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
});
