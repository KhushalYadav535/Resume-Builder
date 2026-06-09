# ResumeAI — Full Stack Resume Optimizer

AI-powered resume platform: build, analyze, and optimize resumes for ATS systems.

## Features
- **Resume Builder** — Build from scratch with AI assistance on every section
- **Resume Upload** — Upload PDF/TXT and get instant analysis
- **ATS Score Checker** — AI scores your resume for ATS compatibility
- **Content Reviewer** — Improves bullet points, action verbs, and quantification
- **JD Matcher** — Keyword gap analysis against any job description
- **Resume Templates** — 4 ATS-friendly templates
- **Resume History** — Dashboard to manage all resumes

## Tech Stack
- **Next.js 14** (App Router, fullstack)
- **Tailwind CSS**
- **Google Gemini API** (via official SDK, using `gemini-2.0-flash`)
- **Supabase** (free tier database)
- **pdf-parse** (local PDF extraction)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Environment Variables
Create `.env.local` in the project root:
```env
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Supabase Database Setup
> [!WARNING]
> Run `supabase_schema.sql` to configure the tables, user roles, policies, and triggers. Do not use the inline SQL below for production setups, as it is a minimal reference schema only.

```sql
create table resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  file_name text,
  raw_text text,
  resume_data jsonb,
  ats_score jsonb,
  content_review jsonb,
  jd_match jsonb,
  template_id text default 'modern',
  created_at timestamp default now()
);
```

### 4. Get Free API Keys
- **Google Gemini**: https://aistudio.google.com — sign up and generate your free Gemini API key
- **Supabase**: https://supabase.com — create project, get URL + anon key

### 5. Run Development Server
```bash
npm run dev
```
Open http://localhost:3000

## Deployment (Vercel — Free)
```bash
npm install -g vercel
vercel
```
Add environment variables in Vercel dashboard.

## Project Structure
```
app/
├── page.tsx                    # Landing page
├── dashboard/page.tsx          # Resume dashboard
├── resume/
│   ├── builder/page.tsx        # Resume builder
│   ├── upload/page.tsx         # Upload & analyze
│   ├── templates/page.tsx      # Template chooser
│   └── [id]/page.tsx           # Resume detail view
├── api/
│   ├── parse-resume/           # PDF text extraction
│   ├── ats-score/              # ATS analysis
│   ├── review-content/         # Content review
│   ├── match-jd/               # JD keyword match
│   ├── generate-section/       # AI section writer
│   ├── save-resume/            # Save to Supabase
│   └── get-resumes/            # Fetch from Supabase
components/
├── Navbar.tsx
lib/
├── openrouter.ts               # AI client
└── supabase.ts                 # DB client
types/
└── index.ts                    # TypeScript types
```
