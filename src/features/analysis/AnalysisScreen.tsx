import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useAnalytics } from '../../services/analytics/useAnalytics';
import { abbreviateNumber } from '../../services/analytics/utils';
import { useSmartInsights } from '../../services/ai/useSmartInsights';
import { ActivityIndicator } from 'react-native';

const { width } = Dimensions.get('window');

const getInsightColor = (type: string) => {
    switch (type) {
        case 'leak': return '#FFF1F1';
        case 'save': return '#F1FFF1';
        case 'spend': return '#F1F7FF';
        case 'trend': return '#F5F5F5';
        default: return '#ECECEC';
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

const getInsightIconColor = (type: string) => {
    switch (type) {
        case 'leak': return '#FF4B4B';
        case 'save': return '#00D68F';
        case 'spend': return '#007AFF';
        default: return '#000000';
    }
};

export function AnalysisScreen() {
    const safeAreaInsets = useSafeAreaInsets();
    const { stats, loading } = useAnalytics();
    const { insights, loading: aiLoading } = useSmartInsights();

    const isDataEmpty = stats.income === 0 && stats.outcome === 0;

    if (loading && isDataEmpty) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#C5FF00" />
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
                        <Icon name="auto-awesome" size={14} color="#000" />
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
                    <View style={[styles.statCard, { backgroundColor: '#000000' }]}>
                        <Text style={styles.statLabel}>Income</Text>
                        <Text style={[styles.statValue, { color: '#C5FF00' }]}>
                            Tsh {abbreviateNumber(stats.income)}
                        </Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabelBlack}>Spending</Text>
                        <Text style={styles.statValueBlack}>
                            Tsh {abbreviateNumber(stats.outcome)}
                        </Text>
                    </View>
                </View>

                {/* Hidden Leak: Fees & Levies */}
                <View style={styles.leakCard}>
                    <View style={styles.leakHeader}>
                        <Icon name="money-off" size={24} color="#FF4B4B" />
                        <Text style={styles.leakTitle}>Transaction Leak</Text>
                    </View>
                    <View style={styles.leakContent}>
                        <View>
                            <Text style={styles.leakAmount}>Tsh {abbreviateNumber(stats.fees)}</Text>
                            <Text style={styles.leakSubtext}>Paid in Fees & Levies</Text>
                        </View>
                        <View style={styles.leakBadge}>
                            <Text style={styles.leakBadgeText}>
                                {stats.outcome > 0 ? ((stats.fees / stats.outcome) * 100).toFixed(1) : '0.0'}% of spend
                            </Text>
                        </View>
                    </View>
                    <View style={styles.tipBox}>
                        <Icon name="lightbulb" size={16} color="#000" />
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
                            backgroundColor: '#FFFFFF',
                            backgroundGradientFrom: '#FFFFFF',
                            backgroundGradientTo: '#FFFFFF',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
                            style: { borderRadius: 16 },
                            propsForLabels: { fontSize: 10 },
                            barPercentage: 0.6,
                        }}
                        style={{ borderRadius: 16, marginVertical: 8 }}
                        flatColor={true}
                        fromZero={true}
                        showBarTops={false}
                    />
                    <View style={styles.chartLegend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#C5FF00' }]} />
                            <Text style={styles.legendText}>Inflow</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#000000' }]} />
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
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
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
                    {aiLoading && <ActivityIndicator size="small" color="#000" />}
                </View>

                {insights.length > 0 ? (
                    insights.map((insight, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.newInsightCard,
                                { borderColor: getInsightIconColor(insight.type) }
                            ]}
                        >
                            <View style={styles.insightHeader}>
                                <View style={styles.insightIconSmall}>
                                    <Icon
                                        name={getInsightIcon(insight.type)}
                                        size={18}
                                        color={getInsightIconColor(insight.type)}
                                    />
                                </View>
                                <Text style={styles.insightTitle}>{insight.title}</Text>
                                <View style={[styles.typeBadge, { backgroundColor: getInsightIconColor(insight.type) }]}>
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


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 24,
        marginBottom: 12,
    },
    statusText: {
        fontSize: 16,
        color: '#666',
    },

    // Stats Row
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#000',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '900',
    },
    statLabelBlack: {
        fontSize: 12,
        fontWeight: '900',
        color: '#999',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    statValueBlack: {
        fontSize: 20,
        fontWeight: '900',
        color: '#000',
    },

    // Leak Card
    leakCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#000',
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
        color: '#000',
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
        color: '#FF4B4B',
    },
    leakSubtext: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    leakBadge: {
        backgroundColor: '#FFF1F1',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    leakBadgeText: {
        color: '#FF4B4B',
        fontSize: 12,
        fontWeight: '600',
    },
    tipBox: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        padding: 12,
        borderRadius: 12,
        gap: 8,
        alignItems: 'center',
    },
    tipText: {
        fontSize: 11,
        color: '#666',
        flex: 1,
    },

    // AI Hero Card
    aiHeroCard: {
        backgroundColor: '#C5FF00',
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#C5FF00',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    aiHeroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
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
        color: '#000',
        letterSpacing: 1,
    },
    aiHeroTitle: {
        fontSize: 22,
        lineHeight: 30,
        color: '#000',
        fontWeight: '400',
    },
    boldText: {
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },

    // Category Card
    categoryCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#000',
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
        color: '#000',
        fontWeight: '500',
    },
    categoryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#F0F0F0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#000',
        borderRadius: 3,
    },

    // Insight Card
    newInsightCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#000',
    },
    insightCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#000',
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
        color: '#000',
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
        color: '#FFF',
    },
    insightDescription: {
        fontSize: 13,
        color: '#444',
        lineHeight: 20,
        paddingLeft: 4, // Align slightly with title text
    },

    // Chart Card
    chartCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#000',
    },
    chartYAxis: {
        height: 180,
        justifyContent: 'flex-end',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: 8,
    },
    chartBarsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: '100%',
    },
    chartBarGroup: {
        alignItems: 'center',
        width: 40,
    },
    barStack: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
        height: '100%',
    },
    bar: {
        width: 12,
        borderRadius: 4,
    },
    incomeBar: {
        backgroundColor: '#C5FF00',
        borderWidth: 1,
        borderColor: '#000',
    },
    outcomeBar: {
        backgroundColor: '#000',
    },
    barLabel: {
        fontSize: 10,
        color: '#999',
        marginTop: 8,
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
        color: '#666',
    },
});

