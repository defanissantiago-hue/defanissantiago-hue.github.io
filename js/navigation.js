export function setupNavigation(){
 const sidebar=document.querySelector('#sidebar'),toggle=document.querySelector('#sideToggle');if(!sidebar||!toggle)return;
 const shade=document.createElement('button');shade.className='sidebar-shade';shade.setAttribute('aria-label','Cerrar menú');document.body.append(shade);
 toggle.setAttribute('aria-label','Abrir menú');toggle.setAttribute('aria-controls','sidebar');toggle.setAttribute('aria-expanded','false');
 function set(open){sidebar.classList.toggle('open',open);shade.classList.toggle('visible',open);toggle.setAttribute('aria-expanded',String(open));if(open)sidebar.querySelector('button')?.focus();}
 toggle.onclick=()=>set(!sidebar.classList.contains('open'));shade.onclick=()=>{set(false);toggle.focus()};
 sidebar.addEventListener('click',e=>{if(e.target.closest('.nav-item'))set(false)});document.addEventListener('keydown',e=>{if(e.key==='Escape'){set(false);toggle.focus()}});
}
