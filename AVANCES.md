# Avances: semana 2

Sistema experto difuso para priorización de atención en el Centro de Salud Rural San Rafael. Proyecto 1 de Ingeniería del Conocimiento.

## Entregas

| Entrega | Rama | Contenido |
|---|---|---|
| Semana 1 | `semana-1` | Base de conocimiento y clasificador con reglas SI-ENTONCES nítidas |
| Semana 2 | `semana-2` | Motor de inferencia difusa, explicación e interfaz completa |

## Qué se agregó en esta entrega

- **Base de 50 reglas difusas en dos capas** (`prototipo/js/conocimiento/reglas.js`):
  - Capa 1: de los signos a los compromisos respiratorio, hemodinámico, neurológico, sistémico y de dolor, que menciona el art. 5 de la Resolución 5596.
  - Capa 2: de los compromisos a la prioridad.
- **Motor de inferencia difusa** (`prototipo/js/motor/`): Mamdani con fuzzificación por grupo de edad, operadores mínimo y máximo, agregación y centroide.
- **Piso de seguridad:** el promedio del centroide no puede diluir una bandera roja o una regla crítica.
- **Datos faltantes:** no se toman como normales.
  - Con datos faltantes no se concluye Triage V.
  - Con tres o más faltantes, el resultado es provisional.
- **Explicación:** regla decisiva, fuerza de cada regla, grados de pertenencia y curva de salida.
- **Interfaz** (`prototipo/index.html`):
  - Triaje, con contraste entre lo dicho y lo medido.
  - Cola de atención con tiempos.
  - Base de conocimiento.
  - Arquitectura.
- **Pruebas del motor:** centroide, cobertura, datos faltantes y monotonía (empeorar un signo nunca baja la prioridad).

## Comparación con la semana 1

Con la versión difusa, 37,9 °C y 38,0 °C dan resultados casi iguales: el paso entre conjuntos es gradual. La versión clásica sigue en `prototipo/clasico/`.

## Cómo probarlo

- Abrir `prototipo/index.html`. Hay casos de ejemplo en el selector.
- Pruebas: `node --test "pruebas/*.test.js"`.

## Siguiente entrega

- Validación con 20 casos sintéticos y sus métricas: concordancia, sensibilidad, subtriaje y sesgos.
- Matriz ética.
- Manual de uso.
- Página explicativa.
