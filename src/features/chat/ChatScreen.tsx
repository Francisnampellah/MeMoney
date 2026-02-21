import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { useAIChat } from '../../services/ai/useAIChat';
import { useNavigation } from '@react-navigation/native';

export function ChatScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const styles = createStyles(theme);
    const { messages, loading, error, sendMessage, clearHistory, transactionsAvailable } = useAIChat();
    const [inputValue, setInputValue] = React.useState('');
    const [showNavMenu, setShowNavMenu] = React.useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const message = inputValue.trim();
        setInputValue('');
        await sendMessage(message);
    };

    const handleNavigateTo = (screen: string) => {
        setShowNavMenu(false);
        (navigation.navigate as any)(screen);
    };

    const navigationOptions = [
        { icon: 'home', label: 'Home', screen: 'Home' },
        { icon: 'show-chart', label: 'Analysis', screen: 'Analysis' },
    ];

    const handleClearHistory = () => {
        Alert.alert(
            'Clear Chat History',
            'Are you sure you want to clear all messages? This action cannot be undone.',
            [
                { text: 'Cancel', onPress: () => {}, style: 'cancel' },
                { text: 'Clear', onPress: clearHistory, style: 'destructive' }
            ]
        );
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isUser = item.role === 'user';
        return (
            <View
                style={[
                    styles.messageContainer,
                    isUser ? styles.userMessageContainer : styles.aiMessageContainer
                ]}
            >
                <View
                    style={[
                        styles.messageBubble,
                        isUser ? styles.userBubble : styles.aiBubble
                    ]}
                >
                    <Text
                        style={[
                            styles.messageText,
                            isUser ? styles.userMessageText : styles.aiMessageText
                        ]}
                    >
                        {item.content}
                    </Text>
                </View>
                <Text
                    style={[
                        styles.messageTime,
                        isUser ? styles.userMessageTime : styles.aiMessageTime
                    ]}
                >
                    {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Text>
            </View>
        );
    };

    const emptyStateContent = !transactionsAvailable ? (
        <View style={styles.emptyState}>
            <Icon name="info" size={48} color={theme.colors.text.secondary} />
            <Text style={styles.emptyStateTitle}>No Transactions Yet</Text>
            <Text style={styles.emptyStateText}>
                The AI chat requires transaction data to provide financial insights. Import your M-Pesa transactions to get started.
            </Text>
        </View>
    ) : messages.length === 0 ? (
        <View style={styles.emptyState}>
            <Icon name="smart-toy" size={48} color={theme.colors.primary} />
            <Text style={styles.emptyStateTitle}>AI Financial Advisor</Text>
            <Text style={styles.emptyStateText}>
                Chat with our AI to analyze your spending patterns, get financial tips, and understand your transactions better.
            </Text>
            <View style={styles.suggestionChips}>
                <TouchableOpacity
                    style={styles.suggestionChip}
                    onPress={() => setInputValue('What are my spending trends?')}
                >
                    <Icon name="trending-down" size={16} color={theme.colors.primary} />
                    <Text style={styles.suggestionText}>Spending trends</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.suggestionChip}
                    onPress={() => setInputValue('Where can I save money?')}
                >
                    <Icon name="savings" size={16} color={theme.colors.primary} />
                    <Text style={styles.suggestionText}>Save money</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.suggestionChip}
                    onPress={() => setInputValue('Analyze my recent transactions')}
                >
                    <Icon name="analytics" size={16} color={theme.colors.primary} />
                    <Text style={styles.suggestionText}>Transaction analysis</Text>
                </TouchableOpacity>
            </View>
        </View>
    ) : null;

    return (
        <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>AI Advisor</Text>
                    <Text style={styles.headerSubtitle}>Powered by OpenAI</Text>
                </View>
                {messages.length > 0 && (
                    <TouchableOpacity
                        onPress={handleClearHistory}
                        style={styles.clearButton}
                    >
                        <Icon name="delete-outline" size={24} color={theme.colors.text.secondary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Error State */}
            {error && (
                <View style={styles.errorBanner}>
                    <Icon name="error-outline" size={20} color={theme.colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Messages and Input */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingContainer}
                keyboardVerticalOffset={0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={
                        messages.length === 0
                            ? styles.emptyListContent
                            : styles.messageListContent
                    }
                    ListEmptyComponent={emptyStateContent}
                    scrollEnabled={messages.length > 0}
                    showsVerticalScrollIndicator={false}
                />

                {/* Loading Indicator */}
                {loading && (
                    <View style={styles.loadingIndicatorContainer}>
                        <View style={styles.loadingBubble}>
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                            <Text style={styles.loadingText}>AI is thinking...</Text>
                        </View>
                    </View>
                )}

                {/* Input Area */}
                <View style={[styles.inputContainer, { paddingBottom: insets.bottom + theme.spacing.md }]}>
                <View style={styles.inputWrapper}>
                    <TouchableOpacity
                        onPress={() => setShowNavMenu(true)}
                        style={styles.navButton}
                    >
                        <Icon name="menu" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask me anything about your finances..."
                        placeholderTextColor={theme.colors.text.secondary}
                        value={inputValue}
                        onChangeText={setInputValue}
                        multiline
                        maxLength={500}
                        editable={!loading && transactionsAvailable}
                    />
                    <TouchableOpacity
                        onPress={handleSendMessage}
                        disabled={!inputValue.trim() || loading || !transactionsAvailable}
                        style={[
                            styles.sendButton,
                            (!inputValue.trim() || loading || !transactionsAvailable) &&
                            styles.sendButtonDisabled
                        ]}
                    >
                        {loading ? (
                            <ActivityIndicator
                                size="small"
                                color={theme.colors.text.inverse}
                            />
                        ) : (
                            <Icon name="send" size={20} color={theme.colors.text.inverse} />
                        )}
                    </TouchableOpacity>
                </View>
                <Text style={[styles.charCounter, { opacity: inputValue.length > 0 ? 1 : 0 }]}>
                    {inputValue.length}/500
                </Text>
                </View>
            </KeyboardAvoidingView>

            {/* Navigation Menu Modal */}
            <Modal
                visible={showNavMenu}
                transparent
                animationType="fade"
                onRequestClose={() => setShowNavMenu(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.navModalOverlay}
                    onPress={() => setShowNavMenu(false)}
                >
                    <View style={[styles.navMenu, { bottom: insets.bottom + 80 }]}>
                        {navigationOptions.map((option, index) => (
                            <TouchableOpacity
                                key={option.screen}
                                style={[
                                    styles.navMenuItem,
                                    index < navigationOptions.length - 1 && styles.navMenuItemBorder
                                ]}
                                onPress={() => handleNavigateTo(option.screen)}
                                activeOpacity={0.7}
                            >
                                <Icon name={option.icon} size={20} color={theme.colors.primary} />
                                <Text style={styles.navMenuLabel}>{option.label}</Text>
                                <Icon name="chevron-right" size={18} color={theme.colors.text.secondary} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.primary,
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginTop: 2,
        fontWeight: '400',
    },
    clearButton: {
        padding: 8,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.background,
    },

    // Error Banner
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.error + '12',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        gap: 8,
        marginHorizontal: theme.spacing.md,
        marginTop: theme.spacing.sm,
        borderRadius: theme.borderRadius.lg,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.error,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    errorText: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.error,
        fontWeight: '600',
    },

    // Keyboard Avoiding View
    keyboardAvoidingContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    messageListContent: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
    },
    emptyListContent: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        justifyContent: 'center',
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.lg,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.primary,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        letterSpacing: 0.3,
    },
    emptyStateText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: theme.spacing.lg,
        fontWeight: '500',
    },
    suggestionChips: {
        width: '100%',
        gap: theme.spacing.sm,
    },
    suggestionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.primary + '10',
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1.5,
        borderColor: theme.colors.primary + '25',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    suggestionText: {
        fontSize: 13,
        color: theme.colors.primary,
        fontWeight: '600',
    },

    // Messages
    messageContainer: {
        marginVertical: 8,
        flexDirection: 'column',
    },
    userMessageContainer: {
        alignItems: 'flex-end',
    },
    aiMessageContainer: {
        alignItems: 'flex-start',
    },
    messageBubble: {
        borderRadius: theme.borderRadius.xl,
        paddingHorizontal: 14,
        paddingVertical: 10,
        maxWidth: '85%',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 1,
    },
    userBubble: {
        backgroundColor: theme.colors.primary,
    },
    aiBubble: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
    },
    userMessageText: {
        color: theme.colors.text.inverse,
    },
    aiMessageText: {
        color: theme.colors.text.primary,
    },
    messageTime: {
        fontSize: 11,
        marginTop: 4,
        marginHorizontal: 4,
        fontWeight: '400',
    },
    userMessageTime: {
        color: theme.colors.text.secondary,
    },
    aiMessageTime: {
        color: theme.colors.text.secondary,
    },

    // Input Area
    inputContainer: {
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: theme.spacing.sm,
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    input: {
        flex: 1,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        fontSize: 14,
        color: theme.colors.text.primary,
        maxHeight: 100,
        fontWeight: '500',
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    sendButtonDisabled: {
        backgroundColor: theme.colors.text.secondary + '40',
        elevation: 0,
        shadowOpacity: 0,
    },
    charCounter: {
        fontSize: 11,
        color: theme.colors.text.secondary,
        marginTop: 4,
        alignSelf: 'flex-end',
        fontWeight: '500',
    },

    // Navigation Menu
    navModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    navMenu: {
        position: 'absolute',
        left: theme.spacing.md,
        right: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    navMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        gap: theme.spacing.md,
    },
    navMenuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    navMenuLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },

    // Loading Indicator
    loadingIndicatorContainer: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        alignItems: 'flex-start',
    },
    loadingBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: 14,
        paddingVertical: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 1,
    },
    loadingText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        fontStyle: 'italic',
        fontWeight: '500',
    },
});
