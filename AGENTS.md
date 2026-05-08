# Project-Specific Agent Instructions: Nexus CV Generator

## Context
- **Next.js**: This project uses a custom/non-standard version of Next.js (v16.2.3). Always check `node_modules/next/dist/docs/` if unsure about APIs.
- **Styling**: Unified "Elite" design system. 
  - **Typography**: `Instrument Serif` (Display/Headings), `DM Sans` (Body).
  - **Color System**: Real-time rainbow syncing via the `--dynamic-hue` CSS variable. Use `.dynamic-accent`, `.dynamic-text`, and `.dynamic-border` classes.
  - **Glassmorphism**: Use `backdrop-filter: blur(20px)` and translucent backgrounds (`rgba(255, 255, 255, 0.03)`) for main UI surfaces.

## Core Components
- **Background**: `ParticleCanvas.tsx` implements a "Ferromagnetic Field Graph". It is highly configurable via `NexusStore` (Magnetism Strength, Radius, Dot Size, Density, Twinkle Intensity).
- **State Management**: Zustand store in `web/lib/store.ts` handles all AI configurations and interface preferences.

## Development Mandates
- **Performance**: Maintain 60fps for the background canvas. Interactive elements should trigger `mouse.active = false` to prevent distraction.
- **Responsiveness**: Ensure layouts handle high-density grids and vary properly across the 4 main modules (Chat, Editor, JD Target, Export).
- **Consistency**: All new buttons, inputs, and cards must adhere to the existing glassmorphic and rainbow-synced style.
