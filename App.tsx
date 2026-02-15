/**
 * MeMoney App
 * Entry Point and Navigation
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Transaction } from './src/services/sms/types';
import { HomeScreen } from './src/features/home/HomeScreen';
import { TransactionDetail } from './src/features/transactions/TransactionDetail';
import { AnalysisScreen } from './src/features/analysis/AnalysisScreen';
import { SettingsScreen } from './src/features/settings/SettingsScreen';
import { TransactionsHistory } from './src/features/transactions/TransactionsHistory';
import { BottomTabBar, Tab } from './src/components/BottomTabBar';
import { Header } from './src/components/Header';
import Share from 'react-native-share';
import RNPrint from 'react-native-print';
import { generateReceiptHtml, getReceiptHtml } from './src/utils/pdfGenerator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [activeHeaderTab, setActiveHeaderTab] = useState('Overview');
  const [showHistory, setShowHistory] = useState(false);

  const handlePrint = async () => {
    if (!selectedTransaction) return;
    try {
      const html = getReceiptHtml(selectedTransaction);
      // @ts-ignore
      await RNPrint.print({ html });
    } catch (error) {
      console.error('Error printing receipt:', error);
    }
  };

  const handleShare = async () => {
    if (!selectedTransaction) return;

    try {
      const filePath = await generateReceiptHtml(selectedTransaction);
      if (filePath) {
        await Share.open({
          url: `file://${filePath}`,
          type: 'application/pdf',
          title: 'Transaction Receipt',
        });
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  const renderContent = () => {
    if (selectedTransaction) {
      return (
        <TransactionDetail
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      );
    }

    if (showHistory) {
      return (
        <TransactionsHistory
          onTransactionSelect={setSelectedTransaction}
          onBack={() => setShowHistory(false)}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onTransactionSelect={setSelectedTransaction}
            onViewAll={() => setShowHistory(true)}
          />
        );
      case 'analysis':
        return <AnalysisScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return (
          <HomeScreen
            onTransactionSelect={setSelectedTransaction}
            onViewAll={() => setShowHistory(true)}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Sticky Header */}
      <Header
        activeTab={activeHeaderTab}
        onTabSelect={setActiveHeaderTab}
        showTabs={activeTab === 'home' && !selectedTransaction && !showHistory}
        title={selectedTransaction ? 'Transaction Details' : showHistory ? 'All Transactions' : undefined}
        showBack={!!selectedTransaction || showHistory}
        onBack={() => {
          if (selectedTransaction) {
            setSelectedTransaction(null);
          } else if (showHistory) {
            setShowHistory(false);
          }
        }}
      />

      {renderContent()}

      <BottomTabBar
        activeTab={activeTab}
        onTabSelect={(tab) => {
          setActiveTab(tab);
          setShowHistory(false);
        }}
        showTransactionActions={!!selectedTransaction}
        onPrint={handlePrint}
        onShare={handleShare}
      />
    </SafeAreaProvider>
  );
}

export default App;
