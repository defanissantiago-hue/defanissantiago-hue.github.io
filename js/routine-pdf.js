import{resolveMedia}from'./db.js';
import{dateISO}from'./utils.js';
let ready;
function script(src,global){return new Promise((resolve,reject)=>{if(window[global])return resolve(window[global]);const s=document.createElement('script');s.src=src;s.onload=()=>resolve(window[global]);s.onerror=()=>reject(new Error('No se pudo cargar el generador de PDF.'));document.head.appendChild(s)})}
function library(){return ready??=Promise.all([script('vendor/pdf-lib.min.js','PDFLib'),script('vendor/fontkit.umd.min.js','fontkit')]).then(([lib])=>lib).catch(e=>{ready=null;throw e})}
// Mantener texto legible sin emojis; fuentes latinas incluidas para exportación sin conexión a CDNs.
const latin=text=>String(text??'').replace(/[\u{1F000}-\u{1FAFF}]/gu,'').replace(/[^\x20-\x7E\xA0-\xFF\n]/g,'-');
export async function downloadRoutinePDF(routine,student){
 const{PDFDocument,StandardFonts,rgb,PDFName,PDFString}=await library();const doc=await PDFDocument.create();
 doc.registerFontkit(window.fontkit);const loadFont=async name=>{const r=await fetch('assets/fonts/'+name+'.ttf');if(!r.ok)throw new Error('No se pudo cargar la fuente del PDF.');return doc.embedFont(await r.arrayBuffer(),{subset:true})};const[regular,bold]=await Promise.all([loadFont('DejaVuSans'),loadFont('DejaVuSans-Bold')]);
 const black=rgb(.08,.08,.08),red=rgb(.65,.12,.13),muted=rgb(.4,.4,.4);let page,y;
 const newPage=()=>{page=doc.addPage([595.28,841.89]);y=790;page.drawText('SCORPION WORKOUTS',{x:42,y,size:12,font:bold,color:red});y-=30};
 newPage();
 const wrap=(text,font,size,width)=>{const lines=[];for(const part of latin(text).split('\n')){let line='';for(const word of part.split(/\s+/)){if(font.widthOfTextAtSize((line?line+' ':'')+word,size)<=width){line+=(line?' ':'')+word;continue}if(line){lines.push(line);line=''}let chunk='';for(const ch of word){if(font.widthOfTextAtSize(chunk+ch,size)>width){lines.push(chunk);chunk=''}chunk+=ch}line=chunk}lines.push(line)}return lines};
 const write=(text,size=11,font=regular,color=black)=>{for(const line of wrap(text,font,size,510)){if(y<65)newPage();page.drawText(line,{x:42,y,size,font,color});y-=size*1.45}y-=5};
 y-=70;write(routine.name,22,bold);write(student.full_name||'Alumno',13,bold);write('Generada el '+dateISO().split('-').reverse().join('/')+' · '+(student.goal||'Entrenamiento personalizado'),10,regular,muted);
 try{const bytes=await fetch('assets/scorpion.png').then(r=>r.arrayBuffer());const logo=await doc.embedPng(bytes);page.drawImage(logo,{x:470,y:735,width:70,height:70})}catch{/* El PDF sigue siendo útil sin el logo. */}
 let skippedImages=0;
 for(const d of routine.days||[]){if(y<170)newPage();y-=8;write('DÍA '+d.day_number+' · '+d.title,16,bold,red);
 if(d.weekday!==null&&d.weekday!==undefined)write(['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][d.weekday],10,regular,muted);
 for(const [i,ex]of(d.exercises||[]).entries()){
 if(y<120)newPage();write(`${i+1}. ${ex.name}`,12,bold);write(`${ex.sets} series · ${ex.reps} repeticiones · ${ex.rest_seconds||0} segundos de descanso`);
 if(ex.notes)write('Notas: '+ex.notes,10);if(ex.instructions)write(ex.instructions,10,regular,muted);
 if(ex.image_url){try{const url=await resolveMedia(ex.image_url);const response=await fetch(url);if(!response.ok)throw Error();const bytes=await response.arrayBuffer();const mime=response.headers.get('content-type')||'';let img;if(mime.includes('png'))img=await doc.embedPng(bytes);else if(mime.includes('jpeg')||mime.includes('jpg'))img=await doc.embedJpg(bytes);else{const temp=URL.createObjectURL(new Blob([bytes],{type:mime}));try{const im=new Image();im.src=temp;await im.decode();const c=document.createElement('canvas');const factor=Math.min(1,1000/Math.max(im.naturalWidth,im.naturalHeight));c.width=Math.max(1,Math.round(im.naturalWidth*factor));c.height=Math.max(1,Math.round(im.naturalHeight*factor));c.getContext('2d').drawImage(im,0,0,c.width,c.height);img=await doc.embedPng(c.toDataURL('image/png'))}finally{URL.revokeObjectURL(temp)}};const scale=Math.min(130/img.width,105/img.height);const w=img.width*scale,h=img.height*scale;if(y-h<65)newPage();page.drawImage(img,{x:42,y:y-h,width:w,height:h});y-=h+10}catch{skippedImages++}}
 if(ex.video_url){const link=new URL('app.html',location.href).href+'#routine';if(y<90)newPage();page.drawText('Ver video en mi panel',{x:42,y,size:10,font:bold,color:red});const annotation=doc.context.register(doc.context.obj({Type:'Annot',Subtype:'Link',Rect:[42,y-3,160,y+12],Border:[0,0,0],A:{Type:'Action',S:'URI',URI:PDFString.of(link)}}));page.node.addAnnot(annotation);y-=23}y-=5;
 }}
 if(skippedImages)write('Algunas imágenes no pudieron incluirse. Podés verlas en tu panel.',9,regular,muted);
 write('Los videos se reproducen en tu panel. Este PDF conserva la rutina a la fecha de descarga.',9,regular,muted);
 const pages=doc.getPages();pages.forEach((p,i)=>p.drawText(`${i+1} / ${pages.length}`,{x:510,y:30,size:9,font:regular,color:muted}));
 const bytes=await doc.save(),url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));const a=document.createElement('a');a.href=url;a.download='Scorpion-'+latin(student.full_name||'rutina').replace(/[^a-zA-Z0-9_-]/g,'-')+'.pdf';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
 return{pages:pages.length,skippedImages};
}
