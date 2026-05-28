-- 预约记录新增“客户类型”字段，用于统计新客/老客。
-- new = 新客，old = 老客。
alter table public.appointments
add column if not exists customer_type text not null default 'old';

update public.appointments
set customer_type = 'old'
where customer_type is null;
