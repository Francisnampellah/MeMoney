/**
 * Abbreviate numbers into compact format (e.g. 1500 -> 1.5K)
 */
export const abbreviateNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
};

/**
 * Simplify category names to single words
 */
export const simplifyCategory = (type: string): string => {
    const map: Record<string, string> = {
        'MONEY_TRANSFER': 'Transfer',
        'WITHDRAWAL': 'Withdrawal',
        'BILL_PAYMENT': 'Bills',
        'UTILITY_PAYMENT': 'Utility',
        'LOAN_REPAYMENT': 'Repayment',
        'SAVINGS_WITHDRAWAL': 'Savings',
        'SAVINGS_DEPOSIT': 'Savings',
        'AIRTIME': 'Airtime',
        'BUNDLES': 'Bundles',
        'INSURANCE': 'Insurance',
        'BETTING': 'Betting',
        'LOAN': 'Loan',
    };
    if (map[type]) return map[type];

    // Fallback: take first word and capitalize
    const firstWord = type.split('_')[0];
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
};
