# Auth Feature

This folder contains all authentication-related screens for the MeMoney app.

## Screens

### 1. LoginScreen
The login screen where existing users can sign in with their email and password.

**Features:**
- Email and password inputs with icons
- Show/hide password toggle
- "Forgot Password?" link
- Sign in with phone option
- Loading state with activity indicator
- Error message display
- Responsive design matching app theme

**Usage:**
```tsx
import { LoginScreen } from '../features/auth';

<LoginScreen
  onNavigateToSignUp={() => navigation.navigate('SignUp')}
  onNavigateToForgotPassword={() => navigation.navigate('ForgotPassword')}
  onLoginSuccess={() => navigation.navigate('Home')}
/>
```

### 2. SignUpScreen
The registration screen for new users to create an account.

**Features:**
- Full name, email, phone, password inputs
- Password confirmation field
- Show/hide password toggles
- Terms & Conditions checkbox
- All inputs have icons
- Validation for password match and minimum length
- Error message display
- Link to login screen for existing users

**Usage:**
```tsx
import { SignUpScreen } from '../features/auth';

<SignUpScreen
  onNavigateToLogin={() => navigation.navigate('Login')}
  onSignUpSuccess={() => navigation.navigate('VerifyEmail')}
/>
```

### 3. ForgotPasswordScreen
A multi-step password recovery screen with 3 steps:
1. Enter email
2. Verify OTP
3. Set new password

**Features:**
- Step-based UI (email → OTP → password)
- Email verification
- OTP input (6-digit code)
- Password reset with confirmation
- Resend OTP option
- Loading states
- Error and success messages
- Back navigation between steps

**Usage:**
```tsx
import { ForgotPasswordScreen } from '../features/auth';

<ForgotPasswordScreen
  onNavigateToLogin={() => navigation.navigate('Login')}
  onResetSuccess={() => navigation.navigate('Login')}
/>
```

## Design System

All screens follow the MeMoney design system:

- **Background**: #F8F8F8 (Light Gray)
- **Primary Accent**: #C5FF00 (Lime)
- **Secondary**: #000000 (Black)
- **Borders**: Black borders (1px) on cards and inputs
- **Typography**: Bold, clean fonts with proper hierarchy
- **Button Radius**: 12px
- **Spacing**: Consistent 16px padding with 8-16px gaps

## Component Props

All screens accept callback props for navigation and success handlers, making them easy to integrate with navigation stacks.

### Error Handling
Each screen has error message containers that display validation errors and API failures with appropriate styling.

### Loading States
Buttons show loading indicators during async operations, and inputs are disabled while loading.

### Responsive Design
All screens are responsive and work on various screen sizes using flexbox layouts.
