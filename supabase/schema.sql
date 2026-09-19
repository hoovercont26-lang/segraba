-- SeGraba · schema para el plan free de Supabase
-- 1) SQL Editor → pegar este archivo y Run
-- 2) Authentication → Providers → Email: apagar "Confirm email"
-- 3) Authentication → URL Configuration:
--    Site URL: http://localhost:3000
--    Redirects: http://localhost:3000/** y https://segraba.vercel.app/**

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  correo text not null unique,
  whatsapp text not null default '',
  roles text[] not null default array['marca']::text[],
  created_at timestamptz not null default now()
);

create table if not exists public.avisos (
  id text primary key,
  autor_id uuid references public.profiles (id) on delete set null,
  marca text not null,
  whatsapp text not null,
  nicho text not null,
  ciudad text not null,
  videos int not null,
  precio numeric not null,
  plazo text not null,
  brief text not null,
  created_at timestamptz not null default now(),
  elegido_postulacion_id text,
  redes text[] not null default array['tiktok']::text[],
  estado text not null default 'publicado',
  pago jsonb
);

create table if not exists public.creadores (
  id text primary key,
  autor_id uuid references public.profiles (id) on delete set null,
  nombre text not null,
  tiktok text not null,
  ciudad text not null,
  nichos text[] not null,
  min_precio numeric not null,
  redes text[] not null default array['tiktok']::text[],
  seguidores int not null default 0,
  estilo text not null default '',
  whatsapp text not null default '',
  entregas int not null default 0
);

create table if not exists public.postulaciones (
  id text primary key default gen_random_uuid()::text,
  pega_id text not null references public.avisos (id) on delete cascade,
  creador_id text not null references public.creadores (id) on delete cascade,
  autor_id uuid not null references public.profiles (id) on delete cascade,
  nota text not null default '',
  created_at timestamptz not null default now(),
  estado text not null default 'pendiente',
  unique (pega_id, autor_id)
);

create table if not exists public.mensajes (
  id text primary key default gen_random_uuid()::text,
  chat_id text not null references public.postulaciones (id) on delete cascade,
  de_id uuid not null references public.profiles (id) on delete cascade,
  texto text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notificaciones (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references public.profiles (id) on delete cascade,
  para text not null,
  titulo text not null,
  cuerpo text not null,
  href text not null,
  leida boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.reportes (
  id text primary key default gen_random_uuid()::text,
  de_id uuid not null references public.profiles (id) on delete cascade,
  contra_tipo text not null,
  contra_id text not null,
  contra_nombre text,
  contacto text,
  motivo text not null,
  detalle text not null default '',
  created_at timestamptz not null default now(),
  unique (de_id, contra_tipo, contra_id)
);

create index if not exists avisos_estado_idx on public.avisos (estado);
create index if not exists avisos_autor_idx on public.avisos (autor_id);
create index if not exists postulaciones_pega_idx on public.postulaciones (pega_id);
create index if not exists notificaciones_user_idx on public.notificaciones (user_id, leida);
create index if not exists mensajes_chat_idx on public.mensajes (chat_id, created_at);

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select lower(correo) from public.profiles where id = auth.uid()),
    ''
  ) = 'hoover.cont26@gmail.com';
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rol text;
begin
  rol := coalesce(new.raw_user_meta_data->>'rol', 'marca');
  if rol not in ('marca', 'creador') then
    rol := 'marca';
  end if;
  insert into public.profiles (id, nombre, correo, whatsapp, roles)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'nombre'), ''), split_part(new.email, '@', 1)),
    lower(new.email),
    coalesce(new.raw_user_meta_data->>'whatsapp', ''),
    array[rol]::text[]
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.notificar(
  p_user_id uuid,
  p_para text,
  p_titulo text,
  p_cuerpo text,
  p_href text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notificaciones (user_id, para, titulo, cuerpo, href)
  values (p_user_id, p_para, p_titulo, p_cuerpo, p_href);
end;
$$;

create or replace function public.reporte_count(p_tipo text, p_id text)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from public.reportes
  where contra_tipo = p_tipo and contra_id = p_id;
$$;

create or replace function public.puede_ver_chat(p_chat_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.postulaciones p
    join public.avisos a on a.id = p.pega_id
    where p.id = p_chat_id
      and p.estado = 'elegido'
      and (p.autor_id = auth.uid() or a.autor_id = auth.uid() or public.es_admin())
  );
$$;

create or replace view public.perfiles_publicos as
  select id, nombre from public.profiles;

alter table public.profiles enable row level security;
alter table public.avisos enable row level security;
alter table public.creadores enable row level security;
alter table public.postulaciones enable row level security;
alter table public.mensajes enable row level security;
alter table public.notificaciones enable row level security;
alter table public.reportes enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.es_admin());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update
  using (id = auth.uid() or public.es_admin())
  with check (id = auth.uid() or public.es_admin());

