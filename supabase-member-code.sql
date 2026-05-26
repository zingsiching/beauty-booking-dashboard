-- 会员资料新增“会员编号”字段。
-- 在 Supabase SQL Editor 运行一次即可，前端会用这个字段跨设备同步会员编号。
alter table public.members
add column if not exists member_code text;
