create table if not exists public.dashboard_content (
  id text primary key default 'main',
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.dashboard_content enable row level security;

drop policy if exists "anon can read dashboard content" on public.dashboard_content;
drop policy if exists "anon can insert dashboard content" on public.dashboard_content;
drop policy if exists "anon can update dashboard content" on public.dashboard_content;
drop policy if exists "anon can delete dashboard content" on public.dashboard_content;

create policy "anon can read dashboard content"
on public.dashboard_content for select
using (true);

create policy "anon can insert dashboard content"
on public.dashboard_content for insert
with check (true);

create policy "anon can update dashboard content"
on public.dashboard_content for update
using (true)
with check (true);

create policy "anon can delete dashboard content"
on public.dashboard_content for delete
using (true);

insert into public.dashboard_content (id, value)
values (
  'main',
  '{
    "config": {
      "year": 2026,
      "month": 6,
      "openHour": 10,
      "closeHour": 22,
      "slotMinutes": 30
    },
    "services": [
      {"label":"面部护理","color":"#D9EAD3","defaultDuration":90},
      {"label":"身体护理","color":"#D9EAF7","defaultDuration":90},
      {"label":"清洁","color":"#FFF2CC","defaultDuration":60},
      {"label":"补水","color":"#D9EAD3","defaultDuration":90},
      {"label":"抗衰","color":"#EADCF8","defaultDuration":120},
      {"label":"美白","color":"#FCE4EC","defaultDuration":90},
      {"label":"祛痘","color":"#FCF5CD","defaultDuration":90},
      {"label":"脱毛","color":"#DDEBF7","defaultDuration":60},
      {"label":"咨询","color":"#E7E6E6","defaultDuration":30},
      {"label":"复诊","color":"#E2D6C3","defaultDuration":30},
      {"label":"其他","color":"#FFFFFF","defaultDuration":60}
    ],
    "rooms": [
      {"name":"1号房"},
      {"name":"2号房"},
      {"name":"VIP房"}
    ],
    "staff": [
      {"name":"小宝","role":"顾问"},
      {"name":"凤凤","role":"顾问"},
      {"name":"英姐","role":"美容师"},
      {"name":"露娟","role":"美容师"},
      {"name":"两角","role":"美容师"}
    ],
    "instruments": [
      {"name":"仪器1"},
      {"name":"仪器2"}
    ]
  }'::jsonb
)
on conflict (id) do nothing;
