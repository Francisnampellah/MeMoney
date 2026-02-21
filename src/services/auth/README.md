# Authentication Service

Comprehensive authentication system with local storage persistence for user credentials and data.

## Features

- **User Registration**: Create new user accounts with validation
- **User Login**: Authenticate users with email/phone and password
- **Persistent Storage**: All user data and auth state are saved to AsyncStorage
- **Session Management**: Automatic session handling on app start
- **Logout**: Clear user session and return to login

## Services

### `authService`

The core service for authentication operations.

#### Methods:

**`register(fullName, email, phone, password): Promise<User>`**
- Register a new user
- Validates unique email and phone
- Stores password (unencrypted - should be hashed in production)
- Returns user object without password

**`login(emailOrPhone, password): Promise<User>`**
- Authenticate user with email/phone and password
- Saves current user to AsyncStorage
- Returns authenticated user

**`getCurrentUser(): Promise<User | null>`**
- Get the currently logged-in user
- Returns null if no user is logged in

**`logout(): Promise<void>`**
- Clear the current user session

**`updateUser(userId, updates): Promise<User>`**
- Update user profile information
- Updates both storage and current user session if applicable

**`getAllUsers(): Promise<StoredUser[]>`**
- Get all registered users (for testing)

**`clearAllUsers(): Promise<void>`**
- Clear all users and sessions (for testing/debugging)

## Usage Examples

### Register a New User

```tsx
import { authService } from '../../services/auth';

try {
  const user = await authService.register(
    'John Doe',
    'john@example.com',
    '+254712345678',
    'SecurePassword123'
  );
  console.log('User created:', user);
} catch (error) {
  console.error('Registration error:', error.message);
}
```

### Login User

```tsx
try {
  const user = await authService.login('john@example.com', 'SecurePassword123');
  console.log('Logged in as:', user.fullName);
} catch (error) {
  console.error('Login error:', error.message);
}
```

### Check Current User

```tsx
const user = await authService.getCurrentUser();
if (user) {
  console.log('User is logged in:', user.fullName);
} else {
  console.log('No user logged in');
}
```

### Logout

```tsx
await authService.logout();
console.log('User logged out');
```

## Using the Custom Hook

```tsx
import { useAuth } from '../../services/auth';

function MyComponent() {
  const { user, loading, error, login, register, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <View>
      {user && <Text>Welcome, {user.fullName}!</Text>}
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      {loading && <ActivityIndicator />}
    </View>
  );
}
```

## Usage in App Navigation

The App.tsx automatically:
1. Checks for current user on startup
2. Routes to Auth screens if no user
3. Routes to Main app screens if user is logged in
4. Updates login state when user registers/logs in
5. Logs out when user clicks logout button

## Data Persistence

All data is stored in AsyncStorage under these keys:
- `@MeMoney:users` - Array of all registered users
- `@MeMoney:currentUser` - Currently logged-in user

## Security Notes

⚠️ **Important**: This implementation stores passwords in plain text. For production:
1. Hash passwords using bcrypt or similar
2. Use secure backend authentication
3. Implement token-based auth (JWT)
4. Use HTTPS for all network calls
5. Implement refresh token rotation

## Types

```tsx
interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
}

interface StoredUser extends User {
  password: string;
}
```

## Testing

### Pre-populated Users (for testing)

You can manually add test users:

```tsx
import { authService } from '../../services/auth';

// Add test user
await authService.register(
  'Test User',
  'test@example.com',
  '+254700000000',
  'password123'
);

// Login with test account
await authService.login('test@example.com', 'password123');
```

### Clear All Data

```tsx
// Clear all users and sessions
await authService.clearAllUsers();
```

## Integration Notes

- The auth service integrates seamlessly with the Header ProfileModal
- Logout from profile modal triggers auth state update
- Navigation automatically switches between Auth and Main stacks
- Session persists across app restarts
