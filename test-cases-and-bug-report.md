# Resume Optimizer — Test Cases & Bug Report

> **Document Version:** 1.0  
> **Date:** 2026-06-16  
> **Prepared by:** QA Engineer (Automated Code Analysis)  
> **Codebase:** Next.js 14 + Supabase + TypeScript + Tailwind + OpenRouter/Gemini AI  
> **Scope:** All files under `app/`, `lib/`, `components/`, `utils/`, `hooks/`, `types/`, and `supabase_schema.sql`

---

## Part A — Test Scenarios

---

### Module: Authentication (Login / Signup / Logout)

**Source Files:** `app/login/page.tsx`, `app/signup/page.tsx`, `components/AuthProvider.tsx`, `hooks/useAuth.ts`, `utils/supabase/client.ts`

| Test ID | Module | Test Scenario | Pre-conditions | Steps | Expected Output | Priority |
|---------|--------|---------------|-----------------|-------|-----------------|----------|
| TC-01 | Authentication | Email login with valid credentials | User account exists in Supabase `auth.users` | 1. Navigate to `/login` 2. Select "Email" tab 3. Enter valid email and password 4. Click "Log In →" | `AuthProvider.login()` calls `supabase.auth.signInWithPassword()`. On success, `setUser(data.user)` is called and `router.push("/dashboard")` redirects to dashboard. No error message displayed. | High |
| TC-02 | Authentication | Email login with invalid credentials | No matching user exists | 1. Navigate to `/login` 2. Enter non-existent email and any password 3. Click "Log In →" | Supabase returns error containing "invalid login credentials". `AuthProvider.login()` (line 98) remaps this to "Invalid email or password. Please try again." and sets `errorMsg` state. Red error banner is displayed. | High |
| TC-03 | Authentication | Email login with empty fields | User on login page | 1. Navigate to `/login` 2. Leave email or password empty 3. Click "Log In →" | HTML5 `required` attribute on both `<input>` elements (lines 241, 262) prevents form submission. Browser displays native validation error. | Medium |
| TC-04 | Authentication | Signup with valid email and password | No existing account for the email | 1. Navigate to `/signup` 2. Enter email, password (≥6 chars), confirm password matching 3. Click "Sign Up →" | `AuthProvider.signup()` calls `supabase.auth.signUp()`. On success, `successMsg` is set to "Account successfully created! Redirecting..." (line 64). User redirected to `/dashboard`. Supabase trigger `handle_new_user()` creates a `user_profiles` row with `role = 'user'`. | High |
| TC-05 | Authentication | Signup with mismatched passwords | User on signup page | 1. Enter email, password "abc123", confirm password "abc456" 2. Click "Sign Up →" | Validation at `signup/page.tsx` line 45-48 checks `password !== confirmPassword`. Error message "Passwords do not match. Please verify." is displayed. No API call is made. | High |
| TC-06 | Authentication | Signup with password under 6 characters | User on signup page | 1. Enter email, password "abc", matching confirm password 2. Click "Sign Up →" | Validation at `signup/page.tsx` line 50-53 checks `password.length < 6`. Error message "Password must be at least 6 characters." is displayed. No API call is made. | High |
| TC-07 | Authentication | Signup with already registered email | Account exists for the email | 1. Enter existing email and valid passwords 2. Click "Sign Up →" | Supabase returns error containing "already registered" or "user already exists". `AuthProvider.signup()` (line 121-123) remaps to "An account with this email address already exists." | Medium |
| TC-08 | Authentication | Google OAuth login | Google OAuth provider configured in Supabase | 1. Click "Continue with Google" on login page | `handleGoogleLogin()` calls `supabase.auth.signInWithOAuth({ provider: "google" })` with `redirectTo` set to `${window.location.origin}/auth/callback`. User is redirected to Google consent screen. | High |
| TC-09 | Authentication | OAuth callback with valid code | User completed Google OAuth consent | 1. Browser redirects to `/auth/callback?code=VALID_CODE` | `auth/callback/route.ts` calls `supabase.auth.exchangeCodeForSession(code)`. On success, redirects to `/dashboard` (or the `next` query parameter). | High |
| TC-10 | Authentication | OAuth callback without code parameter | Direct access to callback URL | 1. Navigate to `/auth/callback` without a `code` param | Route (line 20) redirects to `/login?error=Missing+auth+code+parameter`. | Medium |
| TC-11 | Authentication | Logout flow | User is authenticated | 1. Click logout in Navbar | `AuthProvider.logout()` calls `supabase.auth.signOut()`, sets user and role to null, redirects to `/login`. `onAuthStateChange` listener fires `SIGNED_OUT` event. | High |
| TC-12 | Authentication | Mobile OTP login - send OTP | Phone auth enabled in Supabase | 1. On `/login`, switch to "Mobile Number" tab 2. Enter country code +91 and 10-digit number 3. Click "Send OTP →" | `supabase.auth.signInWithOtp({ phone: fullPhone })` is called. On success, `showOtpInput` is set to `true` and OTP input field appears. | Medium |
| TC-13 | Authentication | Mobile OTP login - phone auth not enabled | Supabase phone auth disabled | 1. Switch to Mobile tab 2. Enter number 3. Click "Send OTP →" | Error caught at `login/page.tsx` line 56. Error message set to "Phone login is not enabled. Please use your email address." and tab reverts to email. | Medium |
| TC-14 | Authentication | `useAuth` hook used outside `AuthProvider` | Component not wrapped in `AuthProvider` | 1. Call `useAuth()` in an unwrapped component | `hooks/useAuth.ts` line 9 checks `context === undefined` and throws "useAuth must be used within an AuthProvider". | Low |
| TC-15 | Authentication | Authenticated user accessing `/login` | User logged in | 1. Navigate to `/login` while authenticated | Middleware at `utils/supabase/middleware.ts` line 73-78 detects `isAuthPath && user` and redirects to `/dashboard`. | Medium |

---

### Module: Password Recovery

**Source Files:** `app/forgot-password/page.tsx`, `app/reset-password/page.tsx`

| Test ID | Module | Test Scenario | Pre-conditions | Steps | Expected Output | Priority |
|---------|--------|---------------|-----------------|-------|-----------------|----------|
| TC-16 | Password Recovery | Request password reset with valid email | Account exists for the email | 1. Navigate to `/forgot-password` 2. Enter registered email 3. Click "Send Reset Link →" | `supabase.auth.resetPasswordForEmail(email)` is called with `redirectTo` pointing to `/reset-password`. Success message "A password recovery link has been dispatched to your email address." is displayed. | High |
| TC-17 | Password Recovery | Reset password with valid token | User clicked reset link from email | 1. Follow email link to `/reset-password` 2. Enter new password (≥6 chars) and matching confirm 3. Click "Update Password →" | `supabase.auth.updateUser({ password })` is called. Success message "Password updated successfully. Redirecting you to login..." is shown. After 2500ms `setTimeout`, user is redirected to `/login`. | High |
| TC-18 | Password Recovery | Reset password with mismatched passwords | User on reset-password page | 1. Enter password "newpass1" and confirm "newpass2" 2. Submit | Validation at `reset-password/page.tsx` line 37-41 catches mismatch. Error "Passwords do not match. Please verify." is displayed. | Medium |
| TC-19 | Password Recovery | Reset password with short password | User on reset-password page | 1. Enter password "abc" (< 6 chars) 2. Submit | Validation at line 43-47 catches short password. Error "Password must be at least 6 characters long." displayed. | Medium |
| TC-20 | Password Recovery | Reset link expired/invalid | OTP token expired | 1. Navigate to `/reset-password?error=access_denied&error_code=otp_expired` | `useEffect` at line 17-29 detects `error_code === "otp_expired"` and sets error message "This password reset link has expired or is invalid. Please request a new recovery link." Form fields are disabled. | Medium |

