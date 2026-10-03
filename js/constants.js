export const ROLES={ADMIN:'admin',COACH:'coach',STUDENT:'student'};
export const PAYMENT_STATUS={PAID:'paid',PENDING:'pending',OVERDUE:'overdue'};
export const DAYS=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
export const MUSCLE_GROUPS=['Pecho','Espalda','Hombros','Bíceps','Tríceps','Cuádriceps','Isquios','Glúteos','Gemelos','Core','Full body','Cardio'];
export const EQUIPMENT=['Barra','Mancuernas','Polea','Máquina','Peso corporal','Banda','Kettlebell','Smith','Otro'];
export const GOALS=['Hipertrofia','Fuerza','Pérdida de grasa','Recomposición','Rendimiento','Salud general'];
export const DEFAULT_PLANS=[
{name:'Scorpion Base',price:25000,description:'Rutina personalizada con seguimiento mensual.',features:['Rutina personalizada','Registro de cargas','Videos de técnica','Ajuste mensual'],popular:false},
{name:'Scorpion Pro',price:40000,description:'Seguimiento cercano y ajustes frecuentes.',features:['Todo lo de Base','Ajustes semanales','Feedback prioritario','Seguimiento de progreso'],popular:true},
{name:'Scorpion Elite',price:60000,description:'Acompañamiento premium y control completo.',features:['Todo lo de Pro','Revisión prioritaria','Check-in frecuente','Planificación por bloques'],popular:false}
];
