# Save Beats – Backend Setup

The Save to Cloud feature needs the backend deployed to Supabase. Do this once, then whenever you change the backend code.

## First time only

**1. Install Supabase CLI** (pick one):

```bash
brew install supabase/tap/supabase
```

or

```bash
npm install -g supabase
```

**2. Run setup** (logs you in and links the project):

```bash
cd "DVC_ Super Beats"
npm run setup
```

You’ll need your database password from [Supabase → Settings → Database](https://supabase.com/dashboard/project/zohawejjvvgyzndxuplr/settings/database).

---

## Deploy the backend

Whenever you change backend code (or after setup):

```bash
cd "DVC_ Super Beats"
npm run deploy
```

Or run the script directly:

```bash
./scripts/deploy-backend.sh
```

---

## If Save to Cloud fails

The backend needs a `kv_store_4266c10f` table. If it doesn't exist, run this in [Supabase SQL Editor](https://supabase.com/dashboard/project/zohawejjvvgyzndxuplr/sql/new):

```sql
CREATE TABLE IF NOT EXISTS kv_store_4266c10f (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

Or run the migration file: `supabase/migrations/20240303000000_create_kv_store.sql`

---

## Quick reference

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the app locally |
| `npm run deploy` | Push backend to Supabase |
| `npm run setup` | One-time login + project link |
