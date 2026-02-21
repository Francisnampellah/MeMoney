/**
 * Evaluator Functions for AI Financial Tools
 * 
 * Scorers that evaluate tool selection accuracy:
 * - Binary: toolsSelected, toolsAvoided
 * - Continuous: toolSelectionScore (F1 score)
 */

import type { SingleTurnResult, MultiTurnResult, EvalTarget, MultiTurnTarget } from './types';

/**
 * Evaluator: Check if all expected tools were selected.
 * Returns 1 if all expected tools are present, 0 otherwise.
 * For golden prompts (must select specific tools).
 */
export function toolsSelected(
  output: SingleTurnResult | MultiTurnResult,
  target: EvalTarget | MultiTurnTarget,
): number {
  const expectedTools =
    'expectedTools' in target
      ? target.expectedTools
      : 'expectedToolOrder' in target
        ? target.expectedToolOrder
        : undefined;

  if (!expectedTools?.length) return 1;

  const selected = new Set(
    'toolNames' in output ? output.toolNames : output.toolsUsed,
  );

  return expectedTools.every((t) => selected.has(t)) ? 1 : 0;
}

/**
 * Evaluator: Check if forbidden tools were avoided.
 * Returns 1 if NONE of the forbidden tools are in the output, 0 otherwise.
 * For negative prompts (must NOT select certain tools).
 */
export function toolsAvoided(
  output: SingleTurnResult | MultiTurnResult,
  target: EvalTarget | MultiTurnTarget,
): number {
  if (!target.forbiddenTools?.length) return 1;

  const selected = new Set(
    'toolNames' in output ? output.toolNames : output.toolsUsed,
  );

  return target.forbiddenTools.some((t) => selected.has(t)) ? 0 : 1;
}

/**
 * Evaluator: F1 score for tool selection precision and recall.
 * Returns 0-1 score based on how well the selected tools match expected/forbidden.
 * For secondary prompts (flexible selection with scoring).
 */
export function toolSelectionScore(
  output: SingleTurnResult | MultiTurnResult,
  target: EvalTarget | MultiTurnTarget,
): number {
  const selected = new Set(
    'toolNames' in output ? output.toolNames : output.toolsUsed,
  );

  const expectedTools =
    'expectedTools' in target
      ? target.expectedTools
      : 'expectedToolOrder' in target
        ? target.expectedToolOrder
        : undefined;

  if (!expectedTools?.length) return 1;

  const forbiddenTools = target.forbiddenTools || [];

  // Count correct selections (expected)
  const truePositives = expectedTools.filter((t) => selected.has(t)).length;

  // Count incorrect selections (forbidden or unexpected)
  const falsePositives = Array.from(selected).filter(
    (t) => !expectedTools.includes(t) || forbiddenTools.includes(t),
  ).length;

  // Count missed selections
  const falseNegatives = expectedTools.filter(
    (t) => !selected.has(t),
  ).length;

  // Calculate precision and recall
  const precision =
    truePositives + falsePositives > 0
      ? truePositives / (truePositives + falsePositives)
      : 1;

  const recall =
    truePositives + falseNegatives > 0
      ? truePositives / (truePositives + falseNegatives)
      : 1;

  // F1 score: harmonic mean of precision and recall
  if (precision + recall === 0) return 0;
  return (2 * precision * recall) / (precision + recall);
}

/**
 * Evaluator: Check if tools were called in the expected order.
 * Returns the fraction of expected tools found in sequence.
 * Order matters but tools don't need to be consecutive.
 * For multi-turn evals.
 */
export function toolOrderCorrect(
  output: MultiTurnResult,
  target: MultiTurnTarget,
): number {
  if (!target.expectedToolOrder?.length) return 1;

  const actualOrder = output.toolCallOrder;

  // Check if expected tools appear in order (not necessarily consecutive)
  let expectedIdx = 0;
  for (const toolName of actualOrder) {
    if (toolName === target.expectedToolOrder[expectedIdx]) {
      expectedIdx++;
      if (expectedIdx === target.expectedToolOrder.length) break;
    }
  }

  return expectedIdx / target.expectedToolOrder.length;
}

/**
 * Evaluator: Check if any tools were selected.
 * Returns 1 if at least one tool was selected, 0 otherwise.
 */
export function selectedAnyTool(
  output: SingleTurnResult | MultiTurnResult,
): number {
  if ('selectedAny' in output) {
    return output.selectedAny ? 1 : 0;
  }
  const toolsUsed = 'toolsUsed' in output ? output.toolsUsed : [];
  return toolsUsed.length > 0 ? 1 : 0;
}

/**
 * Evaluator: Count how many tools were selected.
 * Returns the count of tools selected.
 */
export function toolCountSelected(
  output: SingleTurnResult | MultiTurnResult,
): number {
  if ('toolNames' in output) {
    return output.toolNames.length;
  }
  return 'toolsUsed' in output ? output.toolsUsed.length : 0;
}
