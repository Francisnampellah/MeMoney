# M-PESA Message Parser Guide

## Overview
This guide provides specifications for parsing M-PESA transaction SMS messages in a React Native mobile application. The parser extracts transaction details and categorizes them for financial tracking.

## Message Validation

### Primary Rule
**ONLY parse messages that start with an alphanumeric transaction code**

- Valid pattern: Starts with alphanumeric code (e.g., `DBC1MV31SMJ`, `DA87M6GTYVJ`)
- Invalid: Messages starting with text, numbers only, or promotional content
- Example of invalid message: `"5,000 DISCOUNT! Were with you all the way to KFC..."`

## Transaction Code Format
- **Pattern**: Alphanumeric string at the start of the message
- **Length**: Typically 11 characters
- **Examples**: `DBC1MV31SMJ`, `DAV0MMG36XI`, `CLU8M0ICRUO`
- **Extraction**: `^([A-Z0-9]+)`

## Transaction Data Fields

### 1. Transaction Code
- **Location**: First word of the message
- **Purpose**: Unique identifier for each transaction
- **Example**: `DBC1MV31SMJ`

### 2. Amount
- **Pattern**: `Tsh` followed by number with optional decimals and commas
- **Format**: `Tsh16,000.00` or `Tsh16000.00`
- **Regex**: `Tsh([\d,]+\.?\d*)`
- **Note**: Multiple amounts may appear (transaction amount, fees, balance)

### 3. Transaction Direction (Sent/Received)
Determine by keywords in the message:

#### SENT Transactions
Keywords:
- `"sent to"`
- `"paid to"`
- `"Withdraw"`
- `"bought"`
- `"deducted from your M-Pesa account"`

#### RECEIVED Transactions
Keywords:
- `"received"`
- `"Receive"`
- `"You have received"`

### 4. Transaction Type

#### Money Transfer (Sent)
- **Pattern**: `"sent to"` + recipient name/business
- **Example**: `"Tsh16,000.00 sent to TIPS-NMB for account 24610037018"`

#### Money Transfer (Received)
- **Pattern**: `"received"` or `"Receive"` + sender name
- **Example**: `"Receive Tsh400,000.00 from IMRAAN ABDUL OTHUMAN"`

#### Bill Payment
- **Pattern**: `"paid to LIPA"` + merchant name
- **Example**: `"Tsh7,500.00 paid to LIPA BEST PUB"`
- **Identifier**: Merchant name starts with `LIPA`

#### Withdrawal
- **Pattern**: `"Withdraw"` + amount + `"from"` + agent details
- **Example**: `"Withdraw Tsh20,000.00 from 1396099 - MILGRETH SAULI MDUDA"`

#### Utility Payment
- **Pattern**: `"sent to LUKU for account"`
- **Example**: `"Tsh3,000.00 sent to LUKU for account 43030900054"`
- **Type**: Electricity payment

#### Mobile Services
- **Patterns**:
  - Airtime: `"bought"` + `"airtime"`
  - Bundles: `"sent to business VODACOM-BUNDLES"`
  - Insurance: `"sent to VODABIMA HC"`

#### Betting/Gaming
- **Pattern**: `"sent to BetPawa"`
- **Example**: `"Tsh500.00 sent to BetPawa for account"`

#### Loan Services
- **Patterns**:
  - Loan received: `"received loan from"` + service name
  - Loan repayment: `"deducted from your M-Pesa account"` + `"repayment of M-Pesa Overdraft"`
  - M-Pawa loan: `"Loan request at M-Pawa is approved"`

#### Savings/Investment
- **Pattern**: `"M-WEKEZA"` or `"Withdraw of"` + `"from M-WEKEZA account"`
- **Example**: `"Withdraw of Tsh3,000.00 from M-WEKEZA account"`

#### Card Transactions
- **Pattern**: `"M-pesa Visa Card"`
- **Example**: `"received Tsh16,000.00 from 239797 - M-pesa Visa Card"`

#### Balance Check
- **Pattern**: `"Your M-Pesa balance is"` without transaction
- **Example**: `"Confirmed. Your M-Pesa balance is Tsh0.90"`

### 5. Other Participant

#### For Sent Transactions
Extract recipient after keywords:
- `"sent to"` → Business/Person name
- `"paid to"` → Merchant name (may include `LIPA` prefix)
- `"Withdraw"` → Agent name after `"from"` and agent number

