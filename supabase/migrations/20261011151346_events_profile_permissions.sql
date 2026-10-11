begin;

-- Mevcut veriyi taşımadan, beklenmeyen şemayı sessizce değiştirmeden onar.
do $migration$
declare
  events_oid regclass := 'public.events'::regclass;
  kind "char";
  primary_columns text[];
  partition_columns text[];
  partition_strategy "char";
  child record;
  columns_sql text;
begin
  select relkind into kind from pg_class where oid = events_oid;
  if kind = 'p' then
    select p.partstrat, array_agg(a.attname::text order by k.position)
      into partition_strategy, partition_columns
      from pg_partitioned_table p
      cross join lateral unnest(p.partattrs) with ordinality k(attnum, position)
      join pg_attribute a on a.attrelid = p.partrelid and a.attnum = k.attnum
      where p.partrelid = events_oid group by p.partstrat;
    if partition_strategy is distinct from 'r' or partition_columns is distinct from array['created_at']::text[] then
      raise exception 'events bölümleme yapısı beklenenden farklı; otomatik dönüşüm yapılmadı';
    end if;

    select array_agg(a.attname::text order by a.attname)
      into primary_columns
      from pg_constraint c
      cross join lateral unnest(c.conkey) k(attnum)
      join pg_attribute a on a.attrelid = c.conrelid and a.attnum = k.attnum
      where c.conrelid = events_oid and c.contype = 'p';
    if primary_columns is null then
      alter table public.events add primary key (id, created_at);
    elsif primary_columns is distinct from array['created_at', 'id']::text[] then
      raise exception 'events birincil anahtarı beklenenden farklı; anahtar silinmedi';
    end if;

    if not exists (
      select 1 from pg_inherits i join pg_class c on c.oid = i.inhrelid
      where i.inhparent = events_oid and pg_get_expr(c.relpartbound, c.oid) = 'DEFAULT'
    ) then
      create table public.events_default partition of public.events default;
    end if;

    -- Üst tablodaki RLS, doğrudan bölüm sorgusunun yerine geçmez.
    for child in select relid from pg_partition_tree(events_oid) where relid <> events_oid loop
      execute format('alter table %s enable row level security', child.relid);
      execute format('revoke all on table %s from public, anon, authenticated', child.relid);
      select string_agg(quote_ident(attname), ', ' order by attnum) into columns_sql
        from pg_attribute where attrelid = child.relid and attnum > 0 and not attisdropped;
      execute format('revoke select (%1$s), insert (%1$s), update (%1$s), references (%1$s) on table %2$s from public, anon, authenticated', columns_sql, child.relid);
    end loop;
  elsif kind <> 'r' then
    raise exception 'events sıradan veya bölümlenmiş tablo değil; işlem durduruldu';
  end if;
  -- Önceden kurulmuş sıradan olay tablosu ve kayıtları korunur.
end;
$migration$;

alter table public.profiles enable row level security;
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- Eski tablo/sütun izinlerinin ikisini de kaldır; yalnız kişisel alanları aç.
revoke all on table public.profiles from public, anon, authenticated;
do $permissions$
declare columns_sql text;
begin
  select string_agg(quote_ident(attname), ', ' order by attnum) into columns_sql
    from pg_attribute where attrelid = 'public.profiles'::regclass and attnum > 0 and not attisdropped;
  execute format('revoke select (%1$s), insert (%1$s), update (%1$s), references (%1$s) on table public.profiles from public, anon, authenticated', columns_sql);
end;
$permissions$;
grant select on public.profiles to authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;
grant select, insert, update, delete on public.projects, public.experiments, public.variations, public.goals to authenticated;
grant select on public.events, public.subscriptions to authenticated;
grant select, insert, update, delete on public.profiles, public.projects, public.experiments, public.variations, public.goals, public.events, public.subscriptions to service_role;

commit;
