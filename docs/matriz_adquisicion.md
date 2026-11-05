# Matriz de adquisición del conocimiento

Registra de dónde sale cada pieza del sistema. Las reglas completas están en `prototipo/js/conocimiento/reglas.js` y en la pestaña Base de conocimiento.

## Criterio general

La Resolución 5596 de 2015 define las cinco categorías de triage, pero no trae umbrales ni listas de signos: cada IPS define su método (art. 6.1). Por eso el conocimiento tiene dos orígenes:

- **Niveles de prioridad:** Resolución 5596 de 2015, art. 5.
- **Umbrales numéricos:** guías clínicas citables.

No hubo entrevista con un experto clínico. Es la principal limitación de esta matriz, y un médico o enfermera debe revisarla antes de cualquier uso real.

## Variables de entrada

Solo los cortes marcados como "Directo" se tomaron tal cual de la fuente. Los marcados como "Aproximación" son decisiones del equipo orientadas por la fuente, y son los primeros que debe revisar un experto.

| Variable | Términos | Fuente | Tipo de corte |
|---|---|---|---|
| Dolor (0 a 10) | ausente, leve, moderado, severo, extremo | Enunciado; Res. 5596 art. 5.2 (dolor extremo) | Aproximación |
| Temperatura | hipotermia, normal, fiebre baja, media, alta | NEWS2; enunciado (38,5 °C) | Aproximación |
| FC adulto | muy baja a muy alta | NEWS2 | Directo con transición difusa |
| FC niños y lactantes | muy baja a muy alta | PALS | Aproximación |
| FC adulto mayor | muy baja a muy alta | NEWS2, con taquicardia desde valores menores | Aproximación |
| FR adulto y adulto mayor | muy baja a muy alta | NEWS2 | Directo con transición difusa |
| FR niños y lactantes | muy baja a muy alta | PALS; AIEPI | Aproximación |
| PAS adulto | muy baja, baja, normal, muy alta | NEWS2 | Directo en la zona baja; aproximación en la alta |
| PAS niños y lactantes | muy baja, baja, normal, muy alta | PALS | Aproximación |
| PAS adulto mayor | muy baja, baja, normal, muy alta | NEWS2, desplazada hacia arriba | Aproximación |
| SpO₂ | crítica, baja, normal | MinSalud/OPS (2016) | Interpolado |
| Conciencia | alerta, confuso, voz, dolor, no responde | ACVPU, de NEWS2 | Directo |
| Trabajo respiratorio | normal, dificultad leve, dificultad grave | Enunciado | Directo |

### Ajuste de SpO₂ por altitud

El centro está a unos 2.350 m. El documento de MinSalud/OPS (2016, tabla de la p. 11) da estos cortes:

| Altitud | Sugiere hipoxemia | Hipoxemia significativa |
|---|---|---|
| Hasta 2.200 m | < 92 % | < 88 % |
| 2.600 m | < 90 % | < 86 % |
| **San Rafael, 2.350 m (interpolación del equipo)** | **cerca de 91 %** | **cerca de 87 %** |

Por eso `normal` y `baja` se cruzan en 91 % y `baja` y `crítica` en 87 %. El mismo documento advierte que no hay evidencia suficiente para definir estos cortes en todas las alturas y edades, y que la oximetría no es adecuada por debajo de 80 %.

## De la expresión del paciente a la variable

La expresión nunca cambia el resultado por sí sola: el sistema propone qué aclarar y el personal registra el dato.

| Expresión | Posibles significados | Cómo se aclara | Contraste automático |
|---|---|---|---|
| "Me duele leve" | 2/10, o 6/10 en quien minimiza | Escala de 0 a 10 | Dolor ≥ 5, o signos de alta urgencia |
| "Tengo fiebre alta" | Percepción, o 38,5 °C medidos | Termómetro | Temperatura < 37,8 °C |
| "No respira bien" | Disnea, obstrucción nasal, ansiedad, dolor torácico | SpO₂, FR y observación | Trabajo respiratorio normal |
| "Estoy decaído" | Cansancio, enfermedad, letargo en niños | Valoración del niño | Menor de 12 años sin bandera de letargo |
| "Se me subió la presión" | Crisis hipertensiva, síntoma atribuido | Tensiómetro | PAS < 140 mmHg |
| "Me dio un ataque" | Convulsión, ansiedad, desmayo, ACV | Testigos y duración | Ninguna bandera relacionada |
| "Tengo mareo" | Vértigo, hipotensión, deshidratación, presíncope | PA y FC | Faltan PA o FC |
| "No aguanto el dolor" | Dolor severo, angustia | Escala de 0 a 10 | Dolor < 7 |
| "Me duele el pecho y se corre al brazo" | Síndrome coronario, dolor osteomuscular | Interrogatorio | Sin bandera de dolor torácico |
| "Me siento raro" (agregada, no está en el enunciado) | Malestar menor, infección, síndrome coronario atípico | Preguntar por sudoración, náuseas, falta de aire | Sin bandera de síntomas atípicos |

## Fuentes

- Mackway-Jones, K., Marsden, J., y Windle, J. (Eds.). (2014). *Emergency triage: Manchester Triage Group* (3.ª ed.). Wiley.
- Ministerio de Salud y Protección Social. (2015). *Resolución 5596 de 2015*. https://normograma.supersalud.gov.co/compilacion/docs/resolucion_minsaludps_5596_2015.htm
- Ministerio de Salud y Protección Social y Organización Panamericana de la Salud. (2016). *Uso e interpretación de la oximetría de pulso*. https://www.minsalud.gov.co/sites/rid/Lists/BibliotecaDigital/RIDE/VS/PP/ENT/uso-interprtn-oximetria-pulso.pdf
- Royal College of Physicians. (2017). *National Early Warning Score (NEWS) 2*.

Por verificar antes del documento APA, porque se citaron de memoria y no se consultó el texto: los valores de PALS (American Heart Association), de AIEPI (OPS/MinSalud) y la referencia exacta de Manchester y NEWS2.
