# Fastbreak Event Dashboard

Full-stack sports event management app. Sign up, create events with venues, search and filter, edit, delete. Built with Next.js 16, Supabase, and shadcn/ui.

Live: https://fastbreak-event-dashboard-nine.vercel.app

## Stack

- Next.js 16 (App Router)
- TypeScript
- Supabase (Postgres + Auth)
- Tailwind CSS + shadcn/ui
- Vercel

## How it works

Middleware checks for a Supabase session on every request. No session = redirect to `/login`. Auth supports email/password and Google OAuth.

Dashboard is a Server Component. Search and filter update the URL params, not React state. When the URL changes, the server component re-renders and runs a fresh Supabase query. So filtering actually hits the database every time, it's not just hiding cards client-side.

Events and venues are separate tables. Venues have a foreign key to events with cascade delete so nothing gets orphaned.

## Why I built it this way

**Server Actions only.** The assessment mentioned Fastbreak is moving away from API routes, so every mutation goes through Server Actions. Only route handler is `/auth/callback` for OAuth.

**`createSafeAction` wrapper.** Every action returns `{ success: true, data }` or `{ success: false, error }`. Keeps the response shape predictable so components don't have to guess what they're getting back.

**Supabase stays server-side.** Browser client only listens for auth changes. All database reads and writes go through `@supabase/ssr` on the server. No `.from()` calls in client components.

**URL-driven search/filter.** `SearchFilter` is a client component that pushes to the URL. Dashboard page reads `searchParams`, passes them to `getEvents()` which builds the query with `.ilike()` and `.eq()`. Wrapped the grid in `Suspense` keyed on the params so you get a skeleton on filter changes.

**RLS on both tables.** Users only see their own events. Venue policies check ownership through the parent event's `user_id`.

## Trade-offs

**Venues table vs JSON column.** Separate table is more work on inserts and updates since you're managing two tables, but it's more extensible. If venues ever need addresses, capacity, or their own queries, you're not fighting a JSON column.

**300ms debounce on search.** Small delay before results update, but it's not hammering the database on every keystroke.

**No client-side cache.** Dashboard fetches fresh on every request since it's a Server Component. React Query or SWR would add complexity for no real gain at this scale.

## Run locally

```
git clone https://github.com/MaxwellZarg/fastbreak-event-dashboard.git
cd fastbreak-event-dashboard
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

Supabase tables:

```
create table events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  sport_type text not null,
  date_time timestamptz not null,
  description text,
  created_at timestamptz default now()
);

create table venues (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade not null,
  name text not null
);
```

Start:
```
npm run dev
```

## Final thoughts

This was a fun one to build. I take a lot of pride in creating interfaces that are simple, clean, and just work. Anything sports related I'm going to put extra effort into. That's where my passion is. I enjoy assessments like this because they let me prove what I can build on my own, and I enjoy being able to talk about the work just as much as doing it! Thanks!

## Structure

```
app/
  layout.tsx            - Root layout, Toaster
  page.tsx              - Redirect logic
  login/page.tsx        - Email + Google auth
  signup/page.tsx       - Account creation
  auth/callback/        - OAuth exchange
  dashboard/page.tsx    - Server Component, searchParams
  events/new/page.tsx   - Create form
  events/[id]/page.tsx  - Detail view
  events/[id]/edit/     - Edit form

components/
  navbar.tsx            - User email + logout
  event-card.tsx        - Clickable, sport badges
  event-form.tsx        - Shared create/edit
  search-filter.tsx     - URL param updates

lib/
  supabase/server.ts    - Server client
  supabase/client.ts    - Browser client (auth only)
  actions/events.ts     - Server Actions
  queries/events.ts     - Data fetching
  safe-action.ts        - Action wrapper
  types.ts              - Zod + types

middleware.ts           - Auth + session refresh
```
