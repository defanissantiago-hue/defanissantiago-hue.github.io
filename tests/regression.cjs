// Ejecutar: TZ=America/Argentina/Buenos_Aires node --experimental-vm-modules tests/regression.cjs
// No accede a Supabase ni modifica datos reales.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');const root=path.resolve(__dirname,'..');let passed=0;
function check(name,fn){fn();passed++;console.log('PASS '+name)}
async function load(demo=true,sb={}){
 const data=new Map();const ctx=vm.createContext({console,Date,Math,Number,String,Array,Object,JSON,Set,Map,Intl,Promise,Error,URL,URLSearchParams,crypto:webcrypto,setTimeout,clearTimeout,location:{href:'https://example.test/login.html'},localStorage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}});
 ctx.mockSb=sb;const cache=new Map();
 async function module(file){if(cache.has(file))return cache.get(file);
 const source=file.endsWith('/config.js')?`export const CONFIG={DEMO_MODE:${demo},SUPABASE_URL:'https://example.supabase.co',SUPABASE_ANON_KEY:'publishable-test',STORAGE_BUCKET:'exercise-videos'};`:fs.readFileSync(file,'utf8');
 const m=new vm.SourceTextModule(source,{context:ctx,identifier:file,importModuleDynamically:async()=>{const mock=new vm.SourceTextModule('export const createClient=()=>mockSb',{context:ctx});await mock.link(()=>{});await mock.evaluate();return mock}});cache.set(file,m);await m.link((s,ref)=>module(path.resolve(path.dirname(ref.identifier),s)));return m}
 const db=await module(root+'/js/db.js');await db.evaluate();const workout=await module(root+'/js/workout.js');await workout.evaluate();return{db:db.namespace,w:workout.namespace,u:cache.get(root+'/js/utils.js').namespace,data};
}
(async()=>{
 const {db,w,u,data}=await load();db.seedDemo();
 check('local calendar date after 21:00 Argentina',()=>assert.equal(u.dateISO(new Date('2026-10-04T01:30:00Z')),'2026-10-03'));
 check('date-only display does not move to previous day',()=>assert.equal(u.formatDate('2026-10-03'),'03/10/2026'));
 check('one set does not complete entire exercise',()=>assert.equal(w.exerciseDone({id:'ex',sets:2},[{routine_exercise_id:'ex',set_number:1,completed:true}]),false));
 check('all prescribed sets required, unrelated sets ignored',()=>assert.equal(w.exerciseDone({id:'ex',sets:2},[{routine_exercise_id:'other',set_number:2,completed:true},{routine_exercise_id:'ex',set_number:1,completed:true},{routine_exercise_id:'ex',set_number:2,completed:true}]),true));
 check('oldest unpaid payment selected, paid excluded',()=>assert.equal(w.nextPayment([{id:1,status:'pending',due_date:'2026-12-01'},{id:2,status:'pending',due_date:'2026-10-01'},{id:3,status:'paid',due_date:'2026-09-01'}]).id,2));
 check('all paid means no next payment',()=>assert.equal(w.nextPayment([{status:'paid',due_date:'2026-10-01'}]),null));
 const student=await db.adminCreateStudent({full_name:'QA',email:'qa@example.test',password:'test-password'});
 const r=await db.adminSaveRoutineFull({student_id:student.id,name:'Test',days:[{title:'Push',exercises:[{name:'Press',exercise_id:'e2',sets:2,reps:'8-10',rest_seconds:90}]},{title:'Pull',exercises:[{name:'Remo',sets:3,reps:'10',rest_seconds:90}]}]});
 for(const [i,d] of r.days.entries())await db.saveFeedback({student_id:student.id,routine_day_id:d.id,workout_date:'2026-10-03',rpe:7+i,comment:'day '+i,completed:false});
 const first=await db.getFeedback(student.id,'2026-10-03',r.days[0].id),second=await db.getFeedback(student.id,'2026-10-03',r.days[1].id);
 check('feedback isolated per day on same date',()=>{assert.equal(first.comment,'day 0');assert.equal(second.comment,'day 1')});
 const log={student_id:student.id,routine_day_id:r.days[0].id,routine_exercise_id:r.days[0].exercises[0].id,workout_date:'2026-10-03',set_number:1,weight:50,reps:8,completed:true};
 await db.saveExerciseLog(log);await db.saveExerciseLog({...log,weight:55});
 check('saving same set updates instead of duplicating',()=>assert.equal(JSON.parse(data.get('sw_demo_logs')).length,1));
 await db.adminSaveRoutineFull({...r,name:'Version 2'});const active=await db.getStudentRoutine(student.id),history=await db.getStudentHistory(student.id);
 check('routine edit keeps history and changes active version',()=>{assert.notEqual(active.id,r.id);assert.equal(history.logs.length,1);assert.equal(history.logs[0].weight,55);assert.equal(history.logs[0].routine_exercises.name,'Press');assert.equal(JSON.parse(data.get('sw_demo_routines')).filter(r=>r.student_id===student.id&&r.active).length,1)});
 check('history contains RPE, comment and safe HTML',()=>{const html=w.historyHTML({...history,feedback:[{...first,comment:'<script>bad</script>'}]});assert.ok(html.includes('7/10'));assert.ok(html.includes('55'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'))});
 let writes=[],rpc=[];const profile={id:'admin-id',role:'admin',full_name:'Admin'};
 const sb={auth:{signInWithPassword:async()=>({data:{user:{id:'admin-id'}},error:null}),getUser:async()=>({data:{user:{id:'admin-id'}}}),signOut:async()=>({error:null})},from(table){const q={select(){return q},eq(){return q},upsert(row){writes.push({table,row});return q},single:async()=>({data:table==='profiles'?profile:{id:'ok'},error:null})};return q},rpc:async(name,args)=>{rpc.push({name,args});return{data:{id:'new'},error:null}}};
 const prod=(await load(false,sb)).db;const logged=await prod.signIn('a@b.test','password');check('real login resolves profile role',()=>assert.equal(logged.user.role,'admin'));
 await prod.adminSaveStudent({id:'s',full_name:'A',plans:{name:'Pro'}});await prod.adminSavePayment({id:'p',amount:20,students:{full_name:'A'},student:{name:'A'}});
 check('joined relations omitted from database writes',()=>{assert.equal('plans' in writes[0].row,false);assert.equal('students' in writes[1].row,false);assert.equal('student' in writes[1].row,false)});
 await prod.adminSaveRoutineFull({...r});check('production saves using atomic RPC',()=>{assert.equal(rpc[0].name,'save_routine_version');assert.equal(rpc[0].args.payload.student_id,student.id)});
 await assert.rejects(()=>prod.adminSaveRoutineFull({student_id:'s',name:'Empty',days:[]}),/Completá/);passed++;console.log('PASS empty routine rejected');
 sb.rpc=async()=>({error:{code:'PGRST202',message:'missing'}});await assert.rejects(()=>prod.adminSaveRoutineFull(r),/005_v1_patch/);passed++;console.log('PASS missing migration produces explicit error');
 console.log(`\n${passed} regression checks passed. SQL/live auth/browser not covered.`);
})().catch(e=>{console.error(e);process.exit(1)});
