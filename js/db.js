import {CONFIG} from './config.js';import {DEFAULT_PLANS,ROLES,PAYMENT_STATUS} from './constants.js';import {uid,dateISO} from './utils.js';
let supabase=null;
const hasRealConfig=()=>!CONFIG.DEMO_MODE&&CONFIG.SUPABASE_URL.startsWith('http')&&!CONFIG.SUPABASE_ANON_KEY.startsWith('REEMPLAZAR');
export async function getSupabase(){if(CONFIG.DEMO_MODE===true)return null;if(!hasRealConfig())throw new Error('Configuración de Supabase incompleta. Contactá al entrenador.');if(!supabase){const mod=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');supabase=mod.createClient(CONFIG.SUPABASE_URL,CONFIG.SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}return supabase}
const KEYS={session:'sw_demo_session',users:'sw_demo_users',students:'sw_demo_students',plans:'sw_demo_plans',routines:'sw_demo_routines',logs:'sw_demo_logs',feedback:'sw_demo_feedback',payments:'sw_demo_payments',exercises:'sw_demo_exercises'};
function read(k,f=[]){try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}}function write(k,v){localStorage.setItem(k,JSON.stringify(v));return v}
export function seedDemo(){if(read(KEYS.users).length)return;const admin={id:'admin-1',email:'admin@scorpion.local',password:'admin1234',role:ROLES.ADMIN,full_name:'Santiago Coach'};const student={id:'student-1',email:'jaimito@demo.local',password:'jaimito1234',role:ROLES.STUDENT,full_name:'Jaimito Demo'};write(KEYS.users,[admin,student]);write(KEYS.plans,DEFAULT_PLANS.map((p,i)=>({...p,id:`plan-${i+1}`})));write(KEYS.students,[{id:'student-1',user_id:'student-1',full_name:'Jaimito Demo',email:'jaimito@demo.local',plan_id:'plan-2',goal:'Hipertrofia',start_date:dateISO(),active:true,next_payment_date:dateISO(new Date(Date.now()+7*864e5)),notes:'Alumno demo'}]);const ex=[{id:'e1',name:'Press inclinado con barra',muscle_group:'Pecho',equipment:'Barra',video_url:'',instructions:'Controlá la bajada y mantené escápulas retraídas.'},{id:'e2',name:'Press banca',muscle_group:'Pecho',equipment:'Barra',video_url:'',instructions:'Pies firmes, pecho arriba, recorrido controlado.'},{id:'e3',name:'Aperturas en polea baja',muscle_group:'Pecho',equipment:'Polea',video_url:'',instructions:'No cierres de más los hombros.'},{id:'e4',name:'Curl katana',muscle_group:'Bíceps',equipment:'Polea',video_url:'',instructions:'Codo estable y contracción completa.'},{id:'e5',name:'Extensión de tríceps',muscle_group:'Tríceps',equipment:'Polea',video_url:'',instructions:'Bloqueá el codo y extendé completo.'},{id:'e6',name:'Press militar',muscle_group:'Hombros',equipment:'Mancuernas',video_url:'',instructions:'Abdomen firme, no hiperextender lumbar.'}];write(KEYS.exercises,ex);const routine={id:'r1',student_id:'student-1',name:'Hipertrofia Push/Pull/Legs',active:true,created_at:new Date().toISOString(),days:[{id:'d1',day_number:1,title:'PUSH',exercises:[{id:'rx1',exercise_id:'e1',name:'Press inclinado con barra',sets:3,reps:'6-8',rest_seconds:120,notes:'1 serie de aproximación + 2 efectivas',video_url:''},{id:'rx2',exercise_id:'e2',name:'Press banca',sets:2,reps:'6-8',rest_seconds:180,notes:'RIR 1-2',video_url:''},{id:'rx3',exercise_id:'e3',name:'Aperturas en polea baja',sets:2,reps:'8-10',rest_seconds:60,notes:'Pausa 1 segundo en contracción',video_url:''},{id:'rx4',exercise_id:'e4',name:'Curl katana',sets:2,reps:'10-12',rest_seconds:120,notes:'Superserie con tríceps',video_url:''},{id:'rx5',exercise_id:'e5',name:'Extensión de tríceps',sets:2,reps:'12-15',rest_seconds:120,notes:'Superserie con curl',video_url:''},{id:'rx6',exercise_id:'e6',name:'Press militar',sets:3,reps:'8-15',rest_seconds:60,notes:'Controlar técnica',video_url:''}]}]};write(KEYS.routines,[routine]);write(KEYS.logs,[]);write(KEYS.feedback,[]);write(KEYS.payments,[{id:'p1',student_id:'student-1',amount:40000,due_date:dateISO(new Date(Date.now()+7*864e5)),status:PAYMENT_STATUS.PENDING,paid_at:null,concept:'Scorpion Pro'}]);}
export const isDemo=()=>CONFIG.DEMO_MODE===true;
export async function signIn(email,password){if(isDemo()){seedDemo();const user=read(KEYS.users).find(u=>u.email.toLowerCase()===email.toLowerCase()&&u.password===password);if(!user)throw new Error('Correo o contraseña incorrectos.');write(KEYS.session,{user_id:user.id});return{user}}const sb=await getSupabase();const{data,error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;const user=await currentUser();if(!user?.role)throw new Error('No se pudo cargar tu perfil.');return{...data,user}}
export async function signOut(){if(isDemo()){localStorage.removeItem(KEYS.session);return}const sb=await getSupabase();const{error}=await sb.auth.signOut();if(error)throw error}
export async function currentUser(){if(isDemo()){seedDemo();const s=read(KEYS.session,null);if(!s)return null;return read(KEYS.users).find(u=>u.id===s.user_id)||null}const sb=await getSupabase();const{data:{user}}=await sb.auth.getUser();if(!user)return null;const{data:profile,error}=await sb.from('profiles').select('*').eq('id',user.id).single();if(error||!profile)throw new Error('No se pudo cargar tu perfil. Contactá al entrenador.');return{...user,...profile}}
export async function requireRole(roles=[]){const u=await currentUser();if(!u){location.href='login.html';throw new Error('Sesión requerida')}if(roles.length&&!roles.includes(u.role)){if(u.role===ROLES.ADMIN||u.role===ROLES.STUDENT)location.href=u.role===ROLES.ADMIN?'admin.html':'app.html';throw new Error('Rol no habilitado en esta versión. Contactá al administrador.')}return u}
export async function requestPasswordReset(email){if(isDemo())return true;const sb=await getSupabase();const{error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:new URL('reset.html',location.href).href});if(error)throw error;return true}
export async function updatePassword(password){if(isDemo())return true;const sb=await getSupabase();const{error}=await sb.auth.updateUser({password});if(error)throw error;return true}
export async function getPlans(){if(isDemo()){seedDemo();return read(KEYS.plans)}const sb=await getSupabase();const{data,error}=await sb.from('plans').select('*').eq('active',true).order('sort_order');if(error)throw error;return data}
export async function getStudentByUser(userId){if(isDemo()){seedDemo();return read(KEYS.students).find(x=>x.user_id===userId)||null}const sb=await getSupabase();const{data,error}=await sb.from('students').select('*,plans(*)').eq('user_id',userId).maybeSingle();if(error)throw error;return data}
export async function getStudentRoutine(studentId){if(isDemo()){seedDemo();return read(KEYS.routines).find(r=>r.student_id===studentId&&r.active)||null}const sb=await getSupabase();const{data,error}=await sb.from('routines').select('*,routine_days(*,routine_exercises(*,exercises(*)))').eq('student_id',studentId).eq('active',true).order('created_at',{ascending:false}).limit(1).maybeSingle();if(error)throw error;return normalizeRoutine(data)}
function normalizeRoutine(r){if(!r)return null;return{...r,days:(r.routine_days||[]).sort((a,b)=>a.day_number-b.day_number).map(d=>({...d,exercises:(d.routine_exercises||[]).sort((a,b)=>a.position-b.position).map(x=>({...x,name:x.exercises?.name||x.name,video_url:x.video_url||x.exercises?.video_url,instructions:x.exercises?.instructions||''}))}))}}
export async function getLogs(studentId,date=dateISO()){if(isDemo())return read(KEYS.logs).filter(x=>x.student_id===studentId&&x.workout_date===date);const sb=await getSupabase();const{data,error}=await sb.from('exercise_logs').select('*').eq('student_id',studentId).eq('workout_date',date);if(error)throw error;return data}
export async function saveExerciseLog(log){if(isDemo()){const all=read(KEYS.logs);const idx=all.findIndex(x=>x.student_id===log.student_id&&x.workout_date===log.workout_date&&x.routine_exercise_id===log.routine_exercise_id&&x.set_number===log.set_number);const row={...log,id:idx>=0?all[idx].id:uid(),updated_at:new Date().toISOString()};if(idx>=0)all[idx]=row;else all.push(row);write(KEYS.logs,all);return row}const sb=await getSupabase();const{data,error}=await sb.from('exercise_logs').upsert(log,{onConflict:'student_id,workout_date,routine_exercise_id,set_number'}).select().single();if(error)throw error;return data}
export async function saveFeedback(row){if(isDemo()){const all=read(KEYS.feedback);const idx=all.findIndex(x=>x.student_id===row.student_id&&x.workout_date===row.workout_date&&x.routine_day_id===row.routine_day_id);const v={...row,id:idx>=0?all[idx].id:uid(),updated_at:new Date().toISOString()};if(idx>=0)all[idx]=v;else all.push(v);write(KEYS.feedback,all);return v}const sb=await getSupabase();const{data,error}=await sb.from('workout_feedback').upsert(row,{onConflict:'student_id,workout_date,routine_day_id'}).select().single();if(error)throw error;return data}
export async function getFeedback(studentId,date=dateISO(),dayId){
 if(!dayId)throw new Error('Falta el día de entrenamiento.');
 if(isDemo())return read(KEYS.feedback).find(x=>x.student_id===studentId&&x.workout_date===date&&x.routine_day_id===dayId)||null;
 const sb=await getSupabase();const{data,error}=await sb.from('workout_feedback').select('*').eq('student_id',studentId).eq('workout_date',date).eq('routine_day_id',dayId).maybeSingle();if(error)throw error;return data;
}
export async function getPayments(studentId){if(isDemo())return read(KEYS.payments).filter(x=>x.student_id===studentId);const sb=await getSupabase();const{data,error}=await sb.from('payments').select('*').eq('student_id',studentId).order('due_date',{ascending:false});if(error)throw error;return data}
export async function adminListStudents(){if(isDemo()){seedDemo();const plans=read(KEYS.plans);return read(KEYS.students).map(s=>({...s,plans:plans.find(p=>p.id===s.plan_id)}))}const sb=await getSupabase();const{data,error}=await sb.from('students').select('*,plans(*)').order('full_name');if(error)throw error;return data}
export async function adminListExercises(){if(isDemo()){seedDemo();return read(KEYS.exercises)}const sb=await getSupabase();const{data,error}=await sb.from('exercises').select('*').order('name');if(error)throw error;return data}
export async function adminSaveExercise(ex){if(isDemo()){const all=read(KEYS.exercises);const row={...ex,id:ex.id||uid(),updated_at:new Date().toISOString()};const i=all.findIndex(x=>x.id===row.id);if(i>=0)all[i]=row;else all.push(row);write(KEYS.exercises,all);return row}const sb=await getSupabase();const{data,error}=await sb.from('exercises').upsert(ex).select().single();if(error)throw error;return data}
export async function adminSavePlan(plan){if(isDemo()){const all=read(KEYS.plans);const row={...plan,id:plan.id||uid()};const i=all.findIndex(x=>x.id===row.id);if(i>=0)all[i]=row;else all.push(row);write(KEYS.plans,all);return row}const sb=await getSupabase();const{data,error}=await sb.from('plans').upsert(plan).select().single();if(error)throw error;return data}

export async function adminCreateStudent(student){
  if(isDemo()){
    const all=read(KEYS.students);
    const users=read(KEYS.users);
    if(users.some(u=>u.email.toLowerCase()===String(student.email||'').toLowerCase()))throw new Error('Ya existe un usuario con ese correo.');
    const userId=uid();
    const row={...student,id:uid(),user_id:userId};
    users.push({id:userId,email:student.email,password:student.password,role:ROLES.STUDENT,full_name:student.full_name});
    delete row.password;
    all.push(row);
    write(KEYS.users,users);
    write(KEYS.students,all);
    return row;
  }
  const sb=await getSupabase();
  const payload={
    email:String(student.email||'').trim(),
    password:String(student.password||''),
    full_name:String(student.full_name||'').trim(),
    goal:student.goal||'',
    plan_id:student.plan_id||null,
    start_date:student.start_date||null,
    next_payment_date:student.next_payment_date||null,
    notes:student.notes||'',
    active:student.active!==false
  };
  if(!payload.email)throw new Error('Ingresá el correo del alumno.');
  if(payload.password.length<8)throw new Error('La contraseña temporal debe tener al menos 8 caracteres.');
  const {data,error}=await sb.functions.invoke('create-student',{body:payload});
  if(error){
    let message=error.message||'No se pudo crear el alumno.';
    try{
      if(error.context){
        const body=await error.context.json();
        if(body?.error)message=body.error;
      }
    }catch{}
    throw new Error(message);
  }
  if(data?.error)throw new Error(data.error);
  return data?.student||data;
}

export async function adminSaveStudent(student){if(isDemo()){const all=read(KEYS.students);const row={...student,id:student.id||uid(),user_id:student.user_id||uid()};const i=all.findIndex(x=>x.id===row.id);if(i>=0)all[i]=row;else all.push(row);write(KEYS.students,all);return row}const sb=await getSupabase();const {plans,...row}=student;const{data,error}=await sb.from('students').upsert(row).select().single();if(error)throw error;return data}
export async function adminGetAllPayments(){if(isDemo()){const students=read(KEYS.students);return read(KEYS.payments).map(p=>({...p,student:students.find(s=>s.id===p.student_id)}))}const sb=await getSupabase();const{data,error}=await sb.from('payments').select('*,students(full_name,email)').order('due_date',{ascending:false});if(error)throw error;return data}
export async function adminSavePayment(p){if(isDemo()){const all=read(KEYS.payments);const row={...p,id:p.id||uid()};const i=all.findIndex(x=>x.id===row.id);if(i>=0)all[i]=row;else all.push(row);write(KEYS.payments,all);return row}const sb=await getSupabase();const {student,students,...row}=p;const{data,error}=await sb.from('payments').upsert(row).select().single();if(error)throw error;return data}
export async function adminListRoutines(){if(isDemo())return read(KEYS.routines);const sb=await getSupabase();const{data,error}=await sb.from('routines').select('*,students(full_name),routine_days(*,routine_exercises(*,exercises(*)))').order('created_at',{ascending:false});if(error)throw error;return data.map(normalizeRoutine)}
export async function adminSaveRoutine(routine){if(isDemo()){const all=read(KEYS.routines);const row={...routine,id:routine.id||uid(),created_at:routine.created_at||new Date().toISOString()};const i=all.findIndex(x=>x.id===row.id);if(i>=0)all[i]=row;else all.push(row);write(KEYS.routines,all);return row}throw new Error('Para guardar rutinas complejas en Supabase usá adminSaveRoutineFull()')}
export async function adminSaveRoutineFull(routine){
 if(!routine.student_id||!routine.name?.trim()||!routine.days?.length||routine.days.some(d=>!d.title?.trim()||!d.exercises?.length))throw new Error('Completá el nombre, alumno y al menos un ejercicio por día.');
 if(routine.days.some(d=>d.exercises.some(ex=>!Number.isInteger(Number(ex.sets))||Number(ex.sets)<1||Number(ex.sets)>50||!String(ex.reps||'').trim()||Number(ex.rest_seconds)<0)))throw new Error('Revisá series, repeticiones y descansos.');
 if(isDemo()){
  const all=read(KEYS.routines);all.forEach(r=>{if(r.student_id===routine.student_id)r.active=false});
  const row={...routine,id:uid(),active:true,created_at:new Date().toISOString(),days:routine.days.map(d=>({...d,id:uid(),exercises:d.exercises.map(ex=>({...ex,id:uid()}))}))};
  all.push(row);write(KEYS.routines,all);return row;
 }
 const sb=await getSupabase();const{data,error}=await sb.rpc('save_routine_version',{payload:routine});
 if(error)throw new Error(error.code==='PGRST202'?'Falta aplicar sql/005_v1_patch.sql en Supabase.':error.message);return data;
}
export async function getStudentHistory(studentId){if(isDemo()){const allEx=read(KEYS.routines).flatMap(r=>(r.days||[]).flatMap(d=>d.exercises||[]));const logs=read(KEYS.logs).filter(x=>x.student_id===studentId).map(l=>({...l,routine_exercises:allEx.find(ex=>ex.id===l.routine_exercise_id)}));const fb=read(KEYS.feedback).filter(x=>x.student_id===studentId);return{logs,feedback:fb}}const sb=await getSupabase();const[{data:logs,error:e1},{data:feedback,error:e2}]=await Promise.all([sb.from('exercise_logs').select('*,routine_exercises(name,exercises(name))').eq('student_id',studentId).order('workout_date',{ascending:false}),sb.from('workout_feedback').select('*').eq('student_id',studentId).order('workout_date',{ascending:false})]);if(e1)throw e1;if(e2)throw e2;return{logs,feedback}}
export async function uploadExerciseVideo(file,path){if(isDemo())throw new Error('La subida real de videos requiere Supabase configurado.');const sb=await getSupabase();const filePath=`${path}/${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi,'-')}`;const{error}=await sb.storage.from(CONFIG.STORAGE_BUCKET).upload(filePath,file,{upsert:false});if(error)throw error;const{data}=sb.storage.from(CONFIG.STORAGE_BUCKET).getPublicUrl(filePath);return data.publicUrl}
