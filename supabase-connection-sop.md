# Supabase 连接 SOP：预约会员管理看板

## 目标

把当前 `index.html` 看板连接到 Supabase，让预约、会员、服务项目、房间、人员等数据后续可以存在云端。

当前阶段先完成三件事：

1. 在 Supabase 创建数据库表。
2. 找到项目 URL 和 anon/public key。
3. 明确之后 HTML 要填哪些连接信息。

后续再把 `index.html` 的本地储存逻辑替换成 Supabase 读写。

## 非常重要

Supabase 前端连接只能使用：

- Project URL
- anon key / publishable key

不要把下面这个 key 放进 HTML：

- service_role key

`service_role key` 权限非常高，只能放在服务器端，不能放在浏览器页面里。

## 第一部分：进入 SQL Editor

你现在已经在 Supabase 项目首页。

按照下面点击：

1. 看左侧竖向菜单。
2. 点击类似 `>_` 的图标。
3. 这个页面叫 `SQL Editor`。
4. 点击 `New query`。

如果你看到一个可以输入 SQL 的大编辑框，就对了。

## 第二部分：复制并运行建表 SQL

在 `SQL Editor` 里，把下面 SQL 全部复制进去。

然后点击右下角或顶部的 `Run`。

```sql
create extension if not exists "pgcrypto";

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '美容师',
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.instruments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#FFFFFF',
  default_duration integer not null default 90,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  level text not null default '普通会员',
  opened_at date,
  expires_at date,
  package_name text,
  remaining_times numeric default 0,
  balance numeric default 0,
  total_spend numeric default 0,
  last_visit_at date,
  status text not null default '有效',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'appointment',
  status text not null default 'confirmed',
  appointment_date date not null,
  start_time text not null,
  duration integer not null default 90,
  customer text,
  phone text,
  member_id uuid references public.members(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  service_name text,
  staff_id uuid references public.staff(id) on delete set null,
  staff_name text,
  room_id uuid references public.rooms(id) on delete set null,
  room_name text,
  instrument_id uuid references public.instruments(id) on delete set null,
  instrument_name text,
  notes text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
```

运行成功后，页面通常会显示 `Success. No rows returned` 或类似成功提示。

## 第三部分：插入初始选项数据

继续在 SQL Editor 里点击 `New query`。

复制下面 SQL，点击 `Run`。

```sql
insert into public.staff (name, role, sort_order) values
('小宝', '顾问', 1),
('凤凤', '顾问', 2),
('英姐', '美容师', 3),
('露娟', '美容师', 4),
('两角', '美容师', 5)
on conflict do nothing;

insert into public.services (name, color, default_duration, sort_order) values
('面部护理', '#D9EAD3', 90, 1),
('身体护理', '#D9EAF7', 90, 2),
('清洁', '#FFF2CC', 60, 3),
('补水', '#D9EAD3', 90, 4),
('抗衰', '#EADCF8', 120, 5),
('美白', '#FCE4EC', 90, 6),
('祛痘', '#FCF5CD', 90, 7),
('脱毛', '#DDEBF7', 60, 8),
('咨询', '#E7E6E6', 30, 9),
('复诊', '#E2D6C3', 30, 10),
('其他', '#FFFFFF', 60, 11)
on conflict do nothing;

insert into public.rooms (name, sort_order) values
('1号房', 1),
('2号房', 2),
('VIP房', 3)
on conflict do nothing;

insert into public.instruments (name, sort_order) values
('仪器1', 1),
('仪器2', 2)
on conflict do nothing;

insert into public.app_settings (key, value) values
('business_config', '{"year":2026,"month":6,"openHour":10,"closeHour":22,"slotMinutes":30}'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();
```

## 第三点五部分：给内容修改功能加唯一索引

当前 HTML 里的 `修改看板内容` 会用名称来更新：

- 服务项目名称
- 房间名称
- 人员姓名
- 仪器名称

所以需要继续在 SQL Editor 里点击 `New query`，运行下面 SQL：

```sql
create unique index if not exists services_name_unique on public.services (name);
create unique index if not exists rooms_name_unique on public.rooms (name);
create unique index if not exists staff_name_unique on public.staff (name);
create unique index if not exists instruments_name_unique on public.instruments (name);
```

## 第四部分：检查表是否创建成功

点击左侧菜单里的表格图标。

这个页面通常叫：

`Table Editor`

你应该看到这些表：

- `appointments`
- `members`
- `services`
- `rooms`
- `staff`
- `instruments`
- `app_settings`

点击 `services`。

如果你看到：

- 面部护理
- 身体护理
- 清洁
- 补水
- 抗衰

说明初始数据已经成功。

## 第五部分：先临时打开 RLS 策略

这一阶段为了先让 HTML 能连接测试，我们需要设置 RLS。

点击左侧菜单：

1. 找到 `Authentication` 或盾牌/锁相关菜单。
2. 找到 `Policies`。
3. 或者直接在 `Table Editor` 里点击某张表，找 `RLS Policies`。

更简单的方式是继续用 SQL Editor。

点击 `SQL Editor` -> `New query`。

复制下面 SQL，点击 `Run`。

