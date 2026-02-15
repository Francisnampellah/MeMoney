import { Transaction } from '../sms/types';
import { OPENAI_API_KEY, OPENAI_MODEL } from './config';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface AIInsight {
    title: string;
    description: string;
    type: 'spend' | 'leak' | 'save' | 'trend';
}

/**
 * Generates smart financial insights from transaction data using OpenAI.
 */
export async function generateSmartInsights(transactions: Transaction[]): Promise<AIInsight[]> {
    if (!OPENAI_API_KEY) {
        return [
            {
                title: 'AI Insights Disabled',
                description: 'Please provide a valid OpenAI API key in src/services/ai/config.ts to enable smart analysis.',
                type: 'trend'
            }
        ];
    }

    if (transactions.length === 0) return [];

    // Limit transactions to avoid token limits (last 100 tx)
    const recentTx = transactions.slice(0, 100).map(tx => ({
        amt: tx.amount,
        dir: tx.direction,
        type: tx.type,
        to: tx.counterparty_name,
        date: tx.date,
        f: tx.fee + (tx.government_levy || 0)
    }));

    const prompt = `
        Analyze the following M-Pesa transactions and provide 3 actionable smart financial insights.
        Keep descriptions concise, professional, and specific to the patterns found.
        
        Transactions JSON:
        ${JSON.stringify(recentTx)}
        
        Instructions:
        1. Identify high spending categories.
        2. Detect "leaks" like excessive transaction fees or subscription-like patterns.
        3. Suggest specific saving opportunities.
        4. Use Tanzanian context (Tsh currency).

        You must return ONLY a JSON object with a key "insights" which is an array of objects:
        { "insights": [ { "title": string, "description": string, "type": "spend" | "leak" | "save" | "trend" } ] }
    `;

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: OPENAI_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional financial advisor specializing in mobile money habits in Tanzania. You provide brief, high-impact insights based on M-Pesa transaction logs.'
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        return content.insights || [];
    } catch (error) {
        console.error('AI Insights Generation Error:', error);
        return [
            {
                title: 'Analysis Unavailable',
                description: 'We encountered an error analyzing your data. Check your network or API key.',
                type: 'trend'
            }
        ];
    }
}
