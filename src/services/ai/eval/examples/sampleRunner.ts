/**
 * Example Evaluation Runner
 * 
 * Demonstrates how to use the AI chat with comprehensive transaction data
 */

import {
  singleTurnWithMocks,
  testChatWithToolIntegration,
  multiTurnChatTest,
} from '../executors';
import { loadEvalDataWithTransactions, loadScenarioTests, createCustomEvalData } from './testDataLoader';

/**
 * Run all eval tests with transactions
 */
async function runAllEvals() {
  console.log('🚀 Starting AI Chat Evaluation with Comprehensive Transactions\n');

  const evalData = loadEvalDataWithTransactions();

  for (let i = 0; i < evalData.length; i++) {
    const { data, target } = evalData[i];
    console.log(`\n📋 Test ${i + 1}: ${target.description}`);
    console.log(`   Prompt: "${data.prompt}"`);
    console.log(`   Transactions: ${data.transactions?.length || 0}`);
    console.log(`   Expected Tools: ${target.expectedTools.join(', ')}`);

    try {
      // Test tool selection with mocks
      const result = await singleTurnWithMocks(data);
      console.log(`   ✅ Selected Tools: ${result.toolNames.join(', ') || 'None'}`);

      // Test actual chat with tool integration
      if (data.transactions && data.transactions.length > 0) {
        const chatResult = await testChatWithToolIntegration(
          data.prompt,
          data.transactions,
          []
        );
        if (chatResult.success) {
          console.log(`   💬 Chat Response: ${chatResult.response.substring(0, 100)}...`);
        } else {
          console.log(`   ❌ Chat Error: ${chatResult.error}`);
        }
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }
}

/**
 * Run scenario-based tests
 */
async function runScenarioTests() {
  console.log('\n\n🎯 Running Scenario-Based Tests\n');

  const scenarios = loadScenarioTests();

  for (const scenario of scenarios) {
    console.log(`\n📊 Scenario: ${scenario.scenario}`);
    console.log(`   Prompt: "${scenario.data.prompt}"`);
    console.log(`   Transactions: ${scenario.data.transactions?.length || 0}`);

    try {
      const result = await singleTurnWithMocks(scenario.data);
      console.log(`   Selected Tools: ${result.toolNames.join(', ') || 'None'}`);
      console.log(`   Expected: ${scenario.target.expectedTools.join(', ')}`);

      const match =
        result.toolNames.length > 0 &&
        result.toolNames.every((tool) => scenario.target.expectedTools.includes(tool));
      console.log(`   ${match ? '✅ MATCHED' : '❌ MISMATCH'}`);
    } catch (error) {
      console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }
}

/**
 * Run multi-turn conversation test
 */
async function runMultiTurnConversation() {
  console.log('\n\n💬 Running Multi-Turn Conversation Test\n');

  const customData = createCustomEvalData('What are my spending patterns?', [
    'calculateTransactionsByLastDays',
  ]);

  const messages = [
    'How much have I spent in the last 7 days?',
    'What are my top spending categories?',
    'Where can I reduce my spending?',
  ];

  try {
    const result = await multiTurnChatTest(messages, customData.transactions || []);

    console.log(`📍 Conversation with ${result.totalTurns} turns:`);
    result.turns.forEach((turn, idx) => {
      console.log(`\n   Turn ${idx + 1}: ${turn.userMessage}`);
      console.log(`   Success: ${turn.success}`);
      if (turn.success) {
        console.log(
          `   Response: ${turn.assistantResponse.substring(0, 100)}...`
        );
      }
    });
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
}

/**
 * Main runner
 */
async function main() {
  try {
    await runAllEvals();
    await runScenarioTests();
    await runMultiTurnConversation();

    console.log('\n\n✨ Evaluation Complete!\n');
  } catch (error) {
    console.error('Fatal Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { runAllEvals, runScenarioTests, runMultiTurnConversation };
