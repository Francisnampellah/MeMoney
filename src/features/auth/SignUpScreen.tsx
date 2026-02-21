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

interface SignUpScreenProps {
    onNavigateToLogin?: () => void;
    onSignUpSuccess?: () => void;
}

export function SignUpScreen({ onNavigateToLogin, onSignUpSuccess }: SignUpScreenProps) {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSignUp = async () => {
        setError('');
        setSuccess('');
        
        if (!fullName || !email || !phone || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (!acceptTerms) {
            setError('Please accept the terms and conditions');
            return;
        }

        setLoading(true);
        try {
            // Register user with auth service
            await authService.register(fullName, email, phone, password);
            
            // Show success message
            setSuccess('Account created successfully! Redirecting to login...');
            
            // Navigate to login after a short delay
            setTimeout(() => {
                onNavigateToLogin?.();
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Sign up failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join MeMoney today</Text>
                </View>

                {/* Form Section */}
                <View style={styles.formSection}>
                    {/* Error Message */}
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Icon name="error" size={16} color="#E74C3C" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* Success Message */}
                    {success ? (
                        <View style={styles.successContainer}>
                            <Icon name="check-circle" size={16} color="#00AA00" />
                            <Text style={styles.successText}>{success}</Text>
                        </View>
                    ) : null}

                    {/* Full Name Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="person" size={20} color="#999999" />
                            <TextInput
                                style={styles.input}
                                placeholder="John Doe"
                                placeholderTextColor="#CCCCCC"
                                value={fullName}
                                onChangeText={setFullName}
                                editable={!loading}
                            />
                        </View>
                    </View>

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

                    {/* Phone Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="phone" size={20} color="#999999" />
                            <TextInput
                                style={styles.input}
                                placeholder="+254 712 345 678"
                                placeholderTextColor="#CCCCCC"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
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

                    {/* Confirm Password Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="lock" size={20} color="#999999" />
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor="#CCCCCC"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                editable={!loading}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}>
                                <Icon name={showConfirmPassword ? 'visibility' : 'visibility-off'} size={20} color="#999999" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Terms Checkbox */}
                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setAcceptTerms(!acceptTerms)}
                        disabled={loading}
                    >
                        <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                            {acceptTerms && <Icon name="check" size={16} color="#000000" />}
                        </View>
                        <Text style={styles.checkboxLabel}>
                            I agree to the{' '}
                            <Text style={styles.link}>Terms & Conditions</Text>
                            {' '}and{' '}
                            <Text style={styles.link}>Privacy Policy</Text>
                        </Text>
                    </TouchableOpacity>

                    {/* Sign Up Button */}
                    <TouchableOpacity
                        style={[styles.signUpButton, loading && styles.buttonDisabled]}
                        onPress={handleSignUp}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#000000" />
                        ) : (
                            <Text style={styles.signUpButtonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>

                    {/* Sign In Link */}
                    <View style={styles.signInContainer}>
                        <Text style={styles.signInText}>Already have an account? </Text>
                        <TouchableOpacity onPress={onNavigateToLogin} disabled={loading}>
                            <Text style={styles.signInLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
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

    // Header
    header: {
        marginBottom: 32,
        marginTop: 12,
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
        fontWeight: '500',
    },

    // Form Section
    formSection: {
        marginBottom: 24,
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

    // Success Message
    successContainer: {
        flexDirection: 'row',
        backgroundColor: '#E5F5E5',
        borderWidth: 1,
        borderColor: '#00AA00',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 16,
        alignItems: 'center',
        gap: 8,
    },
    successText: {
        fontSize: 13,
        color: '#00AA00',
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

    // Checkbox
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
        gap: 10,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#000000',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: '#C5FF00',
        borderColor: '#C5FF00',
    },
    checkboxLabel: {
        fontSize: 13,
        color: '#666666',
        fontWeight: '500',
        flex: 1,
        lineHeight: 20,
    },
    link: {
        color: '#C5FF00',
        fontWeight: '600',
    },

    // Sign Up Button
    signUpButton: {
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
    signUpButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
    },
    buttonDisabled: {
        opacity: 0.6,
    },

    // Sign In Link
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signInText: {
        fontSize: 13,
        color: '#666666',
        fontWeight: '500',
    },
    signInLink: {
        fontSize: 13,
        color: '#C5FF00',
        fontWeight: '700',
    },
});
