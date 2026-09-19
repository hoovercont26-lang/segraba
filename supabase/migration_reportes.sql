-- Reportes: nombre y contacto de a quién reportan
alter table public.reportes
  add column if not exists contra_nombre text,
  add column if not exists contacto text;
