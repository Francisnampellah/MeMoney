import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

export type Tab = 'home' | 'analysis' | 'settings';

interface BottomTabBarProps {
    activeTab: Tab;
    onTabSelect: (tab: Tab) => void;
    showTransactionActions?: boolean;
    onPrint?: () => void;
    onShare?: () => void;
}

export function BottomTabBar({ activeTab, onTabSelect, showTransactionActions, onPrint, onShare }: BottomTabBarProps) {
    const safeAreaInsets = useSafeAreaInsets();

    if (showTransactionActions) {
        return (
            <View style={[styles.container, { paddingBottom: safeAreaInsets.bottom + 16 }]}>
                <View style={styles.tabBar}>
                    <TouchableOpacity
                        style={styles.tab}
                        onPress={onPrint}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconContainer}>
                            <Icon
                                name="print"
                                size={24}
                                color="#FFFFFF"
                            />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.tab}
                        onPress={onShare}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconContainer}>
                            <Icon
                                name="share"
                                size={24}
                                color="#FFFFFF"
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingBottom: safeAreaInsets.bottom + 16 }]}>
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => onTabSelect('home')}
                    activeOpacity={0.7}
                >
                    <View style={[styles.iconContainer, activeTab === 'home' && styles.activeIconContainer]}>
                        <Icon
                            name="home"
                            size={24}
                            color={activeTab === 'home' ? '#000000' : '#FFFFFF'}
                        />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => onTabSelect('analysis')}
                    activeOpacity={0.7}
                >
                    <View style={[styles.iconContainer, activeTab === 'analysis' && styles.activeIconContainer]}>
                        <Icon
                            name="bar-chart"
                            size={24}
                            color={activeTab === 'analysis' ? '#000000' : '#FFFFFF'}
                        />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => onTabSelect('settings')}
                    activeOpacity={0.7}
                >
                    <View style={[styles.iconContainer, activeTab === 'settings' && styles.activeIconContainer]}>
                        <Icon
                            name="settings"
                            size={24}
                            color={activeTab === 'settings' ? '#000000' : '#FFFFFF'}
                        />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#000000',
        borderRadius: 60,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'space-around',
        minWidth: 200,
        maxWidth: 400,
        borderWidth: 1,
        borderColor: '#000000',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    tab: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeIconContainer: {
        backgroundColor: '#C5FF00',
        borderRadius: 24,
    },
});
