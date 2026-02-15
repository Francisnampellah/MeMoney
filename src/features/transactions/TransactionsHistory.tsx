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

const { width } = Dimensions.get('window');

interface TransactionsHistoryProps {
    onTransactionSelect: (transaction: Transaction) => void;
    onBack: () => void;
}

export function TransactionsHistory({ onTransactionSelect, onBack }: TransactionsHistoryProps) {
    const safeAreaInsets = useSafeAreaInsets();
    const { transactions, loading } = useMpesaSms();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<string>('all');
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

    // Dynamically get unique types present in the current transactions
    const uniqueTypes = Array.from(new Set(transactions.map(tx => tx.type))).sort();

    // Check if the current filter is one of the specific transaction types
    const isTypeSelected = uniqueTypes.includes(selectedFilter);

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
            onPress={() => onTransactionSelect(item)}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <View style={[styles.typeBadge, { backgroundColor: item.direction === 'RECEIVED' ? '#E1F5FE' : '#FFF3E0' }]}>
                    <Icon
                        name={item.direction === 'RECEIVED' ? 'south-west' : 'north-east'}
                        size={16}
                        color={item.direction === 'RECEIVED' ? '#0288D1' : '#F57C00'}
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
                <Text style={[styles.amount, { color: item.direction === 'RECEIVED' ? '#00C853' : '#FF5252' }]}>
                    {item.direction === 'RECEIVED' ? '+' : '-'} {item.currency} {item.amount.toLocaleString()}
                </Text>
                {item.balance_after !== null && (
                    <Text style={styles.balance}>Bal: {item.balance_after.toLocaleString()}</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>


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
                            color={selectedFilter === 'received' ? '#000000' : '#999999'}
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
                            color={selectedFilter === 'sent' ? '#000000' : '#999999'}
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
                            color={isTypeSelected ? '#000000' : '#999999'}
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
                                        <Icon name="check" size={18} color="#000" />
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
                        <Icon name="history" size={64} color="#EEE" />
                        <Text style={styles.emptyText}>No transactions found</Text>
                    </View>
                }
            />
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    // Search and Filter Section
    searchFilterSection: {
        paddingHorizontal: 16,
        marginBottom: 16,
        marginTop: 8,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F7',
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
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        gap: 4,
        marginBottom: 8,
    },
    filterChipActive: {
        backgroundColor: '#C5FF00',
        borderColor: '#C5FF00',
    },
    filterChipText: {
        fontSize: 12,
        color: '#999999',
        fontWeight: '600',
    },
    filterChipTextActive: {
        color: '#000000',
        fontWeight: 'bold',
    },
    // Dropdown Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    dropdownMenu: {
        width: '100%',
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        maxHeight: '60%',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    dropdownTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
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
        borderRadius: 12,
    },
    dropdownItemActive: {
        backgroundColor: '#F5F5F5',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#444',
    },
    dropdownItemTextActive: {
        fontWeight: 'bold',
        color: '#000',
    },
    listContent: {
        paddingHorizontal: 16,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
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
        color: '#000',
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
        color: '#999',
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
        color: '#AAA',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#CCC',
    },
});
