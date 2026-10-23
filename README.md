# Teleo Church — Frontend Admin & Web Portal

The frontend application for **Teleo Church**, built using modern web development standards, scalable architectural patterns, and a robust fail-closed security model.

---

## 🏛️ Architectural Overview: Feature-Based MVVM

The project follows a **Feature-Based MVVM (Model-View-ViewModel)** architecture. This pattern separates business and API logic from presentation components, keeping features modular, testable, and maintainable.

```
┌────────────────────────────────────────────────────────┐
│                        VIEW                            │
│   Pure React TSX components (rendering, styles)        │
│   Consumes ViewModels via clean, declarative hooks     │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│                      VIEWMODEL                         │
│   Custom hooks (`use*ViewModel.ts`)                    │
│   Handles UI state, async actions, event handlers      │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│                        MODEL                           │
│   Pure API services, data contracts, and DTO types     │
│   Centralized Axios client (`withCredentials: true`)   │
└────────────────────────────────────────────────────────┘
```

- **Model (`model/`, `shared/models/`):**
  Defines TypeScript data contracts, domain interfaces, and pure API communication services. Completely isolated from React rendering lifecycle and hooks.
- **ViewModel (`viewmodel/`, `shared/viewmodels/`):**
  Custom React hooks (`use...ViewModel`) that encapsulate component state, user interactions, validation, and lifecycle management. Exposes a clean, typed interface to the View.
- **View (`view/`, `shared/components/`):**
  Pure presentation components (`.tsx`) focused exclusively on rendering JSX and user styling. Zero inline data fetching or direct API mutations.
- **Decoupled Shell Layout (`AdminLayoutView.tsx`):**
  Centralized admin navigation shell hosting the persistent sidebar, header, and a scrollable `<Outlet />` viewport for domain views.

---

## ⚡ Scanned Tech Stack

Verified and extracted from [`package.json`](./package.json):

| Category             | Technology                 | Version    | Notes                                                          |
| :------------------- | :------------------------- | :--------- | :------------------------------------------------------------- |
| **Framework & Core** | React                      | `^19.2.0`  | React 19 modern hooks & concurrent rendering                   |
| **Language**         | TypeScript                 | `~5.9.3`   | Strict type checking with project references (`tsc -b`)        |
| **Build Tooling**    | Vite                       | `^7.2.4`   | Ultra-fast HMR and production asset bundler                    |
| **Styling**          | Tailwind CSS v4            | `^4.3.3`   | Native `@tailwindcss/vite` bundling (`@import "tailwindcss";`) |
| **Routing**          | React Router DOM           | `^7.13.0`  | Centralized route configuration with nested `<Outlet />`       |
| **HTTP Client**      | Axios                      | `^1.20.0`  | Configured instance with HTTP-only cookies & 401 eviction      |
| **Icons**            | Lucide React               | `^0.564.0` | Consistent, lightweight SVG iconography                        |
| **Motion & Drag**    | Framer Motion              | `^12.34.3` | Fluid UI transitions and drag-and-drop reordering              |
| **Code Quality**     | ESLint                     | `^9.39.1`  | Flat config (`eslint.config.js`)                               |
| **Type Linting**     | TypeScript ESLint          | `^8.46.4`  | Static type-aware lint rules                                   |

---

## 📁 Actual Directory Structure

Actual layout scanned from the repository workspace:

```text
teleo-church-website/
├── .env.example                                  # Canonical environment configuration template
├── .env.local                                    # Local development overrides (git-ignored)
├── .github/
│   └── workflows/
│       └── ci.yml                                # GitHub Actions CI workflow (Node 20, lint & build)
├── eslint.config.js                              # ESLint 9 flat configuration
├── index.html                                    # HTML entry point with web font imports
├── package.json                                  # Dependencies and npm scripts
├── tsconfig.json                                 # Project reference root configuration
├── tsconfig.app.json                             # Application TypeScript compiler options
├── tsconfig.node.json                            # Tooling & Vite configuration compiler options
├── vite.config.ts                                # Vite configuration with React, Tailwind, & /api proxy
│
└── src/
    ├── main.tsx                                  # App bootstrapping with AuthProvider & StrictMode
    ├── App.tsx                                   # Root component hosting AppRouter
    ├── index.css                                 # Tailwind CSS v4 design tokens & custom utilities
    ├── vite-env.d.ts                             # Environment variable type declarations (ImportMetaEnv)
    │
    ├── assets/                                   # Static branding assets and custom web fonts
    │   ├── admin-bg.jpg                          # Admin shell textured backdrop
    │   ├── react.svg                             # React logo asset
    │   ├── teleo-logo.png                        # Core Teleo mark
    │   ├── teleo-logo-with-text.jpg              # Full Teleo branding graphic
    │   └── fonts/
    │       └── Vogun-Medium.ttf                  # Custom Vogun serif display font
    │
    ├── router/                                   # Centralized Routing Layer
    │   ├── AppRouter.tsx                         # BrowserRouter provider & suspense fallback
    │   ├── ProtectedRoute.tsx                    # Fail-closed authentication barrier
    │   ├── FeatureGuard.tsx                      # Church subscription/feature-level access guard
    │   └── routes.config.tsx                     # Lazy route catalog with chunk reload retry handler
    │
    ├── features/                                 # Feature Modules (MVVM Pattern)
    │   │
    │   ├── Auth/                                 # Authentication Domain
    │   │   └── login/
    │   │       ├── model/
    │   │       │   └── login.model.ts            # LoginModel: authenticate, getCurrentUser, logout
    │   │       ├── view/
    │   │       │   └── LoginView.tsx             # Responsive split-panel authentication UI
    │   │       └── viewmodel/
    │   │           └── useLoginViewModel.ts      # Login form state, error handling, redirect logic
    │   │
    │   └── Admin/                                # Admin Portal Domain
    │       ├── views/
    │       │   └── AdminLayoutView.tsx           # Persistent shell layout wrapper (<Outlet />)
    │       │
    │       ├── dashboard/                        # Overview & Analytics
    │       │   ├── model/
    │       │   │   ├── adminDashboard.model.ts   # Dashboard aggregate fetching service
    │       │   │   └── adminDashboard.types.ts   # Dashboard KPI & visitor summary types
    │       │   ├── view/
    │       │   │   └── AdminDashboardView.tsx    # KPI metrics, upcoming events & registration cards
    │       │   └── viewmodel/
    │       │       └── useAdminDashboardViewModel.ts # Dashboard state & metrics orchestration
    │       │
    │       ├── events/                           # Events & Announcements
    │       │   ├── model/
    │       │   │   ├── adminEvents.service.ts    # CRUD API service for events & announcements
    │       │   │   ├── adminEvents.types.ts      # Filter, sort, and form data interfaces
    │       │   │   └── content.types.ts          # ChurchEvent & Announcement entity definitions
    │       │   ├── view/
    │       │   │   ├── AdminEventsView.tsx       # Tabbed event/announcement management grid
    │       │   │   ├── ConfirmDeleteModal.tsx    # Deletion confirmation dialog
    │       │   │   ├── ContentPreviewModal.tsx   # Live modal preview for events & announcements
    │       │   │   └── EventModal.tsx            # Create/Edit modal with date pickers & banner upload
    │       │   └── viewmodel/
    │       │       └── useAdminEventsViewModel.ts # Filter, search, and form mutation handlers
    │       │
    │       ├── content/                          # Series & Journeys Builder
    │       │   ├── model/
    │       │   │   ├── adminContent.service.ts   # Journeys & parts API service
    │       │   │   └── adminContent.types.ts     # Journey, Part, and ContentType domain contracts
    │       │   ├── view/
    │       │   │   ├── AdminContentView.tsx      # Journeys listing and status controls
    │       │   │   ├── ConfirmArchiveModal.tsx   # Archive confirmation dialog
    │       │   │   ├── contentStyles.ts          # Shared badge and card style utilities
    │       │   │   ├── JourneyEditor.tsx         # Series editor (metadata, parts, reordering)
    │       │   │   ├── PartModal.tsx             # Part modal (video URL validation & text body)
    │       │   │   └── PartReorderPanel.tsx      # Framer Motion drag-and-drop reorder panel
    │       │   └── viewmodel/
    │       │       └── useAdminContentViewModel.ts # Journey creation, part ordering, and validation
    │       │
    │       ├── prayer-wall/                      # Prayer Requests & Praise Reports
    │       │   ├── components/
    │       │   │   └── AdminPrayerDrawer.tsx     # Slide-over detail inspection & comment drawer
    │       │   ├── model/
    │       │   │   ├── adminPrayerWall.model.ts  # Prayer wall moderation API service
    │       │   │   └── adminPrayerWall.types.ts  # PrayerItem, comment, and status definitions
    │       │   ├── view/
    │       │   │   └── AdminPrayerWallView.tsx   # Moderation queue and spotlight card deck
    │       │   └── viewmodel/
    │       │       └── useAdminPrayerWallViewModel.ts # Moderation actions, filters, and drawer state
    │       │
    │       ├── registrations/                    # Guest & Member Program Records
    │       │   ├── model/
    │       │   │   ├── adminRegistrations.service.ts # Multi-endpoint registration fetcher
    │       │   │   ├── adminRegistrations.types.ts   # "Plan a Visit" guest registration contract
    │       │   │   ├── adminEncounterRegistrations.types.ts # "Encounter" retreat contract
    │       │   │   └── adminDiscipleshipRegistrations.types.ts # "Discipleship" class contract
    │       │   ├── view/
    │       │   │   └── AdminRegistrationsView.tsx    # Multi-tab table (Plan a Visit, Encounter, Discipleship)
    │       │   └── viewmodel/
    │       │       └── useAdminRegistrationsViewModel.ts # Search, pagination, and guest stats
    │       │
    │       ├── users/                            # User Account Management
    │       │   ├── model/
    │       │   │   ├── adminUsers.model.ts       # User directory & update API service
    │       │   │   └── adminUsers.types.ts       # ManagedUser & UserUpdateForm types
    │       │   ├── view/
    │       │   │   ├── AdminUsersView.tsx        # System users table and church assignments
    │       │   │   └── UpdateUserModal.tsx       # User role and profile update modal
    │       │   └── viewmodel/
    │       │       └── useAdminUsersViewModel.ts # User list state, modal toggle, and update handlers
    │       │
    │       └── settings/                         # Admin Settings & Session
    │           ├── view/
    │           │   └── AdminSettingsView.tsx     # Current user profile card, roles, and logout
    │           └── viewmodel/
    │               └── useAdminSettingsViewModel.ts # Profile retrieval and logout navigation
    │
    └── shared/                                   # Shared Global Infrastructure
        ├── components/
        │   ├── AdminHeader.tsx                   # Top bar with current route title and user summary
        │   └── AdminSidebar.tsx                  # Navigation sidebar filtered by feature flags
        │
        ├── context/
        │   ├── AuthContext.tsx                   # AuthProvider with session guard and rehydration
        │   ├── authContextInstance.ts            # React Context instance definition
        │   └── useAuth.ts                        # Consumer hook for authentication context
        │
        ├── viewmodels/
        │   ├── useAdminHeaderViewModel.ts        # Dynamic header title mapping
        │   ├── useAdminSidebarViewModel.ts       # Sidebar link visibility based on feature flags
        │   └── useModalTransition.ts             # Modal mount/unmount and escape key listener
        │
        └── models/
            ├── api/
            │   └── axiosClient.api.ts            # Central Axios client (60s timeout, 401 eviction)
            └── types/
                └── auth.types.ts                 # AuthUser, UserProfile, FeaturesConfig contracts
```

---

## 🔒 Security & Access Control Model

1. **HTTP-Only Cookie Session Security:**
   - Credentials are exchanged over secure HTTP-only cookies (`withCredentials: true`). No JWT or access tokens are ever stored in `localStorage`.
2. **Session-Only Active Guard:**
   - Managed via a `sessionStorage` flag (`teleo_admin_session_active`).
   - If the browser or tab is closed, `sessionStorage` is purged, requiring re-authentication upon next launch to protect shared terminal devices.
3. **Reactive 401 Unauthorized Eviction:**
   - The Axios response interceptor (`axiosClient.api.ts`) intercepts any `401 Unauthorized` responses and dispatches the window event `auth:unauthorized`.
   - `AuthContext` listens for this event, purges the session marker, and evicts user state, prompting `ProtectedRoute` to redirect cleanly to `/login` without requiring full-page reloads.
4. **Subscription-Level Access Control (`FeatureGuard`):**
   - Church organizations have dynamic feature toggles (`FeaturesConfig`).
   - `FeatureGuard` enforces fail-closed access on routes (e.g. `/admin/content`, `/admin/prayer-wall`, `/admin/registrations`, `/admin/events`). Disabled features redirect to `/admin/dashboard`.
   - `AdminSidebar` automatically hides menu items for features not provisioned in the church's config.