**Examples**:
- `"sent to TIPS-NMB"` → Recipient: `TIPS-NMB`
- `"paid to LIPA BEST PUB"` → Recipient: `BEST PUB` or `LIPA BEST PUB`
- `"Withdraw Tsh20,000.00 from 1396099 - MILGRETH SAULI MDUDA"` → Recipient: `MILGRETH SAULI MDUDA`

#### For Received Transactions
Extract sender after keywords:
- `"from"` → Person/Entity name
- Pattern: `"from [phone/account] - [NAME]"` or `"from [NAME]"`

**Examples**:
- `"from IMRAAN ABDUL OTHUMAN"` → Sender: `IMRAAN ABDUL OTHUMAN`
- `"from 255768126637 - MARIA NYANGOKO ADAM"` → Sender: `MARIA NYANGOKO ADAM`
- `"from 239797 - M-pesa Visa Card"` → Sender: `M-pesa Visa Card`

### 6. Transaction Date
- **Pattern**: Date format `DD/M/YY` or `D/M/YY`
- **Examples**: `12/2/26`, `2/2/26`, `31/1/26`
- **Regex**: `(\d{1,2}/\d{1,2}/\d{2})`
- **Time**: Usually includes time like `at 11:37 AM` or `at 7:50 PM`
- **Full pattern**: `on (\d{1,2}/\d{1,2}/\d{2}) at (\d{1,2}:\d{2} [AP]M)`

### 7. Balance
- **Pattern**: `"New M-Pesa balance is"` or `"Balance is"` + amount
- **Examples**: 
  - `"Balance is Tsh635.90"`
  - `"New M-Pesa balance is Tsh17,635.90"`
  - `"New balance is Tsh400,000.90"`
- **Important**: The balance represents the M-PESA wallet balance AFTER the transaction
- **Note**: Messages are typically ordered chronologically, so the LAST valid message contains the current balance

### 8. Fees
- **Pattern**: `"Total fee"` or `"charged"` + amount
- **Components**:
  - M-Pesa fee
  - Government levy
- **Example**: `"Total fee Tsh1,000.00 (M-Pesa fee Tsh1,000.00 + Government Levy Tsh0.00)"`

## Message Pattern Examples

### Pattern 1: Money Sent
```
DBC1MV31SMJ Confirmed. Tsh16,000.00 sent to TIPS-NMB for account 24610037018 on 12/2/26 at 11:37 AM Total fee Tsh1,000.00 (M-Pesa fee Tsh1,000.00 + Government Levy Tsh0.00). Balance is Tsh635.90.
```
**Extracted Data**:
- Transaction Code: `DBC1MV31SMJ`
- Amount: `16000.00`
- Direction: `SENT`
- Type: `MONEY_TRANSFER`
- Recipient: `TIPS-NMB`
- Date: `12/2/26 11:37 AM`
- Fee: `1000.00`
- Balance: `635.90`

### Pattern 2: Money Received
```
DB29MNQK86J Confirmed. On 2/2/26, 11:25 AM Receive Tsh400,000.00 from IMRAAN ABDUL OTHUMAN New balance is Tsh400,000.90.
```
**Extracted Data**:
- Transaction Code: `DB29MNQK86J`
- Amount: `400000.00`
- Direction: `RECEIVED`
- Type: `MONEY_TRANSFER`
- Sender: `IMRAAN ABDUL OTHUMAN`
- Date: `2/2/26 11:25 AM`
- Balance: `400000.90`

### Pattern 3: Withdrawal
```
DBB0MUO76G0 Confirmed. On 11/2/26 at 7:50 PM Withdraw Tsh20,000.00 from 1396099 - MILGRETH SAULI MDUDA Total fee Tsh2,156.00 (M-Pesa fee Tsh1,850.00 + Government levy Tsh306.00). Balance is Tsh17,635.90.
```
**Extracted Data**:
- Transaction Code: `DBB0MUO76G0`
- Amount: `20000.00`
- Direction: `SENT`
- Type: `WITHDRAWAL`
- Agent: `MILGRETH SAULI MDUDA`
- Date: `11/2/26 7:50 PM`
- Fee: `2156.00`
- Balance: `17635.90`

### Pattern 4: Bill Payment
```
DB93MSX1699 Confirmed. Tsh12,000.00 sent to TIPS-Mixx By Yas for account 16318495 on 9/2/26 at 2:14 PM Total fee Tsh1,450.00 (M-Pesa fee Tsh1,450.00 + Government Levy Tsh0.00). Balance is Tsh49,381.90.
```
**Extracted Data**:
- Transaction Code: `DB93MSX1699`
- Amount: `12000.00`
- Direction: `SENT`
- Type: `BILL_PAYMENT`
- Merchant: `TIPS-Mixx By Yas`
- Date: `9/2/26 2:14 PM`
- Fee: `1450.00`
- Balance: `49381.90`

