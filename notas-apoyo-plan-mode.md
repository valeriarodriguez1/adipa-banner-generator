# Notas de apoyo · Generador de banners ADIPA

*Esto no es el BRIEF.md final — ese lo arma Claude Code contigo, en Plan Mode, a partir del mapa. Este documento es el respaldo en texto de todo lo que ya quedó definido, para que no se pierda nada difícil de leer en la imagen del Excalidraw. Compártelo junto con el mapa cuando entres a Plan Mode.*

## Problema que resuelve

El equipo de diseño de ADIPA produce banners para la sección de columnas de opinión cada vez que un docente publica un artículo. Hoy ese trabajo es manual pieza por pieza; esta app deja que el diseñador cargue los datos del docente una vez y genere automáticamente un banner por cada país donde se publica (Chile, México, Colombia), con la nomenclatura académica correcta según las reglas de cada país.

## Usuario principal y roles

- **Diseñador/a** (usuario principal): consulta el tablero de Monday, carga la información del docente, selecciona los países, revisa el resultado y descarga.
- **Sistema automático**: procesa la información, aplica las reglas de nomenclatura y formato, genera los banners, valida que cumplan las reglas (peso de archivo, etc.).

No hay un rol de "solicitante" separado — el mismo diseñador consulta Monday y genera.

## Pantallas / piezas (en orden del journey)

1. **Información** (formulario inicial)
2. **Validación de datos completos** (misma pantalla — señala campos si falta algo)
3. **Pantalla de carga** ("ya casi está listo")
4. **Resultados** (banners generados + acciones)
5. **Edición manual** (mismo formulario, precargado, para ajustar y regenerar)
6. **Resultados** (segunda vez, tras editar — pantalla completa, no un mensaje suelto)

## Datos por pantalla

**Información / Edición manual** (mismos campos en ambas)
- Nombre — texto libre
- Género — selección única, obligatorio: Femenino / Masculino / No binario u Otro. Se usa para elegir la forma correcta de los grados y títulos que varían por género (ver Reglas de negocio). Obligatorio siempre, aunque algunas combinaciones no lo terminen usando.
- Grado académico — checkboxes, hasta 3 de 4 opciones fijas: Doctorado/PhD, Magíster/Master, Especialidad Médica, Pregrado/Licenciatura
- Título profesional — dropdown de selección única, 35 opciones fijas (tabla de Monday, alfabetizadas)
- Resumen docente — textarea, un bullet por línea
- Fotografía — subir imagen + ajustar recuadro de recorte (arrastre y zoom)
- País — checkboxes multi-select: Chile, México, Colombia
- Sale: hasta 3 banners en formato WebP (uno por país seleccionado)

**Edición manual**, además: se precarga con los datos de la última generación de la sesión (nombre, género, grado académico, título profesional, resumen docente, países, foto); el usuario edita solo lo que necesita.

## Reglas de negocio

**Grado académico** — Campo obligatorio. Hasta 3 casillas de 4 fijas (Doctorado/PhD, Magíster/Master, Especialidad Médica, Pregrado/Licenciatura). Solo grados ya completados, no en curso. Pregrado/Licenciatura es excluyente con los otros tres: si se marca, se desmarcan los demás y viceversa — nunca se combina, solo aparece cuando es el único grado de alguien.

**Título profesional** — Campo obligatorio. Dropdown de selección única, 35 opciones fijas alfabetizadas, cargadas desde la tabla de Monday. Sin opción "Otro": todo docente que llega a este flujo ya está catalogado con uno de los 35 valores. El diseñador lo elige leyendo el resumen docente — el sistema nunca lo infiere automáticamente del texto.

**Género** — Campo obligatorio, selección única (Femenino / Masculino / No binario u Otro). Determina qué forma usar cuando un grado o título tiene variantes de género (ej. Magíster en México: Mtro./Mtra./Mtre.; Doctorado hispano/europeo: Dr./Dra./Dre.; algunas profesiones específicas de Chile/Colombia). Si la combinación (grado o profesión + país + género) no tiene una forma definida en la tabla de Monday, el sistema avisa antes de generar en vez de asumir la forma femenina o masculina por defecto.