---

### Module: Middleware & Route Protection

**Source Files:** `utils/supabase/middleware.ts`

| Test ID | Module | Test Scenario | Pre-conditions | Steps | Expected Output | Priority |
|---------|--------|---------------|-----------------|-------|-----------------|----------|
| TC-21 | Middleware | Unauthenticated access to `/dashboard` | No active session | 1. Navigate to `/dashboard` without logging in | Middleware detects `isProtectedPath && !user` (line 51) and redirects to `/login`. | High |
| TC-22 | Middleware | Unauthenticated access to `/resume/*` | No active session | 1. Navigate to `/resume/builder` without logging in | `/resume` is in `isProtectedPath` (line 48-49). Middleware redirects to `/login`. | High |
| TC-23 | Middleware | Non-admin user accessing `/analytics` | User logged in with `role = 'user'` | 1. Navigate to `/analytics` | Middleware (line 58-70) checks `user_profiles.role` for admin. Since `role !== 'admin'`, redirects to `/dashboard`. | High |
| TC-24 | Middleware | Admin user accessing `/analytics` | User logged in with `role = 'admin'` | 1. Navigate to `/analytics` | Middleware finds `profile.role === 'admin'` and allows access (no redirect). | Medium |

---

### Module: Resume Upload & Analysis (Parse → ATS Score)

**Source Files:** `app/api/parse-resume/route.ts`, `app/api/analyze-resume/route.ts`, `lib/resumeParser.ts`, `lib/calculateATS.ts`, `lib/sectionParser.ts`, `lib/extractPersonalInfo.ts`, `lib/extractSkills.ts`

| Test ID | Module | Test Scenario | Pre-conditions | Steps | Expected Output | Priority |
|---------|--------|---------------|-----------------|-------|-----------------|----------|
| TC-25 | Resume Upload | Upload valid PDF file | User authenticated | 1. POST `/api/parse-resume` with FormData containing a valid PDF file | `pdf-parse` library extracts text. Response: `{ text: "<extracted>", fileName: "<file.name>" }`. Status 200. | High |
| TC-26 | Resume Upload | Upload valid TXT file | User authenticated | 1. POST `/api/parse-resume` with a `.txt` file | `buffer.toString("utf-8")` extracts text (line 52). Response: `{ text: "...", fileName: "..." }`. Status 200. | High |
| TC-27 | Resume Upload | Upload unsupported file type (e.g., DOCX) | User authenticated | 1. POST `/api/parse-resume` with a `.docx` file | `parse-resume/route.ts` line 54-60 returns `{ error: "Only PDF or TXT files supported" }` with status 400. | High |
| TC-28 | Resume Upload | Upload empty PDF (no extractable text) | User authenticated | 1. POST `/api/parse-resume` with a PDF that has only images, no text | `pdf-parse` returns empty `text`. Check at line 63-70 returns `{ error: "Could not extract text from file" }`, status 400. | Medium |
| TC-29 | Resume Upload | Upload with no file attached | User authenticated | 1. POST `/api/parse-resume` with empty FormData | `file` is null (line 8). Returns `{ error: "No file uploaded" }`, status 400. | Medium |
| TC-30 | Resume Analysis | Analyze resume with valid text (authenticated) | User authenticated | 1. POST `/api/analyze-resume` with `{ resumeText: "...", fileName: "My Resume" }` | `parseResume(resumeText)` returns structured `ResumeData`. `calculateATS(resumeText)` returns `ATSScore`. Record inserted into `resumes` table with `user_id`, `file_name`, `raw_text`, `resume_data`, `ats_score`. Response: saved row JSON. | High |
| TC-31 | Resume Analysis | Analyze resume without authentication | No active session | 1. POST `/api/analyze-resume` with `{ resumeText: "..." }` but no auth cookie | `supabase.auth.getUser()` returns null. Response: `{ error: "Unauthorized access. Missing active auth session." }`, status 401. | High |
| TC-32 | Resume Analysis | Analyze resume with empty resumeText | User authenticated | 1. POST `/api/analyze-resume` with `{ resumeText: "" }` | Check at line 31-33 returns `{ error: "No resume text provided" }`, status 400. | High |
| TC-33 | ATS Scoring | ATS score for freshman resume (< 3 YoE) | N/A (unit logic) | 1. Call `calculateATS()` with text containing "intern" keyword, no year ranges | `estimateYearsOfExperience()` returns 1. `expLevel = "freshman"`, `standardLabel = "Freshman (Lenient)"`. Lenient scoring baselines apply. | Medium |
| TC-34 | ATS Scoring | ATS score for executive resume (≥ 10 YoE) | N/A | 1. Call `calculateATS()` with text spanning 2005-2026 with college education | `estimateYearsOfExperience()` computes `2026-2005 = 21`, minus 4 for college = 17 years. `expLevel = "executive"`. Strict scoring: needs ≥6 metrics, ≥18 tech + ≥8 soft skills. | Medium |
| TC-35 | ATS Scoring | ATS penalizes USD currency usage | N/A | 1. Call `calculateATS()` with text containing "$500K budget" | `usdRegex` matches `$` (line 134-135). `formattingScore -= 10`. Suggestion includes "Currency Format: Detected USD ($) references." | Medium |
| TC-36 | ATS Scoring | ATS rewards Indian Rupee metrics | N/A | 1. Call `calculateATS()` with text containing "₹15 Lakhs" | `rupeeRegex` matches (line 131-132). `formattingScore` gets `+10` bonus (line 143). | Low |
| TC-37 | ATS Scoring | ATS detects missing sections | N/A | 1. Call `calculateATS()` with text that has no "Experience" or "Education" section headers | `parseSections()` returns empty arrays. `sectionsScore` reduced: -30 for Experience, -20 for Education. Suggestions list missing sections. | Medium |
| TC-38 | ATS Scoring | ATS detects passive voice | N/A | 1. Call `calculateATS()` with text containing "responsible for" and "worked on" | `passiveVoiceRegex` matches ≥2 items (line 212-213). `readabilityScore -= 15`. Suggestion about upgrading to active verbs. | Low |
| TC-39 | Section Parser | Parser identifies all section headers | N/A | 1. Call `parseSections()` with text containing "Summary", "Experience", "Education", "Projects", "Skills", "Certifications" headers | Each section keyword regex matches and lines are distributed to correct section arrays. Header lines themselves are skipped (line 54). | Medium |
| TC-40 | Section Parser | Lines before any header default to summary | N/A | 1. Call `parseSections()` with text that starts with content before any section header | Lines distributed under `summary` via the else branch at line 61. | Low |
| TC-41 | Personal Info | Extract email from resume text | N/A | 1. Call `extractPersonalInfo()` with text containing "user@example.com" | `emailRegex` at line 8 matches. `email` field in returned `PersonalInfo` equals "user@example.com". | Medium |
| TC-42 | Personal Info | Extract name from first line | N/A | 1. Call `extractPersonalInfo()` with "John Doe\nSoftware Engineer\nuser@example.com" | Name extraction (lines 19-33) iterates first 3 lines. "John Doe" passes all filters (no @, no URLs, letters/spaces only, length 2-40). `fullName = "John Doe"`. | Medium |
| TC-43 | Personal Info | Name with special characters defaults | N/A | 1. Call `extractPersonalInfo()` with first line "123-456-7890" (phone number) | Line fails `/^[a-zA-Z\s]+$/` test (line 28). Falls through to default `fullName = "Untitled Candidate"`. | Low |
| TC-44 | Skills Extraction | Extract technical and soft skills | N/A | 1. Call `extractSkills()` with text containing "React, Node.js, Leadership, Teamwork" | `TECHNICAL_DICTIONARY` matches "react", "node.js" via word-boundary regex. `SOFT_DICTIONARY` matches "leadership", "teamwork". Skills returned with proper casing. | Medium |
| TC-45 | Skills Extraction | Missing skills computed from dependencies | N/A | 1. Call `extractSkills()` with text containing "react" but not "next.js", "typescript", "tailwind" | `SKILL_DEPENDENCIES["react"]` lists `["next.js", "typescript", "tailwind"]`. Since these aren't found, they appear in `missingSkills` (up to 5). | Low |
| TC-46 | Resume Parser | Parse work experience with bullets | N/A | 1. Call `parseResume()` with text having "Experience\nSoftware Engineer \| TCS \| Jan 2022 - Present\n• Built microservices" | `workExperience` array contains one entry with `role = "Software Engineer"`, `company = "TCS"`, `bullets = ["Built microservices"]`, `current = true`. | Medium |
| TC-47 | Resume Parser | Default fallback when no experience found | N/A | 1. Call `parseResume()` with text that has no experience section | `resumeParser.ts` lines 167-177 push a default work experience entry with `company = "Company Name"`, `role = "Professional Role"`, `current = true`. | Low |

