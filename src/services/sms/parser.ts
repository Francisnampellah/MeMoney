import {
  ParsedTransaction,
  TransactionStatus,
  TransactionType,
  Channel,
  TransactionDirection,
} from './types';

/**
 * M-Pesa SMS Parser
 * Extracts structured transaction data from M-Pesa SMS messages
 * Based on M-PESA Message Parser Guide v1.0
 */

export const mpesaParser = {
  /**
   * Parse a single M-Pesa SMS message
   */
  parseSms: (rawText: string): ParsedTransaction | null => {
    // 1. Validate Message (Must start with alphanumeric transaction code)
    if (!isValidMessage(rawText)) {
      return null;
    }

    // 2. Extract Transaction Code
    const transactionId = extractTransactionId(rawText);
    if (!transactionId) return null; // Should be covered by isValidMessage, but safety check

    // 3. Determine Transaction Direction
    const direction = determineDirection(rawText);

    // 4. Extract Amount
    const amount = extractAmount(rawText);

    // 5. Categorize Transaction Type
    const type = extractTransactionType(rawText);

    // 6. Extract Other Participant
    const { name, account } = extractParticipant(rawText, direction);

    // 7. Extract Date and Time
    const { date, time } = extractDateTime(rawText);

    // 8. Extract Balance
    const balanceAfter = extractBalance(rawText);

    // 9. Extract Fees
    const { fee, governmentLevy } = extractFees(rawText);

    // Determine Status (Basic logic based on keywords)
    const status: TransactionStatus = rawText.includes('Confirmed')
      ? 'Confirmed'
      : rawText.includes('Failed')
        ? 'Failed'
        : 'Unknown';

    // Determine Channel
    const channel = determineChannel(type, rawText);

    return {
      transaction_id: transactionId,
      status,
      direction,
      type,
      amount,
      currency: 'TZS',
      fee,
      government_levy: governmentLevy,
      counterparty_name: name,
      counterparty_account: account,
      channel,
      date,
      time,
      balance_after: balanceAfter,
      raw_text: rawText,
    };
  },

  /**
   * Parse multiple SMS messages and deduplicate by transaction_id
   */
  parseSmsList: (smsList: string[]): ParsedTransaction[] => {
    const parsed = smsList
      .map(sms => mpesaParser.parseSms(sms))
      .filter((tx): tx is ParsedTransaction => tx !== null);

    return mpesaParser.deduplicateByTransactionId(parsed);
  },

  /**
   * Deduplicate transactions by transaction_id
   */
  deduplicateByTransactionId: (
    transactions: ParsedTransaction[],
  ): ParsedTransaction[] => {
    const transactionMap = new Map<string, ParsedTransaction>();

    for (const transaction of transactions) {
      // We know ID is not null here due to parseSms logic, but safe cast
      const id = transaction.transaction_id!;

      if (transactionMap.has(id)) {
        const existing = transactionMap.get(id)!;
        const merged = mpesaParser.mergeTransactions(existing, transaction);
        transactionMap.set(id, merged);
      } else {
        transactionMap.set(id, transaction);
      }
    }

    return Array.from(transactionMap.values());
  },

  /**
   * Merge two transactions with the same ID
   */
  mergeTransactions: (
    tx1: ParsedTransaction,
    tx2: ParsedTransaction,
  ): ParsedTransaction => {
    return {
      ...tx1,
      // Prefer Confirmed status
      status: tx1.status === 'Confirmed' ? tx1.status : tx2.status,
      // Prefer specific types over unknown/money transfer if applicable
      type: tx1.type !== 'MONEY_TRANSFER' && tx1.type !== 'UNKNOWN' ? tx1.type : tx2.type,
      // MAX logic for numerical values assuming non-zero is better
      amount: Math.max(tx1.amount, tx2.amount),
      fee: Math.max(tx1.fee, tx2.fee),
      government_levy: Math.max(tx1.government_levy, tx2.government_levy),
      // User longer/present strings
      counterparty_name: tx1.counterparty_name || tx2.counterparty_name,
      counterparty_account: tx1.counterparty_account || tx2.counterparty_account,
      date: tx1.date || tx2.date, // Should be same
      time: tx1.time || tx2.time,
      balance_after: tx1.balance_after !== null ? tx1.balance_after : tx2.balance_after,
      // Concatenate raw text
      raw_text: tx1.raw_text === tx2.raw_text ? tx1.raw_text : `${tx1.raw_text} | ${tx2.raw_text}`,
    };
  },
};

// --- Helper Functions ---

function isValidMessage(text: string): boolean {
  // Primary Rule: Start with alphanumeric code (e.g., DBC1MV31SMJ)
  return /^[A-Z0-9]+\s/.test(text);
}

function extractTransactionId(text: string): string | null {
  const match = text.match(/^([A-Z0-9]+)\s/);
  return match ? match[1] : null;
}

function determineDirection(text: string): TransactionDirection {
  const lower = text.toLowerCase();
  if (
    lower.includes('sent to') ||
    lower.includes('paid to') ||
    lower.includes('withdraw') ||
    lower.includes('bought') ||
    lower.includes('deducted from your m-pesa account')
  ) {
    return 'SENT';
  }
  if (
    lower.includes('received') ||
    lower.includes('receive') ||
    lower.includes('you have received')
  ) {
    return 'RECEIVED';
  }
  return 'SENT'; // Default fallback, though risky
}

function extractAmount(text: string): number {
  // Match "Tsh" followed by number
  // Regex: Tsh([\d,]+\.?\d*)
  const match = text.match(/Tsh([\d,]+\.?\d*)/);
  if (match) {
    return parseFloat(match[1].replace(/,/g, ''));
  }
  return 0;
}

