# Project Context (Human-maintained)

<!-- This file is never overwritten by AI Agentic Rules -->
<!-- Add your project-specific context, guidance, and rules here -->

## Project Overview

This is a sample repository demonstrating the AI Agentic Rules composition structure.

## Project-Specific Rules

### Frontend
- Use Next.js App Router (even with Bun-first profile)
- Prefer shadcn/ui components
- Use Tailwind CSS for styling

### Backend
- Use `Bun.serve()` for HTTP servers
- Prefer `bun:sqlite` for SQLite databases
- Use Zod for runtime validation

### Testing
- Use `bun test` for all tests
- Aim for >80% coverage on new features

## Domain-Specific Rules

### `frontend/` directory
- All components must be TypeScript
- Use React Server Components where possible
- Accessibility is mandatory (WCAG 2.1 AA minimum)

### `api/` directory
- All endpoints must validate input with Zod schemas
- Errors must be structured and include correlation IDs
- Rate limiting required for public endpoints

## Team Guidelines

- Code reviews are required for all changes
- All PRs must pass CI checks before merging
- Use conventional commit messages

---

*Edit this file to add project-specific context. AI Agentic Rules will never overwrite it.*
