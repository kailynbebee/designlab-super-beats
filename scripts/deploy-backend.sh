#!/bin/bash
# Deploys the Save Beats backend to Supabase.
# Run from project root: ./scripts/deploy-backend.sh

set -e
cd "$(dirname "$0")/.."

echo "Deploying Save Beats backend to Supabase..."
echo ""

if ! command -v supabase &> /dev/null; then
  echo "Supabase CLI not found. Install it first:"
  echo "  brew install supabase/tap/supabase"
  echo ""
  echo "Or: npm install -g supabase"
  exit 1
fi

# Deploy (--project-ref skips link step, --use-api avoids Docker)
supabase functions deploy make-server-4266c10f --project-ref zohawejjvvgyzndxuplr --use-api

echo ""
echo "Done! Save to Cloud should work now."
echo "Run 'npm run dev' and try saving a beat."
