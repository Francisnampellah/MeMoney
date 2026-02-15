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

    switch (activeTab) {
      case 'home':
        return <HomeScreen onTransactionSelect={setSelectedTransaction} />;
      case 'analysis':
        return <AnalysisScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen onTransactionSelect={setSelectedTransaction} />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Sticky Header */}
      <Header
        activeTab={activeHeaderTab}
        onTabSelect={setActiveHeaderTab}
        showTabs={activeTab === 'home' && !selectedTransaction}
        title={selectedTransaction ? 'Transaction Details' : undefined}
        showBack={!!selectedTransaction}
        onBack={() => setSelectedTransaction(null)}
      />

      {renderContent()}

      <BottomTabBar
        activeTab={activeTab}
        onTabSelect={setActiveTab}
        showTransactionActions={!!selectedTransaction}
        onPrint={handlePrint}
        onShare={handleShare}
      />
    </SafeAreaProvider>
  );
}

export default App;
