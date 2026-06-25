import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { inboundsApi } from '../api/inbounds';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing } from '../utils/colors';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

const PROTOCOL_COLORS = {
  vless: '#7C5CFC',
  vmess: '#4A90D9',
  trojan: '#3FB950',
  shadowsocks: '#D29922',
  dokodemoDoor: '#58A6FF',
  http: '#F85149',
  socks: '#8B949E',
};

function InboundCard({ item, onToggle, onDelete, index, t }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay: index * 60, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 350, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const protocol = (item.protocol || '').toLowerCase();
  const protoColor = PROTOCOL_COLORS[protocol] || colors.primary;
  const protoLabel = protocol.toUpperCase();
  const up = item.up || 0;
  const down = item.down || 0;

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>
      <View style={[styles.inboundCard, !item.enable && styles.inboundDisabled]}>
        <View style={styles.inboundHeader}>
          <View style={[styles.protocolBadge, { backgroundColor: protoColor + '20', borderColor: protoColor }]}>
            <View style={[styles.protocolDot, { backgroundColor: protoColor }]} />
            <Text style={[styles.protocolText, { color: protoColor }]}>{protoLabel}</Text>
          </View>
          <View style={styles.inboundActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: item.enable ? colors.errorGlow : colors.successGlow }]}
              onPress={() => onToggle(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionText, { color: item.enable ? colors.error : colors.success }]}>
                {item.enable ? t('inbounds.deactivate') : t('inbounds.activate')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => onDelete(item)} activeOpacity={0.7}>
              <Text style={[styles.actionText, { color: colors.error }]}>{t('inbounds.delete')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.remark}>{item.remark || t('inbounds.unnamed')}</Text>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('inbounds.port')}</Text>
            <Text style={styles.detailValue}>{item.port}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('inbounds.clients')}</Text>
            <Text style={styles.detailValue}>{item.clientCount || item.clients?.length || 0}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('inbounds.tcp')}</Text>
            <Text style={styles.detailValue}>
              {item.streamSettings?.network || 'tcp'}
              {item.streamSettings?.security === 'tls' ? ` + ${t('inbounds.tls')}` : ''}
              {item.streamSettings?.security === 'reality' ? ` + ${t('inbounds.reality')}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.trafficRow}>
          <Text style={styles.trafficUp}>{'\u2191'} {formatBytes(up)}</Text>
          <Text style={styles.trafficDown}>{'\u2193'} {formatBytes(down)}</Text>
        </View>

        <View style={styles.inboundFooter}>
          <Text style={styles.footerText}>
            {item.totalGB > 0 ? formatBytes(item.totalGB * 1024 * 1024 * 1024) : t('inbounds.unlimited')}
          </Text>
          <View style={styles.footerRight}>
            {item.enable ? (
              <View style={styles.statusBadgeActive}>
                <Text style={styles.statusBadgeTextActive}>{t('clients.active')}</Text>
              </View>
            ) : (
              <View style={styles.statusBadgeInactive}>
                <Text style={styles.statusBadgeTextInactive}>{t('clientDetail.inactive')}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function InboundsScreen() {
  const { t } = useLanguage();
  const [inbounds, setInbounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInbounds = async () => {
    try {
      const data = await inboundsApi.list();
      if (data.success) {
        setInbounds(data.obj || []);
      }
    } catch (e) {
      console.log('Inbounds fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchInbounds();
    }, [])
  );

  const handleToggle = async (inbound) => {
    try {
      await inboundsApi.setEnable(inbound.id, !inbound.enable);
      fetchInbounds();
    } catch (e) {
      Alert.alert(t('inbounds.error'), t('inbounds.toggleError'));
    }
  };

  const handleDelete = (inbound) => {
    Alert.alert(
      t('inbounds.deleteTitle'),
      t('inbounds.deleteMsg', { name: inbound.remark || inbound.id }),
      [
        { text: t('inbounds.cancel'), style: 'cancel' },
        {
          text: t('inbounds.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await inboundsApi.delete(inbound.id);
              fetchInbounds();
            } catch (e) {
              Alert.alert(t('inbounds.error'), t('inbounds.deleteError'));
            }
          },
        },
      ]
    );
  };

  const renderInbound = ({ item, index }) => (
    <InboundCard item={item} index={index} t={t} onToggle={handleToggle} onDelete={handleDelete} />
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={inbounds}
        renderItem={renderInbound}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchInbounds(); }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>{'\u2205'}</Text>
            <Text style={styles.emptyText}>{t('inbounds.noInbounds')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  inboundCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  inboundDisabled: {
    opacity: 0.55,
  },
  inboundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  protocolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
  },
  protocolDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  protocolText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  inboundActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  remark: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
  },
  trafficRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  trafficUp: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '700',
  },
  trafficDown: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '700',
  },
  inboundFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border + '60',
  },
  footerText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  footerRight: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  statusBadgeActive: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeTextActive: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '700',
  },
  statusBadgeInactive: {
    backgroundColor: colors.error + '20',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeTextInactive: {
    fontSize: 10,
    color: colors.error,
    fontWeight: '700',
  },
  empty: {
    padding: spacing.xxl + 20,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 16,
  },
});
