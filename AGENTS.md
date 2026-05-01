# AGENTS.md

## 🧠 Project Overview
This is a community-driven sports app that allows users to:
- View live scores and game data
- See player stats and game leaders
- Follow teams and players
- Engage socially (comments, reactions, etc.)

Frontend:
- React Native (TypeScript)
- Expo
- Functional components + hooks

Backend:
- Node.js + Express
- ESPN API as primary data source
- Custom API layer for normalization + caching

---

## 🧱 Core Architecture Principles

### 1. Separation of Concerns
- UI components = presentation only
- Hooks = data fetching + state logic
- API layer = all external requests (no direct API calls in components)

### 2. Data Flow
ESPN API → Backend → Normalized Response → Frontend Hook → UI

Never fetch ESPN data directly in the frontend.

---

## 📡 API Rules

- All API calls go through `apiClient`
- Do not call external APIs directly from hooks/components
- Normalize all ESPN responses before returning to frontend

### Example shape:
```ts
{
  playerId: number;
  name: string;
  teamId: number;
  stats: {
    points?: number;
    assists?: number;
  };
}