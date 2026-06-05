#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

PROJECT_ID="${PROJECT_ID:-jigg-498314}"
REGION="${REGION:-europe-north1}"
SERVICE_NAME="${SERVICE_NAME:-cad-worker}"
SUPABASE_URL="${SUPABASE_URL:-https://pzyrwyluyddeedmhglou.supabase.co}"
SUPABASE_STORAGE_BUCKET="${SUPABASE_STORAGE_BUCKET:-cad-artifacts}"
SUPABASE_SECRET_NAME="${SUPABASE_SECRET_NAME:-supabase-secret-key}"
CAD_WORKER_TOKEN_SECRET_NAME="${CAD_WORKER_TOKEN_SECRET_NAME:-cad-worker-token}"
MEMORY="${MEMORY:-2Gi}"
CPU="${CPU:-2}"
TIMEOUT="${TIMEOUT:-900}"

gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --set-env-vars "SUPABASE_URL=$SUPABASE_URL,SUPABASE_STORAGE_BUCKET=$SUPABASE_STORAGE_BUCKET" \
  --set-secrets "SUPABASE_SECRET_KEY=$SUPABASE_SECRET_NAME:latest,CAD_WORKER_TOKEN=$CAD_WORKER_TOKEN_SECRET_NAME:latest" \
  --memory "$MEMORY" \
  --cpu "$CPU" \
  --timeout "$TIMEOUT" \
  --allow-unauthenticated

gcloud run services describe "$SERVICE_NAME" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --format="value(status.url)"
