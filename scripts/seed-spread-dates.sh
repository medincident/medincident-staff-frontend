#!/usr/bin/env bash
# Распределяет created_at для incidents и service_requests, созданных в окне
# seedStart..now, по последним 6 месяцам.
# Для incidents: occurred_at уже задан через API → выставляем created_at =
# occurred_at + random(0..24h) (типичный лаг регистрации).
# Для service_requests: occurred_at нет — created_at = random за 6 мес.
# Запуск: SEED_START='2026-05-31T...' bash scripts/seed-spread-dates.sh

set -euo pipefail

if [ -z "${SEED_START:-}" ]; then
  echo "SEED_START env required (ISO timestamp from seed.ts output)"
  exit 1
fi

ME="019e2570-1aec-7d1b-a9b6-7aa8f989db7e"

docker exec -i backend_postgres psql -U medincident -d medincident <<SQL
-- Incidents: created_at = occurred_at + random(0..24h)
UPDATE domain.incidents
SET created_at = occurred_at + (random() * interval '24 hours'),
    updated_at = occurred_at + (random() * interval '24 hours')
WHERE created_at >= '${SEED_START}'::timestamptz
  AND registrar_employee_id = '${ME}'::uuid;

UPDATE projections.incidents
SET created_at = occurred_at + (random() * interval '24 hours'),
    updated_at = occurred_at + (random() * interval '24 hours')
WHERE created_at >= '${SEED_START}'::timestamptz
  AND registrar_employee_id = '${ME}'::uuid;

-- Service requests: created_at random за последние 180 дней (бизнес-смещение).
UPDATE domain.service_requests
SET created_at = now() - (random() * interval '180 days'),
    updated_at = now() - (random() * interval '180 days')
WHERE created_at >= '${SEED_START}'::timestamptz
  AND author_id = '${ME}';

UPDATE projections.service_requests
SET created_at = now() - (random() * interval '180 days'),
    updated_at = now() - (random() * interval '180 days')
WHERE created_at >= '${SEED_START}'::timestamptz
  AND author_id = '${ME}';

-- Итог
SELECT 'incidents' as kind,
       count(*) as total,
       min(created_at)::date as earliest,
       max(created_at)::date as latest
FROM projections.incidents
WHERE registrar_employee_id = '${ME}'::uuid
UNION ALL
SELECT 'requests' as kind,
       count(*) as total,
       min(created_at)::date as earliest,
       max(created_at)::date as latest
FROM projections.service_requests
WHERE author_id = '${ME}';
SQL