---

## 🎨 Design System & Styling Tokens

Built on **Tailwind CSS v4** utilizing modern CSS `@theme` design tokens and glassmorphism styling in [`src/index.css`](./src/index.css):

### Color Tokens
- `--color-midnight-teal`: `#002e38` (Primary brand / deep backdrop)
- `--color-deep-teal`: `#074f56` (Secondary accent)
- `--color-soft-linen`: `#e6edef` (Neutral surface / light foreground)
- `--color-harvest-orange`: `#ec662c` (Call-to-action & highlight)

### Typography
- **Serif Display:** `Vogun` ([`src/assets/fonts/Vogun-Medium.ttf`](./src/assets/fonts/Vogun-Medium.ttf))
- **Sans Interface:** `Outfit` (loaded via Google Fonts)

---

## ⚙️ Environment Configuration

Configuration variables are managed via Vite's `import.meta.env` system:

| Variable            | Description                                              | Default | Allowed Values           |
| :------------------ | :------------------------------------------------------- | :------ | :----------------------- |
| `VITE_API_BASE_URL` | Base URL of the backend API server (leave blank for dev) | `""`    | Any valid HTTP/HTTPS URL |

### Setup Instructions:

1. Create a `.env.local` file by copying the example:
   ```bash
   cp .env.example .env.local
   ```
2. **Local Development (Default):**
   Leave `VITE_API_BASE_URL=` blank. The Vite dev server proxies all `/api/*` calls directly to the live backend at `https://teleo-backend.onrender.com` without CORS friction.
3. **Custom / Local Backend Server:**
   Set `VITE_API_BASE_URL=http://localhost:4000` to point to a custom local backend instance.

---

## 🚀 Development & Verification Commands

### 1. Installation

Install project dependencies:

```bash
npm install
```

### 2. Development Server

Start the local Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Quality & Verification Suite

Run checks before committing or opening a Pull Request (mirrors GitHub Actions CI):

- **Linting:**
  ```bash
  npm run lint
  ```
- **Type Checking & Production Build:**
  ```bash
  npm run build
  ```
  *(Runs `tsc -b && vite build`)*
- **Production Bundle Preview:**
  ```bash
  npm run preview
  ```

---

## 🔄 CI Pipeline

Automated checks are executed via GitHub Actions ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)) on pushes and pull requests targeting the `develop` branch:

1. **Environment:** Ubuntu Latest, Node.js 20.
2. **Dependency Installation:** `npm ci`.
3. **Code Quality:** `npm run lint -- --max-warnings 0`.
4. **Build Validation:** `npm run build` (`tsc -b` and `vite build`).
