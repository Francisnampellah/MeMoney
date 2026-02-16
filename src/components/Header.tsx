import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface HeaderProps {
    showTabs?: boolean;
    activeTab?: string;
    onTabSelect?: (tab: string) => void;
    tabs?: string[];
    title?: string;
    showBack?: boolean;
    onBack?: () => void;
}

export function Header({
    showTabs = true,
    activeTab = 'Overview',
    onTabSelect,
    tabs = ['Overview', 'Transactions',],
    title,
    showBack = false,
    onBack
}: HeaderProps) {

    return (
        <View style={styles.container}>
            {/* Header Icons */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    {showBack ? (
                        <TouchableOpacity style={styles.iconButton} onPress={onBack}>
                            <Icon name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.iconButton}>
                            <Icon name="settings" size={20} color="#000000" />
                        </TouchableOpacity>
                    )}
                </View>

                {title && (
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>{title}</Text>
                    </View>
                )}
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.profileIcon}>
                        <Icon name="person" size={20} color="#000000" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tab Navigation */}
            {showTabs && (
                <View style={styles.tabNavigation}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={activeTab === tab ? styles.tabActive : styles.tab}
                            onPress={() => onTabSelect?.(tab)}
                        >
                            <Text style={activeTab === tab ? styles.tabTextActive : styles.tabText}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000000',
        paddingTop: 30,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#000000',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    profileIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#C5FF00',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Tab Navigation
    tabNavigation: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#000000',
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    tab: {
        marginRight: 24,
        paddingBottom: 8,
    },
    tabActive: {
        marginRight: 24,
        paddingBottom: 8,
        borderBottomWidth: 3,
        borderBottomColor: '#C5FF00',
    },
    tabText: {
        fontSize: 14,
        color: '#999999',
        fontWeight: '500',
    },
    tabTextActive: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});
