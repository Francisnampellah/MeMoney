import React, { useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { enableScreens } from 'react-native-screens';

enableScreens();

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
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { RootStackParamList, MainTabParamList, HomeTopTabParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const BottomTab = createBottomTabNavigator<MainTabParamList>();
const TopTab = createMaterialTopTabNavigator<HomeTopTabParamList>();

const PlaceholderScreen = ({ name }: { name: string }) => (
  <HomeScreen /> // For now, reuse HomeScreen or a simple text view
);

function HomeTopTabs() {
  return (
    <TopTab.Navigator
      tabBar={(props) => (
        <Header
          activeTab={props.state.routeNames[props.state.index]}
          onTabSelect={(tab) => props.navigation.navigate(tab)}
          showTabs={true}
          tabs={['Overview', 'Transactions']}
        />
      )}
    >
      <TopTab.Screen name="Overview" component={HomeScreen} />
      <TopTab.Screen name="Transactions" component={TransactionsHistory} />
    </TopTab.Navigator>
  );
}

function MainTabs() {
  return (
    <BottomTab.Navigator
      screenOptions={{
        headerShown: false, // Header is handled by TopTab or individual screens
      }}
      tabBar={(props) => {
        const { state, navigation } = props;
        const activeRouteName = state.routeNames[state.index] as Tab;
        return (
          <BottomTabBar
            activeTab={activeRouteName.toLowerCase() as Tab}
            onTabSelect={(tab) => navigation.navigate(tab.charAt(0).toUpperCase() + tab.slice(1) as any)}
          />
        );
      }}
    >
      <BottomTab.Screen name="Home" component={HomeTopTabs} />
      <BottomTab.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{
          headerShown: true,
          header: () => <Header title="Analysis" showTabs={false} />
        }}
      />
      <BottomTab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          header: () => <Header title="Settings" showTabs={false} />
        }}
      />
    </BottomTab.Navigator>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="TransactionDetail"
            component={TransactionDetail}
            options={{
              headerShown: true,
              header: ({ navigation, route }) => (
                <Header
                  title="Transaction Details"
                  showBack={true}
                  onBack={() => navigation.goBack()}
                />
              ),
            }}
          />
          <Stack.Screen
            name="TransactionsHistory"
            component={TransactionsHistory}
            options={{
              headerShown: true,
              header: ({ navigation }) => (
                <Header
                  title="All Transactions"
                  showBack={true}
                  onBack={() => navigation.goBack()}
                />
              ),
            }}
          />
        </Stack.Navigator>

        {/* Action functions can be passed via context or handled in screens */}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