### Pattern 5: Loan Received
```
DAT0MKVOCBA Confirmed. You have received loan from Mgodi amount Tsh72,900.00 date 29/1/26 at 2:27 PM. New balance is Tsh72,900.90.
```
**Extracted Data**:
- Transaction Code: `DAT0MKVOCBA`
- Amount: `72900.00`
- Direction: `RECEIVED`
- Type: `LOAN`
- Source: `Mgodi`
- Date: `29/1/26 2:27 PM`
- Balance: `72900.90`

### Pattern 6: Loan Repayment
```
DB24MNQK5CQ Confirmed. Tsh3,720.00 has been deducted from your M-Pesa account on 2/2/26 at 11:25 AM as a repayment of M-Pesa Overdraft service. New M-Pesa balance is Tsh388,902.90.
```
**Extracted Data**:
- Transaction Code: `DB24MNQK5CQ`
- Amount: `3720.00`
- Direction: `SENT`
- Type: `LOAN_REPAYMENT`
- Purpose: `M-Pesa Overdraft`
- Date: `2/2/26 11:25 AM`
- Balance: `388902.90`

### Pattern 7: Savings Withdrawal
```
DA93M724N41 confirmed. Withdraw of Tsh3,000.00 from M-WEKEZA account on 9/1/26 at 3:55 PM has been completed. New M-Pesa balance is Tsh4,154.90
```
**Extracted Data**:
- Transaction Code: `DA93M724N41`
- Amount: `3000.00`
- Direction: `RECEIVED`
- Type: `SAVINGS_WITHDRAWAL`
- Source: `M-WEKEZA`
- Date: `9/1/26 3:55 PM`
- Balance: `4154.90`

## Parsing Algorithm

### Step-by-Step Process

1. **Validate Message**
   - Check if message starts with alphanumeric transaction code
   - If not, skip message
   - Regex: `^[A-Z0-9]+\s`

2. **Extract Transaction Code**
   - Get first word/token from message
   - Example: `DBC1MV31SMJ`

3. **Determine Transaction Direction**
   - Search for keywords: "sent", "paid", "Withdraw", "bought", "deducted" → SENT
   - Search for keywords: "received", "Receive" → RECEIVED
   - Default: Check context

4. **Extract Amount**
   - Find first occurrence of `Tsh` followed by numbers
   - Remove commas, parse as float
   - Example: `Tsh16,000.00` → `16000.00`

5. **Categorize Transaction Type**
   - Check for specific patterns:
     - Contains "Withdraw" → WITHDRAWAL
     - Contains "paid to LIPA" → BILL_PAYMENT
     - Contains "LUKU" → UTILITY_PAYMENT
     - Contains "loan" → LOAN or LOAN_REPAYMENT
     - Contains "M-WEKEZA" → SAVINGS
     - Contains "BetPawa" → BETTING
     - Contains "airtime" → AIRTIME
     - Contains "VODABIMA" → INSURANCE
     - Default → MONEY_TRANSFER

6. **Extract Other Participant**
   - For SENT: Extract text after "sent to", "paid to", or "from" (for withdrawals)
   - For RECEIVED: Extract text after "from"
   - Clean up account numbers and IDs
   - Example: `"from 255768126637 - MARIA NYANGOKO ADAM"` → `"MARIA NYANGOKO ADAM"`

7. **Extract Date and Time**
   - Pattern: `on DD/M/YY at HH:MM AM/PM`
   - Alternative: `date DD/M/YY at HH:MM AM/PM`
   - Convert to ISO format or app's date format

8. **Extract Balance**
   - Search for "Balance is" or "New M-Pesa balance is"
   - Extract amount after keyword
   - Parse as float
   - **Critical**: This is the balance AFTER the transaction

9. **Extract Fees (Optional)**
   - Search for "Total fee" or "charged"
   - Extract amount
   - Parse fee breakdown if needed

## Balance Calculation

### Important Note
The balance shown in each message is the **post-transaction balance**. 

### Current Balance Logic
```
To get current balance:
1. Parse all valid messages
2. Sort by date/time (newest first)
3. Take balance from the FIRST (most recent) message
4. This is the current M-PESA wallet balance
```

