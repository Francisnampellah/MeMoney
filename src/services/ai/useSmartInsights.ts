import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAnalytics } from '../analytics/useAnalytics';
import { generateSmartInsights, AIInsight } from './openai';

const CACHE_KEY = '@MeMoney_AI_Insights_Cache';

/**
 * Generates a simple fingerprint of the transaction data to detect changes.
 * We include count, total volume, and latest transaction ID.
 */
function getTransactionFingerprint(transactions: any[]): string {
    if (transactions.length === 0) return '';
    const latestId = transactions[0]?.transaction_id || '';
    const count = transactions.length;
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    return `${latestId}_${count}_${totalAmount}`;
}

export function useSmartInsights() {
    const { transactions, loading: analyticsLoading } = useAnalytics();
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInsights = useCallback(async (force = false) => {
        if (transactions.length === 0) return;

        const currentFingerprint = getTransactionFingerprint(transactions);

        try {
            setLoading(true);

            // Check cache first
            if (!force) {
                const cachedData = await AsyncStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    const { insights: cachedInsights, fingerprint: cachedFingerprint } = JSON.parse(cachedData);

                    // Check if cache contains the "Disabled" error.
                    const isDisabledError = cachedInsights.some((i: any) => i.title === 'AI Insights Disabled');

                    // ONLY use cache if fingerprints match and it's not a previous error
                    if (!isDisabledError && currentFingerprint === cachedFingerprint) {
                        setInsights(cachedInsights);
                        setLoading(false);
                        return;
                    }
                }
            }

            // Generate new insights since state has changed
            const newInsights = await generateSmartInsights(transactions);
            setInsights(newInsights);

            // Save to cache with the current state fingerprint
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
                insights: newInsights,
                fingerprint: currentFingerprint,
                timestamp: Date.now()
            }));
        } catch (err) {
            setError('Failed to generate insights');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [transactions]);

    useEffect(() => {
        if (!analyticsLoading && transactions.length > 0 && insights.length === 0) {
            fetchInsights();
        }
    }, [analyticsLoading, transactions.length, insights.length, fetchInsights]);

    return {
        insights,
        loading: loading || analyticsLoading,
        error,
        refresh: () => fetchInsights(true)
    };
}
