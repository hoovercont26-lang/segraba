-- Admin puede actualizar perfiles (activar planes, etc.)
-- SQL Editor → Run

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update
  using (id = auth.uid() or public.es_admin())
  with check (id = auth.uid() or public.es_admin());

-- Activación de plan solo por admin (evita fallos silenciosos por RLS)
create or replace function public.activar_plan_creador(p_user_id uuid)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.profiles;
  hasta timestamptz := now() + interval '30 days';
  pago jsonb;
begin
  if not public.es_admin() then
    raise exception 'Solo el admin puede activar planes.';
  end if;

  select * into target from public.profiles where id = p_user_id;
  if target.id is null then
    raise exception 'No encontramos esa cuenta.';
  end if;
  if target.plan is null then
    raise exception 'Esa cuenta no pidió un plan.';
  end if;

  pago := coalesce(target.plan_pago, '{}'::jsonb)
    || jsonb_build_object('validadoAt', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'));

  update public.profiles
  set
    plan_estado = 'activo',
    plan_hasta = hasta,
    postulaciones_usadas = 0,
    postulaciones_periodo = to_json(hasta)#>>'{}',
    plan_pago = pago
  where id = p_user_id
  returning * into target;

  insert into public.notificaciones (user_id, para, titulo, cuerpo, href)
  values (
    p_user_id,
    'creador',
    'Tu plan ya está activo',
    format(
      'Plan %s vigente hasta el %s. Te quedan %s apuntadas en este ciclo.',
      initcap(target.plan),
      to_char(hasta at time zone 'America/Lima', 'DD TMMonth YYYY'),
      case when target.plan = 'pro' then '25' else '8' end
    ),
    '/pegas'
  );

  return target;
end;
$$;

grant execute on function public.activar_plan_creador(uuid) to authenticated;
