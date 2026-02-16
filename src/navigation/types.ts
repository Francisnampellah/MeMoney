import { Transaction } from '../services/sms/types';
import { NavigatorScreenParams } from '@react-navigation/native';

export type HomeTopTabParamList = {
    Overview: undefined;
    Transactions: undefined;
};

export type MainTabParamList = {
    Home: NavigatorScreenParams<HomeTopTabParamList>;
    Analysis: undefined;
    Settings: undefined;
};

export type RootStackParamList = {
    Main: NavigatorScreenParams<MainTabParamList>;
    TransactionDetail: { transaction: Transaction };
    TransactionsHistory: undefined;
};
