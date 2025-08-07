-- Retry cleanup including dependent projects/tasks before removing client profiles
BEGIN;

-- Targets
CREATE TEMP TABLE tmp_target_profiles ON COMMIT DROP AS
SELECT id
FROM public.client_profiles cp
WHERE (
  lower(cp.name) ~ '(?<![a-z])(test|teste|dummy|fake|asd|qwe|lorem|ipsum|sample)(?![a-z])'
  OR lower(coalesce(cp.company, '')) ~ '(test|teste|dummy|fake|asd|qwe|lorem|ipsum|sample)'
  OR cp.name ~ '^[0-9]{3,}$'
  OR coalesce(cp.company, '') ~ '^[0-9]{3,}$'
  OR lower(cp.email) ~ '(@test\.|@example\.|@mailinator\.|@fake\.)'
);

CREATE TEMP TABLE tmp_target_fpa_clients ON COMMIT DROP AS
SELECT DISTINCT fc.id, fc.client_profile_id
FROM public.fpa_clients fc
LEFT JOIN public.client_profiles cp ON cp.id = fc.client_profile_id
WHERE fc.client_profile_id IN (SELECT id FROM tmp_target_profiles)
   OR lower(fc.company_name) ~ '(test|teste|dummy|fake|asd|qwe|lorem|ipsum|sample)'
   OR fc.company_name ~ '^[0-9]{3,}$';

CREATE TEMP TABLE tmp_target_chat_rooms ON COMMIT DROP AS
SELECT id FROM public.chat_rooms WHERE client_id IN (SELECT id FROM tmp_target_profiles);

CREATE TEMP TABLE tmp_target_project_schedules ON COMMIT DROP AS
SELECT id FROM public.project_schedules WHERE client_id IN (SELECT id FROM tmp_target_profiles);

CREATE TEMP TABLE tmp_target_tickets ON COMMIT DROP AS
SELECT id FROM public.tickets WHERE user_id IN (SELECT id FROM tmp_target_profiles)
   OR lower(user_email) ~ '(@test\.|@example\.|@mailinator\.|@fake\.)';

CREATE TEMP TABLE tmp_target_approval_requests ON COMMIT DROP AS
SELECT id FROM public.approval_requests WHERE requested_by_user_id IN (SELECT id FROM tmp_target_profiles);

-- New: projects and tasks
CREATE TEMP TABLE tmp_target_projects ON COMMIT DROP AS
SELECT id FROM public.projects WHERE client_id IN (SELECT id FROM tmp_target_profiles);

CREATE TEMP TABLE tmp_target_tasks ON COMMIT DROP AS
SELECT id FROM public.tasks WHERE project_id IN (SELECT id FROM tmp_target_projects);

-- Delete children first
-- Chat
DELETE FROM public.chat_messages WHERE chat_room_id IN (SELECT id FROM tmp_target_chat_rooms);
DELETE FROM public.chat_rooms   WHERE id IN (SELECT id FROM tmp_target_chat_rooms);

-- Schedules
DELETE FROM public.schedule_phases WHERE schedule_id IN (SELECT id FROM tmp_target_project_schedules);
DELETE FROM public.project_schedules WHERE id IN (SELECT id FROM tmp_target_project_schedules);

-- Tickets
DELETE FROM public.ticket_attachments WHERE ticket_id IN (SELECT id FROM tmp_target_tickets);
DELETE FROM public.ticket_responses  WHERE ticket_id IN (SELECT id FROM tmp_target_tickets);
DELETE FROM public.tickets           WHERE id IN (SELECT id FROM tmp_target_tickets);

-- Approvals
DELETE FROM public.approval_attachments WHERE request_id IN (SELECT id FROM tmp_target_approval_requests);
DELETE FROM public.approval_history     WHERE request_id IN (SELECT id FROM tmp_target_approval_requests);
DELETE FROM public.approval_requests    WHERE id        IN (SELECT id FROM tmp_target_approval_requests);

-- Files & documents
DELETE FROM public.files            WHERE client_id IN (SELECT id FROM tmp_target_profiles);
DELETE FROM public.documents        WHERE user_id   IN (SELECT id FROM tmp_target_profiles);
DELETE FROM public.client_documents WHERE user_id   IN (SELECT id FROM tmp_target_profiles);

-- FPA domain
DELETE FROM public.fpa_communications   WHERE fpa_client_id IN (SELECT id FROM tmp_target_fpa_clients);
DELETE FROM public.fpa_drivers          WHERE fpa_client_id IN (SELECT id FROM tmp_target_fpa_clients);
DELETE FROM public.fpa_variance_analysis WHERE fpa_client_id IN (SELECT id FROM tmp_target_fpa_clients);
DELETE FROM public.fpa_data_uploads     WHERE fpa_client_id IN (SELECT id FROM tmp_target_fpa_clients);
DELETE FROM public.fpa_financial_data   WHERE fpa_client_id IN (SELECT id FROM tmp_target_fpa_clients);
DELETE FROM public.fpa_periods          WHERE fpa_client_id IN (SELECT id FROM tmp_target_fpa_clients);
DELETE FROM public.fpa_reports          WHERE fpa_client_id IN (SELECT id FROM tmp_target_fpa_clients);
DELETE FROM public.fpa_clients          WHERE id            IN (SELECT id FROM tmp_target_fpa_clients);

-- New: tasks then projects
DELETE FROM public.tasks    WHERE id IN (SELECT id FROM tmp_target_tasks);
DELETE FROM public.projects WHERE id IN (SELECT id FROM tmp_target_projects);

-- Teams
DELETE FROM public.company_teams WHERE company_id IN (SELECT id FROM tmp_target_profiles)
   OR member_id IN (SELECT id FROM tmp_target_profiles);

-- Finally, client profiles
DELETE FROM public.client_profiles WHERE id IN (SELECT id FROM tmp_target_profiles);

COMMIT;