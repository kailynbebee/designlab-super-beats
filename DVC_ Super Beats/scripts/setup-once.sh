#!/bin/bash
# One-time setup: log in to Supabase and link this project.
# Run from project root: ./scripts/setup-once.sh

set -e
cd "$(dirname "$0")/.."

echo "Supabase one-time setup"
echo ""

if ! command -v supabase &> /dev/null; then
  echo "Supabase CLI not found. Install it first:"
  echo "  brew install supabase/tap/supabase"
  exit 1
fi

echo "Step 1: Log in (opens browser)..."
supabase login

echo ""
echo "Step 2: Link to your project (you'll need your database password from Supabase dashboard)..."
supabase link --project-ref zohawejjvvgyzndxuplr

echo ""
echo "Setup complete! You can now run 'npm run deploy' to push backend updates."
