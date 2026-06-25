import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { serverApi } from '../api/server';
import { clientsApi } from '../api/clients';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing } from '../utils/colors';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  const decimals = i >= 3 ? 2 : 1;
  return value.toFixed(decimals) + ' ' + sizes[i];
}

function safePercent(val) {
  if (val == null) return null;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
  }
  if (typeof val === 'object') {
    if (typeof val.percent === 'number') return val.percent;
    if (typeof val.percent === 'string') return parseFloat(val.percent) || null;
    if (val.total && val.current != null) return (val.current / val.total) * 100;
    if (val.total && val.used != null) return (val.used / val.total) * 100;
  }
  return null;
}

function formatPercent(val) {
  const p = safePercent(val);
  return p != null ? p.toFixed(2) + '%' : '-';
}

function percentColor(val) {
  const p = safePercent(val);
  return p != null && p > 80 ? colors.error : colors.success;
}

function formatUptime(seconds, t) {
  if (!seconds) return '0' + t('dashboard.s');
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (d > 0) parts.push(d + t('dashboard.d'));
  if (h > 0) parts.push(h + t('dashboard.h'));
  if (m > 0) parts.push(m + t('dashboard.m'));
  if (s > 0 || parts.length === 0) parts.push(s + t('dashboard.s'));
  return parts.join(' ');
}

function StatCard({ title, value, color, delay = 0 }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statCard,
        { borderLeftColor: color || colors.primary, opacity, transform: [{ translateY }] },
      ]}
    >
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color: color || colors.primary }]}>{value}</Text>
    </Animated.View>
  );
}

function TrafficBar({ up, down }) {
  const total = up + down;
  const upPercent = total > 0 ? (up / total) * 100 : 50;
  const downPercent = total > 0 ? (down / total) * 100 : 50;

  return (
    <View style={styles.trafficBox}>
      <View style={styles.trafficBar}>
        <View style={[styles.trafficSeg, { flex: upPercent, backgroundColor: colors.success }]} />
        <View style={[styles.trafficSeg, { flex: downPercent, backgroundColor: colors.warning }]} />
      </View>
      <View style={styles.trafficLabels}>
        <Text style={styles.trafficUp}>{'\u2191'} {formatBytes(up)}</Text>
        <Text style={styles.trafficDown}>{'\u2193'} {formatBytes(down)}</Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const { t } = useLanguage();
  const [status, setStatus] = useState(null);
  const [onlines, setOnlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setError(null);
    const results = await Promise.allSettled([
      serverApi.getStatus(),
      clientsApi.getOnlines().catch(() => ({ success: true, obj: [] })),
    ]);

    const [statusResult, onlinesResult] = results;

    if (statusResult.status === 'fulfilled' && statusResult.value?.success) {
      setStatus(statusResult.value.obj);
    } else if (statusResult.status === 'rejected') {
      setError(statusResult.reason?.message || t('dashboard.loadError'));
      console.log('Status error:', statusResult.reason);
    }

    if (onlinesResult.status === 'fulfilled' && onlinesResult.value?.success) {
      setOnlines(onlinesResult.value.obj || []);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const cpuVal = status?.cpu != null ? status.cpu.toFixed(2) + '%' : '-';
  const load1 = typeof status?.load === 'object' ? status.load.load1 : status?.load;
  const loadVal = load1 != null ? load1.toFixed(2) : '-';
  const xrayRunning = status?.xray?.state === 'running';
  const xrayVersion = status?.xray?.version || '-';
  const netUp = status?.netIO?.up || status?.traffic?.upTotal || 0;
  const netDown = status?.netIO?.down || status?.traffic?.downTotal || 0;
  const uptimeSecs = status?.uptime || status?.xray?.uptime || 0;

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{t('dashboard.loadError')}</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
      }
    >
      <Text style={styles.sectionTitle}>{t('dashboard.serverStatus')}</Text>
      <View style={styles.grid}>
        <StatCard title={t('dashboard.xrayStatus')} value={xrayRunning ? t('dashboard.running') : t('dashboard.stopped')} color={xrayRunning ? colors.success : colors.error} delay={0} />
        <StatCard title={t('dashboard.uptime')} value={formatUptime(uptimeSecs, t)} color={colors.info} delay={50} />
        <StatCard title={t('dashboard.version')} value={xrayVersion} color={colors.accent} delay={100} />
        <StatCard title={t('dashboard.cpu')} value={cpuVal} color={colors.warning} delay={150} />
        <StatCard title={t('dashboard.ram')} value={formatPercent(status?.mem)} color={colors.info} delay={200} />
        <StatCard title={t('dashboard.swap')} value={formatPercent(status?.swap)} color={colors.textSecondary} delay={250} />
        <StatCard title={t('dashboard.disk')} value={formatPercent(status?.disk)} color={percentColor(status?.disk)} delay={300} />
        <StatCard title={t('dashboard.avgLoad')} value={loadVal} color={colors.accent} delay={350} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.trafficStats')}</Text>
        <View style={styles.trafficCard}>
          <TrafficBar up={netUp} down={netDown} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.onlineUsers')}</Text>
        <View style={styles.onlineBox}>
          <Text style={styles.onlineCount}>{onlines.length}</Text>
          <Text style={styles.onlineLabel}>{t('dashboard.onlineUser')}</Text>
        </View>
        {onlines.length > 0 && (
          <View style={styles.onlineList}>
            {onlines.slice(0, 10).map((email, i) => (
              <View key={i} style={styles.onlineItem}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineEmail}>{email}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { fontSize: 16, fontWeight: '700', color: colors.error, marginBottom: spacing.sm },
  errorDetail: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.lg },
  section: { marginTop: spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: {
    backgroundColor: colors.card, borderRadius: 12, padding: spacing.md,
    borderLeftWidth: 3, borderWidth: 1, borderColor: colors.border,
    width: '48%', flexGrow: 1, minWidth: '46%',
    shadowColor: colors.black, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 2,
  },
  statTitle: {
    fontSize: 11, color: colors.textSecondary, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
  statValue: { fontSize: 22, fontWeight: '900', marginTop: spacing.xs },
  trafficCard: {
    backgroundColor: colors.card, borderRadius: 12, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: colors.black, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 2,
  },
  trafficBox: { gap: spacing.sm },
  trafficBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: colors.border },
  trafficSeg: { height: '100%' },
  trafficLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  trafficUp: { fontSize: 13, color: colors.success, fontWeight: '600' },
  trafficDown: { fontSize: 13, color: colors.warning, fontWeight: '600' },
  onlineBox: {
    backgroundColor: colors.card, borderRadius: 12, padding: spacing.lg,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
    shadowColor: colors.black, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 2,
  },
  onlineCount: { fontSize: 48, fontWeight: '900', color: colors.success },
  onlineLabel: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  onlineList: { marginTop: spacing.sm },
  onlineItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: 10,
    marginTop: spacing.xs, borderWidth: 1, borderColor: colors.border,
  },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginRight: spacing.sm },
  onlineEmail: { color: colors.text, fontSize: 14 },
});
