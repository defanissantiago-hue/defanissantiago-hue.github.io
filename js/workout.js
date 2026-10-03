import{escapeHTML,formatDate,dateISO,groupBy,emptyHTML}from'./utils.js';
export function exerciseDone(ex,logs){const sets=Number(ex.sets)||1;return Array.from({length:sets},(_,i)=>i+1).every(n=>logs.some(l=>String(l.routine_exercise_id)===String(ex.id)&&Number(l.set_number)===n&&l.completed));}
export function nextPayment(payments){return payments.filter(p=>p.status!=='paid').sort((a,b)=>a.due_date.localeCompare(b.due_date))[0]||null;}
export function paymentState(p){return p.status!=='paid'&&p.due_date<dateISO()?'overdue':p.status;}
export function historyHTML(history){
 const logs=groupBy(history.logs,l=>`${l.workout_date}|${l.routine_day_id||''}`),feedback=groupBy(history.feedback,l=>`${l.workout_date}|${l.routine_day_id||''}`);
 const keys=[...new Set([...Object.keys(logs),...Object.keys(feedback)])].sort().reverse();
 return keys.map(key=>`<section class="card history-detail"><h3>${formatDate(key.split('|')[0])}</h3>${(logs[key]||[]).length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Ejercicio</th><th>Serie</th><th>Kg</th><th>Reps</th><th>Hecha</th></tr></thead><tbody>${(logs[key]||[]).slice().sort((a,b)=>String(a.routine_exercise_id).localeCompare(String(b.routine_exercise_id))||a.set_number-b.set_number).map(l=>`<tr><td>${escapeHTML(l.routine_exercises?.name||l.routine_exercises?.exercises?.name||'Ejercicio archivado')}</td><td>${l.set_number}</td><td>${l.weight??'—'}</td><td>${l.reps??'—'}</td><td>${l.completed?'✓':'—'}</td></tr>`).join('')}</tbody></table></div>`:''}${(feedback[key]||[]).map(f=>`<p><b>Dificultad: ${f.rpe??'—'}/10</b> · ${f.completed?'Completado':'Parcial'}</p><p>${escapeHTML(f.comment||'Sin comentario')}</p>`).join('')}</section>`).join('')||emptyHTML('Sin historial','Todavía no hay entrenamientos registrados.');
}
