# AI Help Desk Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing AI Help Desk widget available throughout the sticker album app and connect it to the local Gemini backend.

**Architecture:** Render the widget once at the app root so it floats above every tab and modal. Pass the app language into the widget, use Vite’s `/api` proxy for local development, and normalize backend language values so both `BS`/`EN` and `bs`/`en` work.

**Tech Stack:** React 19, TypeScript, Vite, Express, Gemini REST API.

---

### Task 1: Integrate the widget into the app shell

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/AIHelpDeskWidget/AIHelpDeskWidget.tsx`

- [x] Import `AIHelpDeskWidget` in `App.tsx` and render it once near the root closing element.
- [x] Add an optional `lang` prop to the widget and use it as the preferred request language, while retaining text detection for users who switch languages mid-conversation.

### Task 2: Connect local frontend and backend development

**Files:**
- Modify: `vite.config.mjs`
- Modify: `src/server.js`

- [x] Proxy `/api` requests from Vite port 3000 to the Express server on port 3001.
- [x] Normalize language values case-insensitively and accept the app’s `BS`/`EN` values.
- [x] Keep the Gemini key server-only and return safe JSON errors.

### Task 3: Verify the integration

**Files:**
- No new test files; use existing project checks.

- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [x] Confirm the widget import, `/api/ai` proxy, and backend language mapping are present with `rg`.
