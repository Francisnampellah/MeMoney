import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
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

interface HomeScreenProps {
    onTransactionSelect: (transaction: Transaction) => void;
    onViewAll: () => void;
}

export function HomeScreen({ onTransactionSelect, onViewAll }: HomeScreenProps) {
    const safeAreaInsets = useSafeAreaInsets();
    const { hasPermission, requestPermission, isLoading: isPermissionLoading } = useSmsPermission();
    const { transactions, loading: smsLoading, error, refresh } = useMpesaSms();
    const { stats, loading: analyticsLoading } = useAnalytics();
    const { insights, loading: aiLoading } = useSmartInsights();

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
        // Apply filter
        if (selectedFilter === 'received' && tx.direction !== 'RECEIVED') return false;
        if (selectedFilter === 'sent' && tx.direction !== 'SENT') return false;

        // Apply search
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
                            <Icon name="insights" size={20} color="#C5FF00" />
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
                                <Icon name="lightbulb" size={14} color="#C5FF00" />
                                <Text style={styles.homeInsightTitle}>AI TIP: {topInsight.title}</Text>
                            </View>
                            <Text style={styles.homeInsightDesc} numberOfLines={2}>
                                {topInsight.description}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                {/* <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity style={[styles.actionButton, styles.depositButton]}>
                        <Icon name="add-circle" size={32} color="#FFFFFF" />
                        <Text style={styles.actionLabelDeposit}>Deposit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, styles.withdrawButton]}>
                        <Icon name="remove-circle" size={32} color="#FFFFFF" />
                        <Text style={styles.actionLabelWithdraw}>Withdraw</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, styles.transferButton]}>
                        <Icon name="swap-horiz" size={32} color="#000000" />
                        <Text style={styles.actionLabelTransfer}>Transfer</Text>
                    </TouchableOpacity>
                </View> */}

                {/* SMS Permission Banner */}
                {!hasPermission && (
                    <TouchableOpacity
                        style={styles.permissionBanner}
                        onPress={handleRequestSmsPermission}
                        disabled={isPermissionLoading}
                        activeOpacity={0.8}
                    >
                        <Icon name="sms" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.permissionBannerText}>
                            {isPermissionLoading ? 'Requesting...' : 'Enable SMS Access'}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Search and Filter Section */}
                <View style={styles.searchFilterSection}>
                    {/* Search Bar */}
                    <View style={styles.searchBar}>
                        <Icon name="search" size={20} color="#999999" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search transactions..."
                            placeholderTextColor="#999999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Icon name="close" size={20} color="#999999" />
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
                                color={selectedFilter === 'received' ? '#000000' : '#999999'}
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
                                color={selectedFilter === 'sent' ? '#000000' : '#999999'}
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
                            <Icon name="inbox" size={48} color="#CCCCCC" />
                            <Text style={styles.emptyText}>No transactions yet</Text>
                        </View>
                    )}

                    {/* Transaction List */}
                    {filteredTransactions.slice(0, transactionLimit).map((item, index) => (
                        <TouchableOpacity
                            key={item.transaction_id || index}
                            style={styles.balanceItem}
                            onPress={() => onTransactionSelect(item)}
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
                            onPress={onViewAll}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.viewAllText}>View All Transactions</Text>
                            <Icon name="chevron-right" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    // Container
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
    },

    // Content
    content: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 80,
    },

    // Balance Card
    balanceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#000000',
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
    menuIcon: {
        fontSize: 20,
        color: '#666666',
    },
    balanceAmountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    balanceAmount: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#000000',
        letterSpacing: -1,
    },
    balanceDecimal: {
        fontSize: 32,
        fontWeight: '400',
        color: '#999999',
    },
    currencyBadge: {
        backgroundColor: '#C5FF00',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    currencyText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000000',
    },

    // PnL Card
    pnlCard: {
        backgroundColor: '#000000',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#000000',
    },
    pnlHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    pnlLabel: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    pnlSubLabel: {
        fontSize: 12,
        color: '#999999',
        marginTop: 2,
    },
    pnlMenuIcon: {
        fontSize: 20,
        color: '#FFFFFF',
    },
    pnlContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        color: '#999999',
        marginBottom: 4,
    },
    analyticValueIn: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#C5FF00',
    },
    analyticValueOut: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    analyticDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#333333',
    },
    homeInsightBox: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
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
        color: '#C5FF00',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    homeInsightDesc: {
        fontSize: 12,
        color: '#CCCCCC',
        lineHeight: 16,
    },
    pnlAmountSection: {
        flex: 1,
    },
    pnlAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#C5FF00',
        marginBottom: 4,
    },
    pnlPercentage: {
        fontSize: 14,
        color: '#C5FF00',
    },
    chartPlaceholder: {
        width: 100,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartText: {
        fontSize: 40,
    },

    // Action Buttons
    actionButtonsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        height: 100,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000000',
    },
    depositButton: {
        backgroundColor: '#00D68F',
    },
    withdrawButton: {
        backgroundColor: '#000000',
    },
    transferButton: {
        backgroundColor: '#C5FF00',
    },
    actionIconContainer: {
        marginBottom: 8,
    },
    actionIcon: {
        fontSize: 32,
    },
    actionLabelDeposit: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    actionLabelWithdraw: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    actionLabelTransfer: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000',
    },

    // Permission Banner
    permissionBanner: {
        flexDirection: 'row',
        backgroundColor: '#000000',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    permissionBannerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // Balance Section
    balanceSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        paddingBottom: 24,
    },
    balanceSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
    },

    // Loading & Empty States
    loadingText: {
        textAlign: 'center',
        color: '#666666',
        fontSize: 14,
        marginTop: 32,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 48,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#999999',
        textAlign: 'center',
    },

    // Balance Item (Token List)
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
        backgroundColor: '#F8F8F8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    tokenIconText: {
        fontSize: 20,
    },
    tokenInfo: {
        flex: 1,
    },
    tokenName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 2,
    },
    tokenNetwork: {
        fontSize: 12,
        color: '#999999',
    },
    balanceItemRight: {
        alignItems: 'flex-end',
    },
    tokenAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 2,
    },
    tokenValue: {
        fontSize: 12,
        color: '#999999',
    },

    // Search and Filter Section
    searchFilterSection: {
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#000000',
        marginLeft: 8,
        padding: 0,
    },
    filterChips: {
        flexDirection: 'row',
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        gap: 4,
    },
    filterChipActive: {
        backgroundColor: '#C5FF00',
        borderColor: '#C5FF00',
    },
    filterChipText: {
        fontSize: 14,
        color: '#999999',
        fontWeight: '500',
    },
    filterChipTextActive: {
        color: '#000000',
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
        color: '#999999',
        fontWeight: '500',
    },
    limitOptions: {
        flexDirection: 'row',
        gap: 4,
    },
    limitOption: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        minWidth: 32,
        alignItems: 'center',
    },
    limitOptionActive: {
        backgroundColor: '#C5FF00',
        borderColor: '#C5FF00',
    },
    limitOptionText: {
        fontSize: 12,
        color: '#999999',
        fontWeight: '500',
    },
    limitOptionTextActive: {
        color: '#000000',
        fontWeight: 'bold',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginTop: 8,
        backgroundColor: '#F5F5F7',
        borderRadius: 12,
        gap: 4,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000',
    },
});
