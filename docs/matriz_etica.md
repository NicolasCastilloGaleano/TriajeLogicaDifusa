# Matriz ética

Riesgos del sistema, la medida que ya tiene el prototipo y lo que queda pendiente. El sistema apoya la priorización y no reemplaza la decisión clínica.

## Riesgos y controles

| Riesgo | A quién afecta | Control en el prototipo | Riesgo restante |
|---|---|---|---|
| Subtriaje: un paciente grave queda con baja prioridad | Paciente | Piso de seguridad, banderas rojas, datos faltantes no asumidos como normales | **Alto. Medido: 20 % en la validación, con 4 de 10 casos I y II no detectados.** Lo que el sistema no conoce pasa inadvertido |
| Sobretriaje: se consumen recursos en casos que no lo requieren | Otros pacientes, personal | La decisión final es del profesional | Medido: 10 % en la validación |
| Confianza excesiva en el sistema | Paciente, personal | Aviso permanente, nivel editable, explicación visible | Requiere capacitación |
| Uso fuera del dominio validado | Paciente | Aviso de prototipo sin validación clínica | No detecta trauma, embarazo o toxicología sin la bandera marcada |
| Decisión opaca | Personal, paciente | Muestra reglas, fuerzas, fuentes y grados de pertenencia | La explicación es técnica y puede requerir formación |
| Responsabilidad difusa ante un error | Institución, personal, desarrolladores | Registro de cambios y motivo en la cola | La cola no conserva un registro permanente. Falta definir un responsable institucional |
| Filtración de datos de salud | Paciente | Sin nombres ni documentos, código temporal, datos solo en memoria | El texto libre podría incluir datos personales: se advierte, pero no se bloquea |
| Sesgo por edad | Niños, adultos mayores | Rangos por grupo etario | Rangos pediátricos aproximados y pocos casos por grupo |
| Sesgo por forma de expresarse (cultura, escolaridad, vereda) | Pacientes que minimizan o no usan la escala | Contraste entre lo dicho y lo medido; prioridad a lo medido | La escala de dolor depende de cómo se la explique y entienda |
| Barrera tecnológica | Centro de salud rural | Funciona sin internet ni instalación | Requiere un computador y equipos de medición |
| Negación de atención | Paciente | El Triage V indica que también se atiende (art. 4, parágrafo) | Depende del uso institucional |

## Análisis de sesgos

- **Sexo, vereda y escolaridad:** 240 corridas sin ningún cambio de resultado. Esto solo demuestra que el motor no usa esos datos. No descarta un sesgo indirecto: dos personas con la misma enfermedad pueden reportar el dolor de forma distinta.
- **Grupo etario:** hubo subtriaje en adultos (3 de 11) y niños (1 de 4), y ninguno en adultos mayores (3) ni lactantes (2). Son muy pocos casos para afirmar equidad.
- **Presentaciones atípicas:** en la segunda ronda, una mujer con náuseas, sudoración y malestar epigástrico, esperada en II, quedó en IV. Esto mostró un posible sesgo indirecto: los datos no incluyen el sexo, pero la bandera describía la presentación típica. Se agregó una bandera, y aun así T05, dolor de mandíbula y brazo sin dolor de pecho, quedó en IV. El problema no está resuelto: toda bandera define qué presentaciones se reconocen.

## Rondas de validación

| Ronda | Concordancia | Sensibilidad I y II | Subtriaje | Sobretriaje | Qué se hizo después |
|---|---|---|---|---|---|
| 1 | 90 % | 100 % | 0 % | 10 % | Se separó compromiso grave y crítico |
| 2 | 75 % | 78 % | 20 % | 5 % | Se agregaron banderas y antecedentes |
| 3 (vigente) | 70 % | 60 % | 20 % | 10 % | Reglas congeladas |

Las rondas no son comparables entre sí, porque cada una se hizo más difícil a propósito. La caída no significa que el sistema empeorara: al cerrarse la ronda 3, los casos de ajuste dan 15 de 15, 19 de 20 y 19 de 20, sin subtriaje. Significa que cada ronda encuentra presentaciones que ninguna regla describe.

## Análisis de errores de la ronda vigente

| Caso | Esperado | Obtenido | Causa |
|---|---|---|---|
| T05, dolor de mandíbula y brazo sin dolor de pecho | II | IV | Ninguna bandera cubre esta presentación tal como está redactada |
| T06, fiebre con rigidez de nuca | II | III | Sin signos meníngeos en la base |
| T08, embarazo con cefalea y visión borrosa | II | III | Sin signos de preeclampsia en la bandera obstétrica |
| T10, fiebre en paciente con quimioterapia | II | III | El antecedente da el mismo peso a todas las enfermedades |
| T14, crisis asmática leve | III | II | Saturación baja con taquipnea se considera compromiso grave |
| T19, lactante sano | V | IV | La escala de dolor no aplica a lactantes, pero se cuenta como dato faltante |

T19 es un defecto de diseño, no un vacío clínico. Estos errores no se corrigieron: hacerlo sobre la misma ronda inflaría las cifras, y sin un experto clínico la lista de presentaciones nunca estará completa.

## Marco legal

Pendiente de verificar el texto de cada norma antes de citarla en el documento APA.

| Norma | Aplicación en el proyecto |
|---|---|
| Resolución 5596 de 2015 (consultada) | Cinco categorías, tiempos de atención, perfil del personal, registro. El triage no se usa para negar atención. |
| Ley 1581 de 2012 | Protección de datos personales. Los datos de salud son sensibles. |
| Ley 23 de 1981 | Ética médica: la decisión y la responsabilidad clínica. |
| Resolución 1995 de 1999 | Manejo de la historia clínica. El prototipo no la reemplaza. |
| Ley 1751 de 2015 | Derecho fundamental a la salud. |

## Requisitos antes de un uso real

1. Revisión de reglas y umbrales por médicos y enfermeras.
2. Validación prospectiva con casos reales anonimizados y aprobación de un comité de ética.
3. Definición institucional de responsables, capacitación y registro de decisiones.
4. Evaluación legal, incluido si el sistema debe tratarse como un dispositivo médico.
