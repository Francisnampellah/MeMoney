import { Transaction } from '../services/sms/types';
import { NavigatorScreenParams } from '@react-navigation/native';

export type HomeTopTabParamList = {
    Overview: undefined;
    Transactions: undefined;
};

export type MainTabParamList = {
    Home: NavigatorScreenParams<HomeTopTabParamList>;
    Chat: undefined;
    Analysis: undefined;
};

export type AuthStackParamList = {
    Login: undefined;
    SignUp: undefined;
    ForgotPassword: undefined;
};

export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainTabParamList>;
    TransactionDetail: { transaction: Transaction };
    TransactionsHistory: undefined;
    Settings: undefined;
    SignUp: undefined;
    ForgotPassword: undefined;
};
