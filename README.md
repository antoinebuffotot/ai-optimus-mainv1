# AI Optimus

AI Optimus turns Dynatrace's agentic AI from complex theory into everyday practice by making AI agents easy to understand, observe, and use at scale.

## Overview

This is a [Dynatrace App](https://dt-url.net/developers) built with the **Dynatrace App Toolkit** (`dt-app`) and the **Strato Design System**. It runs on **Dynatrace AppEngine** and uses TypeScript/React for the UI layer.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 16.13.0
- A Dynatrace environment with AppEngine enabled
- Access to the Dynatrace environment URL (set in `app.config.json`)

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server (opens browser with hot reload)
npm run start

# Build for production
npm run build

# Deploy to your Dynatrace environment
npm run deploy
```

## Project Structure

```
├── ui/                  # Frontend React application
│   ├── app/             # App pages and components
│   │   ├── App.tsx      # Root component with routing
│   │   ├── components/  # Reusable UI components
│   │   └── pages/       # Page components
│   ├── assets/          # Static assets (images, icons)
│   ├── main.tsx         # Application entry point
│   └── tsconfig.json    # TypeScript config for UI
├── specs/               # Application specifications and requirements
├── docs/                # Project documentation
├── app.config.json      # Dynatrace app configuration (name, ID, scopes)
├── eslint.config.mjs    # ESLint configuration
├── tsconfig.eslint.json # TypeScript config for linting
├── package.json         # Dependencies and scripts
└── AGENTS.md            # AI coding agent instructions
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm run deploy` | Deploy to Dynatrace environment |
| `npm run uninstall` | Uninstall from Dynatrace environment |
| `npm run lint` | Run ESLint checks |
| `npm run create:function` | Scaffold a new serverless function |
| `npm run create:action` | Scaffold a new action |
| `npm run update` | Update Dynatrace SDK packages |
| `npm run info` | Display CLI and environment info |

## Configuration

- **App metadata**: `app.config.json` — defines the app name, ID, version, and required scopes
- **Environment URL**: Set `environmentUrl` in `app.config.json` to your target Dynatrace environment
- **Scopes**: Add required permissions to the `scopes` array in `app.config.json`

## Documentation

- [Dynatrace Developer Portal](https://dt-url.net/developers) — Platform documentation
- [Strato Design System](https://developer.dynatrace.com/develop/ui/) — UI component library
- [DQL Reference](https://dt-url.net/dql-ref) — Dynatrace Query Language

## License

ISC
