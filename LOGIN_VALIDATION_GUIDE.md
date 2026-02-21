# Login Validation Flow Documentation

## Overview

The login function is fully implemented to validate user credentials against stored user data in AsyncStorage before allowing access to the dashboard.

## Complete Login Flow

### 1. User Enters Credentials
```
LoginScreen Component
├── User enters email/phone
└── User enters password
```

### 2. Validate Against Local Storage
```
LoginScreen.handleLogin()
├── Calls authService.login(email, password)
│
└── authService.login()
    ├── Retrieves ALL users from AsyncStorage (@MeMoney:users)
    ├── Searches for user where:
    │   ├── email OR phone MATCHES input
    │   └── password MATCHES input
    ├── If user found:
    │   ├── Saves user to CurrentUser storage (@MeMoney:currentUser)
    │   ├── Returns user (without password)
    │   └── LoginScreen calls onLoginSuccess()
    └── If user not found:
        └── Throws "Invalid email/phone or password" error
```

### 3. Route to Dashboard
```
App.tsx
├── Receives onLoginSuccess callback
├── Sets isLoggedIn = true in state
├── Navigation re-renders
├── Condition check: isLoggedIn ? true
└── Shows MainTabs (Dashboard screens)
```

## Data Storage Keys

- **`@MeMoney:users`**: Array of all registered users with credentials
  ```json
  [
    {
      "id": "1707000000000",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+254712345678",
      "password": "Password123",
      "createdAt": "2025-02-16T..."
    }
  ]
  ```

- **`@MeMoney:currentUser`**: Currently logged-in user (without password)
  ```json
  {
    "id": "1707000000000",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+254712345678",
    "createdAt": "2025-02-16T..."
  }
  ```

## Login Validation Logic

### Code from `authService.ts`

```typescript
async login(emailOrPhone: string, password: string): Promise<User> {
  try {
    // Get all registered users from AsyncStorage
    const users = await this.getAllUsers();
    
    // Search for matching user
    const user = users.find(u => 
      (u.email === emailOrPhone || u.phone === emailOrPhone) && 
      u.password === password
    );

    // Throw error if no match found
    if (!user) {
      throw new Error('Invalid email/phone or password');
    }

    // Save current user to AsyncStorage
    const { password: _, ...userWithoutPassword } = user;
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

    // Return authenticated user
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
}
```

## Login Validation Scenarios

### ✅ Scenario 1: Valid Credentials
```
Input:  email: "john@example.com", password: "Password123"
Storage: [{ email: "john@example.com", password: "Password123", ... }]

Match: ✅ YES
Action: 
  1. Save user to CurrentUser storage
  2. Return user object
  3. Trigger onLoginSuccess()
  4. Route to Dashboard
```

### ❌ Scenario 2: Invalid Email
```
Input:  email: "wrong@example.com", password: "Password123"
Storage: [{ email: "john@example.com", password: "Password123", ... }]

Match: ❌ NO (email doesn't exist)
Action:
  1. Throw error: "Invalid email/phone or password"
  2. Show error message in LoginScreen
  3. Stay on Login page
```

### ❌ Scenario 3: Invalid Password
```
Input:  email: "john@example.com", password: "WrongPassword"
Storage: [{ email: "john@example.com", password: "Password123", ... }]

Match: ❌ NO (password doesn't match)
Action:
  1. Throw error: "Invalid email/phone or password"
  2. Show error message in LoginScreen
  3. Stay on Login page
```

### ✅ Scenario 4: Login with Phone Number
```
Input:  phone: "+254712345678", password: "Password123"
Storage: [{ phone: "+254712345678", password: "Password123", ... }]

Match: ✅ YES
Action: 
  1. Save user to CurrentUser storage
  2. Return user object
  3. Trigger onLoginSuccess()
  4. Route to Dashboard
```

## App Navigation Integration

### App.tsx checks auth state on startup:

```typescript
useEffect(() => {
  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setIsLoggedIn(!!currentUser);  // true if user exists, false if null
    } catch (error) {
      setIsLoggedIn(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };
  checkAuth();
}, []);
```

### Navigation Stack Selection:

```typescript
{isLoggedIn ? (
  <>
    {/* Main Dashboard Screens */}
    <Stack.Screen name="Main" component={MainTabs} />
  </>
) : (
  <>
    {/* Auth Screens */}
    <Stack.Screen name="Auth" component={LoginScreen} />
  </>
)}
```

## Testing the Login

### Option 1: Create Test Users First

Use the seed helper to populate test users:

```typescript
import { authTestHelpers } from './src/services/auth/authTestHelpers';

// Call this once to seed test users
await authTestHelpers.seedTestUsers();
```

Test Credentials:
- Email: `john@example.com` / Password: `Password123`
- Email: `jane@example.com` / Password: `SecurePass456`
- Email: `test@test.com` / Password: `test1234`

### Option 2: Register a New User

1. Click "Sign Up" on login screen
2. Enter credentials:
   - Full Name: Your name
   - Email: your@email.com
   - Phone: +254700000000
   - Password: YourPassword123
3. Click "Create Account"
4. Credentials saved to AsyncStorage
5. Redirected to login
6. Login with the credentials you just created

### Option 3: Manual AsyncStorage Verification

```typescript
// Check stored credentials
const users = await AsyncStorage.getItem('@MeMoney:users');
console.log('All users:', JSON.parse(users));

// Check current user
const currentUser = await AsyncStorage.getItem('@MeMoney:currentUser');
console.log('Current user:', JSON.parse(currentUser));
```

## Error Handling

The login function provides clear error messages:

1. **Empty Fields**: "Please fill in all fields"
2. **Invalid Credentials**: "Invalid email/phone or password"
3. **Storage Error**: Caught and logged

All errors are displayed in a red error container on the LoginScreen.

## Security Considerations

⚠️ **Development Only**: This implementation stores passwords in plain text for development purposes.

For production, implement:
1. ✅ Password hashing (bcrypt)
2. ✅ Token-based authentication (JWT)
3. ✅ HTTPS-only network requests
4. ✅ Secure session management
5. ✅ Rate limiting on login attempts
6. ✅ Backend authentication server

## Function References

### authService.login()
- **Input**: `emailOrPhone` (string), `password` (string)
- **Output**: `User` object without password
- **Throws**: `Error` with message "Invalid email/phone or password"
- **Side Effects**: Saves user to `@MeMoney:currentUser` storage

### authService.getCurrentUser()
- **Input**: None
- **Output**: `User | null`
- **Purpose**: Check if user is already logged in

### authService.logout()
- **Input**: None
- **Output**: Promise<void>
- **Side Effects**: Removes `@MeMoney:currentUser` from storage

## Summary

✅ **Login validation is FULLY IMPLEMENTED**
- ✅ Checks credentials against AsyncStorage
- ✅ Only allows valid email/phone + password combinations
- ✅ Saves current session to storage
- ✅ Routes to dashboard on success
- ✅ Shows error messages on failure
- ✅ Persists session across app restarts
