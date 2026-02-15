import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function SettingsScreen() {
    const safeAreaInsets = useSafeAreaInsets();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.placeholderText}>App settings and preferences.</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: 100,
    },
    placeholderText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});
