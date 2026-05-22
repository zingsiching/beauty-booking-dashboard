create unique index if not exists services_name_unique on public.services (name);
create unique index if not exists rooms_name_unique on public.rooms (name);
create unique index if not exists staff_name_unique on public.staff (name);
create unique index if not exists instruments_name_unique on public.instruments (name);
