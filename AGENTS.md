# AGENTS.md - Coding Guidelines for Dev Tools Hub

This file provides essential information for AI agents working on this repository.

## Commands

### Build & Development
- `pnpm dev` - Start development server (http://localhost:3000)
- `pnpm build` - Production build
- `pnpm start` - Start production server

### Quality Assurance
- `pnpm lint` - Run ESLint (uses next/core-web-vitals + next/typescript)
- `pnpm test` - Run all tests with Vitest
- `pnpm test <pattern>` - Run single test file (e.g., `pnpm test password-utils.test.ts`)

### Database
- `pnpm prisma:generate` - Generate Prisma Client
- `pnpm prisma:migrate` - Apply database migrations (requires DATABASE_URL)

## Code Style Guidelines

### TypeScript
- **Strict mode enabled** - All types must be properly defined
- **Path alias**: `@/*` maps to `./src/*`
- **Types**: PascalCase (e.g., `RandomPasswordConfig`, `GeneratedPassword`)
- **Interfaces**: PascalCase for data structures (e.g., `ButtonProps`, `Tool`)
- **Functions**: camelCase (e.g., `generateRandomPassword`, `parseJsonWithLocation`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `UPPERCASE`, `DIGITS`, `EFF_WORDLIST`)
- **Type exports**: Export types and interfaces explicitly

### Imports
```typescript
// React hooks and types
import { useState, useCallback, useEffect } from "react";
import type { LucideIcon } from "lucide-react";

// Internal components
import { Button } from "@/components/ui/button";
import { PasswordConfig } from "@/components/password/password-config";

// Internal utilities
import { trackEvent } from "@/lib/analytics";
import {
  generateRandomPassword,
  DEFAULT_RANDOM_CONFIG,
} from "@/lib/password-utils";
```

### Components
- **Client components**: Add `"use client";` at the top
- **Function components only** - No class components
- **Props interface**: Define above component, using PascalCase
- **forwardRef**: Use for components that need ref forwarding
- **displayName**: Set for debugging (e.g., `Button.displayName = "Button";`)
- **Default exports**: For page components; named exports for utilities

### Styling (Tailwind CSS v4)
- **Color scheme**: slate (50-900) as neutral, blue-600 for primary actions
- **Class merging**: Use `cn()` from `@/lib/utils` for conditional classes
- **Responsive breakpoints**: `sm:` (640px), `lg:` (1024px)
- **Font sizes**: text-xs (12px), text-sm (14px), text-base (16px)
- **Spacing**: Tailwind scale (1 = 0.25rem, 4 = 1rem)

### File Organization
```
src/
├── app/                    # Next.js App Router pages
│   ├── <tool>/page.tsx    # Tool pages (client components)
│   └── api/               # API routes
├── components/
│   ├── ui/                # Reusable UI primitives (Button, Input, Card)
│   └── <tool>/            # Tool-specific components
├── lib/                   # Pure functions, utilities
│   ├── <tool>-utils.ts    # Tool logic (exported, tested)
│   └── <tool>-utils.test.ts
└── config/                # Configuration files
    └── tools.ts          # Tool registry
```

### Error Handling
- **Utility functions**: Return result objects with `ok: true/false` pattern or throw
- **Components**: Show non-blocking errors (toasts, inline messages)
- **Validation**: Validate inputs before processing, provide helpful error messages
- **No alert()**: Use UI feedback instead

### Testing (Vitest)
- **Test file**: Co-located with source (e.g., `password-utils.test.ts`)
- **Structure**: `describe()` blocks for test suites, `it()` for individual tests
- **Coverage**: Test normal paths, edge cases, and error scenarios
- **Assertions**: Use `expect()` from Vitest globals (enabled in vitest.config.ts)
- **No external dependencies**: Tests should run without database/network

### Page Structure (Tool Pages)
- **Two-column layout** (desktop) / stacked (mobile):
  - Left: Configuration/Inputs
  - Right: Results/Outputs
- **Header**: Title + description + keyboard shortcut hint
- **Keyboard shortcut**: Cmd/Ctrl + Enter for primary action
- **Analytics**: Track `tool_open` on mount, action events on user interaction
- **Accessibility**: Aria labels, keyboard navigation, focus states

### Naming Conventions
- **Tool IDs**: kebab-case (e.g., `password-generator`, `json-formatter`)
- **Component files**: kebab-case (e.g., `password-config.tsx`, `base64-textarea.tsx`)
- **Utility files**: kebab-case with `-utils` suffix (e.g., `password-utils.ts`)
- **Directories**: kebab-case (e.g., `src/components/qrcode/`)
- **Test files**: Same name as source with `.test.ts` extension

### Comments & Documentation
- **File header**: Brief description of module purpose
- **Complex functions**: JSDoc comments for public APIs (`@param`, `@returns`)
- **Section separators**: `// ====` for logical divisions
- **No inline comments**: Code should be self-explanatory
- **No TODO comments**: Use feature_list.json for tracking

### Security
- **No secrets**: Never commit API keys, passwords, or sensitive data
- **Input validation**: Validate all user inputs before processing
- **CSP**: Use Content Security Policy headers (configured in Next.js)
- **Rate limiting**: Apply to public APIs (see api-security.ts)

## Adding a New Tool

1. **Create utilities**: `src/lib/<tool>-utils.ts` + tests
2. **Create components**: `src/components/<tool>/` directory
3. **Create page**: `src/app/<tool>/page.tsx`
4. **Register tool**: Add to `src/config/tools.ts`
5. **Add to feature_list.json**: Plan implementation steps
6. **Add analytics**: Track `tool_open` and action events

## Common Patterns

### Result Object Pattern
```typescript
export interface Success<T> {
  ok: true;
  value: T;
}

export interface Failure {
  ok: false;
  error: { message: string; location?: ErrorLocation };
}

export type Result<T> = Success<T> | Failure;
```

### Config Object Pattern
```typescript
export interface Config {
  length: number;
  mode: "option1" | "option2";
  // ...options
}

export const DEFAULT_CONFIG: Config = {
  length: 16,
  mode: "option1",
};
```

### Component Props Pattern
```typescript
export interface Props {
  /** Prop description */
  value: string;
  /** Callback description */
  onChange: (value: string) => void;
}
```

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required for analytics)
- `ADMIN_DASHBOARD_PASSWORD` - Admin page password (required for /admin/analytics)

## Database Schema
- Uses Prisma ORM
- Schema defined in `prisma/schema.prisma`
- Main tables: `analytics_events` (tracking), `tool_usage_daily` (aggregates)
- Run migrations after schema changes: `pnpm prisma:migrate`

## Testing Checklist
- [ ] Unit tests for all utility functions
- [ ] Test normal cases, edge cases, and errors
- [ ] Integration tests for API routes (if applicable)
- [ ] No external dependencies in tests (mock network/database)
- [ ] Run `pnpm test` before committing

## Linting Checklist
- [ ] Run `pnpm lint` before committing
- [ ] Fix all linting errors
- [ ] Use TypeScript strict mode (no `any` types)
- [ ] Ensure all imports resolve correctly
