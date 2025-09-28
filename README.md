# Visitation Dashboard (PastoralCarePro Component)

## Executive Summary
Mobile-first, offline-first component for pastors in the East Caribbean Conference (Barbados) to tra## Interface Requirements (Implemented in MVP)

### Dashboard
- Hero CTA: "Log New Visit"
- Today's visits summary
- Overdue follow-ups count (badge)
- Recent visits (7 days)
- Sync status indicator
- Church selector dropdown

### Visit Logging
- **Quick Entry**: Member name, visit type buttons, category picker, comments (voice-to-text placeholder), quick save
- **Detailed Entry**: Duration/scripture/prayer/resources/follow-up scheduling placeholders

### Visit Management
- List view, search/filter placeholders
- Color-coded priority indicators
- Quick actions placeholders

### Reporting
- **Simple Counters**: Month totals, weekly averages placeholdersow-ups, and reporting. Supports iOS 12+, Android 8+, and PWA via Expo.

## Rationale

The Bible emphasizes the importance of pastoral care:  
> *"And the word of the Lord came to me, saying, 'Son of man, prophesy against the shepherds of Israel, prophesy and say to them, "Thus says the Lord God to the shepherds: 'Woe to the shepherds of Israel who feed themselves! Should not the shepherds feed the flocks? You eat the fat and clothe yourselves with the wool; you slaughter the fatlings, but you do not feed the flock. The weak you have not strengthened, nor have you healed those who were sick, nor bound up the broken, nor brought back what was driven away, nor sought what was lost; but with force and cruelty you have ruled them. So they were scattered because there was no shepherd; and they became food for all the beasts of the field when they were scattered. My sheep wandered through all the mountains, and on every high hill; yes, My flock was scattered over the whole face of the earth, and no one was seeking or searching for them.'"* (Ezekiel 34:1-6)

- **Pastoral Care is Vital**: Pastors are often overburdened. This app empowers pastors to efficiently log and manage visits, ensuring better care for their congregations.
- **East Caribbean Context**: The Conference spans multiple islands with connectivity challenges. An offline-first approach ensures pastors can log visits anytime, syncing when online.
- **Mobile-First Design**: Caters to pastors who are frequently on the move, ensuring ease of use and accessibility.
- **Privacy & Security**: Data privacy and security are paramount given the sensitive nature of pastoral visits. The app incorporates biometric authentication and secure data storage.

### Pastoral Visitation Mandate
Beginning with the new district assignment in **October 2026**, pastors must systematically and compassionately visit every member and family in their care.

**Core responsibilities supported by this workflow:**
1. **Visit families** - Confirm that every child in the household has been baptized. Recommend baptismal preparation for children ages 9–12 and spotlight this call to commitment on Decision Days.
2. **Reach out to and visit missing members** within family units to restore connection and spiritual support.

These priorities drive backlog grooming, progress dashboards, and follow-up alerts so shepherds can aggressively close visitation gaps.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run start

# Run on specific platforms
npm run ios
npm run android  
npm run web
```

**Prerequisites:** Node 18+, npm or pnpm, Expo CLI  
**Note:** First run auto-creates SQLite schema

## Architecture

### Tech Stack
- **Frontend**: Expo (React Native + Web)
- **Language**: TypeScript
- **Database**: SQLite (expo-sqlite)
- **State Management**: Zustand
- **Navigation**: React Navigation
- **Device APIs**: Expo Location, Network, LocalAuthentication, SecureStore

### Core Principles
- **Offline-first**: All CRUD operations work offline
- **Sync Strategy**: Records with `synced=0` are queued for auto-sync when online
- **Manual Sync**: Available in Settings screen
- **Conflict Resolution**: Latest `updated_at` timestamp wins (server-side extension needed)

### Security & Privacy
- Biometric unlock via Expo LocalAuthentication (optional)
- Tokens in SecureStore (placeholder)
- Session timeout placeholder
- Local DB at-rest encryption note (platform-dependent)
- Ensure GDPR/privacy compliance in server integration

### Integrations
- **WhatsApp**: Deep link for communication
- **Maps**: Deep link for location services
- **Google Calendar**: Integration (placeholder)
- **Cloud Sync API**: Backend integration (placeholder)

### Accessibility
- **WCAG 2.1 AA** targets
- Dynamic text sizes
- Screen reader labels
- High-contrast friendly palette

## Core Data Structure (Database)

### Tables
```sql
-- Churches
CREATE TABLE churches (
  id TEXT PRIMARY KEY,
  name TEXT
);

-- Members
CREATE TABLE members (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  church_id TEXT,
  affiliation TEXT,
  discipleship_status TEXT
);

-- Visits
CREATE TABLE visits (
  id TEXT PRIMARY KEY,
  start_time INTEGER,
  end_time INTEGER,
  visit_date INTEGER,
  pastor_email TEXT,
  pastor_name TEXT,
  member_id TEXT,
  member_first TEXT,
  member_last TEXT,
  church_id TEXT,
  visit_type TEXT,
  category TEXT,
  comments TEXT,
  address TEXT,
  lat REAL,
  lng REAL,
  next_visit_date INTEGER,
  followup_actions TEXT,
  priority TEXT,
  scripture_refs TEXT,
  prayer_requests TEXT,
  resources TEXT,
  synced INTEGER DEFAULT 0,
  updated_at INTEGER
);

