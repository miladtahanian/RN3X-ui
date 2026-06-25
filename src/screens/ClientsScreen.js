import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { clientsApi } from '../api/clients';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing } from '../utils/colors';

const { width } = Dimensions.get('window');

function TrafficBar({ up, down }) {
  const total = up + down;
  const upPercent = total > 0 ? (up / total) * 100 : 50;
  const downPercent = total > 0 ? (down / total) * 100 : 50;

  return (
    <View style={styles.trafficBar}>
      <View style={[styles.trafficSegment, { flex: upPercent || 1, backgroundColor: colors.success }]} />
      <View style={[styles.trafficSegment, { flex: downPercent || 1, backgroundColor: colors.warning }]} />
    </View>
  );
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return (i >= 3 ? value.toFixed(2) : value.toFixed(1)) + ' ' + sizes[i];
}

function ClientCard({ item, onPress, onLongPress, onResetTraffic, index, t, direction }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay: index * 60, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 350, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const up = item.traffic?.up || item.up || 0;
  const down = item.traffic?.down || item.down || 0;
  const totalGB = item.totalGB || 0;
  const usedGB = totalGB > 0 ? ((up + down) / (totalGB * 1024 * 1024 * 1024)) * 100 : 0;
  const isExpired = item.expiryTime && item.expiryTime < Date.now();
  const isDisabled = item.enable === false;

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <TouchableOpacity
        style={[styles.clientCard, (isExpired || isDisabled) && styles.clientDisabled]}
        onPress={() => onPress(item)}
        onLongPress={() => onLongPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.clientHeader}>
          <View style={styles.clientInfo}>
            <View style={styles.clientNameRow}>
              <View style={[styles.statusIndicator, { backgroundColor: isDisabled ? colors.error : isExpired ? colors.warning : colors.success }]} />
              <Text style={[styles.clientEmail, (isExpired || isDisabled) && styles.textMuted]} numberOfLines={1}>
                {item.email}
              </Text>
            </View>
            <View style={styles.badgeRow}>
              {item.enable !== false && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{t('clients.active')}</Text>
                </View>
              )}
              {isExpired && (
                <View style={[styles.badge, styles.badgeExpired]}>
                  <Text style={styles.badgeText}>{t('clients.expired')}</Text>
                </View>
              )}
              {(item.inboundTags || item.inboundIds)?.slice(0, 2).map((tag, i) => (
                <View key={i} style={[styles.badge, styles.badgeTag]}>
                  <Text style={styles.badgeText}>{tag}</Text>
                </View>
              ))}
              {((item.inboundTags || item.inboundIds)?.length || 0) > 2 && (
                <View style={[styles.badge, styles.badgeMore]}>
                  <Text style={styles.badgeText}>+{(item.inboundTags || item.inboundIds).length - 2}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.clientTraffic}>
            <Text style={styles.trafficUp}>{'\u2191'} {formatBytes(up)}</Text>
            <Text style={styles.trafficDown}>{'\u2193'} {formatBytes(down)}</Text>
          </View>
        </View>

        <TrafficBar up={up} down={down} />

        <View style={styles.clientFooter}>
          <Text style={styles.footerText}>
            {t('clients.limit')}: {item.limitIP || '\u221E'} IP
          </Text>
          <View style={styles.footerRight}>
            {totalGB > 0 && (
              <Text style={[styles.percentText, usedGB > 80 && { color: colors.error }]}>
                {usedGB.toFixed(1)}%
              </Text>
            )}
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => onResetTraffic(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.resetBtnText}>{'\u21BA'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ClientsScreen({ navigation }) {
  const { t, direction } = useLanguage();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchClients = async () => {
    setError(null);
    try {
      const data = await clientsApi.list();
      if (data.success) {
        const list = Array.isArray(data.obj) ? data.obj : data.obj?.clients || [];
        setClients(list);
      } else {
        setError(t('clients.loadError'));
      }
    } catch (e) {
      console.log('Clients fetch error:', e);
      setError(e.message || t('clients.loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchClients();
    }, [])
  );

  const filteredClients = clients.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const tags = c.inboundTags || c.inboundIds || [];
    return (
      (c.email || '').toLowerCase().includes(q) ||
      tags.some((t) => String(t).toLowerCase().includes(q))
    );
  });

  const handleDelete = (client) => {
    Alert.alert(
      t('clients.deleteTitle'),
      t('clients.deleteMsg', { email: client.email }),
      [
        { text: t('clients.cancel'), style: 'cancel' },
        {
          text: t('clients.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await clientsApi.delete(client.email);
              fetchClients();
            } catch (e) {
              Alert.alert(t('clients.error'), t('clients.deleteError'));
            }
          },
        },
      ]
    );
  };

  const handleResetTraffic = (client) => {
    Alert.alert(
      t('clients.resetTraffic'),
      t('clients.resetMsg', { email: client.email }),
      [
        { text: t('clients.cancel'), style: 'cancel' },
        {
          text: t('clients.reset'),
          onPress: async () => {
            try {
              await clientsApi.resetTraffic(client.email);
              fetchClients();
            } catch (e) {
              Alert.alert(t('clients.error'), t('clients.resetError'));
            }
          },
        },
      ]
    );
  };

  const renderClient = ({ item, index }) => (
    <ClientCard
      item={item}
      index={index}
      t={t}
      direction={direction}
      onPress={(client) => navigation.navigate('ClientDetail', { client })}
      onLongPress={handleDelete}
      onResetTraffic={handleResetTraffic}
    />
  );

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
        <Text style={styles.errorText}>{t('clients.loadError')}</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); fetchClients(); }} activeOpacity={0.7}>
          <Text style={styles.retryBtnText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <View style={styles.searchInputWrapper}>
          <TextInput
            style={[styles.searchInput, direction === 'ltr' && { textAlign: 'left' }]}
            placeholder={t('clients.search')}
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>{'\u2715'}</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.countText}>{filteredClients.length} {t('clients.user')}</Text>
      </View>

      <FlatList
        data={filteredClients}
        renderItem={renderClient}
        keyExtractor={(item) => item.email || item.id?.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchClients(); }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>{':('}</Text>
            <Text style={styles.emptyText}>{t('clients.noClients')}</Text>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm + 2,
  },
  searchIcon: {
    fontSize: 16,
    color: colors.textMuted,
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    fontSize: 14,
  },
  clearBtn: {
    padding: spacing.xs,
  },
  clearBtnText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  countText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    padding: spacing.md,
    paddingTop: 0,
    paddingBottom: spacing.xxl,
  },
  clientCard: {
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
  clientDisabled: {
    opacity: 0.55,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  clientInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  clientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  clientEmail: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  textMuted: {
    color: colors.textMuted,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.success + '25',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeExpired: {
    backgroundColor: colors.error + '25',
  },
  badgeTag: {
    backgroundColor: colors.info + '20',
  },
  badgeMore: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  clientTraffic: {
    alignItems: 'flex-end',
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
  trafficBar: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  trafficSegment: {
    height: '100%',
  },
  clientFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  percentText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '800',
  },
  resetBtn: {
    padding: 2,
  },
  resetBtnText: {
    fontSize: 16,
    color: colors.textMuted,
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
