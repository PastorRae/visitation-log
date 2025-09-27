# Copilot Instructions for Visitation Dashboard

## Project Overview
- **Purpose:** Mobile-first, offline-first app for pastors to log visits, follow-ups, and reports. Designed for the East Caribbean Conference (Barbados).
- **Tech Stack:** Expo (React Native + Web), TypeScript, SQLite (expo-sqlite), Zustand (state), React Navigation, Expo Location/Network/LocalAuthentication/SecureStore.

## Architecture & Data Flow
- **Offline-first:** All CRUD operations work offline. Unsynced records (`synced=0`) are queued and auto-synced when online. Manual sync is available in Settings.
- **State Management:** Use Zustand (`src/state/store.ts`).
- **Database:** Local SQLite via `src/db/db.ts`. Tables: `churches`, `members`, `visits`, `followups`. Enums for visit types, categories, priorities.
- **Navigation:** Managed in `src/navigation/index.tsx`.
- **Screens:** Main UI in `src/screens/`. Dashboard, Visit Logging, Visit Management, Reporting, Settings.
- **Security:** Biometric unlock (Expo LocalAuthentication), SecureStore for tokens, session timeout placeholder.

## Developer Workflows
- **Install:** `npm i`
- **Start:** `npm run start`
- **Platforms:** `npm run ios` / `npm run android` / `npm run web`
- **DB Schema:** First run auto-creates SQLite tables.
- **Sync:** Auto-sync on connectivity; manual sync via Settings.

## Project-Specific Patterns
- **Visit Logging:** Quick entry (member, type, category, comments), detailed entry (duration, scripture, prayer, resources, follow-up).
- **Reporting:** Simple counters (month totals, weekly averages).
- **Follow-ups:** Overdue badge on dashboard, follow-up scheduling in visit details.
- **Accessibility:** WCAG 2.1 AA, dynamic text, screen reader labels, high-contrast palette.
- **Integrations:** WhatsApp deep link, Maps deep link, Google Calendar placeholder.
- **Barbados Adaptations:** WhatsApp-first, SMS fallback, English baseline, Creole i18n placeholder.

## Conventions & Examples
- **Enums:** Use enums for visit types, categories, priorities (see README.md and `src/types.ts`).
- **Sync Flag:** All records have `synced` field; set to `0` for unsynced, update on successful sync.
- **Conflict Policy:** Latest `updated_at` wins (extend server-side).
- **Component Structure:** UI components in `src/components/`, screens in `src/screens/`.

## Key Files
- `src/db/db.ts`: SQLite schema and DB logic
- `src/state/store.ts`: Zustand state management
- `src/screens/`: Main UI screens
- `src/components/VisitCard.tsx`: Visit display pattern
- `src/types.ts`: Data types and enums
- `README.md`: Architecture, workflows, conventions

## Metrics Targets
- <3s launch (cached)
- <30s visit logging flow
- Sync <10s typical
- Crash <1%
- Sync success 99.5%

---

**Feedback:** If any section is unclear or missing, please specify so it can be improved for future AI agents.