---

### Module: Resume Builder & Save

**Source Files:** `app/api/save-resume/route.ts`, `app/resume/builder/page.tsx`

| Test ID | Module | Test Scenario | Pre-conditions | Steps | Expected Output | Priority |
|---------|--------|---------------|-----------------|-------|-----------------|----------|
| TC-48 | Save Resume | Save new resume (INSERT) | User authenticated, no `id` in body | 1. POST `/api/save-resume` with `{ fileName: "My Resume", resumeText: "...", structuredResume: {...} }` | No `id` provided → INSERT path (line 73-93). Row inserted into `resumes` with `user_id = user.id`. ATS score auto-calculated if omitted (line 42-48). Response: saved row JSON. | High |
| TC-49 | Save Resume | Update existing resume (UPDATE) | User authenticated, resume exists | 1. POST `/api/save-resume` with `{ id: "<existing_uuid>", fileName: "Updated", ... }` | `id` provided → UPDATE path (line 53-71). `.eq("id", id).eq("user_id", user.id)` enforces ownership. `updated_at` set to current timestamp. | High |
| TC-50 | Save Resume | Save resume without authentication | No active session | 1. POST `/api/save-resume` without auth cookies | `user` is null (line 22). `throw new Error("User not authenticated")` caught at line 109. Response: `{ error: "User not logged in or active session expired." }`, status 401. | High |
| TC-51 | Save Resume | Auto-calculate ATS score when omitted | User authenticated | 1. POST `/api/save-resume` with `resumeText` but no `ats_score`/`atsScore` | `atsScore` is null/undefined (line 42). `calculateATS(resumeText)` called automatically. Score saved with resume. | Medium |
| TC-52 | Save Resume | Update resume owned by different user | User A authenticated, resume belongs to User B | 1. POST `/api/save-resume` with `{ id: "<userB_resume_id>" }` | `.eq("user_id", user.id)` at line 67 doesn't match User B's resume. Supabase RLS also blocks. `resultData` is empty → line 101-103 throws "Database failed to return saved record." Status 500. | High |

---

### Module: Resume Retrieval & Deletion

**Source Files:** `app/api/get-resumes/route.ts`, `app/api/delete-resume/route.ts`

| Test ID | Module | Test Scenario | Pre-conditions | Steps | Expected Output | Priority |
|---------|--------|---------------|-----------------|-------|-----------------|----------|
| TC-53 | Get Resumes | Retrieve all resumes for authenticated user | User has 3 resumes | 1. GET `/api/get-resumes` | Query filters by `user_id`, orders by `created_at` DESC. Response: JSON array of 3 resume objects. | High |
| TC-54 | Get Resumes | Retrieve resumes when user has none | User has 0 resumes | 1. GET `/api/get-resumes` | Response: empty array `[]` (line 37 returns `data || []`). | Medium |
| TC-55 | Get Resumes | Retrieve resumes without authentication | No session | 1. GET `/api/get-resumes` | Returns `{ error: "User not logged in or active session expired." }`, status 401. | High |
| TC-56 | Delete Resume | Delete own resume | User authenticated, resume exists | 1. POST `/api/delete-resume` with `{ id: "<resume_uuid>" }` | Delete scoped by `.eq("id", id).eq("user_id", user.id)` (line 38-39). Returns `{ success: true, message: "Resume deleted successfully.", deletedRecord: {...} }`. | High |
| TC-57 | Delete Resume | Delete resume without `id` parameter | User authenticated | 1. POST `/api/delete-resume` with `{}` | Validation at line 27-32: `{ error: "Missing required resume parameter: id" }`, status 400. | Medium |
| TC-58 | Delete Resume | Delete resume belonging to another user | User A authenticated | 1. POST `/api/delete-resume` with `{ id: "<userB_resume>" }` | `.eq("user_id", user.id)` doesn't match. `deletedRecord` is null (line 46-52). Response: `{ error: "Resume record not found or access denied." }`, status 404. | High |
| TC-59 | Delete Resume | Delete resume without authentication | No session | 1. POST `/api/delete-resume` | Returns `{ error: "Unauthorized access. Missing active auth session." }`, status 401. | High |

---

### Module: LinkedIn Import

**Source Files:** `app/api/linkedin-import/route.ts`

| Test ID | Module | Test Scenario | Pre-conditions | Steps | Expected Output | Priority |
|---------|--------|---------------|-----------------|-------|-----------------|----------|
| TC-60 | LinkedIn Import | Import via CSV file upload (multipart) | User authenticated | 1. POST `/api/linkedin-import` with `multipart/form-data` containing LinkedIn `Profile.csv` | `parseCSV()` extracts headers and data rows. Maps "First Name", "Last Name", "Headline", "Summary", etc. Returns `{ success: true, data: { personal: {...}, summary: "...", experience: [], ... } }`. | High |
| TC-61 | LinkedIn Import | Import via text paste (JSON body) | User authenticated | 1. POST `/api/linkedin-import` with `{ rawText: "...", source: "paste" }` | `askAIJSON()` parses LinkedIn text via AI. Returns `{ success: true, data: <parsed_resume> }`. | High |
| TC-62 | LinkedIn Import | CSV file with fewer than 2 rows | User authenticated | 1. Upload CSV with only a header row | `rows.length < 2` (line 81). Returns `{ error: "Empty or invalid CSV file." }`, status 400. | Medium |
| TC-63 | LinkedIn Import | Missing file in multipart request | User authenticated | 1. POST multipart with no `file` field | Line 71-76: `{ error: "Missing required file parameter: file" }`, status 400. | Medium |
| TC-64 | LinkedIn Import | JSON body missing `source` or `rawText` | User authenticated | 1. POST with `{ rawText: "" }` or `{ source: "unknown" }` | Line 138: `source !== "paste" || !rawText` triggers `{ error: "Missing rawText or source parameter." }`, status 400. | Medium |
| TC-65 | LinkedIn Import | Unauthenticated request | No session | 1. POST `/api/linkedin-import` | Returns `{ error: "Unauthorized access. Missing active auth session." }`, status 401. | High |

---

### Module: AI-Powered Features

**Source Files:** `app/api/generate-section/route.ts`, `app/api/generate-cover-letter/route.ts`, `app/api/ai-chat/route.ts`, `app/api/check-grammar/route.ts`, `app/api/career-recommendations/route.ts`, `app/api/skill-gap/route.ts`, `app/api/predict-interview-questions/route.ts`, `app/api/generate-career-story/route.ts`, `app/api/translate-achievement/route.ts`, `app/api/naukri-tips/route.ts`, `lib/openrouter.ts`

