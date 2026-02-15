import { useMemo } from 'react';
import { useMpesaSms } from '../sms/useMpesaSms';
import { abbreviateNumber, simplifyCategory } from './utils';

export interface AnalyticsStats {
    income: number;
    outcome: number;
    fees: number;
    categories: Array<{ name: string; amount: number }>;
    totalOutgoing: number;
    chartData: {
        labels: string[];
        datasets: Array<{
            data: number[];
            color: (opacity?: number) => string;
        }>;
    };
    pieData: Array<{
        name: string;
        amount: number;
        color: string;
        legendFontColor: string;
        legendFontSize: number;
    }>;
}

export function useAnalytics() {
    const { transactions, loading, error, refresh } = useMpesaSms();

    const stats: AnalyticsStats = useMemo(() => {
        let income = 0;
        let outcome = 0;
        let fees = 0;
        const categories: Record<string, number> = {};
        const dailyFlow: Record<string, { income: number, outcome: number }> = {};

        // Process transactions
        transactions.forEach(tx => {
            const txFees = tx.fee + (tx.government_levy || 0);

            if (tx.direction === 'RECEIVED') {
                income += tx.amount;
            } else {
                // Outcome should represent the total amount deducted from balance
                outcome += (tx.amount + txFees);

                // Spending category breakdown - ONLY for outcomes
                const simplifiedName = simplifyCategory(tx.type);
                categories[simplifiedName] = (categories[simplifiedName] || 0) + tx.amount;
            }
            fees += txFees;

            // Trend data (Total movement)
            const date = tx.date; // YYYY-MM-DD
            if (!dailyFlow[date]) dailyFlow[date] = { income: 0, outcome: 0 };
            if (tx.direction === 'RECEIVED') dailyFlow[date].income += tx.amount;
            else dailyFlow[date].outcome += (tx.amount + txFees);
        });

        // Add Fees as a specific category for the breakdown list
        if (fees > 0) {
            categories['Fees'] = (categories['Fees'] || 0) + fees;
        }

        // Convert categories to sorted array
        const sortedCategories = Object.entries(categories)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount);

        const totalOutgoing = outcome || 1; // Total money that left the account

        // Prepare Weekly Trend (Last 7 days with transactions)
        const trendDates = Object.keys(dailyFlow).sort().slice(-7);
        const labels = trendDates.map(date => date.split('-').slice(1).join('/'));
        const incomeData = trendDates.map(date => dailyFlow[date].income);
        const outcomeData = trendDates.map(date => dailyFlow[date].outcome);

        // Prepare Pie Chart data
        const pieData = sortedCategories.slice(0, 5).map((cat, idx) => ({
            name: `${cat.name}`,
            amount: cat.amount,
            color: [
                '#000000',
                '#C5FF00',
                '#4A4A4A',
                '#A3A3A3',
                '#E5E5E5'
            ][idx % 5],
            legendFontColor: '#666',
            legendFontSize: 12,
        }));

        return {
            income,
            outcome,
            fees,
            categories: sortedCategories,
            totalOutgoing,
            chartData: {
                labels,
                datasets: [
                    { data: incomeData, color: (opacity = 1) => `rgba(197, 255, 0, ${opacity})` }, // Lime for inflow
                    { data: outcomeData, color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }    // Black for outflow
                ]
            },
            pieData
        };
    }, [transactions]);

    const feePercentage = useMemo(() =>
        stats.outcome > 0 ? ((stats.fees / stats.outcome) * 100).toFixed(1) : '0.0',
        [stats.fees, stats.outcome]);

    return {
        stats,
        transactions,
        loading,
        error,
        refresh,
        feePercentage
    };
}
