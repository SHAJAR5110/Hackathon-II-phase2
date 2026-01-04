# Frontend - Todo Full-Stack Web Application

## Overview

Next.js 16+ frontend application with React 19+, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3+
- **Authentication**: Better Auth (JWT-based)
- **Icons**: Lucide React
- **State Management**: React hooks, Context API
- **HTTP Client**: Native fetch with centralized wrapper

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_SECRET=your-secret-key-here
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
npm run start
```

## Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Dashboard (task list)
│   ├── auth/
│   │   ├── signup/
│   │   │   └── page.tsx    # Signup page
│   │   └── signin/
│   │       └── page.tsx    # Signin page
│   └── middleware.ts        # Auth middleware
├── components/              # React components
│   ├── TaskList.tsx
│   ├── TaskItem.tsx
│   ├── TaskForm.tsx
│   ├── Header.tsx
│   ├── SignupForm.tsx
│   └── SigninForm.tsx
├── lib/                     # Utilities
│   ├── api.ts              # Centralized API client
│   └── auth.ts             # Better Auth integration
├── styles/
│   └── globals.css         # Global styles and Tailwind
└── CLAUDE.md               # Development guidelines
```

## Development Guidelines

See `CLAUDE.md` for detailed development patterns and best practices.

## Key Patterns

- Server Components by default; Client Components only for interactivity
- All API calls through `/lib/api.ts` (centralized)
- JWT attached automatically via Authorization header
- Tailwind CSS utilities only (no inline styles)
- TypeScript strict mode enabled

## Testing

```bash
npm run test        # Run component tests
npm run test:e2e    # Run E2E tests (optional)
```

## Deployment

This application is designed for deployment on Vercel or similar Next.js hosting platforms.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Better Auth Documentation](https://better-auth.com/docs)