| Test ID | Module | Test Scenario | Pre-conditions | Steps | Expected Output | Priority |
|---------|--------|---------------|-----------------|-------|-----------------|----------|
| TC-66 | AI Engine | Gemini API succeeds on first attempt | Valid `GEMINI_API_KEY` env var | 1. Call `askAI(prompt)` | `openrouter.ts` line 108: `hasGemini` is true. Gemini `generateContent()` returns valid text. `logAIRequest("gemini-2.0-flash", true)` called. Response returned without hitting OpenRouter. | High |
| TC-67 | AI Engine | Gemini fails, OpenRouter fallback succeeds | Invalid/expired Gemini key, valid OpenRouter key | 1. Call `askAI(prompt)` | Gemini throws at line 127-130. `logAIRequest("gemini-2.0-flash", false)` logged. Falls through to OpenRouter (line 134). Cascading model chain tries each model in `OPENROUTER_MODELS` until one succeeds. | High |
| TC-68 | AI Engine | All AI models fail (complete failure) | Both Gemini and all OpenRouter models fail | 1. Call `askAI(prompt)` | Gemini fails, all 8 OpenRouter models fail. `fetchOpenRouter()` throws "OpenRouter failover exhausted. All fallback models failed." (line 90). `askAI()` throws `AI Client Failure`. | High |
| TC-69 | AI Engine | OpenRouter key is placeholder/missing | `OPENROUTER_API_KEY` is "sk-or-your-key-here" | 1. Call `fetchOpenRouter()` | Line 37 checks for placeholder keys. Throws "AI Configuration Error: No active OpenRouter key found." | Medium |
| TC-70 | AI Engine | JSON parsing with markdown code fences | AI returns ` ```json {...} ``` ` | 1. Call `askAIJSON()` | `openrouter.ts` line 187/221: `.replace(/```json|```/g, "")` strips markdown fences. Parses inner JSON successfully. | Medium |
| TC-71 | AI Engine | JSON parsing fallback (extract first `{...}`) | AI returns explanatory text before JSON | 1. Call `askAIJSON()` with response like "Here is the result: { ... }" | Primary `JSON.parse` fails. Fallback regex `clean.match(/\{[\s\S]*\}/)` at line 193-198/225-226 extracts and parses the JSON object. | Medium |
| TC-72 | Generate Section | Generate summary with valid context | User provides context text | 1. POST `/api/generate-section` with `{ section: "summary", context: "5 years React dev" }` | `prompts["summary"]` template used (line 11-15). `askAI()` generates professional summary. Response: `{ result: "..." }`. | Medium |
| TC-73 | Generate Section | Generate with unknown section type | User sends `section: "unknown"` | 1. POST `/api/generate-section` with `{ section: "foo", context: "..." }` | Fallback prompt used at line 29: `"Improve this resume section content: ..."`. `askAI()` still returns result. | Low |
| TC-74 | Generate Section | No authentication check exists | Any caller | 1. POST `/api/generate-section` without auth | **Note:** `generate-section/route.ts` does NOT check authentication. Any caller can invoke this AI-powered endpoint. Response: `{ result: "..." }`. | High |
| TC-75 | Cover Letter | Generate cover letter with valid inputs | User authenticated, resume exists | 1. POST `/api/generate-cover-letter` with `{ resumeId: "...", jobDescription: "..." }` | Resume fetched with ownership check (`.eq("user_id", user.id)`). `askAI()` generates cover letter. Response: `{ letter: "..." }`. | High |
| TC-76 | Cover Letter | Missing resumeId or jobDescription | User authenticated | 1. POST with `{ resumeId: "" }` or missing `jobDescription` | Line 17-18: `{ error: "Missing resumeId or jobDescription." }`, status 400. | Medium |
| TC-77 | Cover Letter | Resume not found or not owned | User authenticated | 1. POST with `{ resumeId: "<other_user_resume>" }` | Line 29-31: `{ error: "Resume not found or access denied." }`, status 404. | Medium |
| TC-78 | AI Chat | Valid chat message with resume context | User provides messages array and resumeData | 1. POST `/api/ai-chat` with `{ messages: [{role: "user", content: "Improve my resume"}], resumeData: {...} }` | Resume context built from `resumeData` fields (lines 12-19). `askAI()` generates response. Response: `{ message: "..." }`. | Medium |
| TC-79 | AI Chat | Invalid messages payload | Caller sends `{ messages: "not an array" }` | 1. POST `/api/ai-chat` with non-array `messages` | Line 8-9: `{ error: "Invalid request payload: messages array is required." }`, status 400. | Medium |
| TC-80 | AI Chat | No authentication check exists | Any caller | 1. POST `/api/ai-chat` without auth | **Note:** `ai-chat/route.ts` does NOT check authentication. Any caller can invoke this AI endpoint. | High |
| TC-81 | Grammar Check | Check text with valid input | User authenticated | 1. POST `/api/check-grammar` with `{ text: "I responsible for managed the team." }` | `askAIJSON()` returns `GrammarCheckResult` with `hasIssues: true` and suggestions array. | Medium |
| TC-82 | Grammar Check | Empty text input | User authenticated | 1. POST `/api/check-grammar` with `{ text: "" }` | Line 26-27: `{ error: "Missing text to check." }`, status 400. | Medium |
| TC-83 | Career Recommendations | Generate recommendations | User authenticated, resume exists | 1. POST `/api/career-recommendations` with `{ resumeId: "..." }` | Resume data fetched and stringified. `askAIJSON()` returns `CareerRecommendations` with 3 role suggestions. | Medium |
| TC-84 | Skill Gap | Analyze skill gap with valid inputs | User authenticated, resume exists | 1. POST `/api/skill-gap` with `{ resumeId: "...", targetRole: "Senior React Developer" }` | Resume fetched with ownership check. AI returns `SkillGapResult` with matched/missing skills, courses, and gap percentage. | Medium |
| TC-85 | Skill Gap | Missing targetRole parameter | User authenticated | 1. POST `/api/skill-gap` with `{ resumeId: "..." }` (no targetRole) | Line 24: `{ error: "Missing resumeId or targetRole." }`, status 400. | Medium |
| TC-86 | Interview Questions | Predict questions for resume | User authenticated, resume exists | 1. POST `/api/predict-interview-questions` with `{ resumeId: "..." }` | `askAIJSON()` returns 5 questions with type and answer tips. | Medium |
| TC-87 | Career Story | Generate "Tell me about yourself" | User authenticated, resume exists | 1. POST `/api/generate-career-story` with `{ resumeId: "..." }` | `askAI()` generates 200-300 word narrative script. Response: `{ script: "..." }`. | Medium |
| TC-88 | Translate Achievement | Translate bullet to Indian format | User authenticated | 1. POST `/api/translate-achievement` with `{ bullet: "Managed $2M budget" }` | `askAI()` rewrites bullet to use ₹/Lakhs/Crores. Response: `{ result: "Managed ₹15 Crore budget..." }`. | Medium |
| TC-89 | Translate Achievement | Empty bullet text | User authenticated | 1. POST with `{ bullet: "" }` | Line 17: `{ error: "Missing bullet text." }`, status 400. | Low |
| TC-90 | Naukri Tips | Generate portal optimization tips | User authenticated, resume exists | 1. POST `/api/naukri-tips` with `{ resumeId: "..." }` | Resume fetched. `askAIJSON()` returns `NaukriTipsResult` with 4-5 actionable tips. | Medium |

---

### Module: Job Application Tracker

**Source Files:** `app/api/job-applications/route.ts`

