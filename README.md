# Visitation Dashboard (PastoralCarePro Component)

Executive Summary
- Mobile-first, offline-first component for pastors in the East Caribbean Conference (Barbados) to track visits, follow-ups, and reporting. Supports iOS 12+, Android 8+, and PWA via Expo.

Architecture
- Stack: Expo (React Native + Web), TypeScript, SQLite (expo-sqlite), Zustand (state), React Navigation, Expo Location/Network/LocalAuthentication/SecureStore.
- Offline-first: All CRUD works offline. Records are queued (synced=0) and auto-synced when connectivity is restored. Manual sync supported.
- Security: Biometric unlock, secure token storage, local DB at-rest encryption note (platform-dependent), session timeout placeholder.
- Integrations: WhatsApp (deep link), Maps (deep link), Google Calendar (placeholder), cloud sync API (placeholder).
- Accessibility: WCAG 2.1 AA targets, dynamic text sizes, screen reader labels, high-contrast friendly palette.

Core Data Structure (DB)
- Tables:
  - churches(id TEXT PK, name TEXT)
  - members(id TEXT PK, first_name TEXT, last_name TEXT, church_id TEXT, affiliation TEXT, discipleship_status TEXT)
  - visits(id TEXT PK, start_time INTEGER, end_time INTEGER, visit_date INTEGER, pastor_email TEXT, pastor_name TEXT, member_id TEXT, member_first TEXT, member_last TEXT, church_id TEXT, visit_type TEXT, category TEXT, comments TEXT, address TEXT, lat REAL, lng REAL, next_visit_date INTEGER, followup_actions TEXT, priority TEXT, scripture_refs TEXT, prayer_requests TEXT, resources TEXT, synced INTEGER DEFAULT 0, updated_at INTEGER)
  - followups(id TEXT PK, visit_id TEXT, due_date INTEGER, actions TEXT, priority TEXT, status TEXT, synced INTEGER DEFAULT 0, updated_at INTEGER)
- Enums:
  - Visit Types: in_person, phone, video, emergency, hospital, home, office
  - Categories: pastoral, crisis, discipleship, administrative, evangelism, conflict, celebration, bereavement
  - Priorities: critical, important, standard, routine, annual

Interface Requirements (Implemented in MVP)
- Dashboard:
  - Hero CTA: "Log New Visit"
  - Today’s visits
  - Overdue follow-ups count (badge)
  - Recent visits (7 days)
  - Sync status indicator
  - Church selector dropdown
- Visit Logging:
  - Quick Entry: member name, visit type buttons, category picker, comments (voice-to-text placeholder), quick save
  - Detailed: duration/scripture/prayer/resources/follow-up scheduling placeholders
- Visit Management:
  - List view, search/filter placeholders, color-coded priority, quick actions placeholders
- Reporting:
  - Simple counters: month totals, weekly averages placeholders

Offline & Sync
- Works offline: logs/edit queue stored locally (synced=0).
- Auto-sync when online (Expo Network detect).
- Manual sync button in Settings.
- Conflict policy: latest-updated wins (placeholder, extend server-side).

Security & Privacy
- Biometric unlock via Expo LocalAuthentication (optional).
- Tokens in SecureStore (placeholder).
- Session timeout placeholder.
- Ensure GDPR/privacy compliance in server integration.

Barbados-specific Adaptations
- Calendar/event hooks (placeholder).
- WhatsApp-first communication; SMS fallback (linking).
- Language: English baseline; Creole i18n placeholder.

Development Phases
- Phase 1 (MVP): basic logging, directory stub, simple reporting, offline, auth stub.
- Phase 2: advanced filters/search, follow-up management UI, voice-to-text, WhatsApp/Calendar wiring.
- Phase 3: analytics dashboard, perf, enhanced offline, multi-language, conference-level reporting.

Run Instructions
- Prereqs: Node 18+, npm or pnpm, Expo CLI.
- Install: `npm i`
- Start: `npm run start`
- Platforms: `npm run ios` / `npm run android` / `npm run web`
- Notes: First run auto-creates SQLite schema.

Testing & Metrics
- Targets: <3s launch (cached), <30s visit logging flow, sync <10s typical, crash <1%, sync success 99.5%.
