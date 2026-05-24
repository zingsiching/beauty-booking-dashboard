-- 会员资料新增“产品折扣”字段。
-- 在 Supabase SQL Editor 运行一次即可，前端会用这个字段跨设备同步会员折扣。
alter table public.members
add column if not exists product_discount text not null default '无折扣';
