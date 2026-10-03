# Arquitectura

Frontend estático multipágina compatible con GitHub Pages. Capa de datos `js/db.js` con dos adaptadores: demo localStorage y Supabase. Autenticación Supabase Auth. Autorización con Row Level Security. Almacenamiento de videos con Supabase Storage.

## Roles
- admin: control total.
- coach: control de alumnos, rutinas, ejercicios, pagos.
- student: lectura de su planificación y escritura únicamente sobre sus registros/feedback.

## Privacidad
La separación entre alumnos se realiza en PostgreSQL mediante `my_student_id()` y políticas RLS. No depende de ocultar elementos en HTML.
