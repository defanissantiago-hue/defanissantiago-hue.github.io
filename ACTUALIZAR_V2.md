# Scorpion Workouts — actualización de octubre de 2026

## Instalar sobre tu página actual

1. En Supabase, abrí SQL Editor y ejecutá el contenido completo de **sql/007_v2_features.sql**. Esta actualización supone que ya aplicaste 005, como hiciste anteriormente. No repitas 001–004. El script usa una transacción y conserva los alumnos, rutinas y registros. Si muestra un error, no publiques todavía: copiá el mensaje para revisarlo.
2. En GitHub, reemplazá los archivos de Scorpion con el contenido de la carpeta **scorpion-workouts** del ZIP, en el mismo lugar donde están actualmente `index.html`, `admin.html` y `app.html`. Incluí las carpetas nuevas **assets** y **vendor**, además de **js** y **css**. No subas el ZIP como si fuese la web ni reemplaces la carpeta de AromaLParfum.
3. Esperá a que termine GitHub Pages y recargá con Ctrl+F5. La configuración de Supabase se mantiene; **DEMO_MODE sigue en false**.
4. Entrá como administrador → **Configuración**. Cargá tu alias/CBU, titular, enlace de pago si tenés y las instrucciones para enviar el comprobante. Hasta que cargues esos datos, el alumno verá que debe pedírselos a su entrenador.
5. Probá con tus dos cuentas de alumno: rutina propia, PDF, pago vencido, bloqueo y desbloqueo. Las comprobaciones locales incluidas no sustituyen esta verificación de tu proyecto real.

No se cambió la Edge Function `create-student`. No hace falta recrear cuentas ni asignar nuevamente las rutinas existentes.

## Lo nuevo

- Escorpión con llamas, sin letras, con fondo transparente; reemplaza el emoji y aparece como fondo fijo de la portada.
- Diseño adaptable a computadora y celular. La lista de alumnos se transforma en tarjetas en pantallas pequeñas y evita el desborde que aparecía en tu captura.
- Portada personalizada para quien ya inició sesión: botón **Entrar a mi panel**, día asignado y resumen semanal propio. El visitante ve una presentación general; la rutina de muestra se identifica como ejemplo.
- Sesión persistente en el mismo navegador, con renovación de tokens. Se evitó crear varios clientes de autenticación al mismo tiempo. Cerrar sesión, borrar los datos del navegador o usar modo privado puede requerir volver a ingresar.
- **62 reflexiones rotativas**, alternando filosofía y temas bíblicos. Cambian según el día de Argentina, también si la página queda abierta (comprobación cada 30 segundos). Las filosóficas son originales de Scorpion, sin atribuciones inventadas. Las bíblicas son paráfrasis identificadas con la referencia del pasaje; no citas de una traducción particular. El ciclo se repite cada 62 días.
- **Progresión semanal**: entrenamientos completos, series completadas, volumen registrado (kg × repeticiones) y mayor carga por ejercicio comparada con la semana anterior. Solo cuenta registros marcados como hechos. Una semana en curso se identifica como tal y no se inventan valores cuando faltan registros. El administrador la ve desde **Alumnos → Progreso**.
- **Descargar rutina en PDF**: nombre del alumno, días, ejercicios, series, repeticiones, descansos, notas e imágenes disponibles. Los videos quedan como enlaces al panel. Archivo A4 con texto seleccionable, fuentes incluidas y páginas automáticas. GIF/WebP se incluyen como imagen fija; si un servidor externo impide descargar la imagen, el PDF sigue incluyendo toda la prescripción e informa la omisión.

## Imágenes y videos

