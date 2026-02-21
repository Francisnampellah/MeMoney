/**
 * Evaluation Runner for AI Financial Tools
 * 
 * Tests whether the financial analysis agent correctly selects tools
 * based on user prompts across different categories:
 * - golden: Must select exact expected tools
 * - secondary: Likely selects certain tools, scored on precision/recall
 * - negative: Must NOT select forbidden tools
 */

import fs from 'fs';
import path from 'path';
import { singleTurnWithMocks } from './executors';
import {
  toolsSelected,
  toolsAvoided,
  toolSelectionScore,
  selectedAnyTool,
  toolCountSelected,
} from './evaluators';
import {
  calculateAverageScores,
  groupResultsByCategory,
  formatEvalResult,
} from './utils';
import type { EvalData, EvalTarget, EvalResult, EvalScores } from './types';

/**
 * Main evaluation runner
 */
export async function runTransactionToolsEvaluation(): Promise<void> {
  console.log('🚀 Starting Financial Tools Evaluation...\n');

  // Load test dataset
  const datasetPath = path.join(__dirname, './data/transaction-tools.json');
  let testCases: Array<{ data: EvalData; target: EvalTarget }> = [];

  try {
    const fileContent = fs.readFileSync(datasetPath, 'utf-8');
    testCases = JSON.parse(fileContent);
    console.log(`✓ Loaded ${testCases.length} test cases\n`);
  } catch (error) {
    console.error('❌ Failed to load test dataset:', error);
    process.exit(1);
  }

  const results: EvalResult[] = [];
  let passCount = 0;
  let failCount = 0;

  // Run each test case
  for (let i = 0; i < testCases.length; i++) {
    const { data, target } = testCases[i];
    console.log(`\n📋 Test ${i + 1}/${testCases.length}: ${target.description || data.prompt}`);
    console.log(`   Category: ${target.category}`);

    try {
      // Execute the test
      const output = await singleTurnWithMocks(data);

      // Score the result based on category
      const scores: EvalScores = {};

      if (target.category === 'golden') {
        // Golden: must select all expected tools
        scores.toolsSelected = toolsSelected(output, target);
        scores.toolsAvoided = toolsAvoided(output, target);
        const passed = scores.toolsSelected === 1 && scores.toolsAvoided === 1;
        passCount += passed ? 1 : 0;
        failCount += passed ? 0 : 1;
      } else if (target.category === 'secondary') {
        // Secondary: flexible selection, scored on precision/recall
        scores.toolSelectionScore = toolSelectionScore(output, target);
        passCount += scores.toolSelectionScore > 0.5 ? 1 : 0;
        failCount += scores.toolSelectionScore <= 0.5 ? 1 : 0;
      } else if (target.category === 'negative') {
        // Negative: must avoid forbidden tools
        scores.toolsAvoided = toolsAvoided(output, target);
        const passed = scores.toolsAvoided === 1;
        passCount += passed ? 1 : 0;
        failCount += passed ? 0 : 1;
      }

      // Additional metrics
      scores.selectedAnyTool = selectedAnyTool(output);
      scores.toolCount = toolCountSelected(output);

      const result: EvalResult = {
        data,
        target,
        output,
        scores,
        metadata: {
          description: target.description,
          category: target.category,
          timestamp: new Date().toISOString(),
        },
      };

      results.push(result);

      // Print result
      const status = Object.values(scores).some((s) => s === 0) ? '❌' : '✓';
      console.log(`   ${status} Selected: ${output.toolNames.join(', ') || 'none'}`);
      console.log(`   Expected: ${target.expectedTools?.join(', ') || 'N/A'}`);
      console.log(`   Scores: ${JSON.stringify(scores)}`);
    } catch (error) {
      console.error(
        `   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      failCount++;

      results.push({
        data,
        target,
        output: {
          toolCalls: [],
          toolNames: [],
          selectedAny: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        scores: {},
        metadata: {
          description: target.description,
          category: target.category,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Small delay between API calls
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Calculate summary statistics
  console.log('\n' + '='.repeat(60));
  console.log('📊 EVALUATION SUMMARY');
  console.log('='.repeat(60));

  console.log(`\nTotal Tests: ${testCases.length}`);
  console.log(`✓ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`Success Rate: ${((passCount / testCases.length) * 100).toFixed(1)}%`);

  // Group results by category
  const grouped = groupResultsByCategory(results);

  for (const [category, categoryResults] of Object.entries(grouped)) {
    if (categoryResults.length === 0) continue;

    const categoryPass = categoryResults.filter((r) => {
      const scores = r.scores;
      return Object.values(scores).every((s) => (s !== undefined ? s > 0 : true));
    }).length;

    console.log(
      `\n${category.toUpperCase()}: ${categoryPass}/${categoryResults.length} passed (${((categoryPass / categoryResults.length) * 100).toFixed(1)}%)`,
    );
  }

  // Calculate average scores by evaluator
  console.log('\n📈 AVERAGE SCORES BY EVALUATOR');
  const avgScores = calculateAverageScores(results);
  for (const [evaluator, score] of Object.entries(avgScores)) {
    console.log(`  ${evaluator}: ${(score * 100).toFixed(1)}%`);
  }

  // Save detailed results to file
  const resultsFile = path.join(__dirname, './results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`\n📁 Detailed results saved to: ${resultsFile}`);

  // Save summary to file
  const summaryFile = path.join(__dirname, './summary.json');
  const summary = {
    timestamp: new Date().toISOString(),
    totalTests: testCases.length,
    passed: passCount,
    failed: failCount,
    successRate: (passCount / testCases.length) * 100,
    byCategory: Object.fromEntries(
      Object.entries(grouped).map(([cat, res]) => {
        const passed = res.filter((r) =>
          Object.values(r.scores).every((s) => (s !== undefined ? s > 0 : true)),
        ).length;
        return [cat, { total: res.length, passed, rate: (passed / res.length) * 100 }];
      }),
    ),
    averageScores: avgScores,
  };
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  console.log(`📁 Summary saved to: ${summaryFile}`);

  console.log('\n✅ Evaluation complete!');
  process.exit(passCount === testCases.length ? 0 : 1);
}

// Run evaluation if this is the main module
if (require.main === module) {
  runTransactionToolsEvaluation().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default runTransactionToolsEvaluation;
