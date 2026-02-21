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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { useAIChat } from '../../services/ai/useAIChat';

export function ChatScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const styles = createStyles(theme);
    const { messages, loading, error, sendMessage, clearHistory, transactionsAvailable } = useAIChat();
    const [inputValue, setInputValue] = React.useState('');
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
                <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 64) }]}>
                <View style={styles.inputWrapper}>
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
                {inputValue.length > 0 && (
                    <Text style={styles.charCounter}>
                        {inputValue.length}/500
                    </Text>
                )}
                </View>
            </KeyboardAvoidingView>
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
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    headerSubtitle: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginTop: 2,
    },
    clearButton: {
        padding: 8,
    },

    // Error Banner
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.error + '15',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        gap: 8,
        marginHorizontal: theme.spacing.md,
        marginTop: theme.spacing.sm,
        borderRadius: theme.borderRadius.lg,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.error,
    },
    errorText: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.error,
        fontWeight: '500',
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
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    emptyStateText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: theme.spacing.lg,
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
        backgroundColor: theme.colors.primary + '15',
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.primary + '30',
    },
    suggestionText: {
        fontSize: 13,
        color: theme.colors.primary,
        fontWeight: '500',
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
        borderRadius: theme.borderRadius.lg,
        paddingHorizontal: 14,
        paddingVertical: 10,
        maxWidth: '85%',
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
        paddingTop: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: theme.spacing.sm,
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
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: theme.colors.text.secondary + '33',
    },
    charCounter: {
        fontSize: 11,
        color: theme.colors.text.secondary,
        marginTop: 4,
        alignSelf: 'flex-end',
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
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    loadingText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        fontStyle: 'italic',
    },
});
