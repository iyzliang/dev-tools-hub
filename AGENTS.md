# AGENTS.MD - Dev Tools Hub Agent Configuration

## Build/Lint/Test Commands

### Project Setup
```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma:generate

# Run database migrations (requires DATABASE_URL configured)
pnpm prisma:migrate
```

### Development
```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server (requires prior build)
pnpm start
```

### Code Quality
```bash
# Run ESLint check
pnpm lint

# Run all tests
pnpm test

# Run a specific test file
pnpm test path/to/test/file.test.ts

# Run tests in watch mode
pnpm test --watch

# Run specific test with pattern
pnpm test --run --reporter=verbose 'path/to/specify/test'

# Coverage report
pnpm test -- --coverage
```

## Environment Configuration
```bash
# Required for database features:
# Add DATABASE_URL to .env file
DATABASE_URL="postgresql://user:pass@localhost:5432/devtools"

# Required for admin dashboard:
ADMIN_DASHBOARD_PASSWORD="your-secret-password"
```

## Code Style Guidelines

### TypeScript/JavaScript Style

#### Imports
- Use absolute imports with `@/*` alias for paths starting from `src/`:
```typescript
import { SomeComponent } from '@/components/SomeComponent';
import { someUtil } from '@/lib/utils';
```
- Organize imports in the following order:
  1. External packages (React, Next.js, etc.)
  2. Internal lib (`@/lib/`)
  3. Components (`@/components/`)
  4. Config/Context (`@/config/`, `@/contexts/`)
  5. Local files (`./` or `../`)

#### File Naming & Structure
- Use PascalCase for React components (`JsonFormatter.tsx`)
- Use camelCase for utility functions (`formatJson.ts`)
- Use kebab-case for route segments and static assets
- Place tests adjacent to the code: `Component.tsx` alongside `Component.test.tsx`

#### Types & Interfaces
- Define types at the top of the file or in centralized `types/` directory
- Use TypeScript strict mode (configured in `tsconfig.json`)
- Prefer `interface` over `type` for object shapes
- Add JSDoc comments for exported functions/components when not obvious

### React/Next.js Patterns

#### Component Pattern
- Use Next.js App Router (files in `app/` directory)
- Create self-contained components with minimal external dependencies
- Use client components (`'use client'`) when needed for interactivity
- Leverage Next.js built-in features (`next/link`, `next/image`, etc.)

#### Error Handling
- Handle errors gracefully with user-friendly messages
- Log errors appropriately:
  - Use `console.error` for debugging in development
  - Avoid logging sensitive information
  - Consider using Sentry for production error tracking (future)

#### Performance
- Use React.memo for components that render frequently with same props
- Lazy-load heavy components (especially those behind modals/routes)
- Preload critical imports when possible
- Optimize images and static assets

### Styling Convention (Tailwind CSS v4)

#### Structure
- Use Tailwind v4 utility classes primarily
- Leverage design system from spec (colors, spacing, typography)
- Apply consistent border-radius (4px/8px/12px)
- Use consistent shadows and transitions

#### Responsive Design
- Mobile-first approach
- Use mobile (< 768px), tablet (768px-1024px), desktop (≥ 1024px) breakpoints
- For JSON tools: mobile=vertical stacking, desktop=dual columns

#### Naming Conventions
- Utility classes: follow Tailwind v4 naming convention (e.g., `bg-gray-100`, `p-4`)
- Custom CSS: use BEM methodology if extending Tailwind
- Color palette: use semantic naming where possible (primary, secondary, success, etc.)

### Error Handling
- Validate inputs early with explicit error messaging
- Use React Error Boundaries for unexpected errors (optional)
- Frontend: Use toast notifications for minor issues, inline errors for forms
- Backend API: Return descriptive error messages in JSON format

### Naming Conventions
- **Components**: PascalCase (`JsonValidator`, `AnalyticsDashboard`)
- **Functions**: camelCase (`formatJson`, `validateInput`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_INPUT_LENGTH`, `DEFAULT_TIMEOUT`)
- **Files**: lowercase with hyphens for route segments (`json-formatter/page.tsx`)
- **Variables**: camelCase (`anonymousId`, `jsonData`)

### Database/Prisma Conventions
- Use snake_case for database column names
- Use camelCase for TypeScript variable names
- Follow established schema from project spec
- Always validate user inputs before database operations

### Testing Guidelines
- Write unit tests for pure functions and utility modules
- Write integration tests for API routes (`app/api/**/route.ts`)
- Test major interaction flows (JSON formatting, error handling, analytics tracking)
- Use vitest for unit/integration tests
- Consider implementing E2E tests for critical user journeys
- Mock external dependencies when testing

### Security Practices
- Sanitize user inputs (especially for JSON parsing/validation)
- Never log sensitive information like passwords or API keys
- Validate content length to prevent memory abuse
- Use environment variables for secrets (never hardcode)
- Implement rate limiting on API endpoints (future consideration)

### Analytics Tracking (as per spec)
- Generate/restore `anonymous_id` using `crypto.randomUUID()` stored in localStorage
- Track key events: `page_view`, `json_format`, `json_minify`, `json_error`, `copy_result`
- Do not store complete JSON content in analytics events only metadata
- Batch events where appropriate to reduce API calls

### Component Design Principles (from Design System spec)
- Primary color: #2563EB (blue), Secondary: #10B981 (green)
- Background: Light mode #F3F4F6, Text: Primary #111827, Secondary #4B5563
- Typography: Geist Sans primary font, monospace for code areas
- Spacing based on 4px scale: xs(4px), sm(8px), md(12px), lg(16px), xl(24px)
- Border radius: Small(4px), Medium(8px), Large(12px)
- Buttons: Primary=blue filled, Secondary=gray outline
- Maintain 4.5:1 contrast ratio minimum

### Performance & Accessibility
- All interactive elements must be keyboard accessible
- Include proper ARIA attributes for complex components
- Use semantic HTML elements where appropriate
- Optimize bundle size by code-splitting large components
- Maintain fast loading times, especially for core functionality

### Special Considerations for JSON Tool
- Parse JSON on the client side primarily for privacy/security
- Handle large JSON inputs gracefully with size limits
- Show clear error messages indicating parse errors
- Support both pretty formatting and minification
- Implement proper copy functionality to clipboard