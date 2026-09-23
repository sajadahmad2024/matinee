# Claude CLI Instructions

## Project Overview

This is a **Monorepo** containing multiple applications and shared libraries managed with **pnpm** workspaces.

## Development Guidelines

- **Package Management:** Use `pnpm` for all package management.
- **Port Conflict Resolution:** When multiple applications need to run simultaneously, follow these guidelines:
  - **Default Port Assignments:**
    - Backend (NestJS): Usually :3000 or :8000
    - Web (Next.js): Usually :3001 or :3000
    - Mobile (Expo): Usually :19000, :19001, :19002
    - Documentation: Usually :3002 or :8080
  - **Prevention:** Always check `apps/{APP_NAME}/README.md` for recommended port configurations.
- **Application-Specific Rules:** Each application has its own AI/development rules defined in `/apps/{APP_NAME}/AGENT.md`. These files contain markup language instructions for that specific app.
- **Documentation Standards:**
  - **Location**: `apps/documentation/docs/{APP-NAME}/`
  - **Format**: Markdown (`.md`) files
  - **Scope**: Document each significant activity, feature, or architectural change
  - **Updates**: Keep documentation current with code changes
  - **Requirement**: **ALWAYS** create comprehensive documentation in `apps/documentation/docs/` before implementing any significant feature or architectural change
- **Getting Started:** Refer to individual app README files for setup instructions, Located at `apps/{APP_NAME}/README.md`.
- **Module Development Workflow:**
  1. **Documentation First**: Create comprehensive documentation in `apps/documentation/docs/backend/{module-name}/` before any implementation
  2. **User Confirmation**: Get explicit approval from user before proceeding with implementation

## Claude CLI Context Management

### Context Updates Required

Always update this `claude.md` file when:

- Architecture changes occur
- New applications or libraries are added
- Development workflows change
- Directory structure modifications
- Configuration updates

### Best Practices

1. **Read First**: Always check `apps/{APP_NAME}/README.md` before working on an app.
2. **Follow Rules**: Respect the `.cursorrules` for each application.

## Error Handling & Troubleshooting Guidelines

### **CRITICAL: Proactive Error Resolution**

Claude should **ALWAYS** attempt to fix errors and try solutions automatically before reporting issues to the user.

---

*This file serves as the primary context for Claude CLI operations. Keep it updated with any architectural or workflow changes.*
