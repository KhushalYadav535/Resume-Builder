# Resume Optimizer

A full-stack, AI-powered resume optimization platform that helps job seekers build, analyze, and optimize their resumes against Applicant Tracking Systems (ATS) — all using free-tier tools.

Built with Next.js 14 (App Router), Supabase, TypeScript, and Tailwind CSS, with an OpenRouter-powered AI layer for deep resume analysis.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Project](#running-the-project)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)

---

## Overview

Over 75% of resumes are rejected by ATS software before a human ever sees them. Resume Optimizer addresses this by combining resume creation, ATS scoring, AI-powered content review, and job description matching into a single platform — built entirely on free-tier infrastructure (Supabase, OpenRouter free models, local rule-based parsing).

---

## Features

### Authentication
- Email/password sign up and login (Supabase Auth)
- Show/hide password toggle
- Mobile number login via OTP (with graceful fallback to email if phone auth isn't configured)
- Protected routes with server-side session verification

### Resume Builder
- Multi-step builder: Personal Info, Summary, Work Experience, Education, Skills, Projects, Certifications
- India-specific fields: Languages Known, Board/University mapping, CGPA/Percentage, CTC details, competitive exam scores
- Fresher Mode for campus hires and recent graduates
- AI-assisted bullet point writing and section generation

### Resume Upload & Parsing
- PDF and TXT upload support
- Local rule-based parser: contact extraction, section detection, skill matching (130+ keywords)
- Zero-cost ATS scoring — no API calls required for the initial score

### LinkedIn Import
- Import via LinkedIn's native "Save to PDF" export (More → Save to PDF on your profile)
- AI-powered extraction of work experience, education, skills, certifications, and summary from the PDF text

### ATS Optimization
- Local ATS score (formatting, sections, keyword density)
- India-specific keyword library (tech, domain, and soft skills common in Indian job descriptions)
- Naukri.com-specific optimization tips

### AI Features (via OpenRouter free-tier models)
- Stage 4 Deep AI Audit — rewrites bullet points, quantifies achievements, aligns keywords to a target job description
- Achievement translator using Indian currency and context (₹, Lakhs, Crores)
- Grammar and tone checker
- Cover letter generator
- Interview question predictor
- 2-minute "tell me about yourself" career story generator
- Automatic failover across free models (OpenRouter → Gemma-2 → Qwen-3) to handle rate limits

### Job Application Tracker
- Kanban board: Applied → Screening → Interview → Offer → Rejected → Withdrawn
- JD matching directly from the tracker
- Application stats: interview rate, offer rate

### Resume Management
- Multiple resumes per user
- Edit and update existing resumes
- Delete resumes with confirmation
- Shareable public resume links
- Side-by-side resume comparison
- PDF download (print) and DOCX export
- Properly structured, ATS-safe resume preview and print layout

### Templates
- Modern, Professional, Creative, Executive, ATS Safe, and Minimal templates
- Live template preview using real resume data
- Switch templates without losing resume data

### Career Tools
- Skill gap analysis against a target role
- Career path recommendations
- India salary benchmarking by role, city, and experience

### Dashboard & UX
- Resume portfolio dashboard with ATS score badges
- Onboarding flow for first-time users
- In-app notifications
- Mobile-responsive layout

### Admin Panel
- User management
- Platform analytics (users, resumes, audits run)
- AI usage and failover monitoring

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database & Auth | Supabase (PostgreSQL, Auth, Row-Level Security) |
| AI Layer | OpenRouter (free-tier models with automatic failover) |
| PDF Parsing | pdf-parse |
| DOCX Export | docx (npm) |
| Charts (Admin) | Recharts |

All tooling is free-tier by design — no paid API keys are required to run this project.

---

## Project Structure

```
app/
  page.tsx                          → Landing page
  login/page.tsx                    → Login (email + mobile OTP)
  signup/page.tsx                   → Signup
  onboarding/page.tsx               → First-login wizard
  dashboard/page.tsx                → Resume portfolio dashboard
  jobs/page.tsx                     → Job application tracker
  admin/                            → Admin panel (users, analytics, AI usage)
  resume/
    upload/page.tsx                 → Upload PDF/TXT resume
    builder/page.tsx                → Multi-step resume builder
    templates/page.tsx              → Template selector with live preview
    compare/page.tsx                → Side-by-side resume comparison
    share/[token]/page.tsx          → Public shared resume view
    [id]/page.tsx                   → Resume detail page (tabs)
    [id]/cover-letter/page.tsx      → Cover letter generator
  api/
    parse-resume/route.ts
    analyze-resume/route.ts
    analyze-resume/deep/route.ts
    generate-section/route.ts
    save-resume/route.ts
    get-resumes/route.ts
    delete-resume/route.ts
    export-resume/route.ts
    share-resume/route.ts
    import-linkedin/route.ts
    translate-achievement/route.ts
    check-grammar/route.ts
    generate-cover-letter/route.ts
    predict-interview-questions/route.ts
    generate-career-story/route.ts
    skill-gap/route.ts
    career-recommendations/route.ts
    salary-benchmark/route.ts
    naukri-tips/route.ts
    job-applications/route.ts
    job-applications/[id]/route.ts
    notifications/route.ts
    resume-analytics/route.ts

lib/
  supabase.ts                       → Lazy-initialized Supabase client
  auth.ts                           → Server-side session verification
  openrouter.ts                     → AI client with failover logic
  resumeParser.ts                   → Master resume parser
  extractPersonalInfo.ts
  sectionParser.ts
  extractSkills.ts
  calculateATS.ts                   → Rule-based ATS scoring
  indiaKeywords.ts                  → India-specific keyword library
  salaryData.ts                     → Static India salary benchmark data
  env.ts                            → Environment variable validation

components/
  AuthProvider.tsx
  ResumeRenderer.tsx                 → Shared resume preview/print renderer
  NotificationBell.tsx
  MobileNav.tsx

hooks/
  useAuth.ts

supabase_schema.sql                 → Full database schema with RLS policies
```

---

## Prerequisites

- Node.js 18.17 or later
- npm (or yarn/pnpm)
- A free [Supabase](https://supabase.com) account
- A free [OpenRouter](https://openrouter.ai) account and API key

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/resume-optimizer.git
cd resume-optimizer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for provisioning to complete
3. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` public key

### 4. Get an OpenRouter API key

1. Go to [openrouter.ai](https://openrouter.ai) and create a free account
2. Go to **Keys** and generate a new API key
3. Free-tier models used by this project do not require billing setup

### 5. Set up environment variables

See [Environment Variables](#environment-variables) below.

### 6. Run the database schema

See [Database Setup](#database-setup) below.

### 7. Start the development server

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENROUTER_API_KEY=your-openrouter-api-key
```

`lib/env.ts` validates these at startup and will throw a descriptive error if any are missing.

---

## Database Setup

> ⚠️ Always use `supabase_schema.sql` for setting up your database. Do not run any inline SQL snippets found elsewhere in older documentation — those used an incompatible `user_id TEXT` type and will cause insertion errors. The schema below uses `UUID` to correctly support foreign keys to `auth.users(id)`.

1. Go to your Supabase project dashboard
2. Open the **SQL Editor**
3. Paste the full contents of `supabase_schema.sql`
4. Run it

This sets up all tables (`resumes`, `job_applications`, `notifications`, `profiles`, `ai_requests`), enables Row-Level Security on each, and creates the necessary CRUD policies scoped to `auth.uid()`.

---

## Running the Project

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Lint
npm run lint
```

---

## Troubleshooting

### "Email not confirmed" error when logging in after signup

This happens because Supabase's default setting requires users to click an email confirmation link before they can log in. In development, no confirmation email is actually being sent/clicked, so the login is blocked even though the signup succeeded.

**Fix — disable email confirmation for development:**

1. Go to your Supabase dashboard → **Authentication**
2. Open **Providers → Email** (or **Authentication → Settings**, depending on your dashboard version)
3. Scroll down and turn **off** "Confirm email"
4. Click **Save**

**To unblock users who are already stuck** (signed up before this was turned off), run this in the Supabase **SQL Editor**:

```sql
UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
```

This confirms all pending users immediately. Turning off email confirmation does not affect password security, session handling, or Row-Level Security — it only skips the email verification step, which is appropriate for development and demo environments. Re-enable it before any real production deployment with public users.

### LinkedIn import isn't extracting full profile data

LinkedIn does not allow direct API scraping without an approved Developer Application. Use the PDF export method instead:

1. On your LinkedIn profile, click **More → Save to PDF**
2. Upload that PDF using the LinkedIn Import option in the app
3. The app parses the PDF text using AI to extract all sections (experience, education, skills, certifications)

### OpenRouter requests failing or rate-limited

The AI client (`lib/openrouter.ts`) automatically fails over to backup free models. If all models are rate-limited simultaneously, wait a minute and retry — this is expected behavior on free-tier usage during high load.

### `pip install` or native module errors during setup

Ensure you're using Node.js 18.17+. Delete `node_modules` and `package-lock.json`, then run `npm install` again.

---

## Roadmap

- [ ] Google OAuth login
- [ ] Two-factor authentication
- [ ] UPI/payment integration for premium tiers
- [ ] Multi-language resume support (Hindi and regional languages)
- [ ] Public portfolio pages with SEO optimization

---

## License

This project was built as part of an academic internship submission.
