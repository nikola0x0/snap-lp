# Suggested Commands for snap-lp

## Core Development Commands

### Development Server
```bash
# Start development server (runs on http://localhost:3000)
npm run dev
```

### Build and Production
```bash
# Build for production
npm run build

# Start production server (must run build first)
npm run start
```

## Code Quality Commands

### Linting and Formatting
```bash
# Run Biome linter and formatter checks
npm run lint

# Auto-format code with Biome
npm run format
```

## System Commands (macOS/Darwin)

### File Operations
```bash
# List files and directories
ls -la

# Find files by name
find . -name "*.tsx" -type f

# Search in files (using ripgrep if available, otherwise grep)
grep -r "pattern" src/
```

### Git Operations
```bash
# Check git status
git status

# Add files to staging
git add .

# Commit changes
git commit -m "commit message"

# View git log
git log --oneline
```

### Directory Navigation
```bash
# Change directory
cd path/to/directory

# Show current directory
pwd

# Create directory
mkdir new-directory
```

## Development Workflow Commands

### Adding New Routes (App Router)
```bash
# Create a new route at /about
mkdir src/app/about
touch src/app/about/page.tsx
```

### Package Management
```bash
# Install dependencies
npm install

# Install a new package
npm install package-name

# Install dev dependency
npm install -D package-name

# Update packages
npm update
```

## Debugging Commands

### TypeScript
```bash
# Check TypeScript types (if tsc is available)
npx tsc --noEmit

# Check Next.js configuration
npm run build --dry-run
```

### Development Info
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# View package.json scripts
npm run
```