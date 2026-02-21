import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface StoredUser extends User {
  password: string; // Stored with user data
}

const USERS_STORAGE_KEY = '@MeMoney:users';
const CURRENT_USER_KEY = '@MeMoney:currentUser';

export const authService = {
  /**
   * Register a new user
   */
  async register(fullName: string, email: string, phone: string, password: string): Promise<User> {
    try {
      console.log('👤 Registering new user:', { fullName, email, phone });

      // Check if user already exists
      const existingUsers = await this.getAllUsers();
      console.log('📦 Current users in database:', existingUsers.length);

      const userExists = existingUsers.some(u => u.email === email || u.phone === phone);
      
      if (userExists) {
        console.log('⚠️ User already exists with this email or phone');
        throw new Error('User with this email or phone already exists');
      }

      // Create new user
      const newUser: StoredUser = {
        id: Date.now().toString(),
        fullName,
        email,
        phone,
        password, // In production, this should be hashed
        createdAt: new Date().toISOString(),
      };

      console.log('✏️ Creating new user object:', newUser);

      // Save to storage
      const users = await this.getAllUsers();
      users.push(newUser);
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      console.log('✅ User registered successfully. Total users now:', users.length);

      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      console.error('🚨 Registration error:', error);
      throw error;
    }
  },

  /**
   * Login user with email/phone and password
   */
  async login(emailOrPhone: string, password: string): Promise<User> {
    try {
      // Trim inputs
      const trimmedEmailOrPhone = emailOrPhone.trim();
      const trimmedPassword = password.trim();

      console.log('🔑 Login attempt with:', { emailOrPhone: trimmedEmailOrPhone, password: trimmedPassword });

      const users = await this.getAllUsers();
      console.log('📦 Total users in database:', users.length);
      
      if (users.length === 0) {
        throw new Error('No users registered yet. Please create an account first.');
      }

      // Debug: Log all users (without passwords for security)
      console.log('👥 Available users:', users.map(u => ({ email: u.email, phone: u.phone, id: u.id })));

      const user = users.find(u => {
        const emailMatch = u.email.trim() === trimmedEmailOrPhone;
        const phoneMatch = u.phone.trim() === trimmedEmailOrPhone;
        const passwordMatch = u.password.trim() === trimmedPassword;
        
        console.log(`  Checking ${u.email}:`, { emailMatch, phoneMatch, passwordMatch });
        
        return (emailMatch || phoneMatch) && passwordMatch;
      });

      if (!user) {
        console.log('❌ No matching user found');
        throw new Error('Invalid email/phone or password');
      }

      console.log('✅ Login successful for user:', user.fullName);

      // Save current user to storage
      const { password: _, ...userWithoutPassword } = user;
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

      return userWithoutPassword;
    } catch (error) {
      console.error('🚨 Login error:', error);
      throw error;
    }
  },

  /**
   * Get current logged in user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all registered users (for testing/debugging)
   */
  async getAllUsers(): Promise<StoredUser[]> {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  /**
   * Clear all users (for testing/debugging)
   */
  async clearAllUsers(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USERS_STORAGE_KEY);
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user profile
   */
  async updateUser(userId: string, updates: Partial<StoredUser>): Promise<User> {
    try {
      const users = await this.getAllUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        throw new Error('User not found');
      }

      users[userIndex] = { ...users[userIndex], ...updates };
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      // Update current user if it's the logged in user
      const currentUser = await this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        const { password: _, ...userWithoutPassword } = users[userIndex];
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      }

      const { password: _, ...userWithoutPassword } = users[userIndex];
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  },
};
