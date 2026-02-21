import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    Dimensions,
    ScrollView,
    Modal,
    Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMpesaSms } from '../../services/sms/useMpesaSms';
import { Transaction } from '../../services/sms/types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme';

const { width } = Dimensions.get('window');

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

export function TransactionsHistory() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const safeAreaInsets = useSafeAreaInsets();
    const { transactions, loading } = useMpesaSms();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<string>('all');
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

    const theme = useTheme();
    const styles = createStyles(theme);

    // ... unique types and selected check ...
    const uniqueTypes = Array.from(new Set(transactions.map(tx => tx.type))).sort();
    const isTypeSelected = uniqueTypes.includes(selectedFilter);

    // ... filtering ...
    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch =
            (tx.counterparty_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (tx.raw_text?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (tx.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesFilter =
            selectedFilter === 'all' ||
            (selectedFilter === 'received' && tx.direction === 'RECEIVED') ||
            (selectedFilter === 'sent' && tx.direction === 'SENT') ||
            (selectedFilter === tx.type);

        return matchesSearch && matchesFilter;
    });

    const renderItem = ({ item }: { item: Transaction }) => (
        <TouchableOpacity
            style={styles.transactionItem}
            onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <View style={[styles.typeBadge, { backgroundColor: item.direction === 'RECEIVED' ? theme.colors.info + '20' : theme.colors.warning + '20' }]}>
                    <Icon
                        name={item.direction === 'RECEIVED' ? 'south-west' : 'north-east'}
                        size={16}
                        color={item.direction === 'RECEIVED' ? theme.colors.info : theme.colors.warning}
                    />
                </View>
            </View>
            <View style={styles.details}>
                <Text style={styles.name} numberOfLines={1}>
                    {item.counterparty_name || 'Personal Transaction'}
                </Text>
                <Text style={styles.date}>
                    {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            <View style={styles.amountContainer}>
                <Text style={[styles.amount, { color: item.direction === 'RECEIVED' ? theme.colors.success : theme.colors.error }]}>
                    {item.direction === 'RECEIVED' ? '+' : '-'} {item.currency} {item.amount.toLocaleString()}
                </Text>
                {item.balance_after !== null && (
                    <Text style={styles.balance}>Bal: {item.balance_after.toLocaleString()}</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
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
                <View style={styles.filterChipsRow}>
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
                            In
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
                            Out
                        </Text>
                    </TouchableOpacity>

                    {/* Type Dropdown Trigger */}
                    <TouchableOpacity
                        style={[styles.filterChip, isTypeSelected && styles.filterChipActive]}
                        onPress={() => setIsTypeDropdownOpen(true)}
                    >
                        <Text style={[styles.filterChipText, isTypeSelected && styles.filterChipTextActive]}>
                            {isTypeSelected ? selectedFilter.replace(/_/g, ' ') : 'Type'}
                        </Text>
                        <Icon
                            name="keyboard-arrow-down"
                            size={18}
                            color={isTypeSelected ? theme.colors.text.primary : theme.colors.text.secondary}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Transaction Type Dropdown Modal */}
            <Modal
                visible={isTypeDropdownOpen}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsTypeDropdownOpen(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setIsTypeDropdownOpen(false)}
                >
                    <View style={styles.dropdownMenu}>
                        <Text style={styles.dropdownTitle}>Select Transaction Type</Text>
                        <ScrollView style={styles.dropdownScroll}>
                            {uniqueTypes.map(type => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.dropdownItem,
                                        selectedFilter === type && styles.dropdownItemActive
                                    ]}
                                    onPress={() => {
                                        setSelectedFilter(type);
                                        setIsTypeDropdownOpen(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.dropdownItemText,
                                        selectedFilter === type && styles.dropdownItemTextActive
                                    ]}>
                                        {type.replace(/_/g, ' ')}
                                    </Text>
                                    {selectedFilter === type && (
                                        <Icon name="check" size={18} color={theme.colors.text.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>

            <FlatList
                data={filteredTransactions}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.transaction_id || `${item.timestamp}-${index}`}
                contentContainerStyle={[styles.listContent, { paddingBottom: safeAreaInsets.bottom + 20 }]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="history" size={64} color={theme.colors.divider} />
                        <Text style={styles.emptyText}>No transactions found</Text>
                    </View>
                }
            />
        </View >
    );
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    // Search and Filter Section
    searchFilterSection: {
        paddingHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
        marginTop: 8,
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
        marginLeft: 8,
        padding: 0,
    },
    filterChipsRow: {
        flexDirection: 'row',
        gap: 6,
        flexWrap: 'wrap',
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 4,
        marginBottom: 8,
    },
    filterChipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterChipText: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        fontWeight: '600',
    },
    filterChipTextActive: {
        color: theme.colors.text.primary,
        fontWeight: 'bold',
    },
    // Dropdown Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: theme.colors.backdrop,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    dropdownMenu: {
        width: '100%',
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        padding: 20,
        maxHeight: '60%',
        elevation: 10,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    dropdownTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 16,
        textAlign: 'center',
    },
    dropdownScroll: {
        width: '100%',
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: theme.borderRadius.lg,
    },
    dropdownItemActive: {
        backgroundColor: theme.colors.divider,
    },
    dropdownItemText: {
        fontSize: 16,
        color: theme.colors.text.secondary,
    },
    dropdownItemTextActive: {
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    listContent: {
        paddingHorizontal: theme.spacing.md,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    iconContainer: {
        marginRight: 12,
    },
    typeBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    details: {
        flex: 1,
    },
    name: {
        fontSize: 15,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
        color: theme.colors.text.secondary,
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    balance: {
        fontSize: 11,
        color: theme.colors.text.muted,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: theme.colors.placeholder,
    },
});
