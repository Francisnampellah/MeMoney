# AI Chat Feature

## Overview

The AI Chat feature enables users to have intelligent conversations with an AI financial advisor that has access to their transaction history. This allows for personalized financial insights and advice based on actual spending patterns.

## Features

- **Real-time AI Chat**: Send messages and receive instant responses from OpenAI's GPT model
- **Transaction Context**: AI has access to your transaction history for informed responses
- **Conversation History**: All chat messages are persisted locally
- **Smart Suggestions**: Quick-access suggestion chips for common queries
- **Error Handling**: Graceful error messages if transactions aren't available
- **Session Management**: Clear chat history with one tap

## How to Use

### 1. Navigate to Chat Screen
- Tap the **Chat** (robot icon) tab in the bottom navigation bar
- Or access from the main navigation menu

### 2. Start a Conversation
The chat screen provides:
- Conversation history display
- Text input field at the bottom
- Send button to submit messages
- Suggestion chips for quick queries:
  - "What are my spending trends?"
  - "Where can I save money?"
  - "Analyze my recent transactions"

### 3. Example Queries
You can ask the AI about:
- Spending patterns: "What did I spend the most on this month?"
- Savings advice: "How can I reduce my expenses?"
- Transaction details: "Who is Safaricom and how much did I send them?"
- Financial goals: "Based on my transactions, what should my budget be?"
- Account health: "Is my current balance healthy?"

## Architecture

### Services

#### `chatService.ts`
Handles OpenAI API communication with transaction context.

```typescript
sendChatMessage(userMessage, transactions, conversationHistory)
```

- Prepares transaction data as context for the AI
- Maintains conversation history
- Sends requests to OpenAI API
- Returns AI-generated responses

#### `useAIChat.ts`
Custom React hook for managing chat state.

```typescript
const { messages, loading, error, sendMessage, clearHistory, transactionsAvailable } = useAIChat()
```

**Features:**
- Message persistence using AsyncStorage
- Automatic history loading on mount
- Loading and error states
- Conversation history tracking

### Components

#### `ChatScreen.tsx`
Main UI component providing:
- Message display with timestamps
- Input field with character counter (500 char limit)
- Error banner for failed requests
- Empty states with guidance
- Loading indicators

## Configuration

### OpenAI API Key

1. Get your API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add it to `src/services/ai/config.ts`:

```typescript
export const OPENAI_API_KEY = 'your-api-key-here';
export const OPENAI_MODEL = 'gpt-4-turbo'; // or 'gpt-3.5-turbo'
```

### Model Selection

The default model is set in `config.ts`. Recommended options:
- `gpt-4-turbo`: More intelligent, higher cost
- `gpt-3.5-turbo`: Faster, more affordable

## Data Privacy

- **Local Storage**: Chat history is stored locally on your device using AsyncStorage
- **API Communication**: Messages and transaction data are sent to OpenAI's servers
- **No Cloud Backup**: Chat history is cleared when app data is cleared

## Technical Details

### Message Structure
```typescript
interface ChatMessage {
    id: string;           // Unique identifier
    role: 'user' | 'assistant';
    content: string;      // Message text
    timestamp: number;    // Unix timestamp
}
```

### Transaction Context Sent to AI
- Last 50 transactions (to avoid token limits)
- Key stats: balance, income, expenses
- Fields per transaction: amount, direction, type, counterparty, date, fee, currency

### System Prompt
The AI is configured as a financial advisor with:
- Tanzanian mobile money (M-Pesa) context
- Focus on spending analysis
- Actionable advice
- Conversational tone

## Error Handling

### Common Errors

1. **"No Transactions Yet"**
   - Import M-Pesa transactions first using SMS access
   - The AI needs transaction data to provide insights

2. **API Error**
   - Check your OpenAI API key is valid
   - Verify you have API credits available
   - Check internet connection

3. **Failed to Get Response**
   - Network timeout - try again
   - API rate limiting - wait a moment before retrying

## Performance Optimization

- **Message Pagination**: Only last 50 transactions are sent per request
- **Local Caching**: Chat history cached locally to reduce API calls
- **Async Loading**: UI remains responsive during API calls
- **Token Management**: Optimized prompt to stay within token limits

## Future Enhancements

Potential features for future versions:
- Voice input/output for hands-free chat
- Attachment support for receipts
- Scheduled financial check-ins
- Exportable chat transcripts
- Multi-language support
- Budget recommendations with AI insights

## Troubleshooting

### Chat is slow
- Check internet connection
- Verify OpenAI API quota hasn't been exceeded
- Try a simpler question to test responsiveness

### Old messages not loading
- Clear app cache and try again
- Check AsyncStorage permissions (Android)

### AI responses are generic
- Provide more context in your question
- Ask about specific transactions
- Start with "Based on my transactions..."
