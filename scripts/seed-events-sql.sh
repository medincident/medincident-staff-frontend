#!/usr/bin/env bash
# Прямой SQL-сид incidents и service_requests (300 + 300) за последние 6 мес.
# Регистратор — Данил Киреев (employee 019e2570…, в Хирургии Стационара).
# Departments/types/categories распределены случайно.
# Запуск: bash scripts/seed-events-sql.sh

set -euo pipefail

ORG="019e1786-563a-7b3e-846b-ad9de0a219b9"
ME_EMP="019e2570-1aec-7d1b-a9b6-7aa8f989db7e"
ME_ZID="372797516799803396"
ME_NAME="Данил Киреев"
ME_POS="Медбрат"
ME_CLINIC="019e1789-1e4f-7b80-9c9b-e390ea6a860b"
ME_DEPT="019e1789-4390-77a7-989a-a7516d5c9812"

docker exec -i backend_postgres psql -U medincident -d medincident -v ON_ERROR_STOP=1 <<SQL
-- Используем gen_random_uuid (pgcrypto/builtin postgres 13+).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── helpers ───
CREATE TEMP TABLE _cd AS
SELECT c.id AS clinic_id, d.id AS dept_id
FROM projections.clinics c
JOIN projections.departments d ON d.clinic_id = c.id
WHERE c.organization_id = '${ORG}'::uuid;

CREATE TEMP TABLE _ct AS
SELECT c.id AS cat_id, t.id AS type_id
FROM projections.incident_categories c
JOIN projections.incident_types t ON t.category_id = c.id
WHERE c.organization_id = '${ORG}'::uuid;

CREATE TEMP TABLE _rt AS
SELECT id FROM projections.request_types WHERE organization_id = '${ORG}'::uuid;

-- ─── 300 incidents ───
CREATE TEMP TABLE _inc_gen AS
SELECT
  gen_random_uuid() AS id,
  cd.clinic_id, cd.dept_id,
  ct.cat_id, ct.type_id,
  (ARRAY['pending','in_progress','done']::domain.incident_status[])[1 + (random() * 2)::int] AS status,
  (ARRAY['low','normal','high']::domain.incident_priority[])[1 + (random() * 2)::int] AS prio,
  (ARRAY[
    'Зафиксировано при плановом обходе.',
    'Случай выявлен по результатам внутреннего аудита.',
    'Обнаружено старшей медсестрой смены.',
    'Подтверждено документами и записью в журнале.',
    'Случай разобран на утренней конференции.',
    'Передано в работу группе качества.',
    'Зафиксировано во время приёма дежурной смены.',
    'Выявлено в ходе проверки СОП.'
  ])[1 + (random() * 7)::int] AS descr,
  (now() - (random() * interval '180 days'))::timestamptz AS occurred
FROM generate_series(1, 300) gs(i)
CROSS JOIN LATERAL (SELECT clinic_id, dept_id FROM _cd ORDER BY random() LIMIT 1) cd
CROSS JOIN LATERAL (SELECT cat_id, type_id FROM _ct ORDER BY random() LIMIT 1) ct;

INSERT INTO domain.incidents (
  id, organization_id, clinic_id, department_id, category_id, type_id,
  status, priority, description, occurred_at,
  registrar_employee_id, created_at, updated_at
)
SELECT
  g.id, '${ORG}'::uuid, g.clinic_id, g.dept_id, g.cat_id, g.type_id,
  g.status, g.prio, g.descr, g.occurred,
  '${ME_EMP}'::uuid,
  g.occurred + (random() * interval '24 hours'),
  g.occurred + (random() * interval '24 hours')
FROM _inc_gen g;

INSERT INTO projections.incidents (
  id, organization_id, clinic_id, department_id, category_id, type_id,
  status, priority, description, occurred_at,
  registrar_employee_id, registrar_display_name, registrar_position,
  registrar_organization_id, registrar_clinic_id, registrar_department_id,
  created_at, updated_at
)
SELECT
  i.id, i.organization_id, i.clinic_id, i.department_id, i.category_id, i.type_id,
  i.status, i.priority, i.description, i.occurred_at,
  i.registrar_employee_id, '${ME_NAME}', '${ME_POS}',
  '${ORG}'::uuid, '${ME_CLINIC}'::uuid, '${ME_DEPT}'::uuid,
  i.created_at, i.updated_at
FROM domain.incidents i
WHERE i.id IN (SELECT id FROM _inc_gen);

-- ─── 300 service requests ───
CREATE TEMP TABLE _req_gen AS
SELECT
  gen_random_uuid() AS id,
  cd.clinic_id, cd.dept_id,
  rt.id AS type_id,
  (ARRAY[
    'Требуется срочная реакция инженерной/IT-службы.',
    'По графику плановой работы.',
    'Заявка от старшей медсестры смены.',
    'По результатам обхода.',
    'Заявка передана из соседнего отделения.',
    'Согласовано с руководителем подразделения.',
    'После случая ИСМП — внеплановая дезинфекция.',
    'Регулярная плановая заявка на расходники.'
  ])[1 + (random() * 7)::int] AS descr,
  (ARRAY['created','in_work','on_hold','pending_review','completed']::domain.request_status[])[1 + (random() * 4)::int] AS status,
  (now() - (random() * interval '180 days'))::timestamptz AS created
FROM generate_series(1, 300) gs(i)
CROSS JOIN LATERAL (SELECT clinic_id, dept_id FROM _cd ORDER BY random() LIMIT 1) cd
CROSS JOIN LATERAL (SELECT id FROM _rt ORDER BY random() LIMIT 1) rt;

INSERT INTO domain.service_requests (
  id, organization_id, clinic_id, department_id, type_id,
  description, status, author_id, created_at, updated_at
)
SELECT
  g.id, '${ORG}'::uuid, g.clinic_id, g.dept_id, g.type_id,
  g.descr, g.status, '${ME_ZID}', g.created, g.created
FROM _req_gen g;

INSERT INTO projections.service_requests (
  id, organization_id, clinic_id, department_id, type_id,
  description, status, author_id, author_display_name,
  created_at, updated_at
)
SELECT
  r.id, r.organization_id, r.clinic_id, r.department_id, r.type_id,
  r.description, r.status, r.author_id, '${ME_NAME}',
  r.created_at, r.updated_at
FROM domain.service_requests r
WHERE r.id IN (SELECT id FROM _req_gen);

-- ─── summary ───
SELECT 'incidents'::text AS kind,
       count(*) AS total,
       min(created_at)::date AS earliest,
       max(created_at)::date AS latest
FROM projections.incidents
WHERE registrar_employee_id = '${ME_EMP}'::uuid
UNION ALL
SELECT 'requests'::text AS kind,
       count(*) AS total,
       min(created_at)::date AS earliest,
       max(created_at)::date AS latest
FROM projections.service_requests
WHERE author_id = '${ME_ZID}';
SQL
