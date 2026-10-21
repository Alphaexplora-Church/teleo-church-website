# Teleo Church — Frontend Admin & Web Portal

The frontend application for **Teleo Church**, built using modern web development standards, scalable architectural patterns, and a robust fail-closed security model.

---

## 🏛️ Architectural Overview: Feature-Based MVVM

The project follows a **Feature-Based MVVM (Model-View-ViewModel)** architecture. This pattern separates business data logic from presentation components, keeping features modular, testable, and maintainable.

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
| **HTTP Client**      | Axios                      | `^1.20.0`  | Centralized instance with HTTP-only cookies & 401 eviction     |
| **Icons**            | Lucide React               | `^0.564.0` | Consistent, lightweight SVG iconography                        |
| **Motion**           | Framer Motion              | `^12.34.3` | Fluid UI transitions and micro-animations                      |
| **Code Quality**     | ESLint & TypeScript ESLint | `^9.39.1`  | Flat config (`eslint.config.js`)                               |

---

## 📁 Actual Directory Structure

Actual layout scanned from the repository workspace:

```text
teleo-church-website/
├── .env.example                          # Canonical environment configuration template
├── .env.local                            # Local development overrides (git-ignored)
├── eslint.config.js                      # ESLint 9 flat configuration
├── index.html                            # HTML entry point with web font imports
├── package.json                          # Dependencies and npm scripts
├── tsconfig.json                         # Project reference root configuration
├── tsconfig.app.json                     # Application TypeScript compiler options
├── tsconfig.node.json                    # Tooling & Vite configuration compiler options
├── vite.config.ts                        # Vite configuration with React & Tailwind plugins
│
└── src/
    ├── main.tsx                          # App bootstrapping with AuthProvider & StrictMode
    ├── App.tsx                           # Root component hosting AppRouter
    ├── index.css                         # Tailwind CSS v4 entrypoint & custom design tokens
    ├── vite-env.d.ts                     # Environment variable type declarations (ImportMetaEnv)
    │
    ├── assets/                           # Static branding assets and custom web fonts
    │   ├── teleo-logo.png
    │   ├── admin-bg.jpg
    │   └── fonts/
    │       └── Vogun-Medium.ttf
    │
    ├── router/                           # Centralized Routing Layer
    │   ├── AppRouter.tsx                 # BrowserRouter provider and scroll restoration
    │   ├── ProtectedRoute.tsx            # Fail-closed guard & #auth-loading-barrier
    │   └── routes.config.tsx             # Declarative route catalog & feature RBAC metadata
    │
    ├── features/                         # Feature Modules (MVVM Pattern)
    │   ├── Auth/                         # Authentication & Credentials
    │   │   └── login/
    │   │       ├── model/                # LoginModel & API authentication services
    │   │       ├── view/                 # LoginView JSX screen
    │   │       └── viewmodel/            # useLoginViewModel hook
    │   │
    │   └── Admin/                        # Admin Portal Modules
    │       ├── views/
    │       │   └── AdminLayoutView.tsx   # Persistent shell layout wrapper (<Outlet />)
    │       ├── dashboard/                # Admin Dashboard overview & statistics
    │       ├── events/                   # Events & announcements management
    │       ├── content/                  # Media, Journeys, and categories editor
    │       ├── prayer-wall/              # Moderation, comments, and prayer requests
    │       ├── registrations/            # Church program registrations & records
    │       ├── users/                    # System users and church assignments
    │       └── settings/                 # Account profile and session management
    │
    └── shared/                           # Shared Global Infrastructure
        ├── components/                   # Shared UI components (AdminSidebar, AdminHeader)
        ├── context/                      # Global context providers (AuthProvider, useAuth)
        ├── viewmodels/                   # Shared view models (sidebar flags, modals)
        └── models/
            ├── api/
            │   └── axiosClient.ts        # Configured Axios instance with 401 interceptor
            └── types/
                ├── auth.ts               # AuthUser, UserProfile, FeaturesConfig interfaces
                └── globalTypes.ts        # ChurchFeatures and domain entities
```

---

## ⚙️ Environment Configuration

Configuration variables are managed via Vite's `import.meta.env` system:

| Variable            | Description                        | Default | Allowed Values           |
| :------------------ | :--------------------------------- | :------ | :----------------------- |
| `VITE_API_BASE_URL` | Base URL of the backend API server | `""`    | Any valid HTTP/HTTPS URL |

### Setup Instructions:

1. Create a `.env.local` file by copying the example:
   ```bash
   cp .env.example .env.local
   ```
2. **Local Development:**
   Leave `VITE_API_BASE_URL=` empty to route `/api/*` through the local Vite proxy to the live Render backend (`https://teleo-backend.onrender.com`).
3. **Custom Backend Server:**
   Configure `VITE_API_BASE_URL` to point to a custom running backend server (e.g. `http://localhost:4000`).

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

Run the health checks before committing or opening a Pull Request:

- **TypeScript Compilation:**
  ```bash
  npx tsc -b
  ```
- **Linting:**
  ```bash
  npm run lint
  ```
- **Production Build:**
  ```bash
  npm run build
  ```
- **Production Bundle Preview:**
  ```bash
  npm run preview
  ```
