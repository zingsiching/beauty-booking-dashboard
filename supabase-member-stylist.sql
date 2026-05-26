-- 会员资料新增“美容师”字段。
-- 在 Supabase SQL Editor 运行一次即可，前端会用这个字段跨设备同步会员对应美容师。
alter table public.members
add column if not exists stylist_name text;