### Example
```
Message 1 (newest): Balance is Tsh635.90 → CURRENT BALANCE
Message 2: Balance is Tsh17,635.90
Message 3: Balance is Tsh49,381.90
Message 4 (oldest): Balance is Tsh400,000.90
```
Current balance = `Tsh635.90`

## Data Structure

### Recommended Transaction Object
```javascript
{
  id: string,              // Transaction code
  amount: number,          // Transaction amount (without fees)
  direction: 'SENT' | 'RECEIVED',
  type: string,            // Transaction category
  participant: string,     // Other party name
  date: Date,              // Transaction timestamp
  balance: number,         // Post-transaction balance
  fee: number,             // Transaction fee (optional)
  accountNumber: string,   // Account/reference number (optional)
  description: string,     // Original message snippet
  rawMessage: string       // Full original message
}
```

### Transaction Type Enum
```javascript
enum TransactionType {
  MONEY_TRANSFER = 'MONEY_TRANSFER',
  WITHDRAWAL = 'WITHDRAWAL',
  BILL_PAYMENT = 'BILL_PAYMENT',
  UTILITY_PAYMENT = 'UTILITY_PAYMENT',
  LOAN = 'LOAN',
  LOAN_REPAYMENT = 'LOAN_REPAYMENT',
  SAVINGS_WITHDRAWAL = 'SAVINGS_WITHDRAWAL',
  SAVINGS_DEPOSIT = 'SAVINGS_DEPOSIT',
  AIRTIME = 'AIRTIME',
  BUNDLES = 'BUNDLES',
  INSURANCE = 'INSURANCE',
  BETTING = 'BETTING',
  BALANCE_CHECK = 'BALANCE_CHECK',
  OTHER = 'OTHER'
}
```

## Edge Cases to Handle

1. **Multiple amounts in one message**
   - Transaction amount
   - Fee amount
   - Balance amount
   - Solution: Use context and order to identify correct amounts

2. **Confirmation messages without balance**
   - Some confirmations show participant received money
   - Example: `"BARAKA NAMPELLAH has received Tsh 16000"`
   - Solution: Link to previous transaction by code/time

3. **Non-transaction messages**
   - Promotional messages
   - Balance check notifications
   - Solution: Strict validation on alphanumeric start

4. **Date parsing variations**
   - `on DD/M/YY at HH:MM AM/PM`
   - `date DD/M/YY at HH:MM AM/PM`
   - `DD/M/YY, HH:MM AM/PM`
   - Solution: Flexible regex patterns

5. **Name extraction**
   - Names may include phone numbers: `255768126637 - MARIA NYANGOKO ADAM`
   - Names may include agent numbers: `1396099 - MILGRETH SAULI MDUDA`
   - Solution: Split by " - " and take the name part

## Testing Recommendations

1. **Unit Tests**
   - Test each extraction function separately
   - Cover all transaction types
   - Test edge cases

2. **Sample Data**
   - Use provided real messages as test cases
   - Include invalid messages to test filtering

3. **Validation**
   - Verify balance calculations
   - Check date parsing accuracy
   - Confirm participant name extraction

## Performance Considerations

1. **Message Volume**
   - Users may have hundreds of messages
   - Implement efficient parsing (avoid nested loops)
   - Consider batch processing

2. **Caching**
   - Cache parsed transactions
   - Only reparse new messages
   - Store last processed message timestamp

3. **Error Handling**
   - Log unparseable messages for review
   - Don't crash on malformed data
   - Provide fallback values

## Security Notes

1. **Data Privacy**
   - M-PESA messages contain sensitive financial data
   - Implement proper data encryption
   - Follow data protection regulations

2. **Message Permissions**
   - Request SMS permissions appropriately
   - Explain why access is needed
   - Only access M-PESA messages (filter by sender)

## Implementation Checklist

- [ ] Validate message starts with transaction code
- [ ] Extract transaction code
- [ ] Parse amount correctly
- [ ] Determine sent/received direction
- [ ] Categorize transaction type
- [ ] Extract participant name
- [ ] Parse date and time
- [ ] Extract post-transaction balance
- [ ] Calculate current balance from latest message
- [ ] Handle fees appropriately
- [ ] Manage edge cases
- [ ] Implement error handling
- [ ] Add unit tests
- [ ] Secure sensitive data
- [ ] Optimize performance

---

**Version**: 1.0  
**Last Updated**: Based on messages from 12/2025 - 2/2026  
**Region**: Tanzania (M-PESA Tanzania format)