import React, { useState, useContext, createContext } from 'react';
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
import { ChatScreen } from './src/features/chat';
import { TransactionsHistory } from './src/features/transactions/TransactionsHistory';
import { BottomTabBar, Tab } from './src/components/BottomTabBar';
import { Header } from './src/components/Header';
import { authService } from './src/services/auth';
import { SplashScreen } from './src/features/splash/SplashScreen';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { RootStackParamList, MainTabParamList, HomeTopTabParamList } from './src/navigation/types';
import { SettingsProvider, useSettings } from './src/services/settings';
import { ThemeProvider } from './src/theme/ThemeContext';

const Stack = createNativeStackNavigator<RootStackParamList>();
const BottomTab = createBottomTabNavigator<MainTabParamList>();
const TopTab = createMaterialTopTabNavigator<HomeTopTabParamList>();

// Auth Context
const AuthContext = createContext<{ logout: () => void }>({ logout: () => { } });

function HomeTopTabs() {
  const { logout } = useContext(AuthContext);

  return (
    <TopTab.Navigator
      tabBar={(props) => (
        <Header
          activeTab={props.state.routeNames[props.state.index]}
          onTabSelect={(tab) => props.navigation.navigate(tab)}
          showTabs={true}
          tabs={['Overview', 'Transactions']}
          onLogout={logout}
        />
      )}
    >
      <TopTab.Screen name="Overview" component={HomeScreen} />
      <TopTab.Screen name="Transactions" component={TransactionsHistory} />
    </TopTab.Navigator>
  );
}

function MainTabs({ logout }: { logout: () => void }) {
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
        name="Chat"
        component={ChatScreen}
        options={{
          headerShown: false,
        }}
      />
      <BottomTab.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{
          headerShown: true,
          header: () => (
            <Header
              title="Analysis"
              showTabs={false}
              onLogout={logout}
            />
          )
        }}
      />
    </BottomTab.Navigator>
  );
}

// Main App Entry

function AppContent({ showSplash, setShowSplash, handleLogout }: {
  showSplash: boolean,
  setShowSplash: (s: boolean) => void,
  handleLogout: () => void
}) {
  const { settings } = useSettings();

  return (
    <>
      {showSplash ? (
        <SplashScreen
          onFinish={() => setShowSplash(false)}
          duration={3000}
        />
      ) : (
        <AuthContext.Provider value={{ logout: handleLogout }}>
          <NavigationContainer>
            <StatusBar barStyle={settings.theme === 'dark' ? 'light-content' : 'dark-content'} />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Main" component={() => <MainTabs logout={handleLogout} />} />
              <Stack.Screen
                name="TransactionDetail"
                component={TransactionDetail}
                options={{
                  headerShown: true,
                  header: ({ navigation }) => (
                    <Header
                      title="Transaction Details"
                      showBack={true}
                      onBack={() => navigation.goBack()}
                      onLogout={handleLogout}
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
                      onLogout={handleLogout}
                    />
                  ),
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthContext.Provider>
      )}
    </>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <ThemeProvider>
          <AppContent
            showSplash={showSplash}
            setShowSplash={setShowSplash}
            handleLogout={handleLogout}
          />
        </ThemeProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

export default App;
