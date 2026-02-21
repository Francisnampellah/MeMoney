import { authService } from './authService';

/**
 * Test/Seed helper functions for development and testing
 * These functions help populate test credentials for development
 */

export const authTestHelpers = {
  /**
   * Seed test users for development/testing
   * Run this once to populate test credentials
   */
  async seedTestUsers() {
    try {
      // Clear existing users first
      await authService.clearAllUsers();

      // Create test users
      const testUsers = [
        {
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '+254712345678',
          password: 'Password123',
        },
        {
          fullName: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+254787654321',
          password: 'SecurePass456',
        },
        {
          fullName: 'Test User',
          email: 'test@test.com',
          phone: '+254700000000',
          password: 'test1234',
        },
      ];

      for (const user of testUsers) {
        await authService.register(
          user.fullName,
          user.email,
          user.phone,
          user.password
        );
      }

      console.log('✅ Test users seeded successfully');
      return testUsers;
    } catch (error) {
      console.error('Error seeding test users:', error);
      throw error;
    }
  },

  /**
   * Test login with given credentials
   */
  async testLogin(emailOrPhone: string, password: string) {
    try {
      const user = await authService.login(emailOrPhone, password);
      console.log('✅ Login successful:', user);
      return user;
    } catch (error: any) {
      console.error('❌ Login failed:', error.message);
      throw error;
    }
  },

  /**
   * Display all registered users (for testing)
   */
  async displayAllUsers() {
    try {
      const users = await authService.getAllUsers();
      console.log('📋 All registered users:', users);
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  },

  /**
   * Get current user info
   */
  async displayCurrentUser() {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        console.log('👤 Current user:', user);
      } else {
        console.log('❌ No user logged in');
      }
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  },
};

/**
 * Test Credentials (after seeding):
 *
 * User 1:
 * - Email: john@example.com
 * - Phone: +254712345678
 * - Password: Password123
 *
 * User 2:
 * - Email: jane@example.com
 * - Phone: +254787654321
 * - Password: SecurePass456
 *
 * User 3:
 * - Email: test@test.com
 * - Phone: +254700000000
 * - Password: test1234
 */
