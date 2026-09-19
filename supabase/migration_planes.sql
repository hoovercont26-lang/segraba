-- SeGraba · planes de creador + contador de postulaciones
-- SQL Editor → pegar y Run (después del schema base)

alter table public.profiles
  add column if not exists plan text,
  add column if not exists plan_hasta timestamptz,
  add column if not exists plan_estado text not null default 'ninguno',
  add column if not exists plan_pago jsonb,
  add column if not exists postulaciones_usadas int not null default 0,
  add column if not exists postulaciones_periodo text;

comment on column public.profiles.plan is 'base | pro';
comment on column public.profiles.plan_estado is 'ninguno | esperando-pago | validando | activo | vencido';
comment on column public.profiles.postulaciones_usadas is 'Apuntadas usadas en el ciclo de suscripción actual';
comment on column public.profiles.postulaciones_periodo is 'Clave del ciclo (= plan_hasta del periodo activo)';
