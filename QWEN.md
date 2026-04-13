# easyuseAI - Qwen Code Project Context

## Project Overview

**easyuseAI** is a Next.js 15 + React 19 web application that provides AI-powered product photography services for clothing merchants. The core workflow is:

`Homepage` → `/diagnosis` (5-question survey) → `/result` (personalized analysis) → `/submit` (lead capture) → `/execute` (image generation)

### Tech Stack
- **Framework:** Next.js 15.5.4 (App Router)
- **UI:** React 19.1.0 + Tailwind CSS 3.4
- **Database:** PostgreSQL (Supabase) via Prisma ORM
- **Testing:** Vitest + Playwright
- **Deployment:** Vercel

### Core Business Flow
1. User uploads a photo and answers 5 diagnostic questions
2. System analyzes their needs (visual/content/conversion focused)
3. Displays personalized workflow and immediate value
4. Offers free trial actions (image generation)
5. Converts to paid services (¥99 standard, ¥299 full service)

## Building and Running

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Testing
pnpm test
pnpm test:watch

# Browser automation (Playwright)
pnpm browser home       # Homepage screenshot
pnpm browser flow       # Full flow: home→diagnosis→result→execute→submit
pnpm browser console    # Check console errors
```

### Environment Variables
Copy `.env.example` to `.env.local`:
```bash
DATABASE_URL=           # Supabase PostgreSQL
USE_MOCK=false          # Mock mode for local dev
AI_API_KEY=             # AI API key (DeepSeek/OpenAI/MiniMax)
AI_BASE_URL=            # AI API base URL
AI_MODEL=               # AI model name
IMAGE_PROVIDER=         # Image generation provider
IMAGE_API_KEY=          # Image API key
FEISHU_APP_ID=          # Feishu bot app ID
FEISHU_APP_SECRET=      # Feishu bot app secret
```

## Project Structure

```
easyuseAI/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── dashboard/      # Admin dashboard
│   ├── diagnosis/      # 5-question diagnostic survey
│   ├── execute/        # Image generation execution
│   ├── result/         # Analysis results page
│   ├── submit/         # Lead submission form
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Homepage
├── components/          # React components
│   └── PaymentModal.tsx
├── lib/                 # Core business logic
│   ├── image/          # Image generation providers
│   ├── providers/      # Context providers
│   ├── types/          # TypeScript types
│   ├── ai.ts           # AI text generation
│   ├── db.ts           # Database utilities
│   ├── diagnosis.ts    # Diagnostic logic
│   ├── feishu.ts       # Feishu bot integration
│   ├── workflow.ts     # Workflow configuration
│   └── mock-db.ts      # Mock database for local dev
├── ops/                 # Operations documentation
│   ├── CURRENT_TASK.md # Current active task
│   ├── SITE_STATUS.md  # Site health status
│   ├── METRICS.md      # Metrics tracking
│   └── QWEN_LOG.md     # Qwen Code activity log
├── prisma/              # Prisma schema
├── public/              # Static assets
│   ├── images/home/    # Homepage images
│   ├── cases/          # Case study images
│   └── screenshots/    # Browser automation output
└── scripts/             # Utility scripts
    └── browser.ts      # Playwright browser automation
```

## Qwen Code Scope

### You Handle (Low-risk, parallel-friendly)
- Image loading state optimization
- Fallback placeholder images
- Error message improvements
- Result page lightweight UI enhancements
- Mobile image display optimizations

### You Do NOT Handle
- Core API logic
- Diagnosis main flow
- Hermes monitoring configuration
- Deployment configuration
- Payment logic
- Data structure refactoring
- Large-scale architecture changes

## Development Conventions

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier configured
- Tailwind CSS for styling
- Functional components with hooks

### Testing Practices
- Unit tests with Vitest
- E2E tests with Playwright
- Mock database available for local development

### Commit Style
- Clear, concise messages focused on "why" not "what"
- Reference task/issue numbers when applicable

## Current System Roles

| Agent | Role | Responsibilities |
|-------|------|------------------|
| Hermes-Monitor | Health checker | Site monitoring, status updates, Feishu notifications |
| Claude Code | Main executor | Core code changes, complex tasks |
| Qwen Code | Secondary executor | Low-risk, low-coupling optimizations |

## Key Files to Know

| File | Purpose |
|------|---------|
| `ops/CURRENT_TASK.md` | Current active task and priorities |
| `ops/SITE_STATUS.md` | Local/production site health status |
| `ops/QWEN_LOG.md` | Your activity log (update after tasks) |
| `lib/diagnosis.ts` | Diagnostic questionnaire logic |
| `lib/image/` | Image generation provider implementations |
| `app/result/page.tsx` | Results page (your primary focus area) |

## Quick Reference

### Image Generation Flow
1. User selects action on `/result` page
2. Navigate to `/execute?session=X&action=Y`
3. System calls image provider (MiniMax/Gemini/Fal)
4. Returns generated image or fallback

### Provider Configuration
- `IMAGE_PROVIDER`: Primary provider (minimax-cn, gemini, fal)
- Provider routing via `IMAGE_PROVIDER_TASK_MAP`
- Mock provider available for local testing

### Browser Automation
- Screenshots saved to `public/screenshots/`
- Flow reports in `public/browser-report.json`
- Console errors logged to `public/console-errors.log`
