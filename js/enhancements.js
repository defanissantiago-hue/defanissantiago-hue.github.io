import{escapeHTML as esc,dateISO,formatDate}from'./utils.js';
import{resolveMedia}from'./db.js';
export const weekdays=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
export function hasAccess(s){return !!s&&s.active!==false&&!s.payment_blocked}
export function validMedia(value){return !value||/^https:\/\/[^\s]+$/i.test(value)||/^storage:\/\/sw-routine-media\/assets\/[\w.-]+$/.test(value)}
export function mediaHTML(image='',video='',title='Demostración'){
 return `<div class="media-pair">${image?`<img data-media="${esc(image)}" alt="${esc(title)}" loading="lazy">`:''}${video?`<video data-media="${esc(video)}" controls muted loop playsinline preload="none" aria-label="${esc(title)}"></video>`:''}</div>`;
}
export async function hydrateMedia(root=document){
 await Promise.all([...root.querySelectorAll('[data-media]')].map(async el=>{
 const path=el.dataset.media;delete el.dataset.media;
 try{const url=await resolveMedia(path);if(!url)throw new Error('Archivo no disponible');if(el.isConnected)el.src=url}catch{if(el.isConnected){const message=document.createElement('p');message.className='muted';message.textContent='No se pudo cargar este archivo.';el.replaceWith(message)}}
 }));
}
export function selectTrainingDay(routine,history={logs:[],feedback:[]},today=dateISO()){
 const days=routine?.days||[];if(!days.length)return null;
 const weekday=new Date(today+'T12:00:00Z').getUTCDay();
 if(days.some(d=>d.weekday!==null&&d.weekday!==undefined&&d.weekday!==''))return days.find(d=>Number(d.weekday)===weekday&&d.weekday!==null&&d.weekday!=='')||null;
 // Mantener el entrenamiento de hoy; avanzar al siguiente al día siguiente.
 const todayLog=history.logs.find(l=>l.workout_date===today&&days.some(d=>d.id===l.routine_day_id));
 if(todayLog)return days.find(d=>d.id===todayLog.routine_day_id);
 const latest=history.feedback.filter(f=>f.completed&&f.workout_date<today&&days.some(d=>d.id===f.routine_day_id)).sort((a,b)=>b.workout_date.localeCompare(a.workout_date)||String(b.updated_at||'').localeCompare(String(a.updated_at||'')))[0];
 return latest?days[(days.findIndex(d=>d.id===latest.routine_day_id)+1)%days.length]:days[0];
}
export function weekStart(date){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.toISOString().slice(0,10)}
export function weeklyStats(history,today=dateISO()){
 const current=weekStart(today),prev=new Date(current+'T12:00:00Z');prev.setUTCDate(prev.getUTCDate()-7);const previous=prev.toISOString().slice(0,10);
 const stats=start=>{const logs=history.logs.filter(l=>l.workout_date<=today&&weekStart(l.workout_date)===start&&l.completed);return{sets:logs.length,volume:logs.reduce((n,l)=>n+(Number(l.weight)||0)*(Number(l.reps)||0),0),sessions:new Set(history.feedback.filter(f=>f.completed&&f.workout_date<=today&&weekStart(f.workout_date)===start).map(f=>f.workout_date+'|'+f.routine_day_id)).size,logs}};
 return{current:stats(current),previous:stats(previous),start:current};
}
export function weeklyHTML(history){
 const{current:c,previous:p,start}=weeklyStats(history);const fmt=n=>n.toLocaleString('es-AR');
 const keys=[...new Set([...c.logs,...p.logs].map(l=>l.routine_exercises?.exercise_id||l.routine_exercises?.name||l.routine_exercise_id))];
 const max=(list,k)=>{const rows=list.filter(l=>(l.routine_exercises?.exercise_id||l.routine_exercises?.name||l.routine_exercise_id)===k&&l.weight!==null&&l.weight!==undefined);return rows.length?Math.max(...rows.map(l=>Number(l.weight)||0)):null};
 const rows=keys.map(k=>{const a=max(c.logs,k),b=max(p.logs,k);const l=[...c.logs,...p.logs].find(l=>(l.routine_exercises?.exercise_id||l.routine_exercises?.name||l.routine_exercise_id)===k);return`<tr><td>${esc(l?.routine_exercises?.name||'Ejercicio')}</td><td>${b===null?'Sin registro':fmt(b)+' kg'}</td><td>${a===null?'Sin registro':fmt(a)+' kg'}</td><td>${a===null||b===null?'—':(a-b>0?'+':'')+fmt(a-b)+' kg'}</td></tr>`}).join('');
 return `<section class="card weekly-card"><span class="eyebrow">SEMANA DEL ${formatDate(start)}</span><h2>Tu progresión semanal</h2><p class="muted">Semana actual en curso frente a la anterior. Solo series marcadas como hechas.</p><div class="weekly-metrics"><div><strong>${c.sessions}</strong><span>entrenamientos completos</span><small>Semana anterior: ${p.sessions}</small></div><div><strong>${c.sets}</strong><span>series completadas</span><small>Semana anterior: ${p.sets}</small></div><div><strong>${fmt(c.volume)}</strong><span>kg × repeticiones registrados</span><small>Semana anterior: ${fmt(p.volume)}</small></div></div>${rows?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Mayor carga por ejercicio</th><th>Semana anterior</th><th>Esta semana</th><th>Cambio</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<p>Registrá tus entrenamientos para empezar a ver tu evolución.</p>'}<p class="muted">La carga máxima no contempla diferencias de repeticiones o técnica. Los valores vacíos no se estiman.</p></section>`;
}
export function studentLights(s,payments,today=dateISO()){
 const own=payments.filter(p=>p.student_id===s.id),due=own.some(p=>p.status!=='paid'&&p.due_date<today);
 const hasUnrecordedDue=s.next_payment_date&&s.next_payment_date<today&&!own.some(p=>p.due_date>=s.next_payment_date&&p.status==='paid');
 const late=due||hasUnrecordedDue;const paid=own.some(p=>p.status==='paid');
 return `<div class="student-lights"><span class="status-light ${hasAccess(s)?'green':''}">${hasAccess(s)?'Activo':s.active===false?'Inactivo':'Acceso restringido'}</span><span class="status-light ${late?'red':'blue'}">${late?'Pago vencido':own.some(p=>p.status!=='paid')?'Pago pendiente':paid?'Al día':'Sin pagos registrados'}</span><span class="status-light ${s.payment_blocked?'red':''}">${s.payment_blocked?'Bloqueado':'Sin bloqueo'}</span></div>`;
}