| Test ID | Module | Test Scenario | Pre-conditions | Steps | Expected Output | Priority |
|---------|--------|---------------|-----------------|-------|-----------------|----------|
| TC-91 | Job Tracker | GET all applications (authenticated) | User has 5 applications | 1. GET `/api/job-applications` | Returns JSON array of 5 records, ordered by `created_at DESC`. Filtered by `user_id`. | High |
| TC-92 | Job Tracker | POST new application with required fields | User authenticated | 1. POST `/api/job-applications` with `{ company: "TCS", role: "SDE", status: "Applied" }` | Inserted into `job_applications` with `user_id`. DB constraint `CHECK (status IN ('Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'))` validated. Response: created record. | High |
| TC-93 | Job Tracker | POST with missing required fields | User authenticated | 1. POST with `{ company: "TCS" }` (missing role and status) | Line 74: `{ error: "Missing required fields: company, role, and status are mandatory." }`, status 400. | High |
| TC-94 | Job Tracker | POST with invalid status value | User authenticated | 1. POST with `{ company: "TCS", role: "SDE", status: "Pending" }` | DB `CHECK` constraint rejects "Pending". Supabase throws error. Response: status 500 with error message. | Medium |
| TC-95 | Job Tracker | POST with resume_id and jd_text (auto JD match) | User authenticated, resume exists | 1. POST with `{ company: "...", role: "...", status: "Applied", resume_id: "...", jd_text: "..." }` | `calculateJDMatchScore()` (line 81-91) fetches resume raw_text and calls `askAIJSON()` to compute match score 0-100. Score clamped by `Math.max(0, Math.min(100, ...))`. Stored in `jd_match_score`. | Medium |
| TC-96 | Job Tracker | PUT update application | User authenticated, application exists | 1. PUT `/api/job-applications` with `{ id: "...", status: "Interview" }` | Update scoped by `.eq("id", id).eq("user_id", user.id)`. `updated_at` set. | Medium |
| TC-97 | Job Tracker | PUT without id | User authenticated | 1. PUT with `{ status: "Interview" }` (no id) | Line 148-150: `{ error: "Missing job application ID." }`, status 400. | Medium |
| TC-98 | Job Tracker | DELETE application | User authenticated | 1. DELETE `/api/job-applications?id=<uuid>` | ID read from `searchParams` (line 209). Delete scoped by `user_id`. Response: `{ success: true, message: "Job application deleted." }`. | Medium |
| TC-99 | Job Tracker | DELETE without id query param | User authenticated | 1. DELETE `/api/job-applications` (no `?id=`) | Line 211-213: `{ error: "Missing job application ID in query string." }`, status 400. | Medium |
| TC-100 | Job Tracker | All endpoints unauthenticated | No session | 1. Call any method on `/api/job-applications` | Each method checks `!user` and returns `{ error: "Unauthorized. Please log in first." }`, status 401. | High |

---

### Module: Resume Sharing

**Source Files:** `app/api/share/route.ts`, `supabase_schema.sql` (resume_shares table)

| Test ID | Module | Test Scenario | Pre-conditions | Steps | Expected Output | Priority |
|---------|--------|---------------|-----------------|-------|-----------------|----------|
| TC-101 | Sharing | GET share status for own resume | User authenticated, resume exists, no share link | 1. GET `/api/share?resumeId=<uuid>` | Ownership verified. `maybeSingle()` returns null. Response: `{ active: false, message: "No active share link found." }`. | Medium |
| TC-102 | Sharing | POST create share link | User authenticated, resume exists, no existing share | 1. POST `/api/share` with `{ resumeId: "..." }` | `crypto.randomBytes(16).toString("hex")` generates token. Row inserted into `resume_shares` with `views_count: 0, downloads_count: 0, is_public: true`. | High |
| TC-103 | Sharing | POST toggle existing share visibility | User authenticated, share link already exists | 1. POST `/api/share` with `{ resumeId: "...", isPublic: false }` | Existing share found. `is_public` updated to `false`. `updated_at` refreshed. | Medium |
| TC-104 | Sharing | GET/POST without resumeId | User authenticated | 1. Call without `resumeId` param | GET: `{ error: "Missing resume ID parameter." }`, status 400. POST: `{ error: "Missing resume ID." }`, status 400. | Medium |
| TC-105 | Sharing | Access share for non-owned resume | User A tries sharing User B's resume | 1. POST `/api/share` with User B's resume ID | Ownership check at line 66-74 fails. `{ error: "Resume not found or access denied." }`, status 404. | High |

---

### Module: Resume Export (DOCX)

**Source Files:** `app/api/export-resume/route.ts`

| Test ID | Module | Test Scenario | Pre-conditions | Steps | Expected Output | Priority |
|---------|--------|---------------|-----------------|-------|-----------------|----------|
| TC-106 | Export | Export resume as DOCX | User authenticated, resume exists | 1. POST `/api/export-resume` with `{ resumeId: "..." }` | Resume loaded with ownership check. `docx` library generates Word document with sections: header, summary, work experience (bullets), projects, education, skills, languages, certifications. Response has `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`. | High |
| TC-107 | Export | Export with missing resumeId | User authenticated | 1. POST with `{}` | Line 25: `{ error: "Missing resumeId." }`, status 400. | Medium |
| TC-108 | Export | Export non-owned resume | User authenticated | 1. POST with another user's resume ID | Line 37-39: `{ error: "Resume not found." }`, status 404. | Medium |
| TC-109 | Export | DOCX file naming | User authenticated | 1. Export a resume with `file_name = "John's Resume"` | `downloadName` (line 394-396) replaces non-alphanumeric chars: `"John_s_Resume.docx"`. `Content-Disposition` header set correctly. | Low |
| TC-110 | Export | Export resume with empty/null sections | User authenticated | 1. Export resume where `workExperience`, `projects` are empty arrays | Conditional checks (`work.length > 0`, `projects.length > 0`, etc.) skip empty sections. DOCX still generates valid document with available sections only. | Medium |

---

### Module: Salary Benchmark

**Source Files:** `app/api/salary-benchmark/route.ts`, `lib/salaryData.ts`

| Test ID | Module | Test Scenario | Pre-conditions | Steps | Expected Output | Priority |
|---------|--------|---------------|-----------------|-------|-----------------|----------|
| TC-111 | Salary | GET salary benchmark with valid params | User authenticated | 1. GET `/api/salary-benchmark?role=Frontend Engineer&yoe=5&city=Bangalore` | `getSalaryBenchmark()` normalizes role to "frontend_engineer", bracket "mid" (3-5 YoE), city multiplier 1.15. Returns `{ minLPA: 8.1, maxLPA: 17.3, roleName: "Frontend Engineer", cityName: "Bengaluru" }`. | Medium |
| TC-112 | Salary | GET with default parameters | User authenticated | 1. GET `/api/salary-benchmark` (no query params) | Defaults: `role = "Software Engineer"`, `yoe = 2`, `city = "Hyderabad"`. Bracket "entry", multiplier 1.0. | Low |
| TC-113 | Salary | GET with unrecognized role | User authenticated | 1. GET `?role=Astronaut&yoe=5&city=Mumbai` | Role normalization fails all checks. Falls back to "software_engineer" (line 69). Still returns valid benchmark. | Low |
| TC-114 | Salary | Unauthenticated request | No session | 1. GET `/api/salary-benchmark` | Returns `{ error: "Unauthorized." }`, status 401. | Medium |

---

### Module: Notifications

**Source Files:** `app/api/notifications/route.ts`, `components/NotificationBell.tsx`

