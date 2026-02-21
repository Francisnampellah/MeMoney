import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

export type Tab = 'home' | 'chat' | 'analysis';

interface BottomTabBarProps {
    activeTab: Tab;
    onTabSelect: (tab: Tab) => void;
    showTransactionActions?: boolean;
    onPrint?: () => void;
    onShare?: () => void;
    isCollapsed?: boolean;
    onToggleNav?: () => void;
    navigation?: any;
}

import { useTheme } from '../theme';

export function BottomTabBar({ activeTab, onTabSelect, showTransactionActions, onPrint, onShare, isCollapsed, onToggleNav, navigation }: BottomTabBarProps) {
    const safeAreaInsets = useSafeAreaInsets();
    const theme = useTheme();
    const styles = createStyles(theme);

    // Collapsed mode for chat screen - show only a toggle button on the left
    if (isCollapsed) {
        return (
            <View style={[styles.collapsedContainer, { paddingBottom: safeAreaInsets.bottom + 12 }]}>
                <TouchableOpacity
                    style={styles.collapsedToggleButton}
                    onPress={onToggleNav}
                    activeOpacity={0.7}
                >
                    <Icon
                        name="menu"
                        size={24}
                        color={theme.colors.text.inverse}
                    />
                </TouchableOpacity>
            </View>
        );
    }

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
                                color={theme.colors.text.inverse}
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
                                color={theme.colors.text.inverse}
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
                            color={activeTab === 'home' ? theme.colors.text.primary : theme.colors.text.inverse}
                        />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => onTabSelect('chat')}
                    activeOpacity={0.7}
                >
                    <View style={[styles.iconContainer, activeTab === 'chat' && styles.activeIconContainer]}>
                        <Icon
                            name="smart-toy"
                            size={24}
                            color={activeTab === 'chat' ? theme.colors.text.primary : theme.colors.text.inverse}
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
                            color={activeTab === 'analysis' ? theme.colors.text.primary : theme.colors.text.inverse}
                        />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    collapsedContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        paddingLeft: 16,
        alignItems: 'flex-start',
    },
    collapsedToggleButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.colors.background,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: theme.colors.borderDark, // Dark background for the floating bar
        borderRadius: 60,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'space-around',
        minWidth: 200,
        maxWidth: 400,
        borderWidth: 1,
        borderColor: theme.colors.borderDark,
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
        backgroundColor: theme.colors.primary,
        borderRadius: 24,
    },
});