- **Configuración → Imágenes y videos del inicio**: foto y video juntos, visibles en la portada y en el inicio del alumno.
- **Ejercicios → Crear/Editar**: imagen y video de demostración. Al agregar el ejercicio a una rutina se toman sus medios; una rutina ya versionada conserva sus referencias hasta que la edites.
- **Rutinas → Crear/Editar**: imagen y video de la rutina completa; cada ejercicio permite además una URL de imagen y video específica.
- Formatos: JPG, PNG, WebP, GIF, MP4 y WebM; hasta 50 MB por archivo. Para compatibilidad móvil, preferí MP4 con video H.264. Los enlaces deben apuntar al archivo, no a una página de YouTube. Los videos tienen controles, modo silencioso, reproducción en bucle y no se descargan completos al abrir el panel.
- Para quitar un medio, vaciá su URL y guardá. Los archivos anteriores se conservan para no romper rutinas archivadas.
- El inicio usa el bucket público `sw-home-media`. Las nuevas demostraciones se suben a `sw-routine-media`, privado; sus enlaces temporales se autorizan según las rutinas del alumno.

## Qué entrenamiento toca hoy

En el editor de rutinas, cada día tiene un selector:

- **Secuencia** en todos: se comienza en el día 1 y se avanza al día siguiente de un entrenamiento guardado como completo. Mientras se entrena hoy, se mantiene ese día visible. Completar requiere marcar las series y usar **Guardar entrenamiento**.
- **Lunes, martes, etc.** en todos: se respeta el calendario del entrenador. Un día sin asignación se muestra como descanso. No se mezcla calendario y secuencia ni se repite un día de la semana.

Las rutinas existentes quedan en Secuencia. El alumno puede consultar y elegir otros días de su rutina; el calendario sugiere el correspondiente a hoy.

## Luces y bloqueo

- Verde: cuenta activa con acceso al entrenamiento.
- Azul: información de pagos (pendiente, al día o sin pagos registrados).
- Rojo: cuota vencida. Se calcula automáticamente a partir de los cobros y, cuando corresponde, la fecha de próximo pago de la ficha. Vence después de terminar esa fecha, con calendario de Argentina.
- Tercer indicador rojo: bloqueo manual por falta de pago. Apagado/gris si no está bloqueado.

**Pago vencido no bloquea automáticamente.** Usá **Alumnos → Bloquear** y confirmá. El alumno podrá iniciar sesión y ver únicamente sus cobros, tus instrucciones y el enlace para pagar. Rutinas, progreso y registros se restringen también en la base de datos. Su historial se conserva.

Después de verificar el pago: registralo como **Pagado**, actualizá el próximo vencimiento si corresponde y tocá **Desbloquear**. Si la cuenta está marcada como inactiva, también tendrás que activarla.

El enlace de pago puede ser el de tu proveedor (por ejemplo Mercado Pago); esta versión no procesa tarjetas ni confirma cobros automáticamente. Abrir el enlace o enviar un comprobante no desbloquea la cuenta por sí solo.

Un bloqueo no puede retirar un PDF o una imagen que la persona ya descargó. Los enlaces firmados emitidos antes del bloqueo pueden seguir funcionando hasta cinco minutos; las nuevas consultas se deniegan inmediatamente y el panel comprueba el estado al navegar, recuperar el foco y cada 30 segundos. Los medios públicos/externos anteriores continúan siendo públicos: para restringirlos, subilos al nuevo bucket privado y actualizá las referencias.

## Validación realizada

- 15 comprobaciones de regresión del comportamiento existente.
- 11 comprobaciones de calendario, semanas, bloqueo, indicadores, fechas de Argentina, URLs y contenido escapado.
- Migración ejecutada dos veces en PostgreSQL aislado (PGlite): idempotencia, versiones, conservación del historial, separación de alumnos, archivos privados y acceso a cobros durante bloqueo. No se ejecutó en tu Supabase real.
- Navegador Chromium con datos de prueba: escritorio 1440 px y móvil 390 px; configuración de cobro, calendario, bloqueo, edición sin perder el bloqueo, registros, sesión recordada y PDF. Sin errores de JavaScript ni desborde horizontal en las pantallas comprobadas.
- PDF de prueba generado y revisado visualmente. Los datos de prueba y sus capturas no forman parte de la entrega.

Las subidas reales a tus buckets y el flujo de tu enlace de pago requieren la prueba posterior a instalar el SQL. No se publicó nada automáticamente ni se modificaron tus datos reales.
