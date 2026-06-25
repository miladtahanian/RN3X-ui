import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing } from '../utils/colors';

const { width } = Dimensions.get('window');

function SwipeableRow({ item, onDelete, onEdit, onPress, t }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const rowHeight = useRef(new Animated.Value(80)).current;
  const [showDelete, setShowDelete] = useState(false);

  const resetPosition = () => {
    Animated.spring(translateX, { toValue: 0, friction: 7, useNativeDriver: true }).start();
    setShowDelete(false);
  };

  const handlePress = () => {
    if (showDelete) {
      resetPosition();
      return;
    }
    onPress(item);
  };

  const handleLongPress = () => {
    Alert.alert(t('accounts.deleteTitle'), t('accounts.deleteMsg', { name: item.name }), [
      { text: t('accounts.cancel'), style: 'cancel', onPress: resetPosition },
      {
        text: t('accounts.confirmDelete'),
        style: 'destructive',
        onPress: () => {
          Animated.timing(rowHeight, { toValue: 0, duration: 250, useNativeDriver: false }).start(() => {
            onDelete(item.id);
          });
        },
      },
    ]);
  };

  const icon = 'server-outline';
  const lastUsed = item.lastUsed ? new Date(item.lastUsed).toLocaleDateString('fa-IR') : '';

  return (
    <Animated.View style={[styles.accountRowOuter, { height: rowHeight, overflow: 'hidden' }]}>
      <TouchableOpacity
        style={styles.accountRow}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        <View style={styles.accountIcon}>
          <Ionicons name={icon} size={22} color={colors.primary} />
        </View>
        <View style={styles.accountInfo}>
          <Text style={styles.accountName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.accountDetail} numberOfLines={1}>{item.username}@{item.url.replace(/^https?:\/\//, '').replace(/\/+$/, '')}</Text>
          {lastUsed ? <Text style={styles.accountDate}>{lastUsed}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function AccountsScreen({ navigation }) {
  const { accounts, loginWithAccount, removeAccount, loadAccounts } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [loggingInId, setLoggingInId] = useState(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleLogin = async (account) => {
    setLoggingInId(account.id);
    setLoading(true);
    try {
      await loginWithAccount(account);
    } catch (error) {
      const message = error.response?.data?.detail || error.response?.data?.msg || error.message || t('login.connError');
      Alert.alert(t('login.error'), message);
    } finally {
      setLoading(false);
      setLoggingInId(null);
    }
  };

  const handleDelete = async (id) => {
    await removeAccount(id);
  };

  const renderItem = ({ item }) => (
    <SwipeableRow
      item={item}
      onDelete={handleDelete}
      onEdit={() => {}}
      onPress={handleLogin}
      t={t}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.logoIconSmall}>
        <Text style={styles.logoIconText}>3X</Text>
      </View>
      <Text style={styles.headerTitle}>{t('accounts.savedAccounts')}</Text>
      <Text style={styles.headerSubtitle}>{t('app.subtitle')}</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="server-outline" size={64} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>{t('accounts.noAccounts')}</Text>
      <Text style={styles.emptyDesc}>{t('accounts.addServer')}</Text>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footerSection}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('Login')}
        activeOpacity={0.85}
      >
        <Ionicons name="add-circle-outline" size={22} color={colors.white} />
        <Text style={styles.addButtonText}>{t('accounts.addServer')}</Text>
      </TouchableOpacity>
    </View>
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
      <View style={styles.bgGlow1} />
      <View style={styles.bgGlow2} />
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      {loggingInId && (
        <View style={styles.loggingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loggingText}>{t('common.loading')}</Text>
        </View>
      )}
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
  bgGlow1: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.primaryGlow,
    opacity: 0.5,
  },
  bgGlow2: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.accentGlow,
    opacity: 0.4,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.xl,
  },
  logoIconSmall: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoIconText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  accountRowOuter: {
    marginBottom: spacing.sm,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  accountInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  accountName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  accountDetail: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  accountDate: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl + 20,
  },
  emptyTitle: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    color: colors.textMuted,
    fontSize: 13,
  },
  footerSection: {
    marginTop: spacing.lg,
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md + 4,
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  loggingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loggingText: {
    color: colors.text,
    fontSize: 14,
    marginTop: spacing.md,
    fontWeight: '600',
  },
});
