import React, { useState, useContext, createContext } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
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
import { SettingsScreen } from './src/features/settings/SettingsScreen';
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

// Create contexts
const AuthContext = createContext<{ logout: () => void }>({ logout: () => { } });
const RootNavContext = createContext<{ navigateToSettings: () => void }>({ navigateToSettings: () => { } });

function HomeTopTabs() {
  const { logout } = useContext(AuthContext);
  const { navigateToSettings } = useContext(RootNavContext);

  return (
    <TopTab.Navigator
      tabBar={(props) => (
        <Header
          activeTab={props.state.routeNames[props.state.index]}
          onTabSelect={(tab) => props.navigation.navigate(tab)}
          showTabs={true}
          tabs={['Overview', 'Transactions']}
          onLogout={logout}
          onSettings={navigateToSettings}
        />
      )}
    >
      <TopTab.Screen name="Overview" component={HomeScreen} />
      <TopTab.Screen name="Transactions" component={TransactionsHistory} />
    </TopTab.Navigator>
  );
}

function MainTabs({ logout }: { logout: () => void }) {
  const { navigateToSettings } = useContext(RootNavContext);

  return (
    <BottomTab.Navigator
      screenOptions={{
        headerShown: false, // Header is handled by TopTab or individual screens
      }}
      tabBar={(props) => {
        const { state, navigation } = props;
        const activeRouteName = state.routeNames[state.index] as Tab;
        const isChat = activeRouteName.toLowerCase() === 'chat';
        
        // Don't show tabBar on Chat screen
        if (isChat) {
          return null;
        }
        
        return (
          <BottomTabBar
            activeTab={activeRouteName.toLowerCase() as Tab}
            onTabSelect={(tab) => navigation.navigate(tab.charAt(0).toUpperCase() + tab.slice(1) as any)}
            isCollapsed={false}
            navigation={navigation}
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
              onSettings={navigateToSettings}
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
  const navigationRef = React.useRef<any>(null);

  const navigateToSettings = () => {
    navigationRef.current?.navigate('Settings');
  };

  return (
    <>
      {showSplash ? (
        <SplashScreen
          onFinish={() => setShowSplash(false)}
          duration={3000}
        />
      ) : (
        <AuthContext.Provider value={{ logout: handleLogout }}>
          <RootNavContext.Provider value={{ navigateToSettings }}>
            <NavigationContainer ref={navigationRef}>
              <StatusBar barStyle={settings.theme === 'dark' ? 'light-content' : 'dark-content'} />
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen 
                  name="Main" 
                  component={() => <MainTabs logout={handleLogout} />}
                />
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
                        onSettings={() => navigation.navigate('Settings')}
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
                        onSettings={() => navigation.navigate('Settings')}
                      />
                    ),
                  }}
                />
                <Stack.Screen
                  name="Settings"
                  component={SettingsScreen}
                  options={{
                    headerShown: true,
                    header: ({ navigation }) => (
                      <Header
                        title="Settings"
                        showBack={true}
                        onBack={() => navigation.goBack()}
                        onLogout={handleLogout}
                      />
                    ),
                  }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </RootNavContext.Provider>
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
