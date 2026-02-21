import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useAnalytics } from '../../services/analytics/useAnalytics';
import { abbreviateNumber } from '../../services/analytics/utils';
import { useSmartInsights } from '../../services/ai/useSmartInsights';
import { ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme';

const { width } = Dimensions.get('window');

const getInsightColor = (type: string, theme: any) => {
    switch (type) {
        case 'leak': return theme.colors.error + '15';
        case 'save': return theme.colors.success + '15';
        case 'spend': return theme.colors.info + '15';
        case 'trend': return theme.colors.surface;
        default: return theme.colors.surface;
    }
};

const getInsightIcon = (type: string) => {
    switch (type) {
        case 'leak': return 'money-off';
        case 'save': return 'account-balance-wallet';
        case 'spend': return 'shopping-bag';
        case 'trend': return 'trending-up';
        default: return 'insights';
    }
};

const getInsightIconColor = (type: string, theme: any) => {
    switch (type) {
        case 'leak': return theme.colors.error;
        case 'save': return theme.colors.success;
        case 'spend': return theme.colors.info;
        default: return theme.colors.text.primary;
    }
};

export function AnalysisScreen() {
    const safeAreaInsets = useSafeAreaInsets();
    const { stats, loading } = useAnalytics();
    const { insights, loading: aiLoading } = useSmartInsights();
    const theme = useTheme();
    const styles = createStyles(theme);

    const isDataEmpty = stats.income === 0 && stats.outcome === 0;

    if (loading && isDataEmpty) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.statusText, { marginTop: 12 }]}>Analyzing your transactions...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: safeAreaInsets.bottom + 100 }}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.content}>
                {/* AI Overview Hero */}
                <View style={styles.aiHeroCard}>
                    <View style={styles.aiHeroBadge}>
                        <Icon name="auto-awesome" size={14} color={theme.colors.text.inverse} />
                        <Text style={styles.aiHeroBadgeText}>AI OVERVIEW</Text>
                    </View>
                    <Text style={styles.aiHeroTitle}>
                        {stats.income > stats.outcome ? (
                            <Text>
                                <Text style={styles.boldText}>Surplus income</Text> means you're <Text style={styles.boldText}>actively building</Text> a <Text style={styles.boldText}>sustainable</Text> financial future.
                            </Text>
                        ) : (
                            <Text>
                                <Text style={styles.boldText}>Excess spending</Text> suggests you <Text style={styles.boldText}>must reduce</Text> your <Text style={styles.boldText}>daily leaks</Text> immediately.
                            </Text>
                        )}
                    </Text>
                </View>

                {/* Header Stats */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                        <Text style={styles.statLabel}>Income</Text>
                        <Text style={[styles.statValue, { color: theme.colors.success }]}>
                            Tsh {abbreviateNumber(stats.income)}
                        </Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Spending</Text>
                        <Text style={[styles.statValue, { color: theme.colors.error }]}>
                            Tsh {abbreviateNumber(stats.outcome)}
                        </Text>
                    </View>
                </View>

                {/* Hidden Leak: Fees & Levies */}
                <View style={styles.leakCard}>
                    <View style={styles.leakHeader}>
                        <Icon name="money-off" size={24} color={theme.colors.error} />
                        <Text style={styles.leakTitle}>Transaction Leak</Text>
                    </View>
                    <View style={styles.leakContent}>
                        <View>
                            <Text style={styles.leakAmount}>Tsh {abbreviateNumber(stats.fees)}</Text>
                            <Text style={styles.leakSubtext}>Paid in Fees & Levies</Text>
                        </View>
                        <View style={[styles.leakBadge, { backgroundColor: theme.colors.error + '20' }]}>
                            <Text style={styles.leakBadgeText}>
                                {stats.outcome > 0 ? ((stats.fees / stats.outcome) * 100).toFixed(1) : '0.0'}% of spend
                            </Text>
                        </View>
                    </View>
                    <View style={styles.tipBox}>
                        <Icon name="lightbulb" size={16} color={theme.colors.primary} />
                        <Text style={styles.tipText}>
                            High fees? Try Bank to M-Pesa or Lipa methods to save.
                        </Text>
                    </View>
                </View>

                {/* Weekly Trend Chart */}
                <Text style={styles.sectionTitle}>Weekly Cash Flow</Text>
                <View style={styles.chartCard}>
                    <BarChart
                        data={stats.chartData}
                        width={width - 72}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            formatYLabel: (label: string) => abbreviateNumber(parseFloat(label)),
                            backgroundColor: theme.colors.surface,
                            backgroundGradientFrom: theme.colors.surface,
                            backgroundGradientTo: theme.colors.surface,
                            decimalPlaces: 0,
                            color: (opacity = 1) => theme.colors.text.primary,
                            labelColor: (opacity = 1) => theme.colors.text.secondary,
                            style: { borderRadius: theme.borderRadius.xl },
                            propsForLabels: { fontSize: 10 },
                            barPercentage: 0.6,
                        }}
                        style={{ borderRadius: theme.borderRadius.xl, marginVertical: 8 }}
                        flatColor={true}
                        fromZero={true}
                        showBarTops={false}
                    />
                    <View style={styles.chartLegend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
                            <Text style={styles.legendText}>Inflow</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: theme.colors.secondary }]} />
                            <Text style={styles.legendText}>Outflow</Text>
                        </View>
                    </View>
                </View>

                {/* Pie Chart Analysis */}
                <Text style={styles.sectionTitle}>Top Expenditures</Text>
                <View style={styles.chartCard}>
                    <PieChart
                        data={stats.pieData}
                        width={width - 72}
                        height={180}
                        chartConfig={{
                            color: (opacity = 1) => theme.colors.text.primary,
                        }}
                        accessor={"amount"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        center={[0, 0]}
                    />
                </View>

                {/* Spending by Category List */}
                <Text style={styles.sectionTitle}>Details</Text>
                <View style={styles.categoryCard}>
                    {stats.categories.map((cat, index) => {
                        const widthPct = (cat.amount / stats.totalOutgoing) * 100;
                        return (
                            <View key={cat.name} style={styles.categoryItem}>
                                <View style={styles.categoryInfo}>
                                    <Text style={styles.categoryName}>{cat.name}</Text>
                                    <Text style={styles.categoryValue}>
                                        Tsh {abbreviateNumber(cat.amount)}
                                    </Text>
                                </View>
                                <View style={styles.progressBarBg}>
                                    <View
                                        style={[
                                            styles.progressBarFill,
                                            { width: `${Math.min(widthPct, 100)}%` }
                                        ]}
                                    />
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Smart Insights */}
                <View style={styles.insightHeaderRow}>
                    <Text style={styles.sectionTitle}>Smart Insights</Text>
                    {aiLoading && <ActivityIndicator size="small" color={theme.colors.primary} />}
                </View>

                {insights.length > 0 ? (
                    insights.map((insight, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.newInsightCard,
                                { borderColor: getInsightIconColor(insight.type, theme) }
                            ]}
                        >
                            <View style={styles.insightHeader}>
                                <View style={styles.insightIconSmall}>
                                    <Icon
                                        name={getInsightIcon(insight.type)}
                                        size={18}
                                        color={getInsightIconColor(insight.type, theme)}
                                    />
                                </View>
                                <Text style={styles.insightTitle}>{insight.title}</Text>
                                <View style={[styles.typeBadge, { backgroundColor: getInsightIconColor(insight.type, theme) }]}>
                                    <Text style={styles.typeBadgeText}>{insight.type.toUpperCase()}</Text>
                                </View>
                            </View>

                            <Text style={styles.insightDescription}>
                                {insight.description}
                            </Text>
                        </View>
                    ))
                ) : (
                    <View style={styles.insightCard}>
                        <View style={styles.insightEmptyState}>
                            <Text style={styles.insightDescription}>
                                {aiLoading ? 'Generating AI insights...' : 'No insights available yet.'}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}


const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginTop: 24,
        marginBottom: 12,
    },
    statusText: {
        fontSize: 16,
        color: theme.colors.text.secondary,
    },

    // Stats Row
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '900',
        color: theme.colors.text.secondary,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '900',
    },

    // Leak Card
    leakCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 20,
    },
    leakHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    leakTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    leakContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    leakAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.error,
    },
    leakSubtext: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginTop: 2,
    },
    leakBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    leakBadgeText: {
        color: theme.colors.error,
        fontSize: 12,
        fontWeight: '600',
    },
    tipBox: {
        flexDirection: 'row',
        backgroundColor: theme.colors.background,
        padding: 12,
        borderRadius: 12,
        gap: 8,
        alignItems: 'center',
    },
    tipText: {
        fontSize: 11,
        color: theme.colors.text.secondary,
        flex: 1,
    },

    // AI Hero Card
    aiHeroCard: {
        backgroundColor: theme.colors.primary,
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
        // Using common shadow for visibility on primary
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    aiHeroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 16,
        gap: 6,
    },
    aiHeroBadgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: theme.colors.text.inverse,
        letterSpacing: 1,
    },
    aiHeroTitle: {
        fontSize: 22,
        lineHeight: 30,
        color: theme.colors.text.inverse,
        fontWeight: '400',
    },
    boldText: {
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },

    // Category Card
    categoryCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    categoryItem: {
        marginBottom: 16,
    },
    categoryInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    categoryName: {
        fontSize: 14,
        color: theme.colors.text.primary,
        fontWeight: '500',
    },
    categoryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: theme.colors.background,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 3,
    },

    // Insight Card
    newInsightCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    insightCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    insightHeaderRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginTop: 24,
        marginBottom: 12,
    },
    insightEmptyState: {
        padding: 20,
        alignItems: 'center',
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 10,
    },
    insightIconSmall: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: theme.colors.text.primary,
        flex: 1,
    },
    typeBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    typeBadgeText: {
        fontSize: 8,
        fontWeight: '900',
        color: theme.colors.text.inverse,
    },
    insightDescription: {
        fontSize: 13,
        color: theme.colors.text.secondary,
        lineHeight: 20,
        paddingLeft: 4,
    },

    // Chart Card
    chartCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    chartLegend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginTop: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
        color: theme.colors.text.muted,
    },
});