| Test ID | Module | Test Scenario | Pre-conditions | Steps | Expected Output | Priority |
|---------|--------|---------------|-----------------|-------|-----------------|----------|
| TC-115 | Notifications | GET notifications | User authenticated | 1. GET `/api/notifications` | Returns array of notifications for user, ordered by `created_at DESC`. | Medium |
| TC-116 | Notifications | GET with missing notifications table | Notifications table not migrated | 1. GET `/api/notifications` | Error caught at line 26-28. Console warns and returns `[]` as graceful fallback. | Low |
| TC-117 | Notifications | POST mark single notification as read | User authenticated | 1. POST `/api/notifications` with `{ id: "<notification_uuid>" }` | `is_read` updated to `true` for specified notification, scoped by `user_id`. Response: `{ success: true }`. | Medium |
| TC-118 | Notifications | POST mark all as read | User authenticated | 1. POST with `{ markAllRead: true }` | All user's notifications updated. Response: `{ success: true }`. | Medium |
| TC-119 | Notifications | POST with invalid body | User authenticated | 1. POST with `{}` (no `id` or `markAllRead`) | Line 85: `{ error: "Invalid request body parameters." }`, status 400. | Low |

---

### Module: Onboarding

**Source Files:** `app/api/onboarding/route.ts`

| Test ID | Module | Test Scenario | Pre-conditions | Steps | Expected Output | Priority |
|---------|--------|---------------|-----------------|-------|-----------------|----------|
| TC-120 | Onboarding | Complete onboarding | User authenticated | 1. POST `/api/onboarding` with `{ targetRole: "SDE", targetCity: "Mumbai", yoe: 3 }` | Updates `user_profiles.has_completed_onboarding = true`. Response: `{ success: true, data: {...} }`. | Medium |
| TC-121 | Onboarding | Onboarding with missing profiles table column | Column not migrated | 1. POST `/api/onboarding` | Error caught at line 29-31. Console warns and returns `{ success: true, bypassed: true }` — zero lock for user. | Low |
| TC-122 | Onboarding | Unauthenticated onboarding | No session | 1. POST `/api/onboarding` | Returns `{ error: "Unauthorized." }`, status 401. | Medium |

---

### Module: Admin Panel

**Source Files:** `app/api/admin/stats/route.ts`, `app/api/admin/users/route.ts`, `app/api/admin/ai-usage/route.ts`, `app/api/analytics/route.ts`, `app/api/platform-stats/route.ts`, `lib/isAdmin.ts`

| Test ID | Module | Test Scenario | Pre-conditions | Steps | Expected Output | Priority |
|---------|--------|---------------|-----------------|-------|-----------------|----------|
| TC-123 | Admin | GET analytics as admin | User has `role = 'admin'` | 1. GET `/api/analytics` | `isAdmin()` returns true. Queries `user_profiles` count, `resumes` count, today's uploads, ATS averages, template distribution, signup/upload histories. | High |
| TC-124 | Admin | GET analytics as non-admin | User has `role = 'user'` | 1. GET `/api/analytics` | `isAdmin()` returns false. Response: `{ error: "Forbidden: Administrator permissions required." }`, status 403. | High |
| TC-125 | Admin | GET admin users list | Admin authenticated | 1. GET `/api/admin/users` | Returns all `user_profiles` rows with `id, email, role, created_at, has_completed_onboarding`, ordered by `created_at DESC`. | Medium |
| TC-126 | Admin | POST update user role | Admin authenticated | 1. POST `/api/admin/users` with `{ userId: "...", role: "admin" }` | Role validated at line 57-59: must be "admin" or "user". Profile updated. Response: `{ success: true, user: {...} }`. | Medium |
| TC-127 | Admin | POST update role with invalid value | Admin authenticated | 1. POST with `{ userId: "...", role: "superuser" }` | Line 57-59: `{ error: "Invalid role value. Must be 'admin' or 'user'." }`, status 400. | Medium |
| TC-128 | Admin | GET AI usage logs | Admin authenticated | 1. GET `/api/admin/ai-usage` | Returns enriched logs (with user emails via batch lookup) and aggregated stats: `totalRequests`, `successCount`, `failCount`, `totalTokens`, `successRate`, `modelCounts`. | Medium |
| TC-129 | Admin | GET platform-stats (proxy) | Admin authenticated | 1. GET `/api/platform-stats` | `platform-stats/route.ts` proxies to `analytics/route.ts` GET handler. Same response as `/api/analytics`. | Low |
| TC-130 | Admin | Admin stats endpoint (per-user) | Admin authenticated | 1. GET `/api/admin/stats` | Despite admin check, also queries only `user.id` resumes (line 40). Returns personal analytics: `totalResumes`, `averageATS`, template distribution, recent activity (top 5). | Medium |

---

### Module: Test DB Endpoint

**Source Files:** `app/api/test-db/route.ts`

| Test ID | Module | Test Scenario | Pre-conditions | Steps | Expected Output | Priority |
|---------|--------|---------------|-----------------|-------|-----------------|----------|
| TC-131 | Test DB | Database connection test | Valid Supabase credentials | 1. GET `/api/test-db` | Uses anon key client (`lib/supabase.ts` proxy). Queries `resumes` table with `.limit(1)`. Response: `{ success: true, data: [...] }`. | Low |
| TC-132 | Test DB | No authentication check | Any caller | 1. GET `/api/test-db` without auth | **Note:** `test-db/route.ts` has NO authentication check. Uses anon-key client. Any unauthenticated caller can check DB connectivity. However, RLS policies limit visible data. | Low |

---

### Module: Database Schema & RLS

**Source Files:** `supabase_schema.sql`

| Test ID | Module | Test Scenario | Pre-conditions | Steps | Expected Output | Priority |
|---------|--------|---------------|-----------------|-------|-----------------|----------|
| TC-133 | Database | RLS: User can only view own resumes | User A and User B both have resumes | 1. User A queries `resumes` | RLS policy "Users can view their own resumes" (line 35-36) filters by `auth.uid()::text = user_id::text`. User A sees only their resumes. | High |
| TC-134 | Database | RLS: User cannot delete another user's resume | User A, resume belongs to User B | 1. User A attempts `DELETE FROM resumes WHERE id = <B's resume>` | RLS policy (line 43-44) checks `auth.uid()::text = user_id::text`. Delete silently returns 0 rows affected. | High |
| TC-135 | Database | FK cascade: Deleting user removes resumes | User exists with resumes | 1. Delete user from `auth.users` | FK constraint `fk_resumes_user` (line 13) has `ON DELETE CASCADE`. All user's resumes are automatically deleted. | Medium |
| TC-136 | Database | job_applications status CHECK constraint | N/A | 1. Insert job application with `status = 'Pending'` | `CHECK (status IN ('Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'))` at line 121. Database rejects with constraint violation error. | Medium |
| TC-137 | Database | Auto-create user profile on signup | New user signs up | 1. New row inserted in `auth.users` | Trigger `on_auth_user_created` (line 99-101) fires `handle_new_user()`. New `user_profiles` row created with `role = 'user'`. `ON CONFLICT (id) DO NOTHING` handles duplicates. | Medium |
| TC-138 | Database | resume_shares public visibility | Share exists with `is_public = true` | 1. Anonymous user queries `resume_shares` | RLS policy "Public can view shared resumes" (line 162-163) allows SELECT where `is_public = true`. | Medium |
| TC-139 | Database | resume_shares token uniqueness | Share with token "abc" exists | 1. Insert another share with token "abc" | `UNIQUE` constraint on `token` (line 147). Database rejects duplicate. | Low |

---

### Module: Environment & Configuration

**Source Files:** `lib/env.ts`, `lib/supabase.ts`

| Test ID | Module | Test Scenario | Pre-conditions | Steps | Expected Output | Priority |
|---------|--------|---------------|-----------------|-------|-----------------|----------|
| TC-140 | Config | Missing SUPABASE_URL env var | `NEXT_PUBLIC_SUPABASE_URL` not set | 1. Any code path accesses `supabase` proxy from `lib/supabase.ts` | `getSupabaseClient()` (line 17-26) throws: "Supabase Client Error: Missing required environment variable(s): NEXT_PUBLIC_SUPABASE_URL." | High |
| TC-141 | Config | `validateEnv()` during test mode | `NODE_ENV = "test"` | 1. Call `validateEnv()` | Line 14-19: returns early without checking variables. | Low |
| TC-142 | Config | `validateEnv()` during production build | `NEXT_PHASE = "phase-production-build"` | 1. Call `validateEnv()` | Returns early (line 15). Allows build to succeed without env vars. | Low |

---

## Part B — Bug Reports

---

### BUG-01: Operator Precedence Bug in `file_name` Assignment (analyze-resume)

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-01 |
| **Title** | `file_name` always uses parsed fullName due to `||` operator precedence bug |
| **Module** | Resume Analysis |
| **Severity** | Medium |
| **Steps to Reproduce** | 1. POST `/api/analyze-resume` with `{ resumeText: "John Doe\n...", fileName: "My Custom Name" }` 2. Inspect the saved `file_name` in the database |
| **Expected Behavior** | When `fileName` is provided by the caller, it should be used as-is. When `fileName` is falsy, the parsed `fullName` should be used as fallback. |
| **Actual Behavior** | Due to JavaScript operator precedence, the expression `fileName || structuredResume.personalInfo.fullName ? \`...\` : "Untitled Resume"` is parsed as `(fileName || structuredResume.personalInfo.fullName) ? \`${structuredResume.personalInfo.fullName}'s Resume\` : "Untitled Resume"`. This means whenever `fullName` is truthy (which is almost always — it defaults to "Untitled Candidate"), the ternary evaluates to `"${fullName}'s Resume"`, completely ignoring the caller-supplied `fileName`. |
| **Root Cause** | `app/api/analyze-resume/route.ts` line 45. The `||` operator binds more loosely than `?:`, but the ternary's condition includes both operands of `||`. Missing parentheses around the ternary condition/fallback. |
| **Suggested Fix** | Change line 45 to: `file_name: fileName || (structuredResume.personalInfo.fullName ? \`${structuredResume.personalInfo.fullName}'s Resume\` : "Untitled Resume"),` — wrapping the ternary fallback in parentheses. |
| **Status** | Open |

