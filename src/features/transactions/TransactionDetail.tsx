import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { BottomTabBar } from '../../components/BottomTabBar';
import Share from 'react-native-share';
import RNPrint from 'react-native-print';
import { generateReceiptHtml, getReceiptHtml } from '../../utils/pdfGenerator';
import { useTheme } from '../../theme';

export function TransactionDetail() {
    const route = useRoute<RouteProp<RootStackParamList, 'TransactionDetail'>>();
    const { transaction } = route.params;
    const theme = useTheme();
    const styles = createStyles(theme);

    const handlePrint = async () => {
        try {
            const html = getReceiptHtml(transaction);
            // @ts-ignore
            await RNPrint.print({ html });
        } catch (error) {
            console.error('Error printing receipt:', error);
        }
    };

    const handleShare = async () => {
        try {
            const filePath = await generateReceiptHtml(transaction);
            if (filePath) {
                await Share.open({
                    url: `file://${filePath}`,
                    type: 'application/pdf',
                    title: 'Transaction Receipt',
                });
            }
        } catch (error) {
            console.error('Error downloading receipt:', error);
        }
    };
    const isReceived = transaction.direction === 'RECEIVED';

    // Receipt Dashed Divider Component
    const DashedDivider = () => (
        <View style={styles.dashedDividerContainer}>
            <View style={styles.dashedDivider} />
        </View>
    );

    const DetailRow = ({
        label,
        value,
        isBold = false,
        isMono = false
    }: {
        label: string;
        value: string | number | null;
        isBold?: boolean;
        isMono?: boolean
    }) => {
        if (value === null || value === undefined) return null;
        return (
            <View style={styles.row}>
                <Text style={styles.label}>{label}</Text>
                <Text style={[
                    styles.value,
                    isBold && styles.boldValue,
                    isMono && styles.monoValue
                ]}>
                    {value}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.receiptContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        {/* Brand Logo Placeholder */}

                        <Text style={styles.brandText}>MeMoney</Text>
                        <Text style={styles.dateTime}>
                            {transaction.date} • {transaction.time}
                        </Text>
                    </View>

                    <DashedDivider />

                    {/* Transaction ID in Dashed Box */}
                    {transaction.transaction_id && (
                        <View style={styles.tokenBox}>
                            <Text style={styles.tokenLabel}>Transaction ID</Text>
                            <Text style={styles.tokenValue}>{transaction.transaction_id}</Text>
                        </View>
                    )}

                    <View style={styles.typeRow}>
                        <Text style={styles.typeLabel}>Type</Text>
                        <Text style={styles.typeValue}>{transaction.type.replace(/_/g, ' ')}</Text>
                    </View>

                    <DashedDivider />

                    {/* Details Section */}
                    <View style={styles.detailsSection}>
                        <DetailRow label="Status" value={transaction.status} />
                        <View style={{ height: 8 }} />
                        <DetailRow
                            label={isReceived ? 'Sender' : 'Recipient'}
                            value={transaction.counterparty_name || 'Unknown'}
                            isBold
                        />
                        <DetailRow label="Account" value={transaction.counterparty_account} isMono />
                        <DetailRow label="Channel" value={transaction.channel} />
                    </View>

                    <DashedDivider />

                    {/* Financials Section */}
                    <View style={styles.financialsSection}>
                        <DetailRow label="Amount" value={`${transaction.currency} ${transaction.amount.toLocaleString()}`} isBold />
                        <DetailRow label="Fee" value={`${transaction.currency} ${transaction.fee.toLocaleString()}`} />
                        {transaction.government_levy > 0 && (
                            <DetailRow label="Levy" value={`${transaction.currency} ${transaction.government_levy.toLocaleString()}`} />
                        )}

                        {/* Total Line */}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>TOTAL</Text>
                            <Text style={styles.totalValue}>
                                {transaction.currency} {(transaction.amount + transaction.fee + transaction.government_levy).toLocaleString()}
                            </Text>
                        </View>
                    </View>

                    <DashedDivider />

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Thank you for using MeMoney</Text>
                        {transaction.balance_after && (
                            <Text style={styles.balanceText}>
                                Balance: {transaction.currency} {transaction.balance_after.toLocaleString()}
                            </Text>
                        )}
                    </View>
                </View>
            </ScrollView>
            <BottomTabBar
                activeTab="home"
                showTransactionActions={true}
                onPrint={handlePrint}
                onShare={handleShare}
                onTabSelect={() => { }}
            />
        </SafeAreaView>
    );
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
        alignItems: 'center',
    },
    receiptContainer: {
        backgroundColor: theme.colors.surface,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    brandText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 4,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    dateTime: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    dashedDividerContainer: {
        height: 1,
        width: '100%',
        overflow: 'hidden',
        marginVertical: 16,
    },
    dashedDivider: {
        height: 2,
        width: '100%',
        borderWidth: 1,
        borderColor: theme.colors.divider,
        borderStyle: 'dashed',
        borderRadius: 1,
    },
    tokenBox: {
        borderWidth: 1.5,
        borderColor: theme.colors.text.primary,
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: theme.colors.background,
    },
    tokenLabel: {
        fontSize: 10,
        color: theme.colors.text.secondary,
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 1,
    },
    tokenValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        letterSpacing: 1,
    },
    typeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    typeLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    typeValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        textTransform: 'uppercase',
    },
    detailsSection: {
        marginBottom: 0,
    },
    financialsSection: {
        marginBottom: 0,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    label: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        flex: 1,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    value: {
        fontSize: 14,
        color: theme.colors.text.primary,
        flex: 2,
        textAlign: 'right',
    },
    boldValue: {
        fontWeight: 'bold',
    },
    monoValue: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 13,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 2,
        borderTopColor: theme.colors.text.primary,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        textTransform: 'uppercase',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    footer: {
        alignItems: 'center',
        marginTop: 8,
    },
    footerText: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginBottom: 8,
        fontStyle: 'italic',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    balanceText: {
        fontSize: 12,
        color: theme.colors.text.primary,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
});
