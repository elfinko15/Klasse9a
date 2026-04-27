-- ============================================================
-- Kommentarseite – Neues Schema
-- Im Supabase SQL Editor ausführen
-- ============================================================

-- Alte Tabellen entfernen falls vorhanden
drop table if exists comments cascade;
drop table if exists users cascade;

-- Benutzer (Schüler + Admins)
create table users (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  username text unique not null,
  password_hash text not null,
  role text not null default 'student' check (role in ('admin', 'student')),
  bio text default '',
  profile_picture_url text,
  created_at timestamptz default now()
);

-- Kommentare (auf Schüler-Seiten)
create table comments (
  id uuid default gen_random_uuid() primary key,
  target_user_id uuid not null references users(id) on delete cascade,
  author_id uuid not null references users(id) on delete cascade,
  message text not null,
  created_at timestamptz default now()
);

-- RLS aktivieren (Auth wird server-seitig in API-Routen geprüft)
alter table users enable row level security;
alter table comments enable row level security;

-- Service Role Key umgeht RLS automatisch – diese Policies sind Fallback
create policy "allow_all_users" on users for all using (true) with check (true);
create policy "allow_all_comments" on comments for all using (true) with check (true);

-- Indizes für Performance
create index users_username_idx on users (username);
create index comments_target_idx on comments (target_user_id, created_at desc);
create index comments_author_idx on comments (author_id);
