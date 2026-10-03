# Scorpion Workouts — Guía de funcionamiento

## 1. Qué incluye
La aplicación tiene una landing pública, login, panel privado de alumno, panel de entrenador, rutinas visuales, videos en loop, tilde de ejercicios y series completadas, registro de peso y repeticiones, RPE/dificultad 1–10, comentarios, planes, pagos e historial.

## 2. Modo demo
Al descargar, `js/config.js` viene con `DEMO_MODE: true`. Esto permite probar sin Supabase.

**Administrador demo**
- correo: `admin@scorpion.local`
- contraseña: `admin1234`

**Alumno demo**
- correo: `jaimito@demo.local`
- contraseña: `jaimito1234`

El modo demo guarda todo en el navegador con localStorage. NO usarlo con clientes reales.

## 3. Cómo configurar Supabase
1. Crear un proyecto en Supabase.
2. Abrir SQL Editor.
3. Ejecutar en orden: `sql/001_schema.sql`, `sql/002_rls.sql`, `sql/003_storage.sql`, `sql/004_seed_plans.sql`.
4. Ir a Project Settings > API.
5. Copiar Project URL y anon public key.
6. Editar `js/config.js`:
```js
SUPABASE_URL: 'https://TU-PROYECTO.supabase.co',
SUPABASE_ANON_KEY: 'TU_ANON_KEY',
DEMO_MODE: false,
```
7. En Authentication > URL Configuration configurar como Site URL tu GitHub Pages, por ejemplo `https://defanissantiago-hue.github.io/`.
8. Agregar `https://defanissantiago-hue.github.io/reset.html` a Redirect URLs.

## 4. Primer administrador
Creá tu usuario desde Supabase Authentication. Después, en SQL Editor, ejecutá reemplazando el correo:
```sql
update public.profiles p
set role='admin', full_name='Santiago'
from auth.users u
where p.id=u.id and u.email='TU_CORREO';
```

## 5. Crear alumnos reales
Por seguridad, la versión frontend no crea usuarios de Auth con una service key. El procedimiento recomendado es:
1. Supabase > Authentication > Users > Add user.
2. Crear correo/contraseña del alumno.
3. Copiar su UUID.
4. Crear la fila en `students` con `user_id = UUID`.
5. Luego desde el panel admin podés editar sus datos, plan, pagos y rutinas.

Si más adelante querés alta automática, agregá una Edge Function protegida; nunca pongas la service_role key en GitHub Pages.

## 6. Rutinas
En Admin > Rutinas: nueva rutina, seleccionar alumno, agregar días, agregar ejercicios, definir series/reps/descanso/notas y video. Solo perfiles admin/coach tienen permiso de escritura sobre rutinas gracias a RLS.

## 7. Qué puede hacer el alumno
- Ver solo su propia rutina.
- Marcar cada serie con ✓.
- Registrar peso y reps reales.
- Marcar ejercicio completo.
- Guardar dificultad 1–10.
- Escribir comentario del entrenamiento.
- Ver pagos y plan.
- Ver historial propio.

No puede modificar la planificación.

## 8. Videos
Recomendación: MP4 H.264 corto, 3–10 s, sin audio, 720p, comprimido. Se reproduce `autoplay muted loop playsinline`. Podés pegar una URL pública en el ejercicio. Para Supabase Storage, subí al bucket `exercise-videos` y pegá la Public URL.

## 9. Pagos
El sistema registra importe, concepto, vencimiento y estado (`pending`, `paid`, `overdue`). No cobra automáticamente. Para cobro real se puede integrar Mercado Pago más adelante mediante backend/Edge Function.

## 10. Seguridad
Las políticas RLS son obligatorias. No desactives RLS en producción. La anon key sí puede estar en frontend; la protección real la hacen las políticas. Nunca publiques la service_role key.

## 11. GitHub Pages
Subí el contenido del ZIP directamente a la raíz del repo `defanissantiago-hue.github.io`. En Settings > Pages seleccioná Deploy from branch, `main`, carpeta `/root`. La home será `https://defanissantiago-hue.github.io/`.

## 12. Archivos importantes
- `index.html`: landing pública.
- `login.html`: acceso.
- `app.html`: panel alumno.
- `admin.html`: panel entrenador.
- `js/config.js`: configuración.
- `js/db.js`: conexión y capa de datos.
- `js/student-app.js`: lógica alumno.
- `js/admin-app.js`: lógica entrenador.
- `sql/*`: base de datos y seguridad.
- `data/exercise-library.js`: biblioteca de referencia.

## 13. Flujo típico
Entrenador crea usuario en Supabase → vincula alumno → asigna plan → crea rutina → alumno inicia sesión → registra entrenamiento → entrenador revisa progreso y comentarios → entrenador ajusta rutina.
