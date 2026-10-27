# Teleo Church — Admin Portal

Frontend administrative web portal for **Teleo Church**. This application is strictly an internal admin and ministry management portal (managing content, events, prayer requests, discipleship groups, and registrations). Public congregant-facing pages are hosted separately.

---

## Architecture: Feature-Based MVVM

The project follows a **Feature-Based MVVM (Model-View-ViewModel)** pattern to keep domain logic decoupled from UI presentation:

```
┌────────────────────────────────────────────────────────┐
│                        VIEW                            │
│   React components (.tsx)                              │
│   Renders UI and handles user layout                   │
│   Consumes ViewModels via hooks                        │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│                      VIEWMODEL                         │
│   Custom hooks (use*ViewModel.ts)                      │
│   Manages local UI state, handlers, and validation     │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│                        MODEL                           │
│   API services, data contracts, and DTO types          │
│   Plain TypeScript without React hooks or UI logic     │
└────────────────────────────────────────────────────────┘
```

- **Model (`model/` or `models/`):** Data contracts (`*.types.ts`) and API client methods (`*.service.ts`, `*.model.ts`, or `*.api.ts`).
- **ViewModel (`viewmodel/`):** Custom hooks (`use*ViewModel.ts`) that hold UI state and async actions.
- **View (`view/`, `views/`, `components/`):** Presentation components responsible for JSX rendering.

> **Cross-Cutting Concerns:** Shared concerns such as authentication session management (`AuthContext`, `useAuth`), route protection (`ProtectedRoute`, `FeatureGuard`), and universal UI primitives live in `src/shared/` and `src/router/` rather than within individual feature MVVM folders. ViewModels consume these shared utilities directly.
>
> **Feature Model Variations:**
>
> - In some modules, API files use `.service.ts`, `.model.ts`, or `.api.ts` depending on when the module was built. All represent the Model layer.
> - The `settings/` feature intentionally has no local `model/` directory because its operations (viewing profile, roles, and logout) are driven directly by `useAuth()`.

---

## Tech Stack

Exact package versions are tracked in [`package.json`](./package.json).

| Technology           | Category     | Purpose                                      |
| :------------------- | :----------- | :------------------------------------------- |
| **React**            | Framework    | UI library                                   |
| **TypeScript**       | Language     | Type safety (`tsc -b`)                       |
| **Vite**             | Build Tool   | Development server and production bundler    |
| **Tailwind CSS v4**  | Styling      | Utility-first CSS and `@theme` design tokens |
| **React Router DOM** | Routing      | Client-side routing with nested layouts      |
| **Axios**            | HTTP Client  | API communication with cookie credentials    |
| **Lucide React**     | Icons        | SVG icon set                                 |
| **Framer Motion**    | Animation    | Transitions and interactive elements         |
| **ESLint**           | Code Quality | Static analysis and code linting             |

---

## Directory Structure

```text
teleo-church-website/
├── .env.example                 # Environment variable template
├── .env.local                   # Local overrides (git-ignored via .env.*)
├── .github/workflows/ci.yml     # GitHub Actions workflow (Node 20, lint & build)
├── .nvmrc                       # Node.js runtime version (20)
├── index.html                   # Application entry point
├── package.json                 # Dependencies, engines, and npm scripts
├── vite.config.ts               # Vite configuration and /api proxy
│
└── src/
    ├── main.tsx                 # Bootstrapping with AuthProvider
    ├── App.tsx                  # Root router wrapper
    ├── index.css                # Tailwind CSS v4 design tokens and styles
    │
    ├── assets/                  # Logos, backgrounds, and fonts
    │   └── fonts/
    │       └── Vogun-Medium.ttf # Local serif display font (verify license for public distribution)
    │
    ├── router/                  # Centralized routing & guards
    │   ├── AppRouter.tsx        # BrowserRouter provider
    │   ├── ProtectedRoute.tsx   # Authentication guard
    │   ├── FeatureGuard.tsx     # Feature-subscription access gate
    │   └── routes.config.tsx    # Lazy-loaded route definitions
    │
    ├── features/                # Domain feature modules
    │   ├── Auth/
    │   │   └── login/           # Authentication screen and state
    │   └── Admin/
    │       ├── layout/          # AdminSidebar, AdminHeader, layout types
    │       ├── dashboard/       # Overview metrics and recent activity
    │       ├── discipleship/    # Groups directory, calendar, applications
    │       ├── events/          # Events and announcements management
    │       ├── content/         # Series and journeys builder
    │       ├── prayer-wall/     # Prayer moderation queue
    │       ├── registrations/   # Visit, retreat, and discipleship records
    │       ├── users/           # User accounts and roles
    │       └── settings/        # Admin account info and session actions
    │
    └── shared/                  # Universal components, context, and models
        ├── components/          # Reusable UI (Button, Badge, TabSwitch, etc.)
        ├── context/             # AuthContext and useAuth
        ├── models/              # Shared types and axiosClient instance
        └── viewmodels/          # Reusable viewmodel hooks
```

---

## Security & Access Control

1. **Cookie-Based Sessions:** Authentication sessions rely on secure, HTTP-only cookies (`withCredentials: true`). The app does not store tokens in `localStorage`.
2. **Session Storage Marker:** A `sessionStorage` key (`teleo_admin_session_active`) marks active sessions. Closing the browser tab clears this marker, prompting re-authentication.
3. **401 Unauthorized Eviction:** An Axios response interceptor dispatches an `auth:unauthorized` event on 401 errors, clearing authentication state and redirecting to `/login`.
4. **Subscription Feature Gates (`FeatureGuard`):** Permissions are checked against the church organization's `FeaturesConfig`. Features not enabled for the organization are hidden in navigation and blocked at the router level.

---

## Roles & Permissions

Access to the admin portal is restricted to authorized church administrators, pastoral staff, and ministry leads. Specific feature tabs (e.g. Discipleship, Prayer Wall, Content Management) are enabled based on church organization subscription flags.

---

## Environment Configuration

Configuration variables are read through Vite's `import.meta.env`:

| Variable            | Description                                      | Default | Allowed Values |
| :------------------ | :----------------------------------------------- | :------ | :------------- |
| `VITE_API_BASE_URL` | Backend API base URL (leave empty for dev proxy) | `""`    | Any valid URL  |

### Setup:

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```
2. In local development, leave `VITE_API_BASE_URL=` blank. Vite proxies `/api/*` requests to the default development backend (`https://teleo-backend.onrender.com`).
3. Point to a local backend instance if developing locally:
   ```bash
   VITE_API_BASE_URL=http://localhost:4000
   ```

---

## Available NPM Scripts

| Command           | Description                                                                  |
| :---------------- | :--------------------------------------------------------------------------- |
| `npm run dev`     | Starts Vite local development server with HMR                                |
| `npm run build`   | Runs TypeScript check (`tsc -b`) and builds production bundle (`vite build`) |
| `npm run lint`    | Runs ESLint across all files (`eslint .`)                                    |
| `npm run preview` | Starts a local web server serving the `dist/` production build               |

---

## Getting Started

### Prerequisites

- **Node.js:** `>= 20.0.0`
- **npm:** `>= 10.0.0`

### Installation

```bash
# Optional: switch to Node 20 if using nvm
nvm use

# Install dependencies
npm install

# Create local environment config
cp .env.example .env.local

# Start dev server
npm run dev
```

App runs at [http://localhost:5173](http://localhost:5173).

---

## Branching & Contributing

- **`main`**: Production release branch.
- **`develop`**: Active integration branch.
- **Feature Branches**: Branch from `develop` using `feat/*`, `fix/*`, or `chore/*`.
- **Pull Request Rules**:
  - Target branch must be `develop`.
  - CI verification must pass before merging (0 ESLint warnings, successful build).

---

## CI Pipeline

Automated checks run via GitHub Actions ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)) on pushes and pull requests to `develop`:

1. Ubuntu Latest with Node.js 20.
2. Clean dependency install (`npm ci`).
3. Lint validation (`npm run lint -- --max-warnings 0`).
4. Type-check and production build (`npm run build`).

---

## Deployment

This app is built as a Single-Page Application (SPA) and can be hosted on any static hosting service (e.g., Render, Vercel, Netlify, AWS S3/CloudFront).

- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **SPA Fallback:** All non-asset routes must be rewritten to `/index.html` to allow React Router to handle client-side routes.

---

## Backend API

- **Default Backend Service:** `https://teleo-backend.onrender.com`
- Backend endpoints expect session cookies over HTTPS. For custom API deployments, set `VITE_API_BASE_URL` in `.env.local` or environment variables.

---

## Known Gaps & Roadmap

- **Automated Tests:** Unit tests (Vitest) and end-to-end tests (Playwright) are currently not configured in this repo.
  - _Roadmap Item 1:_ Introduce Vitest and React Testing Library for testing ViewModels and store logic.
  - _Roadmap Item 2:_ Introduce Playwright for critical auth and admin workflows.

---

## License & Ownership

Proprietary software. Copyright © Teleo Church. All rights reserved.
