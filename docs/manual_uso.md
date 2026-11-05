# Manual de uso

Triaje San Rafael es un prototipo académico de apoyo a la priorización. **No reemplaza la decisión clínica.** No se ha validado con pacientes reales.

## Cómo abrirlo

1. Abra la carpeta `prototipo`.
2. Haga doble clic en `index.html`.

No necesita instalación ni internet. Funciona en navegadores actuales como Edge, Chrome o Firefox.

## Valorar a un paciente

1. Vaya a la pestaña **Triaje**.
2. Registre la edad. Para menores de un año use decimales: 0,5 equivale a 6 meses.
3. Registre los signos vitales, el dolor, la conciencia y el trabajo respiratorio. **Deje en blanco lo que no pudo medir.** Nunca escriba un valor supuesto.
4. Escriba lo que dice el paciente, sin nombres ni documentos. Si la frase es ambigua, el sistema muestra qué puede significar y qué debe aclarar.
5. Marque las banderas rojas que apliquen.
6. Marque los antecedentes. Solo pueden subir la prioridad.
7. Pulse **Calcular prioridad**.

> **Importante:** el sistema solo reconoce lo que tiene registrado. Si sospecha algo grave que no aparece en las banderas, como meningitis o preeclampsia, confíe en su criterio y suba el nivel. En la validación, 4 de 10 casos graves quedaron con un nivel menor al esperado.

## Leer el resultado

| Elemento | Qué significa |
|---|---|
| Nivel (I a V) | Prioridad sugerida según la Resolución 5596 de 2015. |
| Provisional | Faltan 3 o más datos. Mídalos y calcule de nuevo. |
| Puntaje difuso | Resultado de 0 a 100 antes del piso de seguridad. Puede indicar un nivel menor al final. |
| Revise lo dicho | La frase no coincide con lo registrado, o falta aclararla. Revísela con el paciente. |
| ¿Por qué este nivel? | Resumen de la regla decisiva, el centroide y el piso de seguridad. |
| Reglas y grados de pertenencia | Detalle completo del razonamiento. |

| Nivel | Atención |
|---|---|
| I | Inmediata. |
| II | No debe superar 30 minutos. |
| III, IV y V | Tiempo definido por la institución. Todos los pacientes reciben atención. |

Si el paciente empeora, repita la valoración.

## Decidir y usar la cola

1. Revise la sugerencia con su criterio clínico.
2. Si no está de acuerdo, cambie el nivel y escriba el motivo.
3. Pulse **Agregar a la cola**.

La pestaña **Cola** ordena por nivel decidido, puntaje y hora de llegada. Marca los Triage II desde los 20 minutos de espera y al superar 30. Use **Atendido** para retirar al paciente.

> **Importante:** la cola solo existe mientras la página esté abierta. Al cerrarla o recargarla se borra.

## Otras pestañas

- **Base de conocimiento:** funciones de pertenencia, reglas, banderas y ontología.
- **Arquitectura:** módulos del sistema experto.
- **Validación:** 20 casos sintéticos con sus métricas.

## Cuándo no usarlo

- Ante una emergencia evidente: atienda primero.
- En víctimas múltiples o desastres: la norma exceptúa estos eventos de sus tiempos de atención.
- Como reemplazo de la historia clínica: no guarda registros.

## Si algo no funciona

| Situación | Qué hacer |
|---|---|
| "Registre la edad" | La edad es obligatoria: define los rangos de los signos vitales. |
| Un campo aparece en rojo | El valor está fuera del rango permitido. |
| No aparece el botón de agregar | Primero pulse Calcular prioridad. |
| La página se ve vacía | Compruebe que `index.html` siga dentro de la carpeta `prototipo`, junto a `css`, `js` y `datos`. |

## Pruebas técnicas

Con Node.js instalado, desde la carpeta del proyecto:

```bash
node --test "pruebas/*.test.js"
```
