# Avances: semana 1

Sistema experto difuso para priorización de atención en el Centro de Salud Rural San Rafael. Proyecto 1 de Ingeniería del Conocimiento.

## Objetivo de la semana

Adquirir y representar el conocimiento del dominio, y probarlo con un primer clasificador de reglas SI-ENTONCES nítidas.

## Qué se hizo

- **Adquisición del conocimiento** (`docs/matriz_adquisicion.md`):
  - Fuentes de cada variable y umbral: Resolución 5596 de 2015, NEWS2 y MinSalud/OPS para SpO₂ en altitud.
  - Hallazgo clave: la resolución define los cinco niveles de triage, pero no trae umbrales de signos vitales.
- **Variables lingüísticas** (`prototipo/js/conocimiento/variables.js`):
  - Dolor, temperatura, frecuencias cardiaca y respiratoria, presión, saturación, conciencia y trabajo respiratorio.
  - Los rangos cambian según el grupo de edad.
  - La saturación se ajustó a los 2.350 m del centro.
- **Banderas rojas y antecedentes** (`banderas.js`): hallazgos que fijan un nivel mínimo de urgencia.
- **Ontología** (`ontologia.js` y `docs/ontologia.ttl`): clases y relaciones del dominio.
- **Expresiones ambiguas** (`expresiones.js`): las frases del enunciado, con sus posibles significados y cómo aclararlas.
- **Clasificador nítido** (`prototipo/clasico/`): 17 reglas SI-ENTONCES evaluadas en orden con `if/else`, con explicación de la regla que decidió.

## Limitaciones encontradas

- **Efecto escalón:** con 37,9 °C el paciente queda en Triage V y con 38,0 °C en Triage IV. Una décima cambia el resultado.
- Los cortes solo sirven para adultos.
- Un dato faltante simplemente se ignora.

Estas limitaciones motivan el uso de lógica difusa en la siguiente entrega.

## Cómo probarlo

- Abrir `prototipo/clasico/index.html`.
- Pruebas: `node --test "pruebas/*.test.js"`.

## Siguiente entrega

- Motor de inferencia difusa (Mamdani).
- Base de 30 a 50 reglas difusas.
- Explicación del razonamiento.
- Interfaz completa.
