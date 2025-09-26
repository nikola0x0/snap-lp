# Code Style and Conventions for snap-lp

## Code Quality Tools
- **Primary Tool**: Biome (replaces ESLint + Prettier)
- **Configuration**: `biome.json` with React and Next.js recommended rules
- **Git Integration**: Enabled with VCS hooks

## Formatting Standards

### Indentation
- **Style**: Spaces (not tabs)
- **Width**: 2 spaces per indentation level

### Code Organization
- **Import Organization**: Automatically handled by Biome
- **Unknown File Types**: Ignored by default
- **File Includes**: All files except `node_modules`, `.next`, `dist`, `build`

## TypeScript Conventions

### Configuration
- **Strict Mode**: Enabled (`"strict": true`)
- **Target**: ES2017
- **Module System**: ESNext with bundler resolution
- **JSX**: Preserve (handled by Next.js)

### Path Aliases
- **Alias**: `@/*` maps to `./src/*`
- **Usage**: `import Component from '@/components/Component'`

### Type Safety
- **No Emit**: TypeScript used only for type checking
- **Skip Lib Check**: Enabled for performance
- **Isolated Modules**: Required for bundler compatibility

## React/Next.js Conventions

### File Structure (App Router)
- **Route Files**: `page.tsx` for route components
- **Layout Files**: `layout.tsx` for layout components
- **Global Styles**: `globals.css` in app directory
- **Component Location**: Co-located with pages or in `src/components/`

### Component Patterns
- **Default Exports**: Used for page components
- **Named Exports**: For utility functions and constants
- **Async Components**: Server components by default in App Router

## Styling Conventions

### Tailwind CSS v4
- **Configuration**: Inline in CSS files (no separate config file)
- **Dark Mode**: CSS-based using `prefers-color-scheme: dark`
- **Custom Properties**: Defined in `globals.css`

### CSS Structure
```css
/* Custom properties for theming */
:root {
  --foreground: value;
  --background: value;
}

/* Dark mode variants */
@media (prefers-color-scheme: dark) {
  :root {
    /* Dark theme values */
  }
}
```

## Font Management
- **Font System**: next/font for optimization
- **Primary Font**: Geist Sans
- **Monospace Font**: Geist Mono
- **Implementation**: CSS variables passed from layout

## Biome Rules Applied
- **Recommended**: All recommended rules enabled
- **React Domain**: React-specific rules enabled
- **Next.js Domain**: Next.js-specific rules enabled
- **Suspicious Rules**: `noUnknownAtRules` disabled for Tailwind compatibility

## File Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Pages**: lowercase with hyphens (e.g., `user-profile/page.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

## Import/Export Patterns
- **Relative Imports**: Use `@/` alias for src directory
- **External Dependencies**: Import from node_modules normally
- **Type Imports**: Use `import type` for type-only imports when needed