-- 预约客源：meituan=美团，douyin=抖音，referral=转介绍。
-- 历史记录保持 NULL（未填写），不推断客源、不改动原预约状态。
alter table public.appointments
add column if not exists customer_source text;

comment on column public.appointments.customer_source
is '预约客源：meituan / douyin / referral；NULL 表示未填写';

notify pgrst, 'reload schema';
