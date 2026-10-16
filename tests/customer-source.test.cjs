const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
function load(name,globals={}){
  const start=html.indexOf(`    function ${name}(`);assert.ok(start>=0,`${name} exists`);
  const end=html.indexOf('\n    }',start)+6;
  return vm.runInNewContext(`${html.slice(start,end)}\n${name}`,globals);
}
test('customer source replaces the visible status select and offers three sources',()=>{
  assert.match(html,/<label for="customerSource">客源<\/label>/);
  const select=html.match(/<select id="customerSource">([\s\S]*?)<\/select>/)[1];
  for(const [value,label] of [['meituan','美团'],['douyin','抖音'],['referral','转介绍']])assert.ok(select.includes(`value="${value}">${label}`));
  assert.doesNotMatch(html,/<select id="status">/);
  assert.match(html,/<input type="hidden" id="status"/);
});
test('form keeps historical status and captures customer source',()=>{
  const values={recordId:'abc',memberId:'',appointmentMemberCode:'',customer:'示例客户',phone:'',recordType:'appointment',status:'cancelled',customerSource:'referral',customerType:'new',date:'2026-10-16',startTime:'11:00',duration:'120',staff:'家明',service:'Body Spa',room:'',instrument:'',createdBy:'',notes:''};
  const record=load('formDataToRecord',{document:{getElementById:id=>({value:values[id]})},resolveMemberForAppointment:()=>null,records:[]})();
  assert.equal(record.customerSource,'referral');assert.equal(record.status,'cancelled');
});
for(const source of ['meituan','douyin','referral']){
  test(`${source} survives cloud payload and readback`,()=>{
    const record={id:'valid-id',customer:'示例客户',date:'2026-10-16',startTime:'11:00',customerSource:source,status:'pending'};
    const payload=load('supabaseAppointmentPayload',{resolveMemberForAppointment:()=>null,isUuid:()=>true,serviceOptions:[],staffList:[],roomOptions:[],instrumentOptions:[],config:{storageMode:'supabase'}})(record);
    assert.equal(payload.customer_source,source);assert.equal(payload.status,'pending');
    const mapped=load('mapSupabaseAppointment')(payload);
    assert.equal(mapped.customerSource,source);assert.equal(mapped.status,'pending');
  });
}
test('historical records have no guessed source',()=>{
  assert.equal(load('mapSupabaseAppointment')({id:'old'}).customerSource,'');
  assert.equal(load('customerSourceLabel')(''),'未填写');
});
test('appointment export includes customer source',()=>{
  assert.match(html,/"客户类型", "客源", "手机号"/);
  const start=html.indexOf('    function exportExcel()');
  const end=html.indexOf('\n    }',start);
  assert.match(html.slice(start,end),/customerSourceLabel\(record.customerSource\)/);
});
