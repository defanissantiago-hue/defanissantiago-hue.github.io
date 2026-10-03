# Scorpion Workouts — revisión del 3 de octubre de 2026

Este paquete corrige el ZIP actual de GitHub. No se publicó la web ni se modificó tu Supabase.
Conserva el diseño negro/rojo, el frontend estático, la biblioteca, la configuración pública de Supabase y DEMO_MODE: false.

## Qué hacer ahora

1. En Supabase → SQL Editor → New query, copiar y ejecutar **sql/005_v1_patch.sql** completo. Es una migración para tu base existente, dentro de una transacción. No volver a ejecutar los archivos 001–004. Si aparece un error, detenerse y compartir el mensaje; no seguir publicando este frontend hasta que la migración termine correctamente.
2. Extraer el ZIP. Subir el **contenido de la carpeta scorpion-workouts** a la raíz del repositorio `defanissantiago-hue/defanissantiago-hue.github.io`, reemplazando los archivos de igual nombre. `index.html` debe quedar en la raíz. Incluir los nuevos `css/components.css`, `js/navigation.js` y `js/workout.js`.
3. Esperar el despliegue de GitHub Pages y recargar con Ctrl+F5. No modificar el repositorio de AromaLParfum.
4. Realizar la prueba completa que figura abajo. No cargar datos de alumnos reales hasta verificar permisos y persistencia.

El nuevo guardado de rutinas requiere la función de la migración. Si falta, el editor muestra un mensaje indicando `005_v1_patch.sql`.

## Cambios incluidos

- Login: recupera el rol desde `profiles` antes de decidir a qué panel entrar. Una configuración incompleta ya no activa silenciosamente el modo demo.
- Edición de alumnos y pagos: excluye las relaciones consultadas (`plans`, `students`) de los datos enviados al guardar. El correo de un alumno existente es de solo lectura: modificar la ficha no cambia su correo de Auth.
- Rutinas: el editor recibe días y ejercicios completos. Cada guardado crea una versión nueva, archiva la anterior y conserva sus registros. En producción se hace con una función SQL atómica. Solo queda activa la nueva rutina para ese alumno; las versiones archivadas no se ofrecen para editar.
- Registro: todas las series deben estar hechas para completar un ejercicio. Se puede marcar y desmarcar. Las escrituras se ordenan; los fallos se muestran y se puede reintentar con Guardar entrenamiento. Los comentarios no se borran al marcar un ejercicio.
- Feedback: RPE y comentario se consultan por alumno, fecha y día de rutina. Dos días en la misma fecha no se mezclan. Guardar una sesión parcial no la marca como totalmente completada.
- Historial: alumno y entrenador ven ejercicio, serie, kg, reps, checks, RPE y comentario, incluyendo las rutinas archivadas.
- Fechas: el registro usa la fecha local del dispositivo. Las fechas de calendario no retroceden un día por la zona horaria.
- Pagos: se muestra el vencimiento impago más antiguo; una cuota pagada no aparece como próximo pago. Los vencidos se calculan al mostrar, sin cambiar automáticamente la base.
- Videos: el administrador puede subir MP4, WebM o MOV de hasta 50 MB desde el formulario de ejercicio. Se conservan el loop y la reproducción silenciada. La URL específica de la rutina tiene prioridad sobre la del ejercicio.
- Celular: archivo de estilos faltante restituido, cierre del menú al navegar y fondo para cerrarlo; videos con ajuste que evita recortarlos. Pendiente revisión visual en un dispositivo real.
- Seguridad preparada: nuevos registros con rol `student`; políticas restrictivas adicionales para datos propios y relaciones entre alumno/día/ejercicio; solo `admin` administra. El rol `coach` queda fuera de esta V1. Alumnos inactivos no pueden acceder a rutinas ni guardar registros mediante las restricciones nuevas.

## Pruebas hechas y límites

**Hecho:** validación de sintaxis de todos los módulos JS; comprobación de archivos enlazados desde HTML; 15 pruebas automatizadas de lógica y acceso a datos en demo y con cliente Supabase simulado.

Para repetir las pruebas con Node:

```bash
TZ=America/Argentina/Buenos_Aires node --experimental-vm-modules tests/regression.cjs
```

**No hecho:** ejecutar el SQL en PostgreSQL/Supabase, revisar las políticas efectivamente desplegadas, ejecutar la Edge Function real, probar entrega del email de recuperación, medir rendimiento de videos y realizar pruebas visuales/interactivas en navegador. El navegador local no estaba instalado y su descarga falló. Las pruebas con respuestas simuladas no acreditan el funcionamiento de tu servidor.

