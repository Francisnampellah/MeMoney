import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSmsPermission } from '../../services/sms';
import { useMpesaSms } from '../../services/sms/useMpesaSms';
import { Transaction } from '../../services/sms/types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAnalytics } from '../../services/analytics/useAnalytics';
import { useSmartInsights } from '../../services/ai/useSmartInsights';
import { abbreviateNumber } from '../../services/analytics/utils';
import { useTheme } from '../../theme';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

export function HomeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const safeAreaInsets = useSafeAreaInsets();
    const { hasPermission, requestPermission, isLoading: isPermissionLoading } = useSmsPermission();
    const { transactions, loading: smsLoading, error, refresh } = useMpesaSms();
    const { stats, loading: analyticsLoading } = useAnalytics();
    const { insights, loading: aiLoading } = useSmartInsights();

    const theme = useTheme();
    const styles = createStyles(theme);

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'received' | 'sent'>('all');
    const [transactionLimit, setTransactionLimit] = useState(5);

    // Get latest remaining balance from the most recent transaction
    const latestTxWithBalance = transactions.find(tx => tx.balance_after !== null);
    const totalBalance = latestTxWithBalance?.balance_after ?? 0;
    const currentCurrency = latestTxWithBalance?.currency ?? 'Tsh';

    const handleRequestSmsPermission = async () => {
        const granted = await requestPermission();
        if (granted) {
            console.log('SMS permission granted!');
        }
    };

    // Filter and search transactions
    const filteredTransactions = transactions.filter(tx => {
        if (selectedFilter === 'received' && tx.direction !== 'RECEIVED') return false;
        if (selectedFilter === 'sent' && tx.direction !== 'SENT') return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                tx.counterparty_name?.toLowerCase().includes(query) ||
                tx.type.toLowerCase().includes(query) ||
                tx.amount.toString().includes(query) ||
                tx.transaction_id?.toLowerCase().includes(query)
            );
        }
        return true;
    });

    const topInsight = insights[0];

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* Content */}
            <View style={styles.content}>
                {/* Balance Card */}
                <View style={styles.balanceCard}>
                    <View style={styles.balanceHeader}>
                        <Text style={styles.balanceLabel}>My Balance</Text>
                        <TouchableOpacity>
                            <Text style={styles.menuIcon}>⋮</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.balanceAmountRow}>
                        <Text style={styles.balanceAmount}>
                            {currentCurrency} {Math.floor(totalBalance).toLocaleString()}
                        </Text>
                        <Text style={styles.balanceDecimal}>
                            ,{(totalBalance % 1).toFixed(2).split('.')[1]}
                        </Text>
                    </View>
                    <View style={styles.currencyBadge}>
                        <Text style={styles.currencyText}>{currentCurrency}</Text>
                    </View>
                </View>

                {/* Analytics Overview Card */}
                <View style={styles.pnlCard}>
                    <View style={styles.pnlHeader}>
                        <View>
                            <Text style={styles.pnlLabel}>Analytics Overview</Text>
                            <Text style={styles.pnlSubLabel}>Last 30 Days</Text>
                        </View>
                        <TouchableOpacity>
                            <Icon name="insights" size={20} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.analyticsDetailsRow}>
                        <View style={styles.analyticItem}>
                            <Text style={styles.analyticLabel}>Inflow</Text>
                            <Text style={styles.analyticValueIn}>+ {currentCurrency} {abbreviateNumber(stats.income)}</Text>
                        </View>
                        <View style={styles.analyticDivider} />
                        <View style={styles.analyticItem}>
                            <Text style={styles.analyticLabel}>Outflow</Text>
                            <Text style={styles.analyticValueOut}>- {currentCurrency} {abbreviateNumber(stats.outcome)}</Text>
                        </View>
                    </View>

                    {topInsight && (
                        <View style={styles.homeInsightBox}>
                            <View style={styles.homeInsightHeader}>
                                <Icon name="lightbulb" size={14} color={theme.colors.primary} />
                                <Text style={styles.homeInsightTitle}>AI TIP: {topInsight.title}</Text>
                            </View>
                            <Text style={styles.homeInsightDesc} numberOfLines={2}>
                                {topInsight.description}
                            </Text>
                        </View>
                    )}
                </View>

                {/* SMS Permission Banner */}
                {!hasPermission && (
                    <TouchableOpacity
                        style={styles.permissionBanner}
                        onPress={handleRequestSmsPermission}
                        disabled={isPermissionLoading}
                        activeOpacity={0.8}
                    >
                        <Icon name="sms" size={20} color={theme.colors.text.inverse} style={{ marginRight: 8 }} />
                        <Text style={styles.permissionBannerText}>
                            {isPermissionLoading ? 'Requesting...' : 'Enable SMS Access'}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Search and Filter Section */}
                <View style={styles.searchFilterSection}>
                    {/* Search Bar */}
                    <View style={styles.searchBar}>
                        <Icon name="search" size={20} color={theme.colors.text.secondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search transactions..."
                            placeholderTextColor={theme.colors.text.secondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Icon name="close" size={20} color={theme.colors.text.secondary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Filter Chips */}
                    <View style={styles.filterChips}>
                        <TouchableOpacity
                            style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipActive]}
                            onPress={() => setSelectedFilter('all')}
                        >
                            <Text style={[styles.filterChipText, selectedFilter === 'all' && styles.filterChipTextActive]}>
                                All
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.filterChip, selectedFilter === 'received' && styles.filterChipActive]}
                            onPress={() => setSelectedFilter('received')}
                        >
                            <Icon
                                name="arrow-downward"
                                size={16}
                                color={selectedFilter === 'received' ? theme.colors.text.primary : theme.colors.text.secondary}
                            />
                            <Text style={[styles.filterChipText, selectedFilter === 'received' && styles.filterChipTextActive]}>
                                Received
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.filterChip, selectedFilter === 'sent' && styles.filterChipActive]}
                            onPress={() => setSelectedFilter('sent')}
                        >
                            <Icon
                                name="arrow-upward"
                                size={16}
                                color={selectedFilter === 'sent' ? theme.colors.text.primary : theme.colors.text.secondary}
                            />
                            <Text style={[styles.filterChipText, selectedFilter === 'sent' && styles.filterChipTextActive]}>
                                Sent
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Balance Section */}
                <View style={styles.balanceSection}>
                    <View style={styles.balanceSectionHeader}>
                        <Text style={styles.sectionTitle}>Balance</Text>

                        {/* Transaction Limit Selector */}
                        <View style={styles.limitSelector}>
                            <Text style={styles.limitSelectorLabel}>Show:</Text>
                            <View style={styles.limitOptions}>
                                {[5, 10, 20, 50].map((limit) => (
                                    <TouchableOpacity
                                        key={limit}
                                        style={[
                                            styles.limitOption,
                                            transactionLimit === limit && styles.limitOptionActive
                                        ]}
                                        onPress={() => setTransactionLimit(limit)}
                                    >
                                        <Text
                                            style={[
                                                styles.limitOptionText,
                                                transactionLimit === limit && styles.limitOptionTextActive
                                            ]}
                                        >
                                            {limit}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    {smsLoading && <Text style={styles.loadingText}>Loading...</Text>}

                    {!smsLoading && transactions.length === 0 && (
                        <View style={styles.emptyState}>
                            <Icon name="inbox" size={48} color={theme.colors.placeholder} />
                            <Text style={styles.emptyText}>No transactions yet</Text>
                        </View>
                    )}

                    {/* Transaction List */}
                    {filteredTransactions.slice(0, transactionLimit).map((item, index) => (
                        <TouchableOpacity
                            key={item.transaction_id || index}
                            style={styles.balanceItem}
                            onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}
                            activeOpacity={0.7}
                        >
                            <View style={styles.balanceItemLeft}>
                                <View style={styles.tokenIcon}>
                                    <Text style={styles.tokenIconText}>₿</Text>
                                </View>
                                <View style={styles.tokenInfo}>
                                    <Text style={styles.tokenName}>
                                        {item.counterparty_name || 'Transaction'}
                                    </Text>
                                    <Text style={styles.tokenNetwork}>{item.type.replace(/_/g, ' ')}</Text>
                                </View>
                            </View>
                            <View style={styles.balanceItemRight}>
                                <Text style={styles.tokenAmount}>{item.currency} {item.amount.toLocaleString()}</Text>
                                <Text style={styles.tokenValue}>
                                    {item.direction === 'RECEIVED' ? '+' : '-'} {item.amount.toLocaleString()}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}

                    {filteredTransactions.length > transactionLimit && (
                        <TouchableOpacity
                            style={styles.viewAllButton}
                            onPress={() => navigation.navigate('TransactionsHistory' as any)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.viewAllText}>View All Transactions</Text>
                            <Icon name="chevron-right" size={20} color={theme.colors.text.secondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </ScrollView >
    );
}

const createStyles = (theme: any) => StyleSheet.create({
    // Container
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },

    // Content
    content: {
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
        paddingBottom: 80,
    },

    // Balance Card
    balanceCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    balanceLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        fontWeight: '500',
    },
    menuIcon: {
        fontSize: 20,
        color: theme.colors.text.secondary,
    },
    balanceAmountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    balanceAmount: {
        fontSize: 48,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        letterSpacing: -1,
    },
    balanceDecimal: {
        fontSize: 32,
        fontWeight: '400',
        color: theme.colors.text.secondary,
    },
    currencyBadge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.xl,
        alignSelf: 'flex-start',
    },
    currencyText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.colors.text.inverse,
    },

    // PnL Card
    pnlCard: {
        backgroundColor: theme.colors.secondary,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.borderDark,
    },
    pnlHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    pnlLabel: {
        fontSize: 14,
        color: theme.colors.text.inverse,
        fontWeight: '600',
    },
    pnlSubLabel: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginTop: 2,
        opacity: 0.7,
    },
    analyticsDetailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 16,
    },
    analyticItem: {
        flex: 1,
    },
    analyticLabel: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginBottom: 4,
    },
    analyticValueIn: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    analyticValueOut: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.inverse,
    },
    analyticDivider: {
        width: 1,
        height: 30,
        backgroundColor: theme.colors.borderDark,
    },
    homeInsightBox: {
        backgroundColor: theme.colors.cardDark,
        borderRadius: theme.borderRadius.lg,
        padding: 12,
        marginTop: 8,
    },
    homeInsightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    homeInsightTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    homeInsightDesc: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        lineHeight: 16,
    },

    // Permission Banner
    permissionBanner: {
        flexDirection: 'row',
        backgroundColor: theme.colors.secondary,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: theme.borderRadius.lg,
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    permissionBannerText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.inverse,
    },

    // Balance Section
    balanceSection: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.md,
        paddingBottom: 24,
    },
    balanceSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },

    // Loading & Empty States
    loadingText: {
        textAlign: 'center',
        color: theme.colors.text.secondary,
        fontSize: 14,
        marginTop: 32,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 48,
    },
    emptyText: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        textAlign: 'center',
    },

    // Balance Item
    balanceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    balanceItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    tokenIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    tokenIconText: {
        fontSize: 20,
        color: theme.colors.text.primary,
    },
    tokenInfo: {
        flex: 1,
    },
    tokenName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 2,
    },
    tokenNetwork: {
        fontSize: 12,
        color: theme.colors.text.secondary,
    },
    balanceItemRight: {
        alignItems: 'flex-end',
    },
    tokenAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 2,
    },
    tokenValue: {
        fontSize: 12,
        color: theme.colors.text.secondary,
    },

    // Search and Filter Section
    searchFilterSection: {
        marginBottom: theme.spacing.md,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.text.primary,
        marginLeft: theme.spacing.sm,
        padding: 0,
    },
    filterChips: {
        flexDirection: 'row',
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 4,
    },
    filterChipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterChipText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        fontWeight: '500',
    },
    filterChipTextActive: {
        color: theme.colors.text.primary,
        fontWeight: 'bold',
    },

    // Transaction Limit Selector
    limitSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    limitSelectorLabel: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        fontWeight: '500',
    },
    limitOptions: {
        flexDirection: 'row',
        gap: 4,
    },
    limitOption: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
        minWidth: 32,
        alignItems: 'center',
    },
    limitOptionActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    limitOptionText: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        fontWeight: '500',
    },
    limitOptionTextActive: {
        color: theme.colors.text.primary,
        fontWeight: 'bold',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.md,
        marginTop: theme.spacing.sm,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.lg,
        gap: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
});
