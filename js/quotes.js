import{dateISO,escapeHTML}from'./utils.js';
// Reflexiones originales: no atribuirlas como citas textuales de filósofos.
// Las reflexiones bíblicas son paráfrasis, con referencia para consultar el pasaje.
const philosophy=[
'La constancia se construye en las decisiones pequeñas que repetís.',
'No elegís todos los obstáculos, pero podés elegir tu próximo paso.',
'El descanso también forma parte de un esfuerzo bien dirigido.',
'Compará tu camino con el de ayer, no con la llegada de otra persona.',
'Una meta da dirección; los hábitos hacen el recorrido.',
'Escuchar tus límites es parte de aprender a superarte.',
'La paciencia no es quedarse quieto: es aceptar que crecer lleva tiempo.',
'No necesitás un día perfecto para hacer algo que valga la pena.',
'La disciplina puede ser una forma de cuidarte.',
'Prestá atención a lo que hacés hoy: ahí comienza el cambio.',
'Aprender de una dificultad también es avanzar.',
'Tu valor no depende del peso que levantás.',
'El esfuerzo sostenible deja espacio para volver mañana.',
'La mejor promesa es la que convertís en una acción pequeña.',
'Cambiar de estrategia también puede ser una señal de perseverancia.',
'La fuerza gana sentido cuando la acompañan la calma y el criterio.',
'Podés reconocer lo que falta sin olvidar lo que ya lograste.',
'No confundas la prisa con el progreso.',
'Hacer menos con atención puede enseñarte más que hacer mucho por inercia.',
'El camino propio se descubre caminando, no esperando certezas.',
'La humildad permite empezar otra vez sin sentir que todo fue en vano.',
'El cuidado de hoy sostiene las posibilidades de mañana.',
'La libertad también consiste en elegir qué hábitos querés cultivar.',
'Una pausa consciente puede ayudarte a encontrar una mejor dirección.',
'La perseverancia necesita propósito, no castigo.',
'Lo que repetís con intención empieza a transformar tu día.',
'La honestidad con tu esfuerzo vale más que una comparación injusta.',
'El progreso no siempre hace ruido; a veces consiste en volver.',
'La serenidad permite distinguir entre insistir y forzar.',
'Hay fortaleza en pedir ayuda y aprender de otros.',
'El tiempo dedicado a cuidarte no es tiempo perdido.'
];
const biblical=[
['Isaías 40:31','Encontrá esperanza para renovar tus fuerzas y seguir caminando.'],
['Gálatas 6:9','No te canses de hacer el bien: los frutos necesitan su tiempo.'],
['Eclesiastés 3:1','Cada etapa tiene su momento; aprendé a reconocer sus tiempos.'],
['Proverbios 4:23','Cuidá tu corazón y aquello que alimenta tu vida interior.'],
['Salmo 23:2–3','Buscá espacios de descanso que renueven tu ánimo.'],
['Josué 1:9','Afrontá el camino con valor y confianza en la compañía de Dios.'],
['Mateo 6:34','Ocupate de este día, sin cargar por adelantado todas las preocupaciones de mañana.'],
['Proverbios 16:9','Podés planificar tu camino y permanecer abierto a la guía de Dios.'],
['Romanos 12:12','Sostené la esperanza, la paciencia y la oración en los momentos difíciles.'],
['Eclesiastés 4:9–10','Caminar acompañado permite ayudarse cuando alguien cae.'],
['Santiago 1:19','Escuchá con atención y dale tiempo a tus palabras antes de responder.'],
['Colosenses 3:23','Poné el corazón en aquello que hacés.'],
['Salmo 46:10','Hacé una pausa para reconocer a Dios en medio de la inquietud.'],
['1 Corintios 13:4','Cultivá un amor que se exprese con paciencia y bondad.'],
['Miqueas 6:8','Elegí la justicia, la misericordia y la humildad en tu manera de vivir.'],
['Filipenses 4:6–7','Llevá tus preocupaciones a la oración y abrí espacio para la paz.'],
['Proverbios 15:1','Una respuesta amable puede ayudar a calmar una discusión.'],
['Salmo 119:105','Buscá en la palabra de Dios una luz para tu próximo paso.'],
['Mateo 11:28','Cuando estés cansado, acercate a Jesús en busca de descanso.'],
['Hebreos 12:1','Recorré con perseverancia el camino que tenés por delante.'],
['Romanos 12:18','Hacé lo que esté a tu alcance para vivir en paz con los demás.'],
['Proverbios 17:17','La amistad se demuestra en el afecto y en los momentos difíciles.'],
['1 Tesalonicenses 5:11','Animá a quienes te rodean y ayudalos a crecer.'],
['Mateo 5:9','Trabajá por la paz en tus relaciones.'],
['Salmo 139:14','Reconocé con gratitud el valor de tu vida.'],
['Proverbios 19:20','Escuchá los consejos que pueden ayudarte a madurar.'],
['Santiago 1:5','Pedí sabiduría cuando necesites orientación.'],
['Filipenses 2:4','Prestá atención también a las necesidades de los demás.'],
['2 Timoteo 1:7','Cultivá el valor, el amor y el dominio propio.'],
['Salmo 90:12','Valorá tus días y buscá vivirlos con sabiduría.'],
['Romanos 12:21','Respondé al mal con acciones que construyan el bien.']
];
export function quoteForDate(date=dateISO()){
 const day=Math.floor(Date.parse(date+'T12:00:00Z')/864e5),i=Math.floor(day/2)%31;
 return day%2?{text:philosophy[i],source:'Reflexión filosófica · Scorpion Workouts'}:{text:biblical[i][1],source:'Reflexión bíblica · '+biblical[i][0]+' (paráfrasis)'};
}
export function quoteHTML(){const q=quoteForDate();return `<aside class="card daily-quote" data-quote-date="${dateISO()}"><span class="eyebrow">UNA IDEA PARA HOY</span><p>${escapeHTML(q.text)}</p><small>${escapeHTML(q.source)}</small></aside>`}
export function watchQuote(){setInterval(()=>{document.querySelectorAll('[data-quote-date]').forEach(el=>{if(el.dataset.quoteDate!==dateISO())el.outerHTML=quoteHTML()})},30000)}
