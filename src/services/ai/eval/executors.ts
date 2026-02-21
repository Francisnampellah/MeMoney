/**
 * Executor Functions for AI Financial Tools Evaluation
 * 
 * Executes tool selection tests using the OpenAI API and the agent's tool registry.
 */

import { Transaction } from '../../sms/types';
import { defaultToolRegistry } from '../tools';
import { sendChatMessage, ChatMessage } from '../chatService';
import { OPENAI_API_KEY, OPENAI_MODEL } from '../config';
import type { EvalData, SingleTurnResult } from './types';
import { buildMessages } from './utils';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Single-turn executor with mocked financial tools.
 * Uses the agent's tool registry but doesn't execute tools - only tracks selection.
 */
export async function singleTurnWithMocks(
  data: EvalData,
): Promise<SingleTurnResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required for evaluation');
  }

  const messages = buildMessages(data);

  // Get tools in OpenAI format from the registry
  const tools = defaultToolRegistry.getToolsForOpenAI();

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: data.config?.model || OPENAI_MODEL,
        messages,
        tools,
        temperature: data.config?.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.statusText} - ${error}`);
    }

    const apiResponse = await response.json();
    const choice = apiResponse.choices[0];
    const assistantMessage = choice.message;

    // Extract tool calls from the response
    const toolCalls = (assistantMessage.tool_calls || []).map((tc: any) => ({
      toolName: tc.function.name,
      args: JSON.parse(tc.function.arguments || '{}'),
    }));

    const toolNames = toolCalls.map((tc: { toolName: string; args: any }) => tc.toolName);

    return {
      toolCalls,
      toolNames,
      selectedAny: toolNames.length > 0,
    };
  } catch (error) {
    return {
      toolCalls: [],
      toolNames: [],
      selectedAny: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Multi-turn executor with actual tool execution.
 * Runs a complete agent loop that can use multiple tools across turns.
 */
export async function multiTurnWithExecution(
  data: EvalData,
  maxTurns: number = 3,
): Promise<{ toolsUsed: string[]; toolCallOrder: string[]; toolCallCount: number; finalResponse: string }> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required for evaluation');
  }

  const messages = buildMessages(data);
  const tools = defaultToolRegistry.getToolsForOpenAI();
  const toolsUsed = new Set<string>();
  const toolCallOrder: string[] = [];
  let toolCallCount = 0;
  let finalResponse = '';
  let continueLoop = true;
  let iterations = 0;
  const maxIterations = 10;

  try {
    while (continueLoop && iterations < maxIterations) {
      iterations++;

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: data.config?.model || OPENAI_MODEL,
          messages,
          tools,
          temperature: data.config?.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const apiResponse = await response.json();
      const choice = apiResponse.choices[0];
      const assistantMessage = choice.message;

      // Add assistant message to conversation
      const assistantMsgObj: any = {
        role: 'assistant',
        content: assistantMessage.content || '',
      };
      
      if (assistantMessage.tool_calls) {
        assistantMsgObj.tool_calls = assistantMessage.tool_calls;
      }
      
      messages.push(assistantMsgObj);

      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        // Process tool calls
        for (const toolCall of assistantMessage.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments || '{}');

          toolsUsed.add(toolName);
          toolCallOrder.push(toolName);
          toolCallCount++;

          try {
            // Execute tool with transaction data
            const toolResult = await defaultToolRegistry.executeTool(toolName, {
              ...toolArgs,
              transactions: data.transactions || [],
            });

            // Add tool result to conversation
            messages.push({
              role: 'user',
              content: JSON.stringify({
                tool_id: toolCall.id,
                result: toolResult,
              }),
            });
          } catch (toolError) {
            console.error(`Tool execution error: ${toolName}`, toolError);
            messages.push({
              role: 'user',
              content: JSON.stringify({
                tool_id: toolCall.id,
                error: toolError instanceof Error ? toolError.message : 'Tool execution failed',
              }),
            });
          }
        }
      } else {
        // No more tool calls, agent has finished
        continueLoop = false;
        finalResponse = assistantMessage.content || '';
      }
    }

    return {
      toolsUsed: Array.from(toolsUsed),
      toolCallOrder,
      toolCallCount,
      finalResponse,
    };
  } catch (error) {
    console.error('Multi-turn execution error:', error);
    return {
      toolsUsed: Array.from(toolsUsed),
      toolCallOrder,
      toolCallCount,
      finalResponse: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Mimics useAIChat behavior - uses the actual sendChatMessage function
 * This tests how the chat handles prompts with tool calling integrated
 */
export async function testChatWithToolIntegration(
  userMessage: string,
  transactions: Transaction[],
  conversationHistory: ChatMessage[] = [],
): Promise<{
  success: boolean;
  response: string;
  conversationLength: number;
  error?: string;
}> {
  try {
    const response = await sendChatMessage(
      userMessage,
      transactions,
      conversationHistory
    );

    return {
      success: true,
      response,
      conversationLength: conversationHistory.length,
    };
  } catch (error) {
    return {
      success: false,
      response: '',
      conversationLength: conversationHistory.length,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Multi-turn chat test that simulates a full conversation flow
 * Similar to how useAIChat would handle multiple messages
 */
export async function multiTurnChatTest(
  messages: string[],
  transactions: Transaction[],
): Promise<{
  turns: Array<{
    userMessage: string;
    assistantResponse: string;
    success: boolean;
  }>;
  totalTurns: number;
  error?: string;
}> {
  const turns: Array<{
    userMessage: string;
    assistantResponse: string;
    success: boolean;
  }> = [];
  const conversationHistory: ChatMessage[] = [];

  try {
    for (const userMessage of messages) {
      try {
        const response = await sendChatMessage(
          userMessage,
          transactions,
          conversationHistory
        );

        turns.push({
          userMessage,
          assistantResponse: response,
          success: true,
        });

        // Build conversation history for next turn (mimicking useAIChat)
        const userMsg: ChatMessage = {
          id: `${Date.now()}_user`,
          role: 'user',
          content: userMessage,
          timestamp: Date.now(),
        };

        const assistantMsg: ChatMessage = {
          id: `${Date.now()}_assistant`,
          role: 'assistant',
          content: response,
          timestamp: Date.now(),
        };

        conversationHistory.push(userMsg);
        conversationHistory.push(assistantMsg);
      } catch (error) {
        turns.push({
          userMessage,
          assistantResponse: '',
          success: false,
        });
      }
    }

    return {
      turns,
      totalTurns: turns.length,
    };
  } catch (error) {
    return {
      turns,
      totalTurns: turns.length,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Run a single evaluation test
 */
export async function runSingleEval(data: EvalData, target: any): Promise<any> {
  const output = await singleTurnWithMocks(data);

  return {
    data,
    target,
    output,
    metadata: {
      description: target.description,
      category: target.category,
      timestamp: new Date().toISOString(),
    },
  };
}