function extractTransactionType(text: string): TransactionType {
  const lower = text.toLowerCase();

  // Specific types first
  if (lower.includes('withdraw of') && lower.includes('from m-wekeza')) return 'SAVINGS_WITHDRAWAL';
  if (lower.includes('withdraw')) return 'WITHDRAWAL';

  if (lower.includes('paid to lipa')) return 'BILL_PAYMENT';
  if (lower.includes('sent to luku')) return 'UTILITY_PAYMENT';

  if (lower.includes('received loan from')) return 'LOAN';
  if (lower.includes('repayment of m-pesa overdraft')) return 'LOAN_REPAYMENT';
  if (lower.includes('loan request at m-pawa')) return 'LOAN'; // M-Pawa

  if (lower.includes('m-wekeza')) return 'SAVINGS_DEPOSIT'; // Fallback for savings if not withdrawal? Guide says SAVINGS but enum has split

  if (lower.includes('sent to betpawa')) return 'BETTING';
  if (lower.includes('bought') && lower.includes('airtime')) return 'AIRTIME';
  if (lower.includes('vodacom-bundles')) return 'BUNDLES';
  if (lower.includes('vodabima')) return 'INSURANCE';

  if (lower.includes('m-pesa visa card')) return 'OTHER'; // Or handle specially

  // Generic Transfers
  if (lower.includes('sent to')) return 'MONEY_TRANSFER';
  if (lower.includes('received') || lower.includes('receive')) return 'MONEY_TRANSFER';

  if (lower.includes('balance is') && !lower.includes('sent') && !lower.includes('received')) {
    return 'BALANCE_CHECK';
  }

  return 'OTHER';
}

function extractParticipant(
  text: string,
  direction: TransactionDirection
): { name: string | null; account: string | null } {
  let name: string | null = null;
  let account: string | null = null;

  // Account extraction (common)
  const accountMatch = text.match(/account\s+(\d+)/i);
  if (accountMatch) {
    account = accountMatch[1];
  }

  if (direction === 'SENT') {
    // "sent to [NAME] for" or "sent to [NAME]"
    const sentMatch = text.match(/sent to\s+(.+?)(\s+for|\s+on|$)/i);
    if (sentMatch) {
      name = sentMatch[1].trim();
    } else {
      // "paid to [NAME]"
      const paidMatch = text.match(/paid to\s+(.+?)(\s+for|\s+on|$)/i);
      if (paidMatch) {
        name = paidMatch[1].trim();
      } else {
        // "Withdraw ... from [AGENT]"
        const withdrawMatch = text.match(/from\s+(\d+\s-\s.+?)(?:\s+Total|\s+on|$)/i);
        if (withdrawMatch) {
          // "1396099 - MILGRETH SAULI MDUDA" -> Extract name
          const parts = withdrawMatch[1].split(' - ');
          name = parts.length > 1 ? parts[1].trim() : parts[0];
        }
      }
    }
  } else {
    // RECEIVED
    // "from [NAME]"
    const fromMatch = text.match(/from\s+(.+?)(\s+New|\.$)/i);
    if (fromMatch) {
      const rawName = fromMatch[1].trim();
      // Handle "Phone - Name" format
      const parts = rawName.split(' - ');
      name = parts.length > 1 ? parts[1].trim() : parts[0];
    }
  }

  return { name, account };
}

function extractDateTime(text: string): { date: string; time: string | null } {
  // Date: DD/M/YY or D/M/YY
  // Regex: (\d{1,2}/\d{1,2}/\d{2})
  let date = formatDate(new Date()); // Default today
  let time: string | null = null;

  const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{2})/);
  if (dateMatch) {
    const parts = dateMatch[1].split('/'); // DD, M, YY
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = `20${parts[2]}`; // YY -> 20YY
      date = `${year}-${month}-${day}`;
    }
  }

  // Time: HH:MM AM/PM
  const timeMatch = text.match(/(\d{1,2}:\d{2}\s*[AP]M)/i);
  if (timeMatch) {
    time = timeMatch[1];
  }

  return { date, time };
}

function extractBalance(text: string): number | null {
  // "Balance is Tsh..." or "New M-Pesa balance is Tsh..."
  const match = text.match(/(?:Balance|balance) is Tsh([\d,]+\.?\d*)/);
  if (match) {
    return parseFloat(match[1].replace(/,/g, ''));
  }
  return null;
}

function extractFees(text: string): { fee: number; governmentLevy: number } {
  let fee = 0;
  let governmentLevy = 0;

  // "Total fee Tsh..."
  const feeMatch = text.match(/Total fee Tsh([\d,]+\.?\d*)/i);
  if (feeMatch) {
    fee = parseFloat(feeMatch[1].replace(/,/g, ''));
  }

  // "Government Levy Tsh..." or "Government levy Tsh..."
  const levyMatch = text.match(/Government [Ll]evy Tsh([\d,]+\.?\d*)/);
  if (levyMatch) {
    governmentLevy = parseFloat(levyMatch[1].replace(/,/g, ''));
  }

  return { fee, governmentLevy };
}

function determineChannel(type: TransactionType, text: string): Channel {
  if (type === 'OTHER' && text.toLowerCase().includes('visa')) return 'VISA';
  if (type === 'WITHDRAWAL') return 'AGENT';
  if (type === 'BILL_PAYMENT' || type === 'UTILITY_PAYMENT') return 'BUSINESS';
  return 'M-PESA';
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
