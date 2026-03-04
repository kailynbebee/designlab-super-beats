-- Required for Save Beat (Save to Cloud) functionality.
-- Run this in Supabase SQL Editor if the table doesn't exist:
-- https://supabase.com/dashboard/project/zohawejjvvgyzndxuplr/sql/new

CREATE TABLE IF NOT EXISTS kv_store_4266c10f (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