**Fotografía** — El diseñador sube la foto ya sin fondo (PNG). Sobre esa imagen, ajusta un recuadro de recorte de proporción fija 514×526 px (igual al espacio de foto del template) con arrastre y zoom. El sistema usa exactamente esa selección — no reajusta proporciones ni recalcula nada.

**Resumen docente** — Un bullet por línea en el textarea. Máximo 300–350 caracteres totales contando espacios (idealmente 35–55 por viñeta), síntesis de 6–7 viñetas priorizando formación, especialización, experiencia, población/área de trabajo y elementos diferenciadores — sin narrativa ni redundancia.

**Nomenclatura académica** (la regla más importante del flujo — dos ramas distintas por país)

**Chile y Colombia:**
`[Grado 1]. [Grado 2, si aplica]. [Grado 3, si aplica]. [Título profesional]. [Nombre completo]`
- Se apilan todos los grados que el docente tenga (máximo 3), ordenados siempre de mayor a menor jerarquía: Doctorado/PhD > Magíster/Master > Especialidad Médica > Pregrado/Licenciatura — sin importar el orden en que se marcaron.
- El título profesional siempre se muestra, sin importar cuántos grados haya.
- Si el único grado es Pregrado/Licenciatura, no hay prefijo de grado: queda `[Título profesional]. [Nombre completo]`.
- Cada grado y el título se abrevian según la tabla de Monday por país, y según Género cuando la forma varía (ver más abajo).
- **Pendiente de decidir:** cuando Doctorado es hispano/europeo, la forma varía por género (Dr./Dra./Dre.); cuando es anglosajón, es siempre "PhD." (neutro). Hoy no hay ningún dato que diga si el doctorado de un docente fue anglosajón o hispano/europeo. Opciones: (a) agregar un campo condicional que solo aparece si se marca Doctorado, o (b) simplificar y usar siempre Dr./Dra./Dre. según género, sin distinguir origen. Recomendación: opción (b), dado el alcance acotado (solo Chile/Colombia, solo cuando Doctorado es el grado más alto) y que ya se suma Género como campo nuevo.

**México:**
`[Solo el grado más alto]. [Nombre completo]`
- No se apilan grados ni se muestra el título profesional en cuanto hay cualquier grado por encima de Pregrado/Licenciatura.
- Si el único grado es Pregrado/Licenciatura, el resultado es `Lic. [Nombre completo]` (Lic. es genérico, no varía por profesión; sí varía Mg./Mtro./Mtra./Mtre. y Dr./Dra./Dre. para Magíster y Doctorado según género).
- México no usa "PhD." bajo ninguna circunstancia — solo Dr./Dra./Dre. según género.
- Confirmado: si Especialidad Médica es el grado más alto en México, también se descarta el nombre de la especialidad (el paréntesis que sí aparece en Chile/Colombia) — solo queda el prefijo Dr./Dra./Dre. según género, igual que con cualquier otro grado. México nunca muestra el nombre de la especialidad.

Ejemplo real ya confirmado: la misma docente (psicóloga, femenino, solo con Pregrado) sale como "Ps. María López" en Chile, y "Lic. María López" en México.

**Exportación** — Generar el archivo en WebP. Si pesa más de 100 KB, se reduce la calidad de compresión y se regenera, repitiendo hasta que quede en 100 KB o menos. Regla dura, sin excepciones.

**Formato del banner** — 1280×675 px. Un solo template — no cambia según el país ni según la escuela/área del docente (confirmado explícitamente: el color del banner es siempre el mismo, sin importar la escuela).

**Colores y tipografía** — No modificar. Confirmado por quien diseñó el template: dos zonas de fondo — blanco (`#FFFFFF`) en la franja superior (donde va "COLUMNA DE OPINIÓN") y purple (`#704EFD`, purple oficial ADIPA, sólido, sin gradiente) en la banda inferior, donde van foto, nombre y resumen docente. Todo el texto va en blanco (`#FFFFFF`) excepto "COLUMNA DE OPINIÓN", que va en cyan oficial (`#2CB7FF`) — es el único texto con color distinto. Tipografía: Poppins SemiBold (nombre del docente, 40pt) y Poppins Medium (resumen docente, 14pt) — pesos oficiales confirmados en el manual de marca.

