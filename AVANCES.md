# Avances: entrega final

Sistema experto difuso para priorización de atención en el Centro de Salud Rural San Rafael. Proyecto 1 de Ingeniería del Conocimiento.

## Entregas

| Entrega | Rama | Contenido |
|---|---|---|
| Semana 1 | `semana-1` | Base de conocimiento y clasificador con reglas SI-ENTONCES nítidas |
| Semana 2 | `semana-2` | Motor de inferencia difusa, explicación e interfaz completa |
| Final | `final` | Validación, matriz ética, manual y página explicativa |

## Qué se agregó en esta entrega

- **Validación en tres rondas**, cada una con 20 casos sintéticos nuevos y más difíciles. La ronda vigente dio 70 % de concordancia, 60 % de sensibilidad en Triage I y II y 20 % de subtriaje. Ver la pestaña Validación y `docs/matriz_etica.md`.
- **Correcciones derivadas de las rondas:**
  - Compromiso "grave" separado de "crítico".
  - Banderas de síntomas coronarios atípicos, confusión tras trauma y lesión menor.
  - Antecedentes de riesgo, que solo pueden subir la prioridad.
- `docs/matriz_etica.md`: riesgos, sesgos, marco legal y análisis de errores.
- `docs/manual_uso.md`: manual de uso.
- `pagina/index.html`: página que explica el sistema.

## Cómo probarlo

- Prototipo: abrir `prototipo/index.html`.
- Versión clásica: `prototipo/clasico/index.html`.
- Pruebas: `node --test "pruebas/*.test.js"`.

## Pendiente

- Documento en formato APA, README, póster y guion de la demo.
- Verificar las citas de PALS, AIEPI, NEWS2, Manchester y el marco legal.
- Revisión de reglas y casos por personal de salud.