-- Follow-ups
CREATE TABLE followups (
  id TEXT PRIMARY KEY,
  visit_id TEXT,
  due_date INTEGER,
  actions TEXT,
  priority TEXT,
  status TEXT,
  synced INTEGER DEFAULT 0,
  updated_at INTEGER
);
```

### Enums
```typescript
// Visit Types
enum VisitType {
  IN_PERSON = 'in_person',
  PHONE = 'phone',
  VIDEO = 'video',
  EMERGENCY = 'emergency',
  HOSPITAL = 'hospital',
  HOME = 'home',
  OFFICE = 'office'
}

// Categories
enum Category {
  PASTORAL = 'pastoral',
  CRISIS = 'crisis',
  DISCIPLESHIP = 'discipleship',
  ADMINISTRATIVE = 'administrative',
  EVANGELISM = 'evangelism',
  CONFLICT = 'conflict',
  CELEBRATION = 'celebration',
  BEREAVEMENT = 'bereavement'
}

// Priorities
enum Priority {
  CRITICAL = 'critical',
  IMPORTANT = 'important',
  STANDARD = 'standard',
  ROUTINE = 'routine',
  ANNUAL = 'annual'
}
```

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

## Offline & Sync

### Offline Operation
- Works offline: logs/edit queue stored locally (`synced=0`)
- Auto-sync when online (Expo Network detect)
- Manual sync button in Settings

### Sync Strategy
- **Auto-sync**: Triggers on network connectivity restoration
- **Manual sync**: Available via Settings screen
- **Conflict policy**: Latest-updated wins (placeholder, extend server-side)
- **Batch operations**: Efficient sync for large datasets

## Barbados-Specific Adaptations

### Communication
- **WhatsApp-first** communication with deep linking
- **SMS fallback** for notifications
- Integration with local telecommunications

### Localization
- **Language**: English baseline
- **Creole i18n**: Internationalization support (placeholder)
- **Cultural adaptations** for East Caribbean Conference

### Calendar Integration
- Local event and calendar system hooks (placeholder)
- Conference-specific scheduling features

## Screen Structure

### Dashboard (`DashboardScreen.tsx`)
- Hero CTA: "Log New Visit"
- Today's visits summary
- Overdue follow-ups count (with badge)
- Recent visits (last 7 days)
- Sync status indicator
- Church selector dropdown

### Visit Logging (`LogVisitScreen.tsx`)
- **Quick Entry**: Member selection, visit type buttons, category picker, comments
- **Detailed Entry**: Duration, scripture references, prayer requests, resources, follow-up scheduling

### Visit Management (`VisitsScreen.tsx`)
- List view with search and filter capabilities
- Color-coded priority indicators
- Quick action buttons for common tasks

### Reporting (`ReportsScreen.tsx`)
- Monthly visit totals
- Weekly averages
- Trend analysis and metrics

### Settings (`SettingsScreen.tsx`)
- Sync configuration
- Authentication settings
- Visit type and category management
- Data export options

## Performance Targets

- **Launch Time**: <3 seconds (cached)
- **Visit Logging Flow**: <30 seconds end-to-end
- **Sync Duration**: <10 seconds for typical dataset
- **Crash Rate**: <1%
- **Sync Success Rate**: 99.5%

## Development Phases

### Phase 1 (MVP) ✅
- Basic logging functionality
- Directory stub
- Simple reporting
- Offline support
- Auth stub

### Phase 2 (In Progress)
- Advanced filters/search
- Follow-up management UI
- Voice-to-text integration
- WhatsApp/Calendar wiring

### Phase 3 (Planned)
- Analytics dashboard
- Performance optimizations
- Enhanced offline capabilities
- Multi-language support
- Conference-level reporting

## Development Workflows

### Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run start`
4. Choose platform: iOS, Android, or Web

### Database Management
- SQLite schema auto-created on first run
- Seed data loading from `src/db/seed.ts`
- Database migrations handled automatically

### Code Architecture
- **State Management**: Zustand store (`src/state/store.ts`)
- **Database Layer**: SQLite via `src/db/db.ts`
- **Navigation**: Managed in `src/navigation/index.tsx`
- **Screens**: Main UI in `src/screens/`
- **Components**: Reusable UI in `src/components/`

### Key Files
- `src/db/db.ts`: SQLite schema and DB logic
- `src/state/store.ts`: Zustand state management
- `src/screens/`: Main UI screens
- `src/components/VisitCard.tsx`: Visit display pattern
- `src/types.ts`: Data types and enums
- `src/services/sync.ts`: Sync service logic

## Contributing

### Code Style
- TypeScript strict mode
- ESLint + Prettier configuration
- Conventional commit messages
- Component-based architecture

### Conventions
- **Enums**: Use enums for visit types, categories, priorities
- **Sync Flag**: All records have `synced` field; set to `0` for unsynced
- **Conflict Policy**: Latest `updated_at` wins
- **Component Structure**: UI components in `src/components/`, screens in `src/screens/`

### Testing
- Unit tests with Jest
- Integration tests for critical flows
- End-to-end testing with Detox
- Performance benchmarking

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the East Caribbean Conference IT team
- Email: support@pastoralcare.org

---

**Feedback:** If any section is unclear or missing, please specify so it can be improved for future AI agents.