**Nombre** — Se mantiene igual en los banners de los tres países.

## Fuera de alcance

- No existe base de datos de docentes; la edición solo aplica a la generación más reciente de la sesión actual.
- Reutilizar información de un docente ya generado (fuera de esa sesión) — queda para una versión futura.
- Integración automática con el tablero de Monday — por ahora los datos se ingresan a mano, leyendo Monday.
- Recorte automático de fondo de la fotografía — el diseñador sube la foto ya sin fondo; el sistema no lo hace.
- Más de un estilo/plantilla de banner — solo existe el template actual.
- Validación automática de resolución mínima de la foto recortada — se deja a criterio del diseñador.
- Sugerencia automática de Título profesional leyendo el resumen docente — la selección siempre es manual.
- Inferir automáticamente si un Doctorado es anglosajón o hispano/europeo leyendo el resumen docente — si se conserva esta distinción, es un dato que el diseñador debe indicar, no algo que el sistema deduzca.
- Variar el color del banner según la escuela o área del docente (el manual de marca lo permite para redes sociales) — el banner mantiene siempre el mismo color, sin importar la escuela.

## Supuestos y pendientes (resolver antes de Plan Mode si se puede)

1. **PhD. vs. Dr./Dra./Dre.** — ¿se agrega un campo condicional (origen del doctorado) o se simplifica siempre a Dr./Dra./Dre.? (recomendación: simplificar — ver Reglas de negocio)
2. **Forma "No binario/Otro"** para las profesiones específicas de Chile/Colombia que sí varían por género (ej. Kinesiología, Fisioterapia, Abogacía, Fonoaudiología) — la tabla de Monday solo definió femenino y masculino para esos casos. No se sabe si es porque no se ha clasificado o porque no se ha dado un caso real; no bloquea nada, porque ya existe la regla de aviso (ver Género en Reglas de negocio), pero si se quiere cerrar el dato de raíz, es una pregunta para alguien de ADIPA, no para la IA de Monday.

## Tabla de nomenclaturas por país

Complétala con lo que ya tienes de Monday y llévala como archivo aparte. Con género en el flujo, varias filas necesitan hasta 3 columnas por país (femenino / masculino / no binario), no una sola:

| Grado académico | Chile | | | Colombia | | | México | | |
|---|---|---|---|---|---|---|---|---|---|
| | Fem. | Masc. | NB | Fem. | Masc. | NB | Fem. | Masc. | NB |
| Doctorado (hispano/europeo) | Dra. | Dr. | Dre. | Dra. | Dr. | Dre. | Dra. | Dr. | Dre. |
| Doctorado (anglosajón, si se conserva) | PhD. | PhD. | PhD. | PhD. | PhD. | PhD. | — | — | — |
| Magíster/Master | Mg. | Mg. | Mg. | Mg./Mgtr. | Mg./Mgtr. | Mg./Mgtr. | Mtra. | Mtro. | Mtre. |
| Especialidad Médica | Dr./Dra. + especialidad | | | Dr./Dra. + especialidad | | | Dr./Dra. + especialidad (¿pendiente 2?) | | |
| Pregrado/Licenciatura (solo, sin otro grado) | *(sin prefijo)* | *(sin prefijo)* | *(sin prefijo)* | *(sin prefijo)* | *(sin prefijo)* | *(sin prefijo)* | Lic. | Lic. | Lic. |

| Título profesional | Chile | | | Colombia | | | México | | |
|---|---|---|---|---|---|---|---|---|---|
| | Fem. | Masc. | NB | Fem. | Masc. | NB | Fem. | Masc. | NB |
| *(la mayoría de las 35 profesiones: mismo valor en las 3 columnas de cada país)* | | | | | | | | | |
| *(profesiones que sí varían — completar con las 3 formas cuando se definan)* | | | | | | | | | |
