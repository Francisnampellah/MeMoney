import { Transaction } from '../sms/types';
import { OPENAI_API_KEY, OPENAI_MODEL } from './config';
import { defaultToolRegistry, ToolRegistry } from './tools';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface AIInsight {
    title: string;
    description: string;
    type: 'spend' | 'leak' | 'save' | 'trend';
}

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    tool_calls?: any[];
}

/**
 * Generates smart financial insights from transaction data using OpenAI with tool calling.
 * The model can call tools to analyze transactions and then provide insights.
 */
export async function generateSmartInsights(
    transactions: Transaction[],
    toolRegistry: ToolRegistry = defaultToolRegistry
): Promise<AIInsight[]> {
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

    const systemPrompt = `You are a professional financial advisor specializing in mobile money habits in Tanzania. 
You analyze M-Pesa transaction logs and provide brief, high-impact insights based on data analysis.

Available tools:
- Use calculateTransactionsByLastDays to analyze spending patterns over time
- Use calculateTransactionsByDateRange for custom period analysis
- Use getSpendingByType to understand spending categories
- Use detectSpendingLeaks to identify wasteful spending patterns

After analyzing the data using tools, provide exactly 3 actionable insights in JSON format.
Each insight should be specific, professional, and use Tanzanian context (Tsh currency).
Return ONLY a valid JSON object with this structure: { "insights": [ { "title": string, "description": string, "type": "spend" | "leak" | "save" | "trend" } ] }`;

    const userPrompt = `Analyze the attached M-Pesa transactions (total: ${transactions.length} transactions) and provide 3 actionable smart financial insights.
Focus on:
1. High spending categories and trends
2. Potential spending leaks (fees, subscriptions, inefficient patterns)
3. Specific saving opportunities tailored to the user's habits

Use the available tools to gather specific data first, then provide insights based on the analysis.`;

    const messages: ChatMessage[] = [
        {
            role: 'system',
            content: systemPrompt
        },
        {
            role: 'user',
            content: userPrompt
        }
    ];

    try {
        // Tool calling loop
        let continueLoop = true;
        let iterations = 0;
        const maxIterations = 10; // Safety limit

        while (continueLoop && iterations < maxIterations) {
            iterations++;

            const response = await fetch(OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: OPENAI_MODEL,
                    messages,
                    tools: toolRegistry.getToolsForOpenAI(),
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.statusText}`);
            }

            const data = await response.json();
            const choice = data.choices[0];
            const assistantMessage = choice.message;

            // Add assistant message to conversation
            messages.push({
                role: 'assistant',
                content: assistantMessage.content || '',
                tool_calls: assistantMessage.tool_calls
            });

            // Check if model wants to call tools
            if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
                // Process each tool call
                for (const toolCall of assistantMessage.tool_calls) {
                    const toolName = toolCall.function.name;
                    const toolArgs = JSON.parse(toolCall.function.arguments);

                    try {
                        // Execute the tool with transactions data
                        const toolResult = await toolRegistry.executeTool(toolName, {
                            ...toolArgs,
                            transactions
                        });

                        // Add tool result to messages
                        messages.push({
                            role: 'user',
                            content: JSON.stringify({
                                tool_use_id: toolCall.id,
                                content: toolResult
                            })
                        });
                    } catch (toolError) {
                        console.error(`Error executing tool ${toolName}:`, toolError);
                        messages.push({
                            role: 'user',
                            content: JSON.stringify({
                                tool_use_id: toolCall.id,
                                error: `Tool execution failed: ${toolError instanceof Error ? toolError.message : 'Unknown error'}`
                            })
                        });
                    }
                }
            } else {
                // Model has finished and provided final response
                continueLoop = false;

                // Try to parse insights from the response
                if (assistantMessage.content) {
                    try {
                        const parsed = JSON.parse(assistantMessage.content);
                        return parsed.insights || [];
                    } catch (parseError) {
                        console.warn('Could not parse insights as JSON, returning as text insight:', parseError);
                        return [
                            {
                                title: 'Analysis Complete',
                                description: assistantMessage.content,
                                type: 'trend'
                            }
                        ];
                    }
                }
            }
        }

        if (iterations >= maxIterations) {
            throw new Error('Tool calling exceeded maximum iterations');
        }

        return [];
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
