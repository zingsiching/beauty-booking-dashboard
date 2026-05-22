create table if not exists public.dashboard_content (
  id text primary key default 'main',
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.staff enable row level security;
alter table public.rooms enable row level security;
alter table public.instruments enable row level security;
alter table public.services enable row level security;
alter table public.members enable row level security;
alter table public.appointments enable row level security;
alter table public.app_settings enable row level security;
alter table public.dashboard_content enable row level security;

drop policy if exists "anon can read staff" on public.staff;
drop policy if exists "anon can insert staff" on public.staff;
drop policy if exists "anon can update staff" on public.staff;
drop policy if exists "anon can delete staff" on public.staff;
create policy "anon can read staff" on public.staff for select using (true);
create policy "anon can insert staff" on public.staff for insert with check (true);
create policy "anon can update staff" on public.staff for update using (true) with check (true);
create policy "anon can delete staff" on public.staff for delete using (true);

drop policy if exists "anon can read rooms" on public.rooms;
drop policy if exists "anon can insert rooms" on public.rooms;
drop policy if exists "anon can update rooms" on public.rooms;
drop policy if exists "anon can delete rooms" on public.rooms;
create policy "anon can read rooms" on public.rooms for select using (true);
create policy "anon can insert rooms" on public.rooms for insert with check (true);
create policy "anon can update rooms" on public.rooms for update using (true) with check (true);
create policy "anon can delete rooms" on public.rooms for delete using (true);

drop policy if exists "anon can read instruments" on public.instruments;
drop policy if exists "anon can insert instruments" on public.instruments;
drop policy if exists "anon can update instruments" on public.instruments;
drop policy if exists "anon can delete instruments" on public.instruments;
create policy "anon can read instruments" on public.instruments for select using (true);
create policy "anon can insert instruments" on public.instruments for insert with check (true);
create policy "anon can update instruments" on public.instruments for update using (true) with check (true);
create policy "anon can delete instruments" on public.instruments for delete using (true);

drop policy if exists "anon can read services" on public.services;
drop policy if exists "anon can insert services" on public.services;
drop policy if exists "anon can update services" on public.services;
drop policy if exists "anon can delete services" on public.services;
drop policy if exists "anon can insert content" on public.services;
drop policy if exists "anon can update content" on public.services;
drop policy if exists "anon can delete content" on public.services;
create policy "anon can read services" on public.services for select using (true);
create policy "anon can insert services" on public.services for insert with check (true);
create policy "anon can update services" on public.services for update using (true) with check (true);
create policy "anon can delete services" on public.services for delete using (true);

drop policy if exists "anon can read members" on public.members;
drop policy if exists "anon can insert members" on public.members;
drop policy if exists "anon can update members" on public.members;
drop policy if exists "anon can delete members" on public.members;
create policy "anon can read members" on public.members for select using (true);
create policy "anon can insert members" on public.members for insert with check (true);
create policy "anon can update members" on public.members for update using (true) with check (true);
create policy "anon can delete members" on public.members for delete using (true);

drop policy if exists "anon can read appointments" on public.appointments;
drop policy if exists "anon can insert appointments" on public.appointments;
drop policy if exists "anon can update appointments" on public.appointments;
drop policy if exists "anon can delete appointments" on public.appointments;
create policy "anon can read appointments" on public.appointments for select using (true);
create policy "anon can insert appointments" on public.appointments for insert with check (true);
create policy "anon can update appointments" on public.appointments for update using (true) with check (true);
create policy "anon can delete appointments" on public.appointments for delete using (true);

drop policy if exists "anon can read app_settings" on public.app_settings;
drop policy if exists "anon can insert settings" on public.app_settings;
drop policy if exists "anon can update settings" on public.app_settings;
drop policy if exists "anon can delete settings" on public.app_settings;
create policy "anon can read app_settings" on public.app_settings for select using (true);
create policy "anon can insert settings" on public.app_settings for insert with check (true);
create policy "anon can update settings" on public.app_settings for update using (true) with check (true);
create policy "anon can delete settings" on public.app_settings for delete using (true);

drop policy if exists "anon can read dashboard content" on public.dashboard_content;
drop policy if exists "anon can insert dashboard content" on public.dashboard_content;
drop policy if exists "anon can update dashboard content" on public.dashboard_content;
drop policy if exists "anon can delete dashboard content" on public.dashboard_content;
create policy "anon can read dashboard content" on public.dashboard_content for select using (true);
create policy "anon can insert dashboard content" on public.dashboard_content for insert with check (true);
create policy "anon can update dashboard content" on public.dashboard_content for update using (true) with check (true);
create policy "anon can delete dashboard content" on public.dashboard_content for delete using (true);
