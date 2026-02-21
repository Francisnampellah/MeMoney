import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Animated,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';

interface SplashScreenProps {
    onFinish?: () => void;
    duration?: number; // Duration in milliseconds
}

export function SplashScreen({ onFinish, duration = 3000 }: SplashScreenProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // End splash screen after duration
        const timer = setTimeout(() => {
            onFinish?.();
        }, duration);

        return () => clearTimeout(timer);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Logo Icon with Animation */}
                <Animated.View
                    style={[
                        styles.logoContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <View style={styles.iconWrapper}>
                        <Icon name="trending-up" size={80} color={theme.colors.primary} />
                    </View>
                </Animated.View>

                {/* App Name */}
                <Animated.View
                    style={[
                        styles.titleContainer,
                        {
                            opacity: fadeAnim,
                        },
                    ]}
                >
                    <Text style={styles.appName}>MeMoney</Text>
                    <Text style={styles.tagline}>Smart Financial Management</Text>
                </Animated.View>

                {/* Loading Indicator */}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Loading your financial dashboard...</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    logoContainer: {
        marginBottom: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconWrapper: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    appName: {
        fontSize: 48,
        fontWeight: '900',
        color: theme.colors.primary,
        letterSpacing: 2,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 14,
        color: '#CCCCCC',
        fontWeight: '500',
        letterSpacing: 1,
        marginTop: 4,
    },
    loadingContainer: {
        marginTop: 40,
    },
    footer: {
        paddingBottom: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: theme.colors.text.muted,
        fontWeight: '400',
        letterSpacing: 0.5,
    },
});
