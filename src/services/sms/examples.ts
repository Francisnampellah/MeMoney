import { mpesaParser } from './parser';

/**
 * Example usage of M-Pesa SMS Parser with deduplication
 */

// Example M-Pesa SMS messages
export const EXAMPLE_SMS = {
  bankTransfer: `DBC1MV31SMJ Confirmed. Tsh16,000.00 sent to TIPS-NMB for account 24610037018 on 12/2/26 at 11:37 AM. Total fee Tsh975. New balance Tsh635.90`,

  moneySend: `DBC1MV31SMK Confirmed. You have sent Tsh10,000.00 to John Doe +255712345678 on 11/2/26 at 10:15 AM. Total fee Tsh100. New balance Tsh1,500.00`,

  moneyReceive: `DBC1MV31SMZ Confirmed. You have received Tsh5,000.00 from Jane Smith +255798765432 on 13/2/26. New balance Tsh6,500.00`,

  withdraw: `DBC1MV31SMA Confirmed. Tsh20,000.00 withdrawn on 10/2/26 at 2:30 PM. Total fee Tsh500. New balance Tsh15,000.00`,

  payBill: `DBC1MV31SMB Confirmed. You paid Tsh1,500.00 to TANESCO on 12/2/26. Total fee Tsh50. New balance Tsh8,000.00`,

  // Duplicate of bankTransfer (same transaction_id)
  bankTransferDuplicate: `DBC1MV31SMJ Confirmed. Tsh16,000.00 sent to TIPS-NMB for account 24610037018. New balance Tsh635.90`,
};

/**
 * Example: Parse a single SMS
 */
export function exampleParseSingleSms(): void {
  const sms = EXAMPLE_SMS.bankTransfer;
  console.log('[Example] Parsing SMS:', sms);

  const parsed = mpesaParser.parseSms(sms);
  console.log('[Example] Result:', JSON.stringify(parsed, null, 2));
}

/**
 * Example: Parse multiple SMS WITHOUT deduplication
 * (This is the raw parsing without deduplication logic)
 */
export function exampleParseMultipleSmsRaw(): void {
  const smsList = [
    EXAMPLE_SMS.bankTransfer,
    EXAMPLE_SMS.moneySend,
    EXAMPLE_SMS.moneyReceive,
    EXAMPLE_SMS.withdraw,
  ];

  const parsed = smsList.map(sms => mpesaParser.parseSms(sms));
  console.log('[Example Raw] Parsed', parsed.length, 'transactions (no dedup)');
  console.log('[Example Raw] Transactions:', JSON.stringify(parsed, null, 2));
}

/**
 * Example: Parse multiple SMS WITH deduplication
 * DEMONSTRATES PRIMARY KEY RULE:
 * Two SMS with same transaction_id are treated as one transaction
 */
export function exampleParseMultipleSmsWithDeduplication(): void {
  const smsList = [
    EXAMPLE_SMS.bankTransfer,
    EXAMPLE_SMS.bankTransferDuplicate, // Same transaction_id as bankTransfer!
    EXAMPLE_SMS.moneySend,
    EXAMPLE_SMS.moneyReceive,
    EXAMPLE_SMS.withdraw,
  ];

  console.log('[Example Dedup] Input: 5 SMS messages');
  console.log('[Example Dedup] 2 messages have same transaction_id: DBC1MV31SMJ');

  const parsed = mpesaParser.parseSmsList(smsList);

  console.log('[Example Dedup] Output: 4 unique transactions');
  console.log(
    '[Example Dedup] Duplicate transaction_id was merged into single record',
  );
  console.log(
    '[Example Dedup] Transactions:',
    JSON.stringify(parsed, null, 2),
  );
}

/**
 * Example: Deduplicate existing parsed transactions
 */
export function exampleDeduplicateExistingTransactions(): void {
  const transactions = [
    mpesaParser.parseSms(EXAMPLE_SMS.bankTransfer),
    mpesaParser.parseSms(EXAMPLE_SMS.bankTransferDuplicate), // Duplicate
    mpesaParser.parseSms(EXAMPLE_SMS.moneySend),
  ];

  console.log('[Example Dedup Existing] Before:', transactions.length);
  const deduplicated = mpesaParser.deduplicateByTransactionId(transactions);
  console.log('[Example Dedup Existing] After:', deduplicated.length);
}

/**
 * Example: Use in React component
 */
export function exampleUseInComponent(): void {
  // This would be in your component
  // const { smsService } = require('./service');
  // 
  // Read SMS from device
  // const rawSmsList = await smsService.readSms();
  // 
  // Parse with auto-deduplication
  // const transactions = smsService.parseMpesaSmsList(rawSmsList);
  // 
  // Now transactions only contains unique transaction_ids
  // setTransactions(transactions);
}

