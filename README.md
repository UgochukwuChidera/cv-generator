# Nexus — Personal Career Document Platform

Nexus is a modern, AI-powered career document platform that helps you build, manage, and export professional resumes and cover letters. It consists of two surfaces sharing a common schema:

- **Web App** — Next.js 14+ with a chat-first onboarding flow, form editor, live preview, and one-click exports
- **CLI Tool** — Standalone Node.js tool for power users who prefer the terminal

## Architecture

```
nexus/
├── web/              # Next.js 14+ App Router web application
├── cli/              # Standalone Node.js ESM CLI tool
├── packages/
│   └── schema/       # Shared Zod Master Career Schema (MCS)
└── package.json      # npm workspaces root
```

## Features

### Web App (`/web`)
- **Chat Onboarding** (`/`) — Describe yourself in plain text; AI extracts a structured resume
- **Form Editor** (`/editor`) — Field-by-field editing with a live preview panel
- **JD Targeting** (`/jd-targeting`) — Paste a job description to get a fit score and tailored bullets
- **Themes** (`/themes`) — Choose from 5 templates: Professional, Modern, Creative, Academic, Minimal
- **Export** (`/export`) — Download as PDF, DOCX, HTML, JSON, or YAML

#### AI (BYOK — Bring Your Own Key)
Supports Claude (Anthropic), OpenAI, GPT-4, Gemini, and OpenRouter. Your API key is stored **only in your browser's `localStorage`** and is forwarded directly to the AI provider — it is never logged or persisted on any server.

### CLI Tool (`/cli`)

```bash
nexus init                          # Interactive setup, creates nexus.json
nexus import --file resume.docx     # Import existing resume
nexus generate --theme modern --format pdf,docx,html
nexus generate-all                  # Generate all themes × all formats
nexus optimize --jd ./jd.txt        # Tailor resume to a job description
nexus cover-letter --jd ./jd.txt --tone formal
nexus list-themes                   # List available themes
nexus export --format yaml          # Export MCS as YAML
nexus history                       # Show version history
nexus rollback --version 3          # Roll back to a previous version
```

### Shared Schema (`packages/schema`)
A [Zod](https://zod.dev)-validated **Master Career Schema (MCS)** covering personal info, work experience, education, skills, projects, languages, and cover letters. Includes `meta.version`, `meta.updated_at`, and a `history[]` array for rollback.

## Quick Start

### Prerequisites
- Node.js 18+
- npm 8+ (workspaces support)

### Install

```bash
git clone <repo>
cd nexus
npm install
```

### Run Web App

```bash
npm run dev
# or
cd web && npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build Web App

```bash
cd web && npm run build
```

### Use CLI

```bash
cd cli && npm run build
node dist/index.js --help
```

Or link globally:

```bash
cd cli && npm link
nexus --help
```

## Tech Stack

| Layer | Tech |
|---|---|
| Web framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Schema validation | Zod |
| PDF export | @react-pdf/renderer |
| DOCX export | docx |
| YAML | js-yaml |
| CLI parsing | commander |
| CLI prompts | inquirer |
| CLI colors | chalk + ora |

## Security

- API keys are stored in `localStorage` (client-side only)
- Keys are forwarded in request headers directly to AI providers
- No keys are ever logged, stored, or sent to any server other than the chosen AI provider

## License

See [LICENSE](./LICENSE).