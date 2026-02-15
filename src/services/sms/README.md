# M-Pesa SMS Parser Service

SMS parsing and transaction extraction service for M-Pesa messages with automatic deduplication.

## Features

- ✅ Parse M-Pesa SMS into structured transaction data
- ✅ Automatic deduplication by transaction_id
- ✅ Handle multiple SMS formats
- ✅ Extract all transaction details (amount, date, time, fees, balance, etc.)
- ✅ Identify transaction types (SEND, RECEIVE, WITHDRAW, BANK_TRANSFER, etc.)
- ✅ Permission management and SMS reading

## Primary Key Rule

**📌 The alphanumeric code at the beginning of the SMS is the unique transaction_id.**

Two messages with the same `transaction_id` represent the **same transaction** and should NOT create duplicate records.

### Example:
```typescript
// Message 1 (Debit confirmation):
"DBC1MV31SMJ Confirmed. Tsh16,000.00 sent to TIPS-NMB..."

// Message 2 (Credit confirmation, same transaction):
"DBC1MV31SMJ Confirmed. Tsh16,000.00 sent to TIPS-NMB..."

// Result: 1 transaction in database, not 2
// (They are automatically merged into one record)
```

## API Reference

### Parse Single SMS

```typescript
import { mpesaParser } from 'src/services/sms';

const parsed = mpesaParser.parseSms(rawSmsText);
// Returns: ParsedTransaction
```

### Parse Multiple SMS (with Auto-Deduplication)

```typescript
import { mpesaParser } from 'src/services/sms';

const transactions = mpesaParser.parseSmsList(smsList);
// Returns: ParsedTransaction[] (deduplicated by transaction_id)
// If 10 SMS are provided but 2 share the same transaction_id,
// returns 9 unique transactions
```

### Deduplicate Existing Transactions

```typescript
import { mpesaParser } from 'src/services/sms';

const transactions = mpesaParser.deduplicateByTransactionId(parsedArray);
// Removes duplicate transaction_ids, keeps the most complete record
```

### Merge Two Transactions

```typescript
import { mpesaParser } from 'src/services/sms';

const merged = mpesaParser.mergeTransactions(transaction1, transaction2);
// Combines data from both, preferring non-null values
// Concatenates raw_text with " | " separator
```

### Parse via Service

```typescript
import { smsService } from 'src/services/sms';

// Single SMS
const tx = smsService.parseMpesaSms(rawSmsText);

// Multiple SMS (with dedup)
const txList = smsService.parseMpesaSmsList(smsList);
```

## Output Format

```typescript
{
  transaction_id: "DBC1MV31SMJ",        // Unique primary key
  status: "Confirmed",                   // Confirmed | Failed | Unknown
  type: "BANK_TRANSFER",                 // Transaction type
  amount: 16000,                         // Main transaction amount (TZS)
  currency: "TZS",                       // Always TZS
  fee: 975,                              // M-Pesa fee
  government_levy: 0,                    // Government tax/levy
  counterparty_name: "TIPS-NMB",         // Who received/sent money
  counterparty_account: "24610037018",   // Bank/business account
  channel: "BANK",                       // M-PESA | BANK | AGENT | BUSINESS | VISA
  date: "2026-02-12",                    // YYYY-MM-DD format
  time: "11:37:00",                      // HH:MM:SS format
  balance_after: 635.90,                 // Account balance after transaction
  raw_text: "..."                        // Original SMS verbatim
}
```

## Transaction Types

| Type | Example |
|------|---------|
| SEND | Money sent to contact |
| RECEIVE | Money received from contact |
| WITHDRAW | Cash withdrawn from agent |
| PAY_BILL | Bill payment (utilities, etc.) |
| LIPA | LIPA na M-Pesa payment |
| BANK_TRANSFER | Transfer to bank (TIPS, etc.) |
| VISA | Visa card transactions |
| BETTING | Betting platform payment |
| UNKNOWN | Couldn't determine type |

## Channels

| Channel | Used For |
|---------|----------|
| M-PESA | Default peer-to-peer transfers |
| BANK | Bank transfers (TIPS, NMB, etc.) |
| AGENT | Cash withdrawal from agents |
| BUSINESS | Business payments (LIPA, PayBill) |
| VISA | Visa card payments |

## Usage in React Component

```typescript
import { useSmsPermission, smsService } from 'src/services/sms';

function TransactionList() {
  const { hasPermission, requestPermission } = useSmsPermission();
  const [transactions, setTransactions] = useState([]);

  const handleLoadTransactions = async () => {
    if (!hasPermission) {
      await requestPermission();
      return;
    }

    // Read SMS from device
    const smsList = await smsService.readSms();

    // Parse and deduplicate
    const parsed = smsService.parseMpesaSmsList(smsList);

    setTransactions(parsed);
  };

  return (
    <View>
      <Button onPress={handleLoadTransactions}>Load Transactions</Button>
      {transactions.map(tx => (
        <Text key={tx.transaction_id}>
          {tx.type}: {tx.amount} TZS
        </Text>
      ))}
    </View>
  );
}
```

## Deduplication Logic

When merging duplicate transactions:

1. **transaction_id**: Always from original (same for both)
2. **status**: Prefers "Confirmed" over "Unknown" or "Failed"
3. **type**: Prefers specific type over "UNKNOWN"
4. **amount**: Uses non-zero value
5. **fee**: Uses highest fee value
6. **government_levy**: Uses highest levy value
7. **counterparty_name**: Uses first non-null value
8. **counterparty_account**: Uses first non-null value
9. **channel**: Prefers specific channel over "M-PESA"
10. **date/time**: Uses first non-null value
11. **balance_after**: Uses first non-null value
12. **raw_text**: Concatenates both with " | " separator

## Console Logging

All operations log to console with `[SMS Service]`, `[SMS Parser]` prefixes:

```
[SMS Parser] Parsing M-Pesa SMS: DBC1MV31SMJ Confirmed...
[SMS Parser] Duplicate transaction_id detected: DBC1MV31SMJ. Merged with existing record.
[SMS Service] Parsing 10 M-Pesa SMS messages
[SMS Service] After deduplication: 9 unique transactions
```

## Examples

See `examples.ts` for working code samples:
- Parse single SMS
- Parse multiple SMS without deduplication
- Parse multiple SMS with deduplication (demonstrated with duplicates)
- Deduplicate existing transactions
- Use in React components

## Files

- `parser.ts` - Core parsing logic
- `service.ts` - SMS service with API
- `useSmsPermission.ts` - Permission management hook
- `types.ts` - TypeScript type definitions
- `examples.ts` - Code examples and test cases
- `README.md` - This file