```sql
alter table public.staff enable row level security;
alter table public.rooms enable row level security;
alter table public.instruments enable row level security;
alter table public.services enable row level security;
alter table public.members enable row level security;
alter table public.appointments enable row level security;
alter table public.app_settings enable row level security;

create policy "anon can read staff" on public.staff for select using (true);
create policy "anon can read rooms" on public.rooms for select using (true);
create policy "anon can read instruments" on public.instruments for select using (true);
create policy "anon can read services" on public.services for select using (true);
create policy "anon can read members" on public.members for select using (true);
create policy "anon can read appointments" on public.appointments for select using (true);
create policy "anon can read app_settings" on public.app_settings for select using (true);

create policy "anon can insert appointments" on public.appointments for insert with check (true);
create policy "anon can update appointments" on public.appointments for update using (true) with check (true);
create policy "anon can delete appointments" on public.appointments for delete using (true);

create policy "anon can insert members" on public.members for insert with check (true);
create policy "anon can update members" on public.members for update using (true) with check (true);
create policy "anon can delete members" on public.members for delete using (true);

create policy "anon can insert settings" on public.app_settings for insert with check (true);
create policy "anon can update settings" on public.app_settings for update using (true) with check (true);

create policy "anon can insert content" on public.services for insert with check (true);
create policy "anon can update content" on public.services for update using (true) with check (true);
create policy "anon can delete content" on public.services for delete using (true);

create policy "anon can insert rooms" on public.rooms for insert with check (true);
create policy "anon can update rooms" on public.rooms for update using (true) with check (true);
create policy "anon can delete rooms" on public.rooms for delete using (true);

create policy "anon can insert staff" on public.staff for insert with check (true);
create policy "anon can update staff" on public.staff for update using (true) with check (true);
create policy "anon can delete staff" on public.staff for delete using (true);

create policy "anon can insert instruments" on public.instruments for insert with check (true);
create policy "anon can update instruments" on public.instruments for update using (true) with check (true);
create policy "anon can delete instruments" on public.instruments for delete using (true);
```

如果页面提示 `RLS/权限策略不允许前端写入`，直接打开本文件同目录下的
`supabase-rls-policies.sql`，把里面的 SQL 全部复制到 Supabase 的 `SQL Editor` 运行。
它会先删除旧策略，再重新创建当前 HTML 需要的读写策略。

注意：这套策略是 MVP 测试用，方便先连通。正式上线登录后，要改成 `authenticated` 用户才能读写。

## 第六部分：找到 Project URL

你现在首页已经能看到项目 URL。

截图中项目名称下面有一行：

`https://...supabase.co`

旁边有 `Copy` 按钮。

操作：

1. 回到项目首页。
2. 找到项目名称下面的 URL。
3. 点击旁边的 `Copy`。
4. 先粘贴到一个临时文本里。

这个叫：

`SUPABASE_URL`

## 第七部分：找到 anon key / publishable key

点击路径：

1. 左侧最下面点击齿轮图标 `Project Settings`。
2. 进入后，左侧或页面里找到 `API`。
3. 找到 `Project API keys`。
4. 复制 `anon public` 或 `publishable` key。

这个叫：

`SUPABASE_ANON_KEY`

再次提醒：

不要复制 `service_role` 到 HTML。

## 第八部分：HTML 里之后要填写什么

后续我会把当前 `index.html` 的云端设置改成 Supabase 版本。

届时你需要填两个值：

1. Supabase Project URL
2. Supabase anon/public key

页面里会类似这样：

```text
云端数据库：Supabase
Project URL：https://xxxxx.supabase.co
Anon Key：eyJ...
```

填完后点击：

```text
保存设置
```

再点击：

```text
读取云端
```

如果连接成功，看板会读取：

- 服务项目
- 人员
- 房间
- 会员
- 预约

## 第九部分：连接成功后怎么测试

### 测试 1：服务项目

1. 打开 HTML。
2. 点击 `新增预约`。
3. 查看 `服务项目` 下拉框。
4. 如果出现 `面部护理、身体护理、清洁、补水...`，说明服务项目读取成功。

### 测试 2：会员

1. 进入 `会员系统管理`。
2. 新增一个会员：
   - 姓名：李女士
   - 手机号：13800000000
   - 会员等级：VIP会员
3. 保存。
4. 回到 `当日预约管理`。
5. 新增预约。
6. 输入手机号 `13800000000`。
7. 如果系统显示 `已识别会员：李女士｜VIP会员`，说明会员数据成功。

### 测试 3：预约

1. 新增一条预约。
2. 保存。
3. 回到 Supabase。
4. 点击左侧 `Table Editor`。
5. 打开 `appointments`。
6. 如果看到刚刚新增的预约，说明预约写入成功。

## 第十部分：正式上线前必须调整

当前 SOP 先让系统连通。

正式给甲方使用前，需要做：

1. Supabase Auth 登录。
2. RLS 政策改为只允许登录用户读写。
3. 每条预约记录加 `created_by` 或 `user_id`。
4. 不再允许匿名用户直接修改表。
5. 如果有多门店，需要加 `store_id`。

## 当前阶段建议

你现在先完成：

1. 建表。
2. 插入初始数据。
3. 找到 Project URL。
4. 找到 anon/public key。
5. 发给我这两个值，或者你自己填到后续 HTML 设置里。

然后我再继续把 `index.html` 改成 Supabase 读写版本。
