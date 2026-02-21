import { Transaction } from '../sms/types';
import { OPENAI_API_KEY, OPENAI_MODEL } from './config';
import { DEVICE_ONLY_TOOLS } from './deviceOnlyTools';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'tool';
    content: string;
    timestamp: number;
    toolUseId?: string;
    toolName?: string;
}

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Sends a chat message with transaction context and uses available tools for calculations
 * Returns AI response with tool-generated results inserted appropriately
 */
export async function sendChatMessage(
    userMessage: string,
    transactions: Transaction[],
    conversationHistory: ChatMessage[] = []
): Promise<string> {
    if (!OPENAI_API_KEY) {
        return 'AI chat is currently unavailable. Please configure your OpenAI API key in src/services/ai/config.ts';
    }

    // Prepare MINIMAL transaction context - only what helps model decide which tools to use
    // All actual data stays on device for tool execution
    const recentTx = transactions.slice(0, 20).map(tx => ({
        amount: tx.amount,
        direction: tx.direction,
        type: tx.type,
        date: tx.date,
        currency: tx.currency
    }));

    // Build conversation context from history
    const previousMessages = conversationHistory.map(msg => ({
        role: msg.role === 'tool' ? 'user' : msg.role,
        content: msg.role === 'tool' 
            ? `Tool Result (${msg.toolName}): ${msg.content}`
            : msg.content
    }));

    // Calculate quick stats for context (no detailed transaction data)
    const totalTransactions = transactions.length;
    const totalIncome = transactions
        .filter(tx => tx.direction === 'RECEIVED')
        .reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpense = transactions
        .filter(tx => tx.direction === 'SENT')
        .reduce((sum, tx) => sum + tx.amount, 0);
    const latestBalance = transactions[0]?.balance_after ?? 0;
    const currency = transactions[0]?.currency ?? 'Tsh';

    const systemPrompt = `You are a helpful financial advisor specializing in mobile money (M-Pesa) transaction analysis. 
    
IMPORTANT ARCHITECTURE:
- You have access to analysis tools that execute on the device with FULL transaction history
- You receive limited transaction data for context decisions (last 20 transactions)
- Use tools to perform calculations on complete local data - NOT from the preview shown
- Tools execute on device and return accurate results based on all available transactions

Available Context (Sample):
- Current Balance: ${currency} ${latestBalance.toLocaleString()}
- Total Transactions Available: ${totalTransactions}
- Total Income: ${currency} ${totalIncome.toLocaleString()}
- Total Expenses: ${currency} ${totalExpense.toLocaleString()}
- Sample Recent Transactions:
${JSON.stringify(recentTx.slice(0, 10), null, 2)}

TOOL USAGE RULES:
1. When user asks about calculations/analysis, use the appropriate tool
2. Tools process COMPLETE local transaction data (not just samples shown)
3. Do NOT estimate or calculate manually - always use tools
4. All sensitive data stays on device - tools execute locally

Guidelines:
- Keep responses SHORT and CLEAR
- Use bullet points for readability
- Reference tool results in your answers
- Ask clarifying questions if user's request is ambiguous
- Maximum 2-3 sentences for quick answers, up to 5-6 for detailed explanations`;

    // Convert device-only tools to OpenAI format
    const tools = DEVICE_ONLY_TOOLS.map(tool => ({
        type: 'function' as const,
        function: {
            name: tool.name,
            description: tool.description,
            parameters: { type: 'object', properties: {} }
        }
    }));

    try {
        let messages: any[] = [
            {
                role: 'system',
                content: systemPrompt
            },
            ...previousMessages,
            {
                role: 'user',
                content: userMessage
            }
        ];

        let response = await makeOpenAIRequest(messages, tools);
        let assistantMessage = response.choices[0].message;

        // Process tool calls in a loop until we get a final response
        let toolCallCount = 0;
        const maxToolCalls = 5; // Prevent infinite loops

        while (assistantMessage.tool_calls && toolCallCount < maxToolCalls) {
            toolCallCount++;

            // Add assistant's tool call message to conversation
            messages.push({
                role: 'assistant',
                content: assistantMessage.content || '',
                tool_calls: assistantMessage.tool_calls
            });

            // Execute each tool and add results
            for (const toolCall of assistantMessage.tool_calls) {
                try {
                    const toolName = toolCall.function.name;
                    const tool = DEVICE_ONLY_TOOLS.find(t => t.name === toolName);
                    
                    if (!tool) {
                        throw new Error(`Tool "${toolName}" not found`);
                    }

                    const toolResult = await tool.execute({
                        ...JSON.parse(toolCall.function.arguments),
                        transactions: transactions // Always pass full transaction list
                    });

                    messages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(toolResult)
                    });
                } catch (error) {
                    messages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: `Error executing tool: ${error instanceof Error ? error.message : 'Unknown error'}`
                    });
                }
            }

            // Get next response without forcing tool use
            response = await makeOpenAIRequest(messages);
            assistantMessage = response.choices[0].message;
        }

        // Return final response content
        return assistantMessage.content || 'I was unable to generate a response.';
    } catch (error) {
        console.error('Chat Service Error:', error);
        throw error;
    }
}

/**
 * Helper function to make OpenAI API requests
 */
async function makeOpenAIRequest(
    messages: any[],
    tools?: any[]
): Promise<any> {
    const body: any = {
        model: OPENAI_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 1000
    };

    // Only include tools if provided
    if (tools && tools.length > 0) {
        body.tools = tools;
        body.tool_choice = 'auto'; // Let model decide when to use tools
    }

    const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    return response.json();
}

/**
 * Generates a unique message ID
 */
export function generateMessageId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
