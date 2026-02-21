/**
 * AI Tools System - Usage Guide
 * 
 * This module provides a structured tool calling system for OpenAI integration.
 */

import { Transaction } from '../sms/types';
import { defaultToolRegistry, ToolRegistry, AVAILABLE_TOOLS } from './index';

/**
 * ============================================================================
 * Example 1: Using the default tool registry with generateSmartInsights
 * ============================================================================
 * 
 * import { generateSmartInsights } from '../services/ai/openai';
 * 
 * const transactions: Transaction[] = [...]; // Your transaction data
 * 
 * // This automatically uses the default tool registry with all available tools
 * const insights = await generateSmartInsights(transactions);
 * console.log(insights);
 * 
 * // Output:
 * // [
 * //   { title: '...', description: '...', type: 'spend' },
 * //   { title: '...', description: '...', type: 'leak' },
 * //   { title: '...', description: '...', type: 'save' }
 * // ]
 */

/**
 * ============================================================================
 * Example 2: Creating a custom tool registry
 * ============================================================================
 * 
 * import { ToolRegistry } from './tools';
 * import { calculateTransactionsByDateTool } from './tools/definitions';
 * 
 * // Only use specific tools
 * const customRegistry = new ToolRegistry([calculateTransactionsByDateTool]);
 * 
 * const insights = await generateSmartInsights(transactions, customRegistry);
 */

/**
 * ============================================================================
 * Example 3: Executing a tool directly
 * ============================================================================
 * 
 * import { defaultToolRegistry } from './tools';
 * 
 * const result = await defaultToolRegistry.executeTool('calculateTransactionsByLastDays', {
 *   days: 30,
 *   transactions
 * });
 * 
 * console.log(result);
 * // {
 * //   period: 'Last 30 days',
 * //   dateRange: '2026-01-22 to 2026-02-21',
 * //   total: 1250000,
 * //   count: 45,
 * //   fees: 5000,
 * //   dailyAverage: '27777.78',
 * //   breakdown: {
 * //     sent: 850000,
 * //     received: 400000,
 * //     net: -450000
 * //   }
 * // }
 */

/**
 * ============================================================================
 * Available Tools Reference
 * ============================================================================
 */

/**
 * Tool: calculateTransactionsByDate
 * --------------------------------
 * Calculate total and count of transactions for a specific date.
 * 
 * Arguments:
 *   - date (string, required): Target date in YYYY-MM-DD format
 *   - transactions (array, required): Array of Transaction objects
 *   - direction (string, optional): Filter by 'SENT' or 'RECEIVED'
 * 
 * Returns:
 *   {
 *     date: string,
 *     total: number,
 *     count: number,
 *     fees: number,
 *     breakdown: { sent: number, received: number }
 *   }
 */

/**
 * Tool: calculateTransactionsByDateRange
 * ----------------------------------------
 * Calculate total and count of transactions within a date range.
 * 
 * Arguments:
 *   - startDate (string, required): Start date in YYYY-MM-DD format
 *   - endDate (string, required): End date in YYYY-MM-DD format
 *   - transactions (array, required): Array of Transaction objects
 *   - type (string, optional): Filter by transaction type (e.g., 'MONEY_TRANSFER')
 * 
 * Returns:
 *   {
 *     period: string,
 *     total: number,
 *     count: number,
 *     fees: number,
 *     dailyAverage: number,
 *     breakdown: { sent: number, received: number, net: number }
 *   }
 */

/**
 * Tool: calculateTransactionsByLastDays
 * ----------------------------------------
 * Calculate total and count of transactions for the last N days.
 * 
 * Arguments:
 *   - days (number, required): Number of days to look back
 *   - transactions (array, required): Array of Transaction objects
 * 
 * Returns:
 *   {
 *     period: string,
 *     dateRange: string,
 *     total: number,
 *     count: number,
 *     fees: number,
 *     dailyAverage: number,
 *     breakdown: { sent: number, received: number, net: number }
 *   }
 */

/**
 * Tool: getSpendingByType
 * ------------------------
 * Analyze spending breakdown by transaction type.
 * 
 * Arguments:
 *   - transactions (array, required): Array of Transaction objects
 *   - startDate (string, optional): Start date in YYYY-MM-DD format
 *   - endDate (string, optional): End date in YYYY-MM-DD format
 * 
 * Returns:
 *   {
 *     summary: Array<{ type: string, amount: number }>,
 *     topType: { type: string, amount: number },
 *     totalSpent: number
 *   }
 */

/**
 * Tool: detectSpendingLeaks
 * --------------------------
 * Identify potential spending leaks and inefficient patterns.
 * 
 * Arguments:
 *   - transactions (array, required): Array of Transaction objects
 *   - days (number, optional): Number of days to analyze (default: 30)
 * 
 * Returns:
 *   {
 *     leaks: {
 *       highFees: { count: number, totalAmount: number },
 *       smallTransactions: { count: number, totalAmount: number, suggestion: string },
 *       recurringPatterns: Array<{ counterparty: string, frequency: number, avgAmount: string, totalAmount: number }>
 *     },
 *     totalAnalyzed: number,
 *     periodDays: number
 *   }
 */

/**
 * ============================================================================
 * How Tool Calling Works
 * ============================================================================
 * 
 * 1. The generateSmartInsights function sends a system prompt and user request
 * 2. OpenAI's model decides which tools to call based on the request
 * 3. Tool definitions are sent to OpenAI with name, description, and schema
 * 4. OpenAI returns tool_calls with the tool name and arguments
 * 5. The system executes the requested tools with the transactions data
 * 6. Results are sent back to OpenAI in the message history
 * 7. OpenAI can call more tools or provide the final insights
 * 8. Loop continues until OpenAI provides final insights (no more tool calls)
 * 
 * This allows the AI model to:
 * - Request specific data it needs
 * - Make informed decisions based on actual transaction data
 * - Provide more accurate and relevant insights
 * - Avoid hallucinating or making up statistics
 */

export {};
