# BRIEF.md — Generador de Banners ADIPA

> Brief de construcción. Basado en el mapa conceptual (`mapa banner generator.png`), `notas-apoyo-plan-mode.md`, `Grados Academicos por pais.pdf`, `Titulos profesionales.pdf` y `template-banner.jpg` / `template banner.ai`, con las ambigüedades y contradicciones detectadas resueltas en conversación con Valeria (ver historial de decisiones al final de este documento).

## 1. Problema que resuelve

El equipo de diseño de ADIPA produce banners para la sección de columnas de opinión cada vez que un docente publica un artículo. Hoy ese trabajo es manual, pieza por pieza. Esta app permite que el diseñador cargue los datos del docente una sola vez y genere automáticamente un banner por cada país donde se publica (Chile, México, Colombia), aplicando la nomenclatura académica correcta según las reglas de cada país.

## 2. Usuario principal y roles

- **Diseñador/a** (usuario principal, único rol humano): consulta el tablero de Monday, carga la información del docente, selecciona los países, revisa el resultado y descarga.
- **Sistema automático**: procesa la información, aplica las reglas de nomenclatura y formato, genera los banners, valida que cumplan las reglas técnicas (peso de archivo, campos completos, nomenclatura definida).

No existe un rol de "solicitante" separado — el mismo diseñador consulta Monday y genera.

## 3. Pantallas / piezas (en orden del journey)