---

### BUG-02: `generate-section` API Has No Authentication Check

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-02 |
| **Title** | `/api/generate-section` endpoint lacks authentication — publicly accessible |
| **Module** | AI-Powered Features |
| **Severity** | High |
| **Steps to Reproduce** | 1. Send POST to `/api/generate-section` with `{ section: "summary", context: "test" }` without any auth cookies |
| **Expected Behavior** | Should return 401 Unauthorized for unauthenticated users, consistent with all other AI endpoints. |
| **Actual Behavior** | Request succeeds. AI content is generated and returned. This endpoint consumes AI tokens (Gemini/OpenRouter quota) for unauthenticated callers. |
| **Root Cause** | `app/api/generate-section/route.ts` — no Supabase `auth.getUser()` check exists in the handler. Every other AI endpoint (`check-grammar`, `career-recommendations`, `skill-gap`, etc.) includes auth verification. |
| **Suggested Fix** | Add auth check at the start of the POST handler: `const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }` |
| **Status** | Open |

---

### BUG-03: `ai-chat` API Has No Authentication Check

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-03 |
| **Title** | `/api/ai-chat` endpoint lacks authentication — publicly accessible |
| **Module** | AI-Powered Features |
| **Severity** | High |
| **Steps to Reproduce** | 1. Send POST to `/api/ai-chat` with `{ messages: [{role: "user", content: "Hello"}] }` without auth cookies |
| **Expected Behavior** | Should return 401 Unauthorized. |
| **Actual Behavior** | AI Coach responds successfully. Consumes AI tokens for unauthenticated callers. |
| **Root Cause** | `app/api/ai-chat/route.ts` — no Supabase auth check exists. |
| **Suggested Fix** | Add the same auth pattern used in other routes: `const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });` |
| **Status** | Open |

---

### BUG-04: `parse-resume` API Has No Authentication Check

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-04 |
| **Title** | `/api/parse-resume` endpoint lacks authentication — publicly accessible |
| **Module** | Resume Upload |
| **Severity** | Medium |
| **Steps to Reproduce** | 1. POST `/api/parse-resume` with a PDF file, no auth cookies |
| **Expected Behavior** | Should return 401 Unauthorized. |
| **Actual Behavior** | PDF is parsed and text returned. While this doesn't consume AI tokens (local parsing only), it still exposes server-side processing to unauthenticated callers. |
| **Root Cause** | `app/api/parse-resume/route.ts` — no auth check. |
| **Suggested Fix** | Add Supabase auth verification at the start of the handler. |
| **Status** | Open |

---

### BUG-05: `test-db` Endpoint Exposes Database Connectivity to Public

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-05 |
| **Title** | `/api/test-db` is a diagnostic endpoint accessible without authentication |
| **Module** | Test DB |
| **Severity** | Low |
| **Steps to Reproduce** | 1. GET `/api/test-db` from any browser, no auth |
| **Expected Behavior** | Should be restricted to admin or development only. |
| **Actual Behavior** | Returns `{ success: true, data: [...] }` with resume data (limited by RLS, but connection status is exposed). |
| **Root Cause** | `app/api/test-db/route.ts` — uses anon-key client with no auth check. Should either be removed in production or protected. |
| **Suggested Fix** | Either delete this route for production builds, or add an `isAdmin()` guard. |
| **Status** | Open |

---

### BUG-06: `onboarding` API Ignores `targetRole`, `targetCity`, `yoe` Body Parameters

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-06 |
| **Title** | Onboarding endpoint destructures but never persists `targetRole`, `targetCity`, `yoe` |
| **Module** | Onboarding |
| **Severity** | Medium |
| **Steps to Reproduce** | 1. POST `/api/onboarding` with `{ targetRole: "SDE", targetCity: "Mumbai", yoe: 3 }` 2. Check `user_profiles` table |
| **Expected Behavior** | `targetRole`, `targetCity`, and `yoe` should be stored in the user profile for personalization. |
| **Actual Behavior** | `route.ts` line 15 destructures `{ targetRole, targetCity, yoe }` from the request body but the `update()` call at line 18-22 only sets `has_completed_onboarding: true`. The destructured values are silently discarded. |
| **Root Cause** | `app/api/onboarding/route.ts` line 15-22. The destructured variables are unused. Either the `user_profiles` table lacks corresponding columns, or this is an oversight. |
| **Suggested Fix** | If columns exist: include them in the update payload. If not: either add columns via schema migration or remove the destructured variables to avoid confusion. |
| **Status** | Open |

---

