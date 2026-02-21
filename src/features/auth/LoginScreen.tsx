import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { authService } from '../../services/auth';

interface LoginScreenProps {
    onNavigateToSignUp?: () => void;
    onNavigateToForgotPassword?: () => void;
    onLoginSuccess?: () => void;
}

export function LoginScreen({ onNavigateToSignUp, onNavigateToForgotPassword, onLoginSuccess }: LoginScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');
        // TODO: Temporarily bypassing login validation for testing
        // Just navigate directly to dashboard
        onLoginSuccess?.();
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <View style={styles.logoCircle}>
                        <Icon name="wallet" size={60} color="#000000" />
                    </View>
                    <Text style={styles.appName}>MeMoney</Text>
                    <Text style={styles.tagline}>Your Digital Finance Companion</Text>
                </View>

                {/* Form Section */}
                <View style={styles.formSection}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to your account</Text>

                    {/* Error Message */}
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Icon name="error" size={16} color="#E74C3C" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* Email Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="email" size={20} color="#999999" />
                            <TextInput
                                style={styles.input}
                                placeholder="you@example.com"
                                placeholderTextColor="#CCCCCC"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                editable={!loading}
                            />
                        </View>
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="lock" size={20} color="#999999" />
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor="#CCCCCC"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                editable={!loading}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={loading}>
                                <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={20} color="#999999" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Forgot Password Link */}
                    <TouchableOpacity onPress={onNavigateToForgotPassword} disabled={loading}>
                        <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#000000" />
                        ) : (
                            <Text style={styles.loginButtonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.divider} />
                    </View>

                    {/* Social Login Buttons */}
                    <TouchableOpacity style={styles.socialButton} disabled={loading}>
                        <Icon name="phone" size={20} color="#000000" />
                        <Text style={styles.socialButtonText}>Sign in with Phone</Text>
                    </TouchableOpacity>
                </View>

                {/* Sign Up Link */}
                <View style={styles.signUpContainer}>
                    <Text style={styles.signUpText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={onNavigateToSignUp} disabled={loading}>
                        <Text style={styles.signUpLink}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 40,
    },

    // Logo Section
    logoSection: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#C5FF00',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#000000',
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 14,
        color: '#999999',
        fontWeight: '500',
    },

    // Form Section
    formSection: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#999999',
        marginBottom: 20,
        fontWeight: '500',
    },

    // Error Message
    errorContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFE5E5',
        borderWidth: 1,
        borderColor: '#E74C3C',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 16,
        alignItems: 'center',
        gap: 8,
    },
    errorText: {
        fontSize: 13,
        color: '#E74C3C',
        fontWeight: '600',
        flex: 1,
    },

    // Input Group
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#000000',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#000000',
        fontWeight: '500',
        padding: 0,
    },

    // Forgot Password Link
    forgotPasswordLink: {
        fontSize: 13,
        color: '#C5FF00',
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'right',
    },

    // Login Button
    loginButton: {
        backgroundColor: '#C5FF00',
        borderWidth: 1,
        borderColor: '#C5FF00',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
    },
    buttonDisabled: {
        opacity: 0.6,
    },

    // Divider
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        fontSize: 12,
        color: '#999999',
        fontWeight: '600',
    },

    // Social Button
    socialButton: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#000000',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    socialButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000',
    },

    // Sign Up Link
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signUpText: {
        fontSize: 13,
        color: '#666666',
        fontWeight: '500',
    },
    signUpLink: {
        fontSize: 13,
        color: '#C5FF00',
        fontWeight: '700',
    },
});
