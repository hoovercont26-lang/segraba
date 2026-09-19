-- Solo creadores con plan activo pueden postular (evita atajos por API directa)

create or replace function public.creador_plan_activo(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = uid
      and p.plan is not null
      and p.plan_estado = 'activo'
      and p.plan_hasta is not null
      and p.plan_hasta > now()
  );
$$;

drop policy if exists postulaciones_insert on public.postulaciones;
create policy postulaciones_insert on public.postulaciones
  for insert with check (
    autor_id = auth.uid()
    and public.creador_plan_activo(auth.uid())
    and exists (
      select 1 from public.creadores c
      where c.id = creador_id and c.autor_id = auth.uid()
    )
  );
