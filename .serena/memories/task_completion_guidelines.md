# Task Completion Guidelines for snap-lp

## Required Commands After Code Changes

### Code Quality Checks (MANDATORY)
```bash
# Run Biome linter and formatter checks
npm run lint

# Auto-format code (if lint finds issues)
npm run format
```

### Build Verification
```bash
# Verify production build works
npm run build
```

### Development Testing
```bash
# Start development server to test changes
npm run dev
# Then visit http://localhost:3000 to verify functionality
```

## Pre-Commit Checklist

### 1. Code Quality
- [ ] Run `npm run lint` - must pass with no errors
- [ ] Run `npm run format` - to ensure consistent formatting
- [ ] Verify TypeScript types compile without errors

### 2. Functionality
- [ ] Test changes in development mode (`npm run dev`)
- [ ] Verify production build works (`npm run build`)
- [ ] Check that hot reload works for modified files

### 3. File Organization
- [ ] Ensure imports use `@/` alias where appropriate
- [ ] Verify new files follow naming conventions
- [ ] Check that components are properly typed

## Testing Strategy

### Manual Testing
- **Development Mode**: Always test changes with `npm run dev`
- **Production Build**: Run `npm run build` to catch build-time issues
- **Browser Testing**: Visit http://localhost:3000 to verify UI changes
- **Hot Reload**: Verify file changes trigger proper reloading

### Automated Checks
- **Biome Linting**: Catches code quality issues and enforces style
- **TypeScript**: Provides compile-time type checking
- **Next.js Build**: Validates App Router structure and optimizations

## Common Issues to Check

### TypeScript Issues
- Missing type definitions for props
- Incorrect import paths (use `@/` alias)
- Unused imports (Biome will flag these)

### Next.js App Router Issues
- Missing `page.tsx` files in route directories
- Incorrect export patterns (default vs named exports)
- Client/Server component mixing issues

### Styling Issues
- Tailwind classes not applying (check PostCSS configuration)
- Dark mode not working (verify CSS custom properties)
- Font loading issues (check Geist font variables)

## Git Workflow

### Before Committing
1. Run all code quality checks
2. Test functionality manually
3. Verify build passes
4. Check git status for unintended changes

### Commit Message Format
Use conventional commits format:
- `feat:` for new features
- `fix:` for bug fixes
- `style:` for formatting changes
- `refactor:` for code restructuring
- `docs:` for documentation updates

## Performance Considerations

### Next.js Optimizations
- Verify images use `next/image` component
- Check for proper loading patterns
- Ensure proper SSR/CSR balance

### Bundle Size
- Monitor build output for bundle size warnings
- Use dynamic imports for large components when appropriate
- Verify tree-shaking works for unused imports

## Deployment Readiness

### Production Checklist
- [ ] `npm run build` completes successfully
- [ ] No console errors in production mode
- [ ] All routes accessible
- [ ] Fonts load correctly
- [ ] Dark/light mode works
- [ ] Responsive design functions properly