# WLCM Frontend

This is the frontend application for the WLCM project. It is built using modern web development tools and best practices to ensure a fast, responsive, and engaging user experience.

## Technology Stack

The application is built with the following core technologies:
- **React 19**: UI library
- **TypeScript**: Static typing for robust code
- **Vite**: Fast frontend tooling and bundler
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Router DOM**: Client-side routing
- **Framer Motion**: Animation library for smooth UI transitions
- **Lenis**: Smooth scrolling library for a premium scrolling experience
- **Lucide React**: Iconography suite

## Folder Structure

The application follows a feature-based modular folder structure inside the `src/` directory to keep related code modular, readable, and easy to maintain.

```text
frontend/
├── public/               # Public static assets (favicon, etc.)
├── src/                  # Application source code
│   ├── assets/           # Images, fonts, and other static files
│   ├── components/       # Shared/reusable UI components (buttons, layout wrappers, etc.)
│   ├── features/         # Feature-specific modules
│   │   ├── About/        # Components specific to the About section
│   │   ├── Engage/       # Components specific to user engagement/donations
│   │   ├── Experience/   # Components specific to ministries and experiences
│   │   └── Home/         # Components specific to the landing page
│   ├── pages/            # Top-level page components matching routes
│   │   ├── AboutUs.tsx
│   │   ├── Engage.tsx
│   │   ├── Experience.tsx
│   │   ├── Home.tsx
│   │   └── Watch.tsx
│   ├── App.tsx           # Main application component & routing setup
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global CSS and Tailwind directives
├── package.json          # Project metadata and dependencies
├── tailwind.config.js    # Tailwind CSS configuration
├── eslint.config.js      # ESLint linting configuration
├── tsconfig.json         # TypeScript configurations
└── vite.config.ts        # Vite configuration
```

## Getting Started

### Prerequisites

Ensure you have Node.js and npm installed on your machine.

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the development server with Hot Module Replacement (HMR). The server is currently running in your terminal locally using this command.

```bash
npm run dev
```

The application will typically be available at `http://localhost:5173/`.

### Building for Production

To create a production-ready build:

```bash
npm run build
```

The built assets will be generated in the `dist/` folder.

### Linting

To run ESLint to check for code quality and style issues:

```bash
npm run lint
```