drop policy if exists avisos_select on public.avisos;
create policy avisos_select on public.avisos
  for select using (
    estado = 'publicado'
    or autor_id = auth.uid()
    or public.es_admin()
  );

drop policy if exists avisos_insert on public.avisos;
create policy avisos_insert on public.avisos
  for insert with check (autor_id = auth.uid());

drop policy if exists avisos_update on public.avisos;
create policy avisos_update on public.avisos
  for update using (autor_id = auth.uid() or public.es_admin());

drop policy if exists creadores_select on public.creadores;
create policy creadores_select on public.creadores
  for select using (true);

drop policy if exists creadores_insert on public.creadores;
create policy creadores_insert on public.creadores
  for insert with check (autor_id = auth.uid());

drop policy if exists creadores_update on public.creadores;
create policy creadores_update on public.creadores
  for update using (autor_id = auth.uid());

drop policy if exists postulaciones_select on public.postulaciones;
create policy postulaciones_select on public.postulaciones
  for select using (
    autor_id = auth.uid()
    or public.es_admin()
    or exists (
      select 1 from public.avisos a
      where a.id = pega_id and a.autor_id = auth.uid()
    )
  );

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

drop policy if exists postulaciones_update on public.postulaciones;
create policy postulaciones_update on public.postulaciones
  for update using (
    public.es_admin()
    or exists (
      select 1 from public.avisos a
      where a.id = pega_id and a.autor_id = auth.uid()
    )
  );

drop policy if exists mensajes_all on public.mensajes;
create policy mensajes_all on public.mensajes
  for all using (public.puede_ver_chat(chat_id))
  with check (de_id = auth.uid() and public.puede_ver_chat(chat_id));

drop policy if exists notis_select on public.notificaciones;
create policy notis_select on public.notificaciones
  for select using (user_id = auth.uid() or public.es_admin());

drop policy if exists notis_update on public.notificaciones;
create policy notis_update on public.notificaciones
  for update using (user_id = auth.uid());

drop policy if exists reportes_select on public.reportes;
create policy reportes_select on public.reportes
  for select using (de_id = auth.uid() or public.es_admin());

drop policy if exists reportes_insert on public.reportes;
create policy reportes_insert on public.reportes
  for insert with check (de_id = auth.uid());

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

grant usage on schema public to anon, authenticated;
grant select on public.avisos, public.creadores to anon, authenticated;
grant select, insert, update on public.avisos, public.creadores, public.profiles to authenticated;
grant select, insert, update on public.postulaciones, public.mensajes, public.notificaciones, public.reportes to authenticated;
grant select on public.profiles, public.postulaciones, public.notificaciones, public.reportes to authenticated;
grant select on public.perfiles_publicos to anon, authenticated;
grant execute on function public.notificar(uuid, text, text, text, text) to authenticated;
grant execute on function public.reporte_count(text, text) to anon, authenticated;
grant execute on function public.es_admin() to anon, authenticated;
grant execute on function public.puede_ver_chat(text) to authenticated;
grant execute on function public.activar_plan_creador(uuid) to authenticated;

