import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ProfileModal } from './ProfileModal';
import { useTheme } from '../theme';

interface HeaderProps {
    showTabs?: boolean;
    activeTab?: string;
    onTabSelect?: (tab: string) => void;
    tabs?: string[];
    title?: string;
    showBack?: boolean;
    onBack?: () => void;
    userProfile?: {
        name?: string;
        email?: string;
        phone?: string;
    };
    onEditProfile?: () => void;
    onSettings?: () => void;
    onLogout?: () => void;
}

export function Header({
    showTabs = true,
    activeTab = 'Overview',
    onTabSelect,
    tabs = ['Overview', 'Transactions',],
    title,
    showBack = false,
    onBack,
    userProfile,
    onEditProfile,
    onSettings,
    onLogout,
}: HeaderProps) {
    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <>
            <View style={styles.container}>
                {/* Header Icons */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {showBack ? (
                            <TouchableOpacity style={styles.iconButton} onPress={onBack}>
                                <Icon name="arrow-back" size={24} color={theme.colors.text.primary} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.iconButton}>
                                <Icon name="settings" size={20} color={theme.colors.text.primary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {title && (
                        <View style={styles.headerCenter}>
                            <Text style={styles.headerTitle}>{title}</Text>
                        </View>
                    )}
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={styles.profileIcon}
                            onPress={() => setProfileModalVisible(true)}
                        >
                            <Icon name="person" size={20} color={theme.colors.text.inverse || '#000000'} />
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

            <ProfileModal
                visible={profileModalVisible}
                onClose={() => setProfileModalVisible(false)}
                userProfile={userProfile}
                onEditProfile={onEditProfile}
                onSettings={onSettings}
                onLogout={onLogout}
            />
        </>
    );
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        backgroundColor: theme.colors.background,
        paddingTop: 30,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 12,
        backgroundColor: theme.colors.background,
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
        backgroundColor: theme.colors.surface,
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
        color: theme.colors.text.primary,
    },
    profileIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Tab Navigation
    tabNavigation: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 12,
        backgroundColor: theme.colors.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderDark,
    },
    tab: {
        marginRight: 24,
        paddingBottom: 8,
    },
    tabActive: {
        marginRight: 24,
        paddingBottom: 8,
        borderBottomWidth: 3,
        borderBottomColor: theme.colors.primary,
    },
    tabText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        fontWeight: '500',
    },
    tabTextActive: {
        fontSize: 14,
        color: theme.colors.text.primary,
        fontWeight: 'bold',
    },
});
