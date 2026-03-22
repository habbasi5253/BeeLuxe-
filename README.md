# 🐝 BeeLuxe Cleaners — Business-in-a-Box

A full-stack platform to automate and scale your cleaning company, built with **Next.js 14**, **Supabase**, **Tailwind CSS**, and **TypeScript**.

---

## Four Core Modules

### 1. AI Recruitment & Vetting
- Automated intake interviews via SMS (Twilio) powered by GPT-4o-mini
- Candidates are evaluated against quality benchmarks (experience, availability, reliability, safety)
- AI scoring (0–100) with hire / maybe / reject recommendations
- Interactive transcript viewer + one-click SMS launch

### 2. Focused Growth Engine (CRM)
- Kanban pipeline: New → Contacted → Qualified → Proposal → Won/Lost
- Dedicated **Construction Trailer** lead tracking with AEC Project ID & trailer count fields
- Residential, Commercial, and B2B/B2C categories
- Automated follow-up SMS dispatch + activity timeline
- AEC industry data pattern fields (aec_project_id, site geo, trailer count)

### 3. Operations & Scheduling Hub
- **FullCalendar** (week/month/day/list views) with color-coded job types
- Cleaner assignment with drag-and-drop event editing
- **SMS + Push notification** system for daily schedule updates
- Cleaner roster with skills, ratings, earnings, and availability status
- Job scheduling form with recurrence support

### 4. Financial Intelligence Dashboard
- Real-time KPI cards: Revenue, Payouts, Gross Margin, Net Profit, Outstanding
- Revenue vs Payouts vs Expenses bar chart (Recharts)
- Gross margin trend area chart with 60% target reference line
- **Revenue per Client ledger** — itemized margin by client
- Invoice management (Draft → Sent → Paid / Overdue)
- Contractor payout ledger with Approve → Paid workflow

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database / Auth | Supabase (PostgreSQL + RLS) |
| Styling | Tailwind CSS v3 + @tailwindcss/forms |
| Charts | Recharts |
| Calendar | FullCalendar v6 |
| AI | OpenAI API (GPT-4o-mini) |
| SMS | Twilio |
| Forms | React Hook Form + Zod |
| State | Zustand |

---

## Getting Started

### 1. Clone & install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
# Fill in your Supabase, OpenAI, and Twilio credentials
```

### 3. Set up Supabase

1. Create a [Supabase](https://supabase.com) project
2. Run `supabase/schema.sql` in the SQL Editor
3. Copy your project URL and anon key to `.env.local`

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/        # Protected dashboard layout
│   │   ├── dashboard/      # Command center overview
│   │   ├── recruitment/    # AI Recruitment module
│   │   ├── crm/            # Growth Engine CRM
│   │   ├── scheduling/     # Operations & Scheduling Hub
│   │   ├── finance/        # Financial Intelligence
│   │   └── settings/       # Platform configuration
│   ├── api/
│   │   ├── interview/      # GPT-4o interview endpoint
│   │   ├── sms/            # Twilio SMS endpoint + webhook
│   │   ├── leads/          # CRM leads CRUD
│   │   ├── schedule/       # Jobs & assignments CRUD
│   │   └── finance/        # Financial reports API
│   └── auth/               # Sign-in page
├── components/
│   ├── layout/             # Sidebar, Topbar
│   ├── ui/                 # Shared components
│   ├── recruitment/        # Recruitment components
│   ├── crm/                # CRM components
│   ├── scheduling/         # Calendar & roster
│   └── finance/            # Charts & ledgers
├── lib/supabase/           # Supabase client/server helpers
└── types/
    └── database.ts         # Full database type definitions
supabase/
└── schema.sql              # Complete Postgres schema + seed data
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server-side) |
| `OPENAI_API_KEY` | OpenAI API key (GPT-4o-mini) |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number |

---

## Twilio SMS Webhook

Set your Twilio webhook URL to:
```
https://your-domain.com/api/sms?From={From}&Body={Body}
```

This enables inbound SMS replies to be processed and fed back into interview sessions.
