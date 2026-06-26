import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Share,
  Animated,
  Modal,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { clientsApi } from '../api/clients';
import { settingsApi } from '../api/settings';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { storage } from '../utils/storage';
import { colors, spacing } from '../utils/colors';

const SUB_FIELD_NAMES = ['subUrl', 'subscriptionUrl', 'subLink', 'subscription_link', 'sub_url', 'subURI'];

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
  const { serverUrl } = useAuth();
  const [client, setClient] = useState(initialClient);
  const [links, setLinks] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [subPort, setSubPort] = useState('');
  const [subPath, setSubPath] = useState('');

  useEffect(() => {
    Promise.all([
      storage.getSubPort(),
      storage.getSubPath(),
    ]).then(([port, path]) => {
      if (port) setSubPort(port);
      if (path) setSubPath(path);
    });
    loadDetails();
  }, []);

  const loadDetails = async () => {
    setError(null);
    try {
      const results = await Promise.allSettled([
        clientsApi.get(initialClient.email),
        clientsApi.getTraffic(initialClient.email),
        clientsApi.getLinks(initialClient.email),
        settingsApi.getAll(),
      ]);

      const [detailResult, trafficResult, linksResult, settingsResult] = results;

      if (detailResult.status === 'fulfilled' && detailResult.value?.success && detailResult.value.obj) {
        setClient(prev => ({ ...prev, ...detailResult.value.obj }));
      }

      if (trafficResult.status === 'fulfilled' && trafficResult.value?.success && trafficResult.value.obj) {
        setClient(prev => ({ ...prev, traffic: trafficResult.value.obj, total: trafficResult.value.obj.total }));
      }

      if (linksResult.status === 'fulfilled' && linksResult.value?.success) {
        const obj = linksResult.value.obj;
        if (Array.isArray(obj)) {
          const subUrl = obj.find(l => l.startsWith('http://') || l.startsWith('https://'));
          setLinks(obj.filter(l => !l.startsWith('http://') && !l.startsWith('https://')));
          if (subUrl) setSettings(prev => ({ ...(prev || {}), _subUrl: subUrl }));
        } else if (obj && typeof obj === 'object') {
          const found = findSubField(obj, SUB_FIELD_NAMES);
          if (found) setSettings(prev => ({ ...(prev || {}), _subUrl: found }));
          setLinks(obj.links || obj.urls || obj.configs || []);
        } else {
          setLinks([]);
        }
      }

      if (settingsResult.status === 'fulfilled' && settingsResult.value?.success && settingsResult.value.obj) {
        const s = settingsResult.value.obj;
        const found = findSubField(s, SUB_FIELD_NAMES);
        if (found) s._subUrl = found;
        setSettings(prev => ({ ...(prev || {}), ...s }));
      }

      const allFailed = [detailResult, trafficResult, linksResult].every(
        r => r.status === 'rejected'
      );
      if (allFailed) {
        const errMsg = detailResult.status === 'rejected'
          ? (detailResult.reason?.message || t('common.error'))
          : t('common.error');
        setError(errMsg);
      }
    } catch (e) {
      console.log('Detail error:', e);
      setError(e.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const up = client.traffic?.up || client.up || 0;
  const down = client.traffic?.down || client.down || 0;
  const totalBytes = client.total || client.totalGB || 0;
  const usedPercent = totalBytes > 0 ? ((up + down) / totalBytes) * 100 : 0;
  const remaining = totalBytes - (up + down);
  const expired = client.expiryTime && client.expiryTime < Date.now();
  const daysLeft = client.expiryTime
    ? Math.floor((client.expiryTime - Date.now()) / 86400000)
    : null;

  function getServerHost(url) {
    try {
      const u = new URL(url);
      return `${u.protocol}//${u.hostname}`;
    } catch {
      return url;
    }
  }

  function findSubField(obj, fieldNames) {
    if (!obj) return null;
    for (const name of fieldNames) {
      const val = obj[name];
      if (val && typeof val === 'string' && val.startsWith('http')) return val;
    }
    return null;
  }

  const subscriptionUrl = (() => {
    if (!client.subId) return '';

    const subId = client.subId;
    const host = serverUrl ? getServerHost(serverUrl) : '';

    const storedPort = subPort || settings?.subPort;
    const storedPath = subPath || settings?.subPath || '/sub/';
    if (storedPort && host) {
      const path = storedPath.startsWith('/') ? storedPath : `/${storedPath}`;
      return `${host}:${storedPort}${path}${subId}`;
    }

    const apiSubUrl = settings?._subUrl;
    if (apiSubUrl) return apiSubUrl;

    const subUri = (settings?.subURI || '').replace(/\/+$/, '');
    if (subUri) {
      return subUri.startsWith('http')
        ? `${subUri}/${subId}`
        : `${host}${subUri}/${subId}`;
    }
    if (host) {
      return `${host}/sub/${subId}`;
    }
    return '';
  })();

  const handleShareLink = async (link) => {
    try {
      await Share.share({ message: link });
    } catch (e) {
      console.log(e);
    }
  };

  const handleShowQr = (value) => {
    setQrValue(value);
    setQrVisible(true);
  };

  const handleCloseQr = () => {
    setQrVisible(false);
    setQrValue('');
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

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{t('common.error')}</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); loadDetails(); }} activeOpacity={0.7}>
          <Text style={styles.retryBtnText}>{t('common.retry')}</Text>
        </TouchableOpacity>
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
        <InfoRow label={t('clientDetail.limitIp')} value={client.limitIp?.toString() ?? client.limitIP?.toString() ?? '\u221E'} />
        <InfoRow label={t('clientDetail.createDate')} value={formatDate(client.createTime || client.created_at)} />
        <InfoRow
          label={t('clientDetail.expiry')}
          value={formatDate(client.expiryTime)}
          valueColor={expired ? colors.error : null}
        />
        {client.subId && <InfoRow label={t('clientDetail.subId')} value={client.subId} />}
      </AnimatedCard>

      {client.subId && (
        <AnimatedCard delay={300} style={styles.card}>
          <Text style={styles.cardTitle}>{t('clientDetail.subscriptionLink')}</Text>
          {subscriptionUrl ? (
            <View style={styles.linkItem}>
              <View style={styles.linkIcon}>
                <Text style={styles.linkIconText}>{'\u21D2'}</Text>
              </View>
              <Text style={styles.linkText} numberOfLines={1}>{subscriptionUrl}</Text>
              <TouchableOpacity style={styles.qrButton} onPress={() => handleShowQr(subscriptionUrl)} activeOpacity={0.7}>
                <Text style={styles.qrButtonText}>{t('clientDetail.qrCode')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBadge} onPress={() => handleShareLink(subscriptionUrl)} activeOpacity={0.7}>
                <Text style={styles.shareText}>{t('clientDetail.share')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <InfoRow label={t('clientDetail.subId')} value={client.subId} />
          )}
        </AnimatedCard>
      )}

      {links.length > 0 && (
        <AnimatedCard delay={400} style={styles.card}>
          <Text style={styles.cardTitle}>{t('clientDetail.connectionLinks')}</Text>
          {links.map((link, i) => (
            <View key={i} style={styles.linkItem}>
              <View style={styles.linkIcon}>
                <Text style={styles.linkIconText}>{'\u21D2'}</Text>
              </View>
              <Text style={styles.linkText} numberOfLines={1}>{link}</Text>
              <TouchableOpacity style={styles.qrButton} onPress={() => handleShowQr(link)} activeOpacity={0.7}>
                <Text style={styles.qrButtonText}>{t('clientDetail.qrCode')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBadge} onPress={() => handleShareLink(link)} activeOpacity={0.7}>
                <Text style={styles.shareText}>{t('clientDetail.share')}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </AnimatedCard>
      )}

      <Modal visible={qrVisible} transparent animationType="fade" onRequestClose={handleCloseQr}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.qrWrapper}>
              <QRCode value={qrValue} size={220} backgroundColor="white" color="black" />
            </View>
            <Text style={styles.modalLinkText} numberOfLines={3}>{qrValue}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => { handleShareLink(qrValue); }} activeOpacity={0.7}>
                <Text style={styles.modalBtnText}>{t('clientDetail.share')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnClose]} onPress={handleCloseQr} activeOpacity={0.7}>
                <Text style={styles.modalBtnText}>{t('clientDetail.close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.error,
    marginBottom: spacing.sm,
  },
  errorDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl,
  },
  retryBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
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
  qrButton: {
    backgroundColor: colors.accent + '25',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: spacing.sm,
  },
  qrButtonText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '700',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrWrapper: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  modalLinkText: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: spacing.md,
    maxWidth: 260,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  modalBtnClose: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
