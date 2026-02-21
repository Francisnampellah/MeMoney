import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userProfile?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  onEditProfile?: () => void;
  onLogout?: () => void;
}

export function ProfileModal({
  visible,
  onClose,
  userProfile = {
    name: 'User Name',
    email: 'user@example.com',
    phone: '+254 712 345 678',
  },
  onEditProfile,
  onLogout,
}: ProfileModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Overlay to close on tap */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal Content */}
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Profile</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Profile Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Icon name="person" size={50} color={theme.colors.text.primary} />
            </View>
          </View>

          {/* Profile Info Card */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{userProfile.name}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{userProfile.email}</Text>
            </View>

            <View style={[styles.infoItem, { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 }]}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{userProfile.phone}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                onEditProfile?.();
                onClose();
              }}
            >
              <Icon name="edit" size={18} color={theme.colors.text.primary} />
              <Text style={styles.actionButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={() => {
                onLogout?.();
                onClose();
              }}
            >
              <Icon name="logout" size={18} color={theme.colors.primary} />
              <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backdrop,
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.secondary,
  },
  infoSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
  },
  infoItem: {
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.text.muted,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  actionsSection: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
  },
  dangerButton: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  dangerButtonText: {
    color: theme.colors.primary,
  },
});