El ZIP solo incluía SQL antiguo y no incluía el código de `create-student`. El archivo de contexto explica que en Supabase se aplicaron otros scripts. Por eso no se debe equiparar el contenido del ZIP con el estado actual de la base.

Para completar la auditoría, ejecutar **sql/006_auditoria_lectura.sql** y compartir los resultados, junto con el código desplegado de `create-student` sin claves. Esa consulta solo lee definiciones de políticas, funciones y configuración; no exporta alumnos ni contraseñas.

## Prueba de aceptación antes de lanzar

1. Entrar como administrador; crear dos alumnos de prueba, A y B, con correos distintos. Verificar que cada uno aparece en Auth y en Alumnos.
2. Crear Press Banca y subir un video corto. Confirmar reproducción en el celular.
3. Crear una rutina para A con dos días y una rutina diferente para B. Editar la de A y comprobar que carga todos sus ejercicios.
4. Entrar como A en una sesión separada. Registrar 50 kg × 8 en la primera serie: el ejercicio NO debe aparecer completo si faltan series. Completar todas: debe actualizarse el progreso. Desmarcar y volver a marcar.
5. Elegir RPE 8, escribir un comentario y guardar. Cambiar de día, elegir otro RPE y otro comentario. Volver al primero: debe conservar el suyo.
6. Cerrar sesión, volver a entrar y revisar pesos, reps, checks e historial. Entrar como admin: el historial debe mostrar ambos comentarios y sus RPE.
7. Editar y guardar la rutina: debe aparecer la versión anterior archivada y mantenerse el historial. La versión nueva empieza con registros nuevos.
8. Simular pérdida de conexión al guardar: debe aparecer error, sin mensaje de éxito. Reconectar y usar Guardar entrenamiento; verificar luego de recargar.
9. Crear un pago vencido, uno futuro y uno pagado. Revisar monto, estado, orden y pantalla del alumno.
10. Probar Olvidé contraseña → correo → reset.html → nueva contraseña → iniciar sesión.
11. Verificar aislamiento usando las sesiones de A y B: no basta ocultar botones. Intentar consultar desde el cliente de Supabase las filas de B con la sesión de A: debe devolver cero filas o denegar el acceso. Intentar insertar/actualizar registros con student_id de B y también con student_id de A pero día/ejercicio de B: debe fallar. A no debe poder actualizar `profiles.role`, rutinas, planes, pagos ni subir videos. Estas pruebas deben hacerse con datos desechables y nunca con service_role, porque esa clave omite RLS.
12. Revisar en celular y escritorio: login, menú, tarjetas, teclado numérico, editor, tablas, historial y reproducción. Verificar que no haya errores en consola.

## Decisiones pendientes del negocio

- Confirmar los precios y beneficios definitivos de Base, Pro y Elite.
- El contacto original de la landing era `contacto@scorpionworkouts.com`, sin evidencia de que fuera real. Se retiró ese destino. Completar `CONTACT_EMAIL` en `js/config.js` con el correo comercial elegido para habilitar Consultar plan. Sin él se indica consultar con el entrenador. No hay pago automático ni solicitud persistida de cambio de plan.
- Las fechas de pagos de la ficha y los registros de pagos siguen siendo campos administrados por separado. La pantalla de pagos usa los registros de pagos; revisar ambos cuando se actualice una cuota.
- Esta V1 permite seleccionar Día 1, Día 2, etc.; todavía no asigna automáticamente un día según un calendario semanal.
- Gráficos, récords, rachas, notificaciones y Mercado Pago siguen fuera de esta revisión.

## Consideraciones de actualización

- Cada edición crea una nueva versión: se conserva todo el historial, pero los checks del día no pasan a la nueva rutina. Conviene editar entre sesiones, no mientras el alumno entrena.
- Las políticas nuevas complementan las existentes: no desactivan RLS ni borran las políticas previas. Si una política previa bloquea una operación válida, sigue siendo necesario revisarla con el archivo de auditoría.
- La consulta de historial aún no tiene paginación; con mucho uso será necesario agregarla para superar los límites de respuesta de la API.
- Una subida de video seguida de un fallo al guardar la ficha puede dejar un archivo sin referencia en Storage. Revisar esos archivos antes de borrarlos.
- Ante una reversión del frontend, conservar la migración y no reejecutar el SQL antiguo. No volver a usar el editor anterior: su guardado eliminaba días y podía eliminar registros asociados.
