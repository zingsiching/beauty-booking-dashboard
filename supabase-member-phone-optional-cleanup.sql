-- 修复手机号选填后的唯一约束冲突。
-- 原因：空手机号如果保存成空字符串 ''，会触发 members_phone_key 唯一约束。
-- 运行一次后，已有空字符串会变成 NULL；之后前端也会把空手机号写成 NULL。
update public.members
set phone = null
where phone = '';
