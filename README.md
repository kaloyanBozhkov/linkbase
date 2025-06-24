# Linkbase - Personal Connection Database

A simple but elegant app that lets you manage your personal connections with information about where and when you met them, their social handles, and interesting facts about them.

## Features

- Add connections with name, Instagram handle, meeting location, and personal facts
- Automatic timestamp when connections are added
- Search connections by name, facts, or meeting location
- Instagram handle links directly to their profile
- Beautiful, modern UI following atomic design principles
- Local data storage with PostgreSQL backend

## Tech Stack

### Backend

- **Node.js** with **Express** - REST API server
- **TypeScript** - Type safety and better development experience
- **Prisma** - Database ORM with PostgreSQL
- **Zod** - Runtime type validation
- **CORS, Helmet** - Security middleware

### Mobile App

- **React Native** - Cross-platform mobile development
- **TypeScript** - Type safety
- **NativeWind** - Tailwind CSS for React Native
- **Zustand** - State management
- **Axios** - HTTP client for API calls
- **React Navigation** - Navigation between screens

## Project Structure

```
linkbase/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── queries/        # Request handlers organized by feature
│   │   │   └── connections/ # Connection-specific query handlers
│   │   ├── services/       # Business logic layer
│   │   ├── router/         # Express route definitions
│   │   └── helpers/        # Utility functions, validation, and logging
│   ├── prisma/             # Database schema and migrations
│   └── package.json
├── app/                    # React Native mobile app
│   ├── src/
│   │   ├── components/     # UI components (Atomic Design)
│   │   │   ├── atoms/      # Basic UI elements
│   │   │   ├── molecules/  # Component compositions
│   │   │   ├── organisms/  # Complex UI sections
│   │   │   └── layouts/    # Page layouts
│   │   ├── pages/          # Screen components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API and external services
│   │   └── helpers/        # Utility functions
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- React Native development environment
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your PostgreSQL connection string. The backend uses `@t3-oss/env-core` for type-safe environment variable validation:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/linkbase?schema=public"
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:8081
   ```

4. Generate Prisma client and run migrations:

   ```bash
   pnpm run db:generate
   pnpm run db:push
   ```

5. Start the development server:
   ```bash
   pnpm run dev
   ```

The API will be available at `http://localhost:3000`

### Mobile App Setup

1. Navigate to the app directory:

   ```bash
   cd app
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. For iOS (macOS only):

   ```bash
   cd ios && pod install && cd ..
   pnpm run ios
   ```

4. For Android:
   ```bash
   pnpm run android
   ```

## API Endpoints

### Connections

- `GET /api/connections` - Get all connections (with pagination)
- `GET /api/connections/search?query=term` - Search connections
- `GET /api/connections/:id` - Get connection by ID
- `POST /api/connections` - Create new connection
- `PUT /api/connections/:id` - Update connection
- `DELETE /api/connections/:id` - Delete connection

### Health Check

- `GET /health` - API health status

## Database Schema

### Connection Model

```typescript
{
  id: string          // Unique identifier
  name: string        // Person's name
  igHandle?: string   // Instagram handle (optional)
  igUrl?: string      // Auto-generated Instagram URL
  metAt: string       // Where you met them
  metWhen: Date       // When you met (auto-generated)
  facts: string[]     // Array of facts about them
  createdAt: Date     // Record creation timestamp
  updatedAt: Date     // Last update timestamp
}
```

## Mobile App Screens

1. **Home Screen** - List all connections with search functionality
2. **Add Connection** - Form to create new connections
3. **Connection Detail** - View full connection information
4. **Edit Connection** - Update existing connection information

## Development Guidelines

### Atomic Design Pattern

The frontend follows the Atomic Design methodology:

- **Atoms**: Basic UI elements (Button, Input, Text)
- **Molecules**: Simple component groups (ConnectionCard, SearchBar)
- **Organisms**: Complex UI sections (ConnectionList, Form)
- **Layouts**: Page-level components (Screen layouts)
- **Pages**: Complete screens (HomeScreen, AddConnectionScreen)

### State Management

- **Zustand** store for global app state
- Local component state for form inputs and UI state
- API layer abstraction for data fetching

### Code Organization

- **Separation of Concerns**: Clear separation between HTTP handling (routes) and data operations (queries)
- **Feature-based Structure**: Queries organized by domain (e.g., `/queries/connections/`)
- **Embedded Validation**: Each query has its own Zod schema for type-safe validation
- **Centralized Utilities**: Logging and helpers in dedicated modules

### Type Safety

- Full TypeScript coverage
- Zod schemas for API validation
- Type-safe environment variables with `@t3-oss/env-core`
- Shared types between frontend and backend

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
