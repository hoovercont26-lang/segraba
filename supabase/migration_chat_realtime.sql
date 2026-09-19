-- Activa mensajes en vivo (Supabase Realtime)
-- Correr en SQL Editor del proyecto Supabase

alter table public.mensajes replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.mensajes;
exception
  when duplicate_object then null;
  when undefined_object then
    raise notice 'Publicación supabase_realtime no encontrada; actívala en Dashboard → Database → Replication';
end $$;
