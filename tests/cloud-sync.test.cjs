const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
function source(name) {
  const start = html.indexOf(`    async function ${name}(`);
  assert.ok(start >= 0, `${name} exists`);
  const end = html.indexOf('\n    }', start) + 6;
  return html.slice(start, end);
}
function load(name, globals = {}) {
  return vm.runInNewContext(`${source(name)}\n${name}`, globals);
}
function queryFactory(total, cap = 500, failOffset = -1) {
  const calls = [];
  const factory = () => ({ range: async (from, to) => {
    calls.push([from, to]);
    if (from === failOffset) return { data: null, error: new Error('network failed') };
    return { data: Array.from({ length: Math.max(0, Math.min(to-from+1, cap, total-from)) }, (_, i) => ({id: from+i})), count: total, error: null };
  }});
  return {factory, calls};
}
for (const [total, cap] of [[1062,500],[1000,500],[1062,200],[0,500]]) {
  test(`complete read: ${total} rows, server cap ${cap}`, async () => {
    const {factory,calls} = queryFactory(total,cap);
    const result = await load('fetchAllSupabaseRows')(factory);
    assert.equal(result.data.length,total);
    assert.equal(new Set(result.data.map(x=>x.id)).size,total);
    if (total) assert.equal(result.data.at(-1).id,total-1);
    assert.ok(calls.length <= Math.max(1,Math.ceil(total/cap)));
  });
}
test('a later-page error rejects instead of replacing complete local data', async () => {
  await assert.rejects(load('fetchAllSupabaseRows')(queryFactory(1062,500,500).factory),/network failed/);
});
test('an empty page before the reported count rejects', async () => {
  await assert.rejects(load('fetchAllSupabaseRows')(()=>({range:async()=>({data:[],count:10,error:null})})),/完整/);
});
test('appointments and members use stable pagination', () => {
  const pull = source('pullSupabaseData');
  assert.match(pull,/fetchAllSupabaseRows\(\(\) => client.from\("appointments"\)/);
  assert.match(pull,/fetchAllSupabaseRows\(\(\) => client.from\("members"\)/);
  assert.equal((pull.match(/\.order\("id"\)/g)||[]).length,2);
});
for (const condition of ['loggedOut','hidden','offline','saving','reading','appointmentForm','settingsForm','memberForm']) {
  test(`background sync skips ${condition}`, async () => {
    let reads=0;
    const globals={config:{storageMode:'supabase'},cloudReadInProgress:condition==='reading',cloudSaveInProgress:condition==='saving',
      localStorage:{getItem:()=>condition==='loggedOut'?null:'yes'},
      document:{visibilityState:condition==='hidden'?'hidden':'visible'},navigator:{onLine:condition!=='offline'},
      modalBackdrop:{classList:{contains:()=>condition==='appointmentForm'}},settingsBackdrop:{classList:{contains:()=>condition==='settingsForm'}},memberModalBackdrop:{classList:{contains:()=>condition==='memberForm'}},
      readCloudData:async()=>{reads++;}};
    await load('refreshCloudIfIdle',globals)();
    assert.equal(reads,0);
  });
}
test('idle online client refreshes silently',async()=>{
  let options;
  const modal={classList:{contains:()=>false}};
  await load('refreshCloudIfIdle',{config:{storageMode:'supabase'},cloudReadInProgress:false,cloudSaveInProgress:false,
    localStorage:{getItem:()=> 'yes'},document:{visibilityState:'visible'},navigator:{onLine:true},
    modalBackdrop:modal,settingsBackdrop:modal,memberModalBackdrop:modal,
    readCloudData:async o=>{options=o;}})();
  assert.equal(options.silent,true);
});
test('background read errors keep the failure status without alerts',async()=>{
  let alerts=0, status;
  const result=await load('readCloudData',{cloudSaveInProgress:false,cloudReadInProgress:false,config:{storageMode:'supabase'},
    pullSupabaseData:async()=>{throw Error('offline');},formatSupabaseError:()=> '读取云端失败',
    setSyncStatus:(message,type)=>{status=type;},alert:()=>alerts++})({silent:true});
  assert.equal(result,false);assert.equal(alerts,0);assert.equal(status,'error');
});
test('a form opened during a background fetch prevents applying its response',async()=>{
  const result={data:[],error:null};
  const client={from:()=>{const q={select:()=>q,eq:()=>q,order:()=>q,maybeSingle:async()=>result,then:(resolve)=>Promise.resolve(result).then(resolve)};return q;}};
  const modal={classList:{contains:()=>true}};
  const resultApplied=await load('pullSupabaseData',{
    getSupabaseClient:()=>client,setSyncStatus:()=>{},fetchAllSupabaseRows:async()=>result,
    dashboardContentId:'main',modalBackdrop:modal,settingsBackdrop:modal,memberModalBackdrop:modal,
    applyConfig:()=>{throw Error('must not apply while editing');}
  })({deferWhileEditing:true});
  assert.equal(resultApplied,false);
});
