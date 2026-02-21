/**
 * Financial Tools Selection Evaluation with Laminar
 *
 * Tests whether the LLM correctly selects financial analysis tools
 * (calculateTransactionsByDate, calculateTransactionsByDateRange, etc.)
 * based on user prompts about spending and transactions.
 *
 * Categories:
 * - golden: Must select specific expected tools
 * - secondary: Likely selects certain tools, scored on precision/recall
 * - negative: Must NOT select any financial tools
 *
 * Results are tracked in Laminar dashboard for visualization and analysis.
 */

import { evaluate } from '@lmnr-ai/lmnr';
import {
  toolsSelected,
  toolsAvoided,
  toolSelectionScore,
  selectedAnyTool,
  toolCountSelected,
} from './evaluators';
import type { EvalData, EvalTarget } from './types';
import dataset from './data/transaction-tools.json' assert { type: 'json' };
import { singleTurnWithMocks } from './executors';

/**
 * Executor that runs single-turn tool selection with mocked tools.
 * Tests whether the agent selects the right financial tools for each prompt.
 */
const executor = async (data: EvalData) => {
  return singleTurnWithMocks(data);
};

/**
 * Run the evaluation with Laminar tracing
 *
 * The evaluation:
 * 1. Sends each test prompt to OpenAI
 * 2. Agent selects tools based on the prompt
 * 3. Evaluators score the tool selection
 * 4. Results are sent to Laminar dashboard
 */
(async () => {
  try {
    await evaluate({
      // Dataset: array of test cases with prompts and expected tools
      data: dataset as Array<{ data: EvalData; target: EvalTarget }>,

      // Executor: runs the agent and captures tool selections
      executor,

      // Evaluators: score the results
      evaluators: {
        // Golden prompts: did it select all expected tools?
        // Returns 1 (pass) or 0 (fail)
        toolsSelected: (output, target) => {
          if (target?.category !== 'golden') return 1; // Skip for non-golden
          return toolsSelected(output, target);
        },

        // Negative prompts: did it avoid forbidden tools?
        // Returns 1 (pass) or 0 (fail)
        toolsAvoided: (output, target) => {
          if (target?.category !== 'negative') return 1; // Skip for non-negative
          return toolsAvoided(output, target);
        },

        // Secondary prompts: precision/recall score
        // Returns F1 score (0-1) for flexible selection
        selectionScore: (output, target) => {
          if (target?.category !== 'secondary') return 1; // Skip for non-secondary
          return toolSelectionScore(output, target);
        },

        // Additional metrics: was any tool selected?
        selectedAny: (output) => selectedAnyTool(output),

        // Count how many tools were selected
        toolCount: (output) => toolCountSelected(output),
      },

      // Laminar configuration for dashboard tracking
      config: {
        projectApiKey: process.env.LMNR_API_KEY,
      },

      // Group name for organizing results in Laminar dashboard
      groupName: 'transaction-tools-selection',
    });

    console.log(
      '✅ Evaluation complete! Check your Laminar dashboard for results.',
    );
  } catch (error) {
    console.error('❌ Evaluation failed:', error);
    process.exit(1);
  }
})();
