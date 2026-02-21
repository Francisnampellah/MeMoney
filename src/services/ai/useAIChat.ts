import { useState, useCallback, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAnalytics } from '../analytics/useAnalytics';
import { sendChatMessage, generateMessageId, ChatMessage } from './chatService';

const CHAT_HISTORY_KEY = '@MeMoney_Chat_History';

export function useAIChat() {
    const { transactions, loading: analyticsLoading } = useAnalytics();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const conversationHistoryRef = useRef<ChatMessage[]>([]);

    // Load chat history on component mount
    useEffect(() => {
        loadChatHistory();
    }, []);

    const loadChatHistory = useCallback(async () => {
        try {
            const savedHistory = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
            if (savedHistory) {
                const history = JSON.parse(savedHistory);
                // Filter out tool messages from display
                const displayMessages = history.filter((msg: ChatMessage) => msg.role !== 'tool');
                setMessages(displayMessages);
                conversationHistoryRef.current = history;
            }
        } catch (err) {
            console.error('Failed to load chat history:', err);
        }
    }, []);

    const saveChatHistory = useCallback(async (msgs: ChatMessage[]) => {
        try {
            await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(msgs));
        } catch (err) {
            console.error('Failed to save chat history:', err);
        }
    }, []);

    const sendMessage = useCallback(
        async (userMessage: string) => {
            if (!userMessage.trim() || transactions.length === 0) return;

            setError(null);
            const userMsg: ChatMessage = {
                id: generateMessageId(),
                role: 'user',
                content: userMessage,
                timestamp: Date.now()
            };

            // Add user message to state (display only user and assistant messages)
            const updatedMessages = [...messages, userMsg];
            setMessages(updatedMessages);
            conversationHistoryRef.current = [...conversationHistoryRef.current, userMsg];
            await saveChatHistory(conversationHistoryRef.current);

            setLoading(true);

            try {
                const aiResponse = await sendChatMessage(
                    userMessage,
                    transactions,
                    conversationHistoryRef.current
                );

                const assistantMsg: ChatMessage = {
                    id: generateMessageId(),
                    role: 'assistant',
                    content: aiResponse,
                    timestamp: Date.now()
                };

                const newMessages = [...updatedMessages, assistantMsg];
                setMessages(newMessages);
                conversationHistoryRef.current = [...conversationHistoryRef.current, assistantMsg];
                await saveChatHistory(conversationHistoryRef.current);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to get AI response');
                console.error('Chat Error:', err);
                // Remove user message if AI response failed
                setMessages(messages);
                conversationHistoryRef.current = conversationHistoryRef.current.filter(
                    msg => msg.id !== userMsg.id
                );
            } finally {
                setLoading(false);
            }
        },
        [messages, transactions, saveChatHistory]
    );

    const clearHistory = useCallback(async () => {
        try {
            setMessages([]);
            conversationHistoryRef.current = [];
            await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
        } catch (err) {
            console.error('Failed to clear chat history:', err);
        }
    }, []);

    return {
        messages,
        loading: loading || analyticsLoading,
        error,
        sendMessage,
        clearHistory,
        transactionsAvailable: transactions.length > 0
    };
}
