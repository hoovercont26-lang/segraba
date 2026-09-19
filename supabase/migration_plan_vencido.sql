-- Marca planes vencidos y actualiza comentarios del ciclo de 30 días
-- SQL Editor → pegar y Run

comment on column public.profiles.plan_estado is 'ninguno | esperando-pago | validando | activo | vencido';
comment on column public.profiles.postulaciones_periodo is 'Clave del ciclo (= plan_hasta del periodo activo)';

update public.profiles
set plan_estado = 'vencido'
where plan_estado = 'activo'
  and plan_hasta is not null
  and plan_hasta <= now();