### BUG-07: `admin/stats` Queries Only Current User's Resumes Despite Admin Context

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-07 |
| **Title** | Admin stats endpoint returns personal stats instead of platform-wide stats |
| **Module** | Admin Panel |
| **Severity** | Medium |
| **Steps to Reproduce** | 1. Authenticate as admin 2. GET `/api/admin/stats` 3. Compare with `/api/analytics` output |
| **Expected Behavior** | As an admin endpoint, it should return platform-wide statistics (all users' resumes). |
| **Actual Behavior** | Line 37-40 queries `.eq("user_id", user.id)` — only fetching the admin's own resumes. This is inconsistent with `/api/analytics` which queries all resumes. The endpoint name suggests portfolio-wide analytics but delivers user-scoped data. |
| **Root Cause** | `app/api/admin/stats/route.ts` line 40: `.eq("user_id", user.id)` scopes query to admin's own resumes. |
| **Suggested Fix** | Remove the `.eq("user_id", user.id)` filter to return platform-wide stats, or rename/document the endpoint as a personal admin stats view. |
| **Status** | Open |

---

### BUG-08: Export DOCX Uses `p.title` Instead of `p.name` for Projects

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-08 |
| **Title** | DOCX export renders "Project" instead of actual project name |
| **Module** | Resume Export |
| **Severity** | Medium |
| **Steps to Reproduce** | 1. Create a resume with projects (each having a `name` property per `types/index.ts` `Project` interface) 2. Export as DOCX via POST `/api/export-resume` 3. Open the DOCX file |
| **Expected Behavior** | Each project should display its `name` from `Project.name`. |
| **Actual Behavior** | Line 206 references `p.title || "Project"`. The `Project` type defines `name`, not `title`. Since `p.title` is always `undefined`, every project renders as "Project". |
| **Root Cause** | `app/api/export-resume/route.ts` line 206. Property name mismatch: code reads `p.title` but `types/index.ts` `Project` interface defines `name`. Similarly, line 227 references `p.bullets` but the `Project` type has `description` (string) and `techStack` (string[]), not `bullets`. |
| **Suggested Fix** | Change line 206 from `p.title || "Project"` to `p.name || "Project"`. Replace `p.bullets` logic (lines 227-244) with rendering `p.description` and `p.techStack`. |
| **Status** | Open |

---

### BUG-09: Export DOCX References `c.year` Instead of `c.date` for Certifications

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-09 |
| **Title** | Certification year not displayed in DOCX export |
| **Module** | Resume Export |
| **Severity** | Low |
| **Steps to Reproduce** | 1. Create resume with certifications (each has `date` property) 2. Export as DOCX 3. Inspect certifications section |
| **Expected Behavior** | Certification date should display in parentheses. |
| **Actual Behavior** | Line 374 references `c.year`, but the `Certification` type defines `date`, not `year`. `c.year` is always `undefined`, so the year portion is never rendered. |
| **Root Cause** | `app/api/export-resume/route.ts` line 374. Property name mismatch with `types/index.ts` `Certification.date`. |
| **Suggested Fix** | Change `c.year` to `c.date`. |
| **Status** | Open |

---

### BUG-10: `logAIRequest` Can Silently Insert `user_id: null` Violating Intent

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-10 |
| **Title** | AI request logging inserts null `user_id` for unauthenticated callers |
| **Module** | AI Engine |
| **Severity** | Low |
| **Steps to Reproduce** | 1. Call an unprotected AI endpoint (e.g., `/api/generate-section`) without auth 2. Check `ai_requests` table |
| **Expected Behavior** | All AI requests should be traceable to a user, or unauthenticated requests should be blocked. |
| **Actual Behavior** | `logAIRequest()` at `openrouter.ts` line 10 uses `user?.id || null`. For unauthenticated calls, `user_id` is `null`. The `ai_requests` table allows this (FK is `REFERENCES auth.users(id) ON DELETE SET NULL`, nullable). This makes analytics inaccurate. |
| **Root Cause** | `lib/openrouter.ts` line 10 combined with missing auth checks on some endpoints. |
| **Suggested Fix** | Fix root cause (BUG-02/03/04: add auth to all endpoints). Additionally, consider making `ai_requests.user_id` NOT NULL to enforce attribution. |
| **Status** | Open |

---

### BUG-11: `save-resume` Treats Falsy ATS Score (e.g., Score of 0) as Missing

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-11 |
| **Title** | ATS score of 0 triggers unnecessary recalculation |
| **Module** | Save Resume |
| **Severity** | Low |
| **Steps to Reproduce** | 1. POST `/api/save-resume` with `{ atsScore: 0, resumeText: "..." }` |
| **Expected Behavior** | ATS score of `0` should be accepted as a valid score. |
| **Actual Behavior** | Line 42: `if (!atsScore && resumeText)` — JavaScript treats `0` as falsy. If an ATS score of `0` is passed, the condition is true and `calculateATS()` recalculates it, overwriting the explicit `0`. |
| **Root Cause** | `app/api/save-resume/route.ts` line 42. Falsy check doesn't distinguish between "not provided" and "provided as 0". |
| **Suggested Fix** | Change `if (!atsScore && resumeText)` to `if (atsScore === null && resumeText)` or `if (atsScore == null && resumeText)`. |
| **Status** | Open |

---

### BUG-12: Middleware Does Not Protect `/job-tracker` and `/onboarding` Paths

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-12 |
| **Title** | Middleware `isProtectedPath` doesn't include `/job-tracker`, `/onboarding`, or `/admin` |
| **Module** | Middleware |
| **Severity** | Medium |
| **Steps to Reproduce** | 1. Navigate to `/job-tracker` without authentication |
| **Expected Behavior** | Unauthenticated user should be redirected to `/login`. |
| **Actual Behavior** | `isProtectedPath` at `middleware.ts` lines 44-49 only covers `/dashboard`, `/analytics`, and `/resume*`. Routes like `/job-tracker`, `/onboarding`, `/admin/*`, and `/share/*` are NOT middleware-protected. While API routes have their own auth checks, the page components may render before client-side auth state is resolved. |
| **Root Cause** | `utils/supabase/middleware.ts` lines 44-49 — incomplete protected paths list. |
| **Suggested Fix** | Add `/job-tracker`, `/onboarding`, `/admin` to `isProtectedPath` check: `pathname === "/job-tracker" || pathname.startsWith("/admin") || pathname === "/onboarding"`. |
| **Status** | Open |

---

### BUG-13: `estimateYearsOfExperience` Hard-Codes Maximum Year as 2026

| Field | Description |
|-------|-------------|
| **Bug ID** | BUG-13 |
| **Title** | Year estimation filter becomes outdated after 2026 |
| **Module** | ATS Scoring |
| **Severity** | Low |
| **Steps to Reproduce** | 1. In 2027+, submit a resume with dates including 2027 2. `estimateYearsOfExperience()` is called |
| **Expected Behavior** | Should dynamically use current year as upper bound. |
| **Actual Behavior** | `calculateATS.ts` line 22 filters years with `y <= 2026`. Any year > 2026 is excluded from the sorted range, potentially underestimating experience. |
| **Root Cause** | `lib/calculateATS.ts` line 22 — hard-coded `2026` instead of `new Date().getFullYear()`. |
| **Suggested Fix** | Replace `y <= 2026` with `y <= new Date().getFullYear()`. |
| **Status** | Open |

---

## Summary

| Metric | Value |
|--------|-------|
| **Total test cases** | 142 |
| **Modules covered** | 14 (Authentication, Password Recovery, Middleware, Resume Upload/Analysis, Resume Builder/Save, Resume Retrieval/Deletion, LinkedIn Import, AI-Powered Features, Job Tracker, Resume Sharing, Resume Export, Salary Benchmark, Notifications, Onboarding, Admin Panel, Database/RLS, Environment/Config) |
| **Bugs found** | 13 (Fixed: 0, Open: 13) |
| **High severity bugs** | 3 (BUG-02, BUG-03, BUG-08) |
| **Medium severity bugs** | 6 (BUG-01, BUG-06, BUG-07, BUG-08, BUG-09, BUG-12) |
| **Low severity bugs** | 4 (BUG-05, BUG-09, BUG-10, BUG-11, BUG-13) |

### Key Risk Areas

1. **Missing Authentication (BUG-02, BUG-03, BUG-04):** Three API endpoints (`generate-section`, `ai-chat`, `parse-resume`) lack authentication checks, exposing AI token consumption and server-side processing to unauthenticated callers. This is the highest priority fix.

2. **Property Name Mismatches in Export (BUG-08, BUG-09):** The DOCX export references `p.title`, `p.bullets`, and `c.year` which don't exist on the TypeScript interfaces (`Project.name`, `Project.description`, `Certification.date`). This causes projects and certifications to render with default placeholder text.

3. **Operator Precedence (BUG-01):** The `file_name` assignment in `analyze-resume` always overwrites the caller-provided filename with the parsed name due to missing parentheses.

4. **Incomplete Middleware Protection (BUG-12):** Several page routes (`/job-tracker`, `/onboarding`, `/admin/*`) are not covered by middleware path protection.
