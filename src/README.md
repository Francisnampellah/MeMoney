# MeMoney - Feature-Based Architecture

## Folder Structure

```
src/
├── features/           # Feature modules (UI screens and logic)
│   ├── transactions/   # Transaction management feature
│   ├── dashboard/      # Dashboard/home screen feature
│   └── ...            # Other UI features
├── services/          # Cross-cutting services (reusable logic)
│   ├── sms/           # SMS reading and permission service
│   └── ...            # Other services (auth, api, storage, etc)
├── shared/            # Shared across all features
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   ├── types/         # Shared TypeScript types
│   └── constants/     # App-wide constants
├── navigation/        # Navigation setup and types
├── config/            # App configuration
└── README.md
```

## Service Module Structure

Services handle business logic and cross-cutting concerns (e.g., `src/services/sms`):

```
services/sms/
├── service.ts         # Main service implementation
├── useSmsPermission.ts # React hook for permission management
└── index.ts           # Public exports
```

## Feature Module Structure

Features handle UI and feature-specific logic (e.g., `src/features/transactions`):

```
features/transactions/
├── screens/          # React components for screens
├── components/       # Feature-specific components
├── service.ts        # Feature-specific business logic
├── types.ts          # Feature-specific types
├── hooks.ts          # Feature-specific hooks (optional)
└── index.ts          # Public exports
```

## Architecture Guidelines

### Services (`src/services/`)
- **Purpose**: Reusable business logic and utilities used across multiple features
- **Examples**: SMS reading, API calls, authentication, storage, permissions
- **Independence**: Services should NOT depend on features
- **Exports**: Services expose clean, feature-agnostic APIs

### Features (`src/features/`)
- **Purpose**: Complete feature implementations with UI and business logic
- **Examples**: Transactions, Dashboard, Settings screens
- **Composition**: Can use services and shared components
- **Isolation**: Keep feature-specific logic within the feature folder
- **Exports**: Features export screens and components

### Shared (`src/shared/`)
- **Purpose**: Code shared across all features and services
- **Contents**: Generic components, hooks, utilities, types, constants
- **Independence**: Should NOT import from features or services

## Dependency Flow

```
App → Features → Services → Shared
              ↓
           Shared
```

- Features can import from Services and Shared
- Services can import from Shared only
- Shared cannot import from Features or Services
- No circular dependencies

## Adding New Code

1. **Need to reuse logic across features?** → Create a service in `src/services/`
2. **Need a feature-specific component?** → Create in `src/features/YourFeature/`
3. **Need a shared component?** → Create in `src/shared/components/`
4. **Need a utility function?** → Create in `src/shared/utils/`
5. **Need shared types?** → Create in `src/shared/types/`
