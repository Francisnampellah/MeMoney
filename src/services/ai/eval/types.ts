/**
 * Evaluation Type Definitions for AI Financial Tools Testing
 * 
 * Tests if the agent correctly selects financial analysis tools
 * based on user prompts and scenarios.
 */

/**
 * Evaluation category types
 */
export type EvalCategory = 'golden' | 'secondary' | 'negative';

/**
 * Single-turn evaluation data with transactions
 */
export interface EvalData {
  prompt: string;
  tools: string[];
  transactions?: any[];
  config?: {
    model?: string;
    temperature?: number;
  };
}

/**
 * Evaluation target/expected outcome
 */
export interface EvalTarget {
  expectedTools?: string[];
  forbiddenTools?: string[];
  category: EvalCategory;
  description?: string;
}

/**
 * Single-turn evaluation result
 */
export interface SingleTurnResult {
  toolCalls: Array<{
    toolName: string;
    args: Record<string, any>;
  }>;
  toolNames: string[];
  selectedAny: boolean;
  error?: string;
}

/**
 * Multi-turn evaluation result
 */
export interface MultiTurnResult {
  toolsUsed: string[];
  toolCallOrder: string[];
  toolCallCount: number;
  finalResponse: string;
  error?: string;
}

/**
 * Multi-turn evaluation target
 */
export interface MultiTurnTarget {
  expectedToolOrder?: string[];
  forbiddenTools?: string[];
  category: EvalCategory;
  description?: string;
}

/**
 * Multi-turn evaluation data
 */
export interface MultiTurnEvalData {
  prompt: string;
  tools: string[];
  transactions?: any[];
  conversationTurns?: number;
}

/**
 * Score per evaluator
 */
export interface EvalScores {
  toolsSelected?: number;
  toolsAvoided?: number;
  toolSelectionScore?: number;
  toolOrderCorrect?: number;
  [key: string]: number | undefined;
}

/**
 * Full evaluation result
 */
export interface EvalResult {
  data: EvalData | MultiTurnEvalData;
  target: EvalTarget | MultiTurnTarget;
  output: SingleTurnResult | MultiTurnResult;
  scores: EvalScores;
  metadata?: {
    description?: string;
    category?: string;
    timestamp?: string;
  };
}
