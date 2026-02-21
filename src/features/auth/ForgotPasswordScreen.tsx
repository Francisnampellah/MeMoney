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

interface ForgotPasswordScreenProps {
    onNavigateToLogin?: () => void;
    onResetSuccess?: () => void;
}

export function ForgotPasswordScreen({ onNavigateToLogin, onResetSuccess }: ForgotPasswordScreenProps) {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSendOtp = async () => {
        setError('');
        setSuccess('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            await new Promise<void>((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 1500);
            });
            setSuccess('OTP sent to your email');
            setStep('otp');
        } catch (err) {
            setError('Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setError('');
        setSuccess('');

        if (!otp) {
            setError('Please enter the OTP');
            return;
        }

        if (otp.length !== 6) {
            setError('OTP must be 6 digits');
            return;
        }

        setLoading(true);
        try {
            await new Promise<void>((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 1500);
            });
            setSuccess('OTP verified successfully');
            setStep('password');
        } catch (err) {
            setError('Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setError('');
        setSuccess('');

        if (!newPassword || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            await new Promise<void>((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 1500);
            });
            setSuccess('Password reset successfully');
            setTimeout(() => {
                onResetSuccess?.();
            }, 1000);
        } catch (err) {
            setError('Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => step === 'email' ? onNavigateToLogin?.() : setStep('email')}>
                        <Icon name="arrow-back" size={24} color="#000000" />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {step === 'email' && (
                        <>
                            <View style={styles.iconSection}>
                                <View style={styles.iconCircle}>
                                    <Icon name="email" size={50} color="#000000" />
                                </View>
                            </View>

                            <Text style={styles.title}>Recover Your Password</Text>
                            <Text style={styles.subtitle}>Enter your email address and we'll send you an OTP to reset your password</Text>

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

                            {/* Send OTP Button */}
                            <TouchableOpacity
                                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                                onPress={handleSendOtp}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#000000" />
                                ) : (
                                    <Text style={styles.primaryButtonText}>Send OTP</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}

                    {step === 'otp' && (
                        <>
                            <View style={styles.iconSection}>
                                <View style={styles.iconCircle}>
                                    <Icon name="vpn-key" size={50} color="#000000" />
                                </View>
                            </View>

                            <Text style={styles.title}>Verify OTP</Text>
                            <Text style={styles.subtitle}>Enter the 6-digit OTP sent to {email}</Text>

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

                            {/* OTP Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>OTP Code</Text>
                                <View style={styles.inputContainer}>
                                    <Icon name="vpn-key" size={20} color="#999999" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="000000"
                                        placeholderTextColor="#CCCCCC"
                                        value={otp}
                                        onChangeText={setOtp}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        editable={!loading}
                                    />
                                </View>
                            </View>

                            {/* Verify Button */}
                            <TouchableOpacity
                                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                                onPress={handleVerifyOtp}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#000000" />
                                ) : (
                                    <Text style={styles.primaryButtonText}>Verify OTP</Text>
                                )}
                            </TouchableOpacity>

                            {/* Resend OTP */}
                            <View style={styles.resendContainer}>
                                <Text style={styles.resendText}>Didn't receive the code? </Text>
                                <TouchableOpacity onPress={handleSendOtp} disabled={loading}>
                                    <Text style={styles.resendLink}>Resend</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {step === 'password' && (
                        <>
                            <View style={styles.iconSection}>
                                <View style={styles.iconCircle}>
                                    <Icon name="lock-reset" size={50} color="#000000" />
                                </View>
                            </View>

                            <Text style={styles.title}>Set New Password</Text>
                            <Text style={styles.subtitle}>Create a strong password for your account</Text>

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

                            {/* New Password Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>New Password</Text>
                                <View style={styles.inputContainer}>
                                    <Icon name="lock" size={20} color="#999999" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="••••••••"
                                        placeholderTextColor="#CCCCCC"
                                        value={newPassword}
                                        onChangeText={setNewPassword}
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

                            {/* Reset Button */}
                            <TouchableOpacity
                                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                                onPress={handleResetPassword}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#000000" />
                                ) : (
                                    <Text style={styles.primaryButtonText}>Reset Password</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
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
        paddingTop: 16,
        paddingBottom: 40,
        flexGrow: 1,
    },

    // Header
    header: {
        marginBottom: 24,
    },

    // Content
    content: {
        flex: 1,
    },

    // Icon Section
    iconSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#C5FF00',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000000',
    },

    // Title and Subtitle
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#999999',
        marginBottom: 20,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 20,
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

    // Primary Button
    primaryButton: {
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
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
    },
    buttonDisabled: {
        opacity: 0.6,
    },

    // Resend Link
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    resendText: {
        fontSize: 13,
        color: '#666666',
        fontWeight: '500',
    },
    resendLink: {
        fontSize: 13,
        color: '#C5FF00',
        fontWeight: '700',
    },
});