insert into public.creadores (
  id, nombre, tiktok, ciudad, nichos, min_precio, redes, seguidores, estilo, whatsapp, entregas
) values
  ('camila-barranco', 'Camila Ríos', 'camcome.pe', 'Lima', array['Foodie','Travel'], 320, array['tiktok','instagram'], 4100, 'Come en cámara, sin voz de comercial. Barranco y Miraflores.', '900000011', 3),
  ('lucia-surco', 'Lucía Mendoza', 'lu.skincare.pe', 'Lima', array['Belleza','Maternidad'], 380, array['instagram','tiktok'], 8200, 'Reseñas de 20 segundos. Muestra textura, no pose.', '900000012', 2),
  ('diego-gym', 'Diego Palacios', 'diegomueve', 'Lima', array['Fitness'], 280, array['tiktok','facebook'], 15600, 'Rutinas cortas en gym de barrio. Habla como socio, no como coach.', '900000013', 1),
  ('valeria-gamarra', 'Valeria Quispe', 'vale.prueba', 'Lima', array['Moda','Belleza'], 220, array['tiktok'], 1900, 'Prueba outfits de Gamarra. Precio en pantalla.', '900000014', 0),
  ('andrea-arequipa', 'Andrea Zuñiga', 'andreacomeaqp', 'Arequipa', array['Foodie'], 260, array['tiktok'], 6700, 'Platos arequipeños y delivery. Mejor retención que muchas limeñas.', '900000015', 2),
  ('sofia-trujillo', 'Sofía Alva', 'sofialva.ugc', 'Trujillo', array['Belleza','Moda'], 240, array['tiktok'], 3100, 'Luz natural, un take. Cobra menos que Lima por el mismo corte.', '900000016', 1),
  ('mateo-tech', 'Mateo Hidalgo', 'hidalgo.unbox', 'Lima', array['Tecnología'], 400, array['tiktok'], 12400, 'Unbox de 15s. Dice el precio y si vale el Yape.', '900000017', 1),
  ('pilar-mama', 'Pilar Torres', 'pilarconlosdos', 'Lima', array['Maternidad','Foodie'], 300, array['tiktok'], 5400, 'Casa real, hijos de fondo. Confianza de tía, no de set.', '900000018', 4),
  ('renato-cusco', 'Renato Huamán', 'renato.ruta', 'Cusco', array['Travel','Foodie'], 350, array['tiktok'], 9800, 'Tours y comida callejera. Habla quechua y castellano.', '900000019', 2),
  ('ines-piura', 'Inés Calderón', 'ines.come.norte', 'Piura', array['Foodie'], 230, array['tiktok'], 2700, 'Ceviche, jugos, almuerzos. Audiencia norteña que sí pide.', '900000020', 0),
  ('karla-miraflores', 'Karla Benavides', 'karla.pruebaesto', 'Lima', array['Belleza','Fitness'], 450, array['tiktok'], 22100, 'Antes/después sin filtro mentiroso. Pide derechos claros.', '900000021', 5),
  ('thiago-dark', 'Thiago León', 'thiagopedidos', 'Lima', array['Foodie'], 250, array['tiktok'], 1300, 'Graba el delivery como cliente. Ideal para dark kitchen.', '900000022', 0)
on conflict (id) do nothing;

insert into public.avisos (
  id, marca, whatsapp, nicho, ciudad, videos, precio, plazo, brief, created_at, redes, estado
) values
  ('ceviche-barranco', 'La Caleta Barranco', '900111001', 'Foodie', 'Lima', 5, 380, 'esta-semana', 'Cinco TikToks de platos del día. Comer en mesa, no voz de comercial. Derechos para pauta 30 días.', '2026-09-11T15:00:00.000Z', array['tiktok'], 'publicado'),
  ('serum-miraflores', 'Nube Skin', '900111002', 'Belleza', 'Lima', 3, 450, 'diez-dias', 'Tres reseñas del serum. Mostrar textura y rutina de noche. Enviamos el producto a Surco o Miraflores.', '2026-09-10T18:20:00.000Z', array['tiktok','instagram'], 'publicado'),
  ('gym-surco', 'Hálito Gym', '900111003', 'Fitness', 'Lima', 4, 320, 'esta-semana', 'Cuatro clips de 15s en el local de Surco. Socio real, no modelo. Horario 7 a 9 am.', '2026-09-12T08:10:00.000Z', array['tiktok','facebook'], 'publicado'),
  ('dark-san-miguel', 'Horno 12', '900111004', 'Foodie', 'Lima', 6, 280, 'esta-semana', 'Dark kitchen. Pedido por app, unbox en casa, primer bocado. Seis tomas, una por sabor.', '2026-09-09T21:00:00.000Z', array['tiktok'], 'publicado'),
  ('cafe-arequipa', 'Tostadito Yanahuara', '900111005', 'Foodie', 'Arequipa', 3, 300, 'diez-dias', 'Tres videos del café de especialidad. Gente de Arequipa, no turista. Precio del vaso en pantalla.', '2026-09-08T14:00:00.000Z', array['tiktok'], 'publicado'),
  ('ropa-gamarra', 'Taller 44', '900111006', 'Moda', 'Lima', 4, 250, 'esta-semana', 'Prueba 4 outfits de Gamarra. Decir talla y precio. Canje no: se paga el video.', '2026-09-11T11:30:00.000Z', array['instagram','facebook'], 'publicado'),
  ('tour-cusco', 'Ruta Qosqo', '900111007', 'Travel', 'Cusco', 3, 400, 'diez-dias', 'Tres piezas de un city tour. Sin drone mentiroso. Gente local que ya camina el centro.', '2026-09-07T16:45:00.000Z', array['tiktok'], 'publicado')
on conflict (id) do nothing;
