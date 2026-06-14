# Agent Execution Rules & Quality Gates

This document defines the constraints, quality gates, and workflow guidelines that automated agents (like Antigravity / Claude Code / Fable 5) must follow when operating on this workspace.

---

## 🔄 Agent Loop Workflow

1. **Read Persistent Context**: Before starting any task, the agent must check:
   - [VISION.md](file:///d:/Dev%20Igor/VENECO%20Tienda/docs/VISION.md) to understand overall goals.
   - [ARCHITECTURE.md](file:///d:/Dev%20Igor/VENECO%20Tienda/docs/ARCHITECTURE.md) to understand current code structures and dependencies.
   - [MEMORY.md](file:///d:/Dev%20Igor/VENECO%20Tienda/MEMORY.md) to see details of past attempts, confirmed facts, and lessons learned.
2. **Execute Cycle**: Perform code adjustments, refactors, or new feature additions in small, self-contained iterations.
3. **Validate Gates**: Test changes using the Quality Gates defined below.
4. **Update Memory**: Write results of successful or failed cycles directly to [MEMORY.md](file:///d:/Dev%20Igor/VENECO%20Tienda/MEMORY.md). Do not repeat failed experiments.
5. **No Modifications to Internal Configs**: Never modify configuration files in `.antigravity/` or `.claudecode/` unless explicitly instructed by the user.

---

## 🛡️ Quality Gates (Quality Verification)

For a loop iteration to be marked as successful, it must pass the following validation commands:

1. **Linter Gate**:
   - Command: `npm run lint`
   - Requirement: Must return code `0` with zero errors and warnings.
2. **Build Gate**:
   - Command: `npm run build`
   - Requirement: Must successfully generate Prisma clients and build the Next.js bundle without compilation errors.
3. **Code Style Conventions**:
   - Avoid Tailwind CSS additions unless Tailwind is explicitly active and required in the UI page file. Prefer Vanilla CSS (`src/app/globals.css` or CSS Modules).
   - Maintain Next.js 16.x and React 19.x patterns. Ensure compatibility with the newer Next.js APIs (App Router, dynamic parameters).
   - Cookies must always be set with modern security flags: `HttpOnly; Secure; SameSite=Strict`.
