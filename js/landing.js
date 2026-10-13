import{CONFIG}from'./config.js';
import{getPlans}from'./db.js';import{DEFAULT_PLANS}from'./constants.js';import{$,escapeHTML,formatMoney}from'./utils.js';
$('#year').textContent=new Date().getFullYear();$('#menuToggle')?.addEventListener('click',()=>$('#mainNav').classList.toggle('open'));
const faqs=[['¿Quién puede editar mi rutina?','Solo el entrenador puede crear o modificar la planificación. El alumno únicamente registra su ejecución, comentarios y dificultad.'],['¿Puedo ver rutinas de otros alumnos?','No. Cada cuenta está aislada y las políticas de seguridad de la base de datos limitan el acceso a la información propia.'],['¿Los videos son GIF?','Se usan videos MP4 cortos en autoplay, mute y loop. Se ven como GIF, pero cargan más rápido y pesan menos.'],['¿Qué puedo registrar?','Peso, repeticiones, series completadas, ejercicios completados, dificultad del 1 al 10 y comentarios del entrenamiento.']];
$('#faqList').innerHTML=faqs.map(([q,a])=>`<div class="faq-item"><button class="faq-q">${escapeHTML(q)}<span>＋</span></button><div class="faq-a"><div>${escapeHTML(a)}</div></div></div>`).join('');document.addEventListener('click',e=>{const b=e.target.closest('.faq-q');if(b)b.parentElement.classList.toggle('open')});
(async()=>{let plans;try{plans=await getPlans()}catch{$('#plansGrid').innerHTML='<p class="muted">No pudimos cargar los planes. Intentá nuevamente en unos minutos.</p>';return}$('#plansGrid').innerHTML=plans.map((p,i)=>`<article class="plan-card card ${p.popular?'popular':''}"><span class="eyebrow">PLAN ${i+1}</span><h3>${escapeHTML(p.name)}</h3><p class="muted">${escapeHTML(p.description||'')}</p><div class="plan-price"><strong>${formatMoney(p.price)}</strong><span>/ mes</span></div><ul class="plan-features">${(p.features||[]).map(f=>`<li>${escapeHTML(f)}</li>`).join('')}</ul>${CONFIG.CONTACT_EMAIL?`<a class="btn ${p.popular?'btn-primary':'btn-outline'} wide" href="mailto:${encodeURIComponent(CONFIG.CONTACT_EMAIL)}?subject=${encodeURIComponent('Quiero '+p.name)}">Consultar plan</a>`:'<p class="muted">Consultá disponibilidad con tu entrenador.</p>'}</article>`).join('')})();

// Inicio personalizado: las consultas pasan por las políticas del alumno autenticado.
import{currentUser,getStudentByUser,getStudentRoutine,getStudentHistory,getSetting}from'./db.js';
import{selectTrainingDay,weeklyStats,hasAccess,mediaHTML,hydrateMedia}from'./enhancements.js';
import{exerciseDone}from'./workout.js';
import{dateISO}from'./utils.js';
import{quoteHTML,watchQuote}from'./quotes.js';
$('#dailyQuote').innerHTML=quoteHTML();watchQuote();
(async()=>{try{const m=await getSetting('home_media');const el=$('#homeMedia');if(m.image_url||m.video_url){el.hidden=false;el.innerHTML=mediaHTML(m.image_url,m.video_url,'Scorpion Workouts');await hydrateMedia(el)}}catch{/* La portada pública sigue funcionando si no se cargaron medios. */}})();
const publicCards={today:$('#todayCard').innerHTML,progress:$('#progressCard').innerHTML};let personalizing=false;
async function personalize(){
 if(personalizing)return;personalizing=true;
 try{
 const u=await currentUser();if(!u){$('#todayCard').innerHTML=publicCards.today;$('#progressCard').innerHTML=publicCards.progress;document.querySelectorAll('[data-panel-link]').forEach(a=>{a.textContent='Ya soy alumno';a.href='login.html'});return}
 document.querySelectorAll('[data-panel-link]').forEach(a=>{a.textContent='Entrar a mi panel';a.href=u.role==='admin'?'admin.html':'app.html'});
 if(u.role==='admin'){$('#todayCard').innerHTML='<small>ENTRENADOR</small><b>TU PANEL</b><span>Administrá alumnos y rutinas</span>';return}
 const st=await getStudentByUser(u.id);if(!st)return;
 if(!hasAccess(st)){$('#todayCard').innerHTML='<small>MI CUENTA</small><b>ACCESO RESTRINGIDO</b><a href="app.html">Ver pagos</a>';$('#progressCard').innerHTML='<small>PROGRESO</small><b>DATOS CONSERVADOS</b><span>Regularizá el acceso con tu entrenador</span>';return}
 const [r,h]=await Promise.all([getStudentRoutine(st.id),getStudentHistory(st.id)]);const day=selectTrainingDay(r,h),logs=h.logs.filter(l=>l.workout_date===dateISO());
 const total=day?.exercises?.length||0,done=(day?.exercises||[]).filter(ex=>exerciseDone(ex,logs)).length,pct=total?Math.round(done/total*100):0;
 $('#todayCard').innerHTML=`<small>HOY · ${escapeHTML(st.full_name.split(' ')[0])}</small><b>${day?'DÍA '+day.day_number+' · '+escapeHTML(day.title):r?'DESCANSO':'SIN RUTINA'}</b><span>${day?done+'/'+total+' ejercicios':r?'Hoy no hay entrenamiento asignado':'Tu entrenador asignará tu rutina'}</span>${day?`<div class="progress"><i style="width:${pct}%"></i></div>`:''}`;
 const w=weeklyStats(h);$('#progressCard').innerHTML=`<small>ESTA SEMANA</small><b>${w.current.sessions} ENTRENAMIENTOS</b><span>${w.current.sets} series completadas</span><a href="app.html">Ver mi progreso</a>`;
 }catch{document.querySelectorAll('[data-panel-link]').forEach(a=>a.title='Si tu sesión sigue activa, entrarás directamente a tu panel.')}finally{personalizing=false}
}
personalize();window.addEventListener('focus',personalize);window.addEventListener('storage',personalize);
