-- Cierra avisos que ya eligieron creador (salen del feed público)
-- Correr en SQL Editor de Supabase

update public.avisos
set estado = 'cerrado'
where elegido_postulacion_id is not null
  and estado is distinct from 'cerrado';
