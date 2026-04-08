# Agent Guidelines

## General Rules

- **Always use the latest stable version** of all tools and dependencies (Node.js, npm packages, frameworks, etc.)
- When updating dependencies, prefer `npm-check-updates` or similar tools to identify outdated packages

## Monorepo Conventions

- Use npm workspaces (`workspaces` in package.json)
- Use Turborepo for task orchestration
- Each app/package should have its own `package.json`
- Shared code goes in `packages/`, applications in `apps/`

## Code Style

- TypeScript everywhere (unless explicitly asked otherwise)
- ESLint + Prettier for code quality
- Jest for testing
- Follow existing conventions in the codebase
