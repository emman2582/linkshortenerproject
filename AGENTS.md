<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Instructions

> [!CAUTION]
> **You MUST read the relevant `/docs` file(s) BEFORE writing a single line of code.** No exceptions. Generating code without first consulting the applicable documentation is strictly forbidden. Violating this rule will produce incorrect, non-compliant output.

All coding standards for this project are documented in the `/docs` directory. Every file in that directory contains mandatory, authoritative instructions. You are required to read and fully apply the contents of every relevant file before generating any code, making any edits, or suggesting any implementation.

| File | Topic | When to read |
|---|---|---|
| `/docs/auth.md` | Authentication — Clerk only, protected routes, auth patterns, modal sign-in/sign-up | Before ANY auth-related code |
| `/docs/ui.md` | UI components — shadcn/ui only, component installation and implementation patterns, no custom components | Before ANY UI-related code |

**If the task touches auth or UI in any way — read the corresponding file first. Always.**