1. **Información** — formulario inicial.
2. **Validación** — misma pantalla que Información. Se dispara al hacer clic en "Generar" y corre dos chequeos antes de avanzar:
   - **Datos completos**: todos los campos obligatorios están llenos.
   - **Nomenclatura definida**: para cada país seleccionado, la combinación grado/título + país + género tiene una forma definida en la tabla de nomenclaturas (ver [Reglas de negocio](#5-reglas-de-negocio)).
   Si algo falla, se señala el campo problemático **sin perder los datos ya ingresados** ni salir de esta pantalla. Si el problema es solo de nomenclatura en un país específico, ese país queda bloqueado pero el resto puede seguir.
3. **Pantalla de carga** — mensaje "ya casi está listo" mientras el sistema procesa.
4. **Resultados** — banners generados (uno por país válido) + acciones: descarga individual por banner, "Descargar todos", "Editar datos", "Regresar al inicio".
5. **Edición manual** — mismo formulario que Información, precargado con los datos de la última generación de la sesión (nombre, género, grado académico, título profesional, resumen docente, países, foto). El diseñador edita solo lo que necesita.
6. **Resultados (segunda vez)** — tras editar y regenerar, se muestra la misma pantalla completa de resultados (no un mensaje suelto).

## 4. Datos por pantalla

### 4.1 Información / Edición manual (mismos campos en ambas)

| Campo | Tipo | Entra | Sale / restricciones |
|---|---|---|---|
| Nombre | Texto libre | Nombre completo del docente | Obligatorio |
| Género | Selección única, obligatoria | Femenino / Masculino / No binario u Otro | Determina la forma correcta de grados y títulos con variantes de género |
| Grado académico | Checkboxes (hasta 3 de 4) | Doctorado, Magíster/Master, Especialidad Médica, Pregrado/Licenciatura | Obligatorio (al menos una casilla marcada). Pregrado/Licenciatura es excluyente con las otras tres. Solo grados completados, no en curso |
| Título profesional | Dropdown de selección única | 35 opciones fijas, alfabetizadas (tabla de Monday) | Obligatorio. Sin opción "Otro". Selección siempre manual, el sistema nunca la infiere del resumen |
| Resumen docente | Textarea, un bullet por línea | Síntesis de la trayectoria | Máximo 550 caracteres contando espacios (**límite duro**, con contador visual). 6–10 viñetas recomendadas (guía, no bloqueo) |
| Fotografía | Subir imagen + recorte | PNG sin fondo, recuadro de recorte 514×526 px con arrastre y zoom | El sistema usa exactamente la selección, sin reajustar proporciones |
| País | Checkboxes multi-select | Chile, México, Colombia | Al menos uno seleccionado |

**Sale de esta pantalla:** hasta 3 banners en formato WebP (uno por país seleccionado y válido).

**Edición manual, además:** se precarga con los datos de la última generación de la sesión; no existe historial de docentes más allá de esa última generación.

### 4.2 Resultados

- Entra: los banners generados por el sistema (uno por país válido).
- Sale / acciones disponibles:
  - Descarga individual por banner (Chile / México / Colombia).
  - "Descargar todos" (conjunto).
  - "Editar datos" → va a Edición manual, precargada.
  - "Regresar al inicio" → descarta la sesión actual y vuelve a Información en blanco.

## 5. Reglas de negocio

### Grado académico
Campo obligatorio. Hasta 3 casillas de 4 fijas (Doctorado, Magíster/Master, Especialidad Médica, Pregrado/Licenciatura). Solo grados ya completados, no en curso. Pregrado/Licenciatura es excluyente con los otros tres: si se marca, se desmarcan los demás y viceversa — nunca se combina, solo aparece cuando es el único grado de alguien.

### Título profesional
Campo obligatorio. Dropdown de selección única, 35 opciones fijas alfabetizadas, cargadas desde la tabla de Monday. Sin opción "Otro": todo docente que llega a este flujo ya está catalogado con uno de los 35 valores. El diseñador lo elige leyendo el resumen docente — el sistema nunca lo infiere automáticamente del texto.

### Género
Campo obligatorio, selección única (Femenino / Masculino / No binario u Otro — una sola opción combinada, no dos). Determina qué forma usar cuando un grado o título tiene variantes de género. Si la combinación (grado o profesión + país + género) no tiene una forma definida en la tabla de Monday, el sistema avisa **en la pantalla Información, antes de procesar** (no después de generar) y bloquea únicamente el país afectado — los demás países seleccionados se generan con normalidad.

### Fotografía
El diseñador sube la foto ya sin fondo (PNG). Sobre esa imagen, ajusta un recuadro de recorte de proporción fija 514×526 px (igual al espacio de foto del template) con arrastre y zoom. El sistema usa exactamente esa selección — no reajusta proporciones ni recalcula nada.

### Resumen docente
Un bullet por línea en el textarea. Síntesis priorizando formación, especialización, experiencia, población/área de trabajo y elementos diferenciadores — sin narrativa ni redundancia.
- **Máximo 550 caracteres totales contando espacios — límite duro y único.** Si se supera, no se puede generar; se indica con un contador visual. No existe un segundo límite duro independiente por cantidad de viñetas.
- **6–10 viñetas — recomendación, no bloqueo.** El diseñador puede usar una cantidad distinta de viñetas siempre que respete el máximo de caracteres.
- **Ajuste dentro de la caja de resumen del banner:** un resumen cercano al máximo de 550 caracteres debe caber siempre dentro del área de resumen del template, sin salirse de su caja ni invadir otros elementos. El sistema primero aprovecha el espacio vertical disponible (interlineado más compacto) y solo si aun así no alcanza, reduce levemente el tamaño de la tipografía — nunca al revés. La tipografía y el estilo del template (Poppins Medium) no cambian para resúmenes cortos o de largo típico.

### Nomenclatura académica
La regla más importante del flujo — dos ramas distintas por país.

**Chile y Colombia:**
`[Grado 1]. [Grado 2, si aplica]. [Grado 3, si aplica]. [Título profesional]. [Nombre completo]`
- Se apilan todos los grados que el docente tenga (máximo 3), ordenados siempre de mayor a menor jerarquía: Doctorado > Magíster/Master > Especialidad Médica > Pregrado/Licenciatura — sin importar el orden en que se marcaron.
- El título profesional siempre se muestra, sin importar cuántos grados haya — **salvo que el país no tenga un prefijo estándar definido para esa profesión** (ver "Casos sin prefijo estándar" abajo), en cuyo caso se omite y no es un error.
- Si el único grado es Pregrado/Licenciatura, no hay prefijo de grado: queda `[Título profesional]. [Nombre completo]`.
- Cada grado y el título se abrevian según la tabla de Monday por país, y según Género cuando la forma varía.

**México:**
`[Solo el grado más alto]. [Nombre completo]`
- No se apilan grados ni se muestra el título profesional en cuanto hay cualquier grado por encima de Pregrado/Licenciatura.
- Si el único grado es Pregrado/Licenciatura, el resultado es `Lic. [Nombre completo]` (Lic. es genérico, no varía por profesión).
- Si Especialidad Médica es el grado más alto, se muestra solo `Dr./Dra./Dre. [Nombre completo]` — **México nunca muestra el nombre de la especialidad** (a diferencia de Chile/Colombia, que sí la muestran).

**Origen del "nombre de la especialidad" (Especialidad Médica, Chile/Colombia):**
No existe un campo de texto libre para la especialidad. El nombre de la especialidad se obtiene del valor ya seleccionado en el campo **Título profesional** (ej. si el diseñador elige "Neurología" como Título profesional y marca Especialidad Médica como grado, el segmento de grado se renderiza como `Dr./Dra./Dre. Neurología`). En ese caso, el segmento independiente de `[Título profesional]` al final de la fórmula **no se duplica** — el valor ya quedó incorporado dentro del segmento de grado de Especialidad Médica. Si Especialidad Médica no está marcada, el Título profesional sí se renderiza como segmento propio, con su abreviatura normal. México no se ve afectado por esto: mantiene la regla ya definida de mostrar solo Dr./Dra./Dre., sin el nombre de la especialidad.

**Doctorado — regla unificada (sin distinción de origen):**
Todo doctorado, sin importar dónde se haya obtenido, se abrevia según género: **Dr.** (masculino) / **Dra.** (femenino) / **Dre.** (no binario u otro). No existe la forma "PhD." en ninguna versión ni país; no hay campo de "origen del doctorado".

**Casos sin prefijo estándar** (ej. Matrona/Obstetricia en Colombia, Ciencia Política en Chile — ver tabla en el anexo): cuando el país no tiene un prefijo definido para esa profesión, el banner se genera igual, simplemente sin el segmento de título profesional. No dispara el aviso de nomenclatura no definida — es un caso normal, no un error.

**Abreviaturas dobles no resueltas** (ej. Terapia Ocupacional en México: "Lic." vs "TO."; ver lista completa en el anexo): estas combinaciones se tratan como **nomenclatura no definida** — el sistema no elige arbitrariamente ni asume la primera opción, y bloquea solo el país afectado hasta que se resuelva (ver [Dependencias pendientes de validación con ADIPA](#6-dependencias-pendientes-de-validación-con-adipa)).

### Exportación
Generar el archivo en WebP. Si pesa más de 100 KB, se reduce la calidad de compresión y se regenera, repitiendo hasta que quede en 100 KB o menos. Regla dura, sin excepciones.

### Formato del banner
1280×675 px. Un solo template — no cambia según el país ni según la escuela/área del docente (el color del banner es siempre el mismo, sin importar la escuela).

### Colores y tipografía
No modificar. Dos zonas de fondo: blanco (`#FFFFFF`) en la franja superior (donde va "COLUMNA DE OPINIÓN") y purple (`#704EFD`, purple oficial ADIPA, sólido, sin gradiente) en la banda inferior, donde van foto, nombre y resumen docente. Todo el texto va en blanco (`#FFFFFF`) excepto "COLUMNA DE OPINIÓN", que va en cyan oficial (`#2CB7FF`). Tipografía: Poppins SemiBold (nombre del docente, 40pt) y Poppins Medium (resumen docente, 14pt).

**Mayúsculas en la línea de nombre:** la línea completa de nomenclatura académica/profesional + nombre del docente se renderiza siempre en MAYÚSCULAS dentro del banner (ej. `Mg. Ps. Leonel Núñez Lagos` → `MG. PS. LEONEL NÚÑEZ LAGOS`). Es una transformación puramente visual, solo del texto dibujado en el banner — el dato original que el diseñador escribió (en el formulario, en la precarga de Edición manual, y en cualquier otro texto de la interfaz) conserva su capitalización tal cual se ingresó; nunca se modifica ni se guarda en mayúsculas.

### Nombre y datos compartidos
Nombre, fotografía y resumen docente se mantienen iguales en los banners de los tres países; únicamente cambia la nomenclatura académica según las reglas de cada país.

### Descarga
El diseñador puede descargar cada banner individualmente o todos a la vez con "Descargar todos".

## 6. Dependencias pendientes de validación con ADIPA

Esto **no es una funcionalidad fuera de alcance** — es información que falta y que debe cerrarse con ADIPA antes o durante la implementación, porque el sistema no puede decidir por sí solo cuál abreviatura usar.

**Estas dependencias tampoco son preguntas abiertas del flujo del MVP.** El comportamiento del sistema mientras no exista una definición oficial ya está resuelto y documentado: la combinación se trata como nomenclatura no definida y se bloquea únicamente el país afectado (ver [Reglas de negocio → Género](#5-reglas-de-negocio)). Lo único pendiente es el dato en sí — la abreviatura oficial que ADIPA debe confirmar — no una decisión de diseño o de comportamiento del flujo.

- **Abreviatura oficial única por grado o profesión y país, para los casos con más de una forma no relacionada con género** — aplica tanto a grados académicos como a títulos profesionales:
  - **Grados académicos** (`Grados Academicos por pais.pdf`): ya no quedan casos pendientes en esta tabla — Magíster/Master en Colombia fue confirmado por ADIPA como "Mag." (ver historial de decisiones) y se retiró de esta lista.
  - **Títulos profesionales** (`Titulos profesionales.pdf`): ej. Terapia Ocupacional en México — "Lic." vs "TO."; lista completa marcada con ⚠ en el anexo, sección 8.2. Psicología en Colombia ya fue confirmada por ADIPA como "Psic." (ver historial de decisiones) y se retiró de esta lista.
  
  En ambos documentos fuente se listan las alternativas sin indicar un criterio de elección.
- **Hasta que ADIPA entregue esa tabla definitiva:** el sistema debe tratar cada una de estas combinaciones (profesión + país) como **nomenclatura no definida** — exactamente el mismo mecanismo del aviso descrito en [Reglas de negocio → Género](#5-reglas-de-negocio) — y bloquear solo el país afectado en la pantalla Información, sin generar el banner y sin asumir ni la primera opción de la lista ni ningún otro criterio implícito.
- Una vez que ADIPA confirme la abreviatura única por caso, esta tabla se actualiza y esas combinaciones dejan de estar bloqueadas — no requiere cambios de flujo ni de reglas, solo completar el dato.

## 7. Fuera de alcance

- No existe base de datos de docentes; la edición solo aplica a la generación más reciente de la sesión actual.
- Reutilizar información de un docente ya generado (fuera de esa sesión) — queda para una versión futura.
- Integración automática con el tablero de Monday — por ahora los datos se ingresan a mano, leyendo Monday.
- Recorte automático de fondo de la fotografía — el diseñador sube la foto ya sin fondo; el sistema no lo hace.
- Más de un estilo/plantilla de banner — solo existe el template actual.
- Validación automática de resolución mínima de la foto recortada — se deja a criterio del diseñador.
- Sugerencia automática de Título profesional leyendo el resumen docente — la selección siempre es manual.
- Distinguir el origen del doctorado (anglosajón vs. hispano/europeo) o usar la forma "PhD." — se simplificó a Dr./Dra./Dre. según género en todos los casos.
- Variar el color del banner según la escuela o área del docente — el banner mantiene siempre el mismo color, sin importar la escuela.

## 8. Anexo — Tabla de nomenclaturas por país

### 8.1 Grados académicos

Leyenda: **⚠** = dos o más abreviaturas sin criterio de elección definido y no relacionadas con género — dependencia pendiente con ADIPA, tratado como nomenclatura no definida (ver [sección 6](#6-dependencias-pendientes-de-validación-con-adipa)).

| Grado académico | Chile | Colombia | México | ¿Varía por género? |
|---|---|---|---|---|
| Doctorado (cualquier origen) | Dr. / Dra. / Dre. | Dr. / Dra. / Dre. | Dr. / Dra. / Dre. | Sí |
| Magíster / Master | Mg. | Mag. (confirmado por ADIPA) | Mtro. / Mtra. / Mtre. | No en Chile/Colombia · Sí en México |
| Especialidad Médica | Dr. / Dra. / Dre. + nombre de la especialidad | Dr. / Dra. / Dre. + nombre de la especialidad | Solo Dr. / Dra. / Dre. (sin nombre de especialidad) | Sí |
| Pregrado / Licenciatura (único grado) | *(sin prefijo de grado — usa el título profesional)* | *(sin prefijo de grado — usa el título profesional)* | Lic. (genérico, reemplaza el título profesional) | No |

> Nota: la columna "Doctorado" reemplaza la distinción PhD./Dr. del PDF original — ver decisión en el historial al final de este documento. Las formas de no binario/otro (Dre., Mtre.) no estaban documentadas para todas las combinaciones en el material fuente; donde falten, aplica la regla de aviso de la sección 5.

### 8.2 Títulos profesionales (35, alfabetizadas en el dropdown real)

Leyenda: **G** = varía por género (Fem./Masc., el material fuente no siempre documenta forma no binario — si falta, aplica el aviso). **⚠** = dos o más abreviaturas sin criterio de elección definido — dependencia pendiente con ADIPA, tratado como nomenclatura no definida (ver [sección 6](#6-dependencias-pendientes-de-validación-con-adipa)). **—** = sin prefijo estándar en ese país (se omite, no es error).

| # | Profesión | Chile | Colombia | México |
|---|---|---|---|---|
| 1 | Psicología | Ps. | Psic. (confirmado por ADIPA) | Lic. |
| 2 | Psiquiatría | Dr. / Dra. (G) | Dr. / Dra. (G) | Dr. / Dra. (G) |
| 3 | Psicopedagogía | Psicp. | Pscp. / Lic. ⚠ | Lic. |
| 4 | Neuropsicología | Ps. (base) | Ps. / Psic. (base) ⚠ | Lic. (base) |
| 5 | Psicoanalista | Ps. (base) | Ps. (base) | Lic. (base) |
| 6 | Psicoterapeuta | Ps. (base) | Ps. (base) | Lic. (base) |
| 7 | Médico Cirujano | Dr. / Dra. (G) | Dr. / Dra. (G) | Dr. / Dra. (G) |
| 8 | Neurología | Dr. / Dra. (G) | Dr. / Dra. (G) | Dr. / Dra. (G) |
| 9 | Pediatría / Neuropediatría | Dr. / Dra. (G) | Dr. / Dra. (G) | Dr. / Dra. (G) |
| 10 | Ginecología / Obstetricia | Dr. / Dra. (G) | Dr. / Dra. (G) | Dr. / Dra. (G) |
| 11 | Inmunología / Reumatología | Dr. / Dra. (G) | Dr. / Dra. (G) | Dr. / Dra. (G) |
| 12 | Urología | Dr. / Dra. (G) | Dr. / Dra. (G) | Dr. / Dra. (G) |
| 13 | Neurocirugía | Dr. / Dra. (G) | Dr. / Dra. (G) | Dr. / Dra. (G) |
| 14 | Fonoaudiología | Flga. / Flgo. (G) | Flga. / Flgo. (G) | Lic. |
| 15 | Terapia Ocupacional | TO. | TO. | Lic. / TO. ⚠ |
| 16 | Kinesiología / Fisioterapia | Knslga. / Knslgo. (G) | Fto. / Fta. (G) | Lic. / TF. ⚠ |
| 17 | Enfermería | Enf. | Enf. | Enf. / Lic. ⚠ |
| 18 | Matrona / Obstetricia | Matr. | — (sin prefijo estándar) | Lic. |
| 19 | Nutrición | Nta. / Nto. (G) | Nut. | Lic. / Ntr. ⚠ |
| 20 | Educación Diferencial / Especial | Ed. / EDI. ⚠ | Lic. / Ed. ⚠ | Lic. |
| 21 | Educadora de Párvulos | Ed. | Lic. | Lic. |
| 22 | Profesor/a (Básica, Media, Ed. Física) | Prof. | Prof. / Lic. ⚠ | Prof. / Lic. ⚠ |
| 23 | Trabajo Social | TS. | TS. / Trab. Soc. ⚠ | TS. / Lic. ⚠ |
| 24 | Asistente Social | AS. | AS. / Lic. ⚠ | AS. / Lic. ⚠ |
| 25 | Abogacía / Derecho | Abgda. / Abgdo. (G) | Abg. | Lic. |
| 26 | Judicatura (Juez/a, Magistrado/a) | Jueza. / Juez. (G) | Juez. / Mag. ⚠ | Lic. / Juez. ⚠ |
| 27 | Sociología | Soc. | Soc. / Lic. ⚠ | Lic. |
| 28 | Ciencia Política | — (sin prefijo estándar) | Lic. | Lic. |
| 29 | Periodismo / Comunicación | Com. / Per. ⚠ | Com. / Lic. ⚠ | Lic. |
| 30 | Arte Visual / Arteterapia | AV. | AV. / Lic. ⚠ | Lic. |
| 31 | Ingeniería | Ing. | Ing. | Ing. |
| 32 | Arquitectura | Arq. | Arq. | Arq. |
| 33 | Bioquímica / Biología | Bioq. / Bio. ⚠ | Bioq. / Lic. ⚠ | Lic. / Q.B.P. ⚠ |
| 34 | Filosofía / Teología / Historia | Fil. / Teol. / Hist. ⚠ (3 disciplinas distintas agrupadas en una fila) | Lic. | Lic. |
| 35 | Contador Público | Cp. | Cont. | C.P. |

## 9. Historial de decisiones (contradicciones y ambigüedades resueltas)

Para trazabilidad — estas fueron las preguntas abiertas detectadas al analizar el material, y la resolución que Valeria confirmó:

1. **PhD. vs. Dr./Dra./Dre.** — `notas-apoyo-plan-mode.md` lo marcaba "pendiente"; `Grados Academicos por pais.pdf` documentaba la distinción de origen (anglosajón/hispano-europeo) como regla vigente. **Resuelto:** se simplifica, siempre Dr./Dra./Dre. según género, sin distinguir origen.
2. **México + Especialidad Médica** — el texto confirmado de notas-apoyo decía que no se muestra el nombre de la especialidad, pero la tabla placeholder del mismo documento aún lo incluía. **Resuelto:** vale el texto confirmado — México nunca muestra el nombre de la especialidad.
3. **Abreviaturas dobles no relacionadas con género** (ej. "Ps." vs "Psic."). **Resuelto:** es una dependencia pendiente de validación con ADIPA (no una funcionalidad fuera de alcance) — mientras esa tabla definitiva no exista, el sistema trata cada caso como nomenclatura no definida y bloquea solo el país afectado; no elige arbitrariamente entre las alternativas.
4. **Descarga de banners** — el mapa solo mostraba "Descargar todos". **Resuelto:** existen ambas — individual y conjunta.
5. **Momento y alcance del aviso de nomenclatura no definida.** **Resuelto:** ocurre en la pantalla Información antes de procesar (no se pierden datos) y bloquea solo el país afectado.
6. **Resumen docente — ¿límite duro o guía?** **Resuelto:** 350 caracteres es límite duro; 6–7 viñetas es recomendación.
7. **Profesión sin prefijo estándar en un país** (ej. Matrona en Colombia). **Resuelto:** se omite el prefijo y se genera igual, sin aviso — es un caso normal.
8. **Revisión final de abreviaturas dobles no relacionadas con género en grados académicos** (no solo en títulos profesionales) — se detectó que Magíster/Master en Colombia ("Mg." vs "Mgtr.") tenía el mismo problema que los casos ya marcados en títulos profesionales, pero no estaba señalado. **Resuelto:** se agrega a la tabla de grados académicos (sección 8.1) con el mismo marcador ⚠ y el mismo tratamiento — dependencia pendiente con ADIPA, tratado como nomenclatura no definida (sección 6).
9. **Origen del "nombre de la especialidad" para Especialidad Médica (Chile/Colombia)** — detectado durante la construcción: la regla de nomenclatura requiere mostrar el nombre de la especialidad, pero no había ningún campo del formulario que lo capturara. **Resuelto:** el nombre de la especialidad es el mismo valor ya seleccionado en el dropdown de Título profesional; cuando Especialidad Médica está marcada, ese valor se incorpora dentro del segmento de grado y no se repite como segmento de Título profesional aparte. México no se ve afectado (sigue sin mostrar el nombre de la especialidad).
10. **Psicología en Colombia** — era una de las abreviaturas dobles marcadas ⚠ ("Ps." vs "Psic."), pendiente de validación con ADIPA. **Resuelto:** ADIPA confirmó que la abreviatura oficial es **"Psic."**. Se actualizó la tabla de títulos profesionales (sección 8.2) y dejó de tratarse como nomenclatura no definida — ahora Chile/Colombia/México resuelven Psicología sin bloqueo. Las demás abreviaturas dobles siguen pendientes sin cambios.
11. **Magíster/Master en Colombia** — era la abreviatura doble marcada ⚠ en grados académicos ("Mg." vs "Mgtr."), pendiente de validación con ADIPA. **Resuelto (y luego corregido — ver punto 12):** se registró inicialmente que ADIPA había confirmado "Mgtr.", sin variación por género.
12. **Corrección del punto 11 — Magíster/Master en Colombia NO es "Mgtr."** — el dato del punto anterior era incorrecto: "Mgtr." corresponde a información de **Argentina**, país que no forma parte del alcance de este MVP (ver [Fuera de alcance](#7-fuera-de-alcance): solo Chile, México y Colombia). **Resuelto correctamente:** la abreviatura oficial de Magíster/Master en Colombia es **"Mag."**, sin variación por género (igual patrón neutro que "Mg." en Chile). Se corrigió la tabla de grados académicos (sección 8.1), la sección 6 y la lógica de nomenclatura — Colombia con grado Magíster/Master usa "Mag." y no queda bloqueada. No se agregó Argentina al sistema ni a ninguna tabla. Las demás abreviaturas dobles (títulos profesionales) siguen pendientes sin cambios.
13. **Mayúsculas en la línea de nombre del banner** — ajuste visual solicitado sobre el template de referencia. **Resuelto:** la línea de nomenclatura + nombre del docente se renderiza en MAYÚSCULAS únicamente en el banner final (canvas de exportación); el dato ingresado por el diseñador y todo lo mostrado en la interfaz (formulario, precarga de Edición manual) conservan su capitalización original — no se transforma ni se guarda en mayúsculas en ningún otro lugar.
14. **Resumen docente — límite y recomendación actualizados tras probar casos reales** (docentes con trayectorias más extensas) y revisar el espacio disponible del template. **Reemplaza** el límite duro de 350 caracteres y la recomendación de 6–7 viñetas del punto 6. **Resuelto:** el límite duro pasa a **550 caracteres** contando espacios (sigue siendo el único límite duro — la cantidad de viñetas nunca bloquea por sí sola); la recomendación de viñetas pasa a **6–10**. El render del banner ahora aprovecha primero el espacio vertical disponible del área de resumen (interlineado más compacto) y solo si aun así no alcanza reduce levemente el tamaño de la tipografía, para que un resumen cercano a 550 caracteres siempre quede dentro de su caja sin invadir otros elementos del template.

## 10. Retrospectiva

**1. ¿Qué pregunta de Claude te hizo dar cuenta de algo que no tenías claro del flujo?**

La pregunta sobre qué debía ocurrir cuando una nomenclatura tenía más de una abreviatura posible. Al principio había asumido que el sistema podía tomar alguna de las opciones disponibles, pero al revisarlo entendí que faltaba definir una abreviatura oficial y que el sistema no debía decidirla arbitrariamente.

**2. ¿Qué diferencia hubo entre tu mapa inicial y lo que terminaste construyendo?**

El flujo principal se mantuvo bastante fiel al mapa inicial, pero durante la construcción aparecieron detalles que no había considerado, como la descarga individual de banners, las validaciones por país, el comportamiento de las nomenclaturas no definidas y varios ajustes de interfaz y responsive. El resultado final terminó siendo una versión más completa y precisa del flujo original.

**3. Si tuvieras que hacer este flujo de verdad para ADIPA, ¿cuál sería el primer riesgo o pieza faltante?**

La principal pieza pendiente sería cerrar con ADIPA una tabla definitiva de nomenclaturas por profesión y país. Todavía existen casos con más de una abreviatura posible, por lo que antes de utilizar la herramienta en un flujo real sería necesario definir una única forma oficial para cada combinación.
