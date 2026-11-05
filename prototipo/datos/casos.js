// Casos sintéticos: ninguno corresponde a una persona real.
// Casos de ajuste: sirven para calibrar el motor y como ejemplos en la interfaz.
(function (raiz) {
  const T = (raiz.Triaje = raiz.Triaje || {});

  const caso = (id, esperado, descripcion, datos, contexto, razon) => ({ id, esperado, descripcion, datos: { banderas: [], texto: '', ...datos }, contexto, razon });
  const ctx = (sexo, vereda, escolaridad) => ({ sexo, vereda, escolaridad });

  T.casosAjuste = [
    caso('A01', 1, 'Adulto rescatado de un río, inconsciente', { edad: 41, dolor: null, temperatura: 34.6, fc: 44, fr: 6, pas: 78, spo2: 79, conciencia: 'no_responde', respiracion: 'dificultad_grave' }, ctx('M', 'Aguas Claras', 'primaria'), 'Riesgo vital con compromiso ventilatorio y neurológico.'),
    caso('A02', 1, 'Reacción alérgica con asfixia', { edad: 26, dolor: 3, temperatura: 36.9, fc: 142, fr: 34, pas: 80, spo2: 82, conciencia: 'confuso', respiracion: 'dificultad_grave', banderas: ['via_aerea', 'anafilaxia'], texto: 'No puedo respirar' }, ctx('F', 'El Mirador', 'secundaria'), 'Vía aérea comprometida.'),
    caso('A03', 2, 'Crisis asmática grave en adulto', { edad: 33, dolor: 2, temperatura: 37, fc: 118, fr: 31, pas: 128, spo2: 86, conciencia: 'alerta', respiracion: 'dificultad_grave', texto: 'Me ahogo' }, ctx('F', 'La Esperanza', 'secundaria'), 'Puede deteriorarse con rapidez.'),
    caso('A04', 2, 'Mordedura de serpiente en la pierna', { edad: 47, dolor: 7, temperatura: 37.1, fc: 102, fr: 19, pas: 124, spo2: 95, conciencia: 'alerta', respiracion: 'normal', banderas: ['mordedura'] }, ctx('M', 'Alto de la Cruz', 'primaria'), 'Riesgo de pérdida de miembro y deterioro.'),
    caso('A05', 2, 'Dolor extremo por cólico renal', { edad: 38, dolor: 10, temperatura: 36.9, fc: 104, fr: 20, pas: 138, spo2: 95, conciencia: 'alerta', respiracion: 'normal', texto: 'No aguanto el dolor' }, ctx('M', 'San Rafael', 'técnico'), 'El dolor extremo es criterio de Triage II.'),
    caso('A06', 2, 'Adulto mayor séptico, taquicárdico y febril', { edad: 79, dolor: 2, temperatura: 39.6, fc: 124, fr: 26, pas: 104, spo2: 89, conciencia: 'confuso', respiracion: 'dificultad_leve' }, ctx('F', 'Los Nogales', 'ninguna'), 'Signos de deterioro sistémico.'),
    caso('A07', 3, 'Vómito persistente en adolescente', { edad: 15, dolor: 4, temperatura: 37.7, fc: 104, fr: 18, pas: 110, spo2: 95, conciencia: 'alerta', respiracion: 'normal', banderas: ['deshidratacion'] }, ctx('F', 'San Rafael', 'secundaria'), 'Requiere hidratación en urgencias.'),
    caso('A08', 3, 'Fractura cerrada de muñeca', { edad: 29, dolor: 8, temperatura: 36.7, fc: 94, fr: 18, pas: 122, spo2: 95, conciencia: 'alerta', respiracion: 'normal' }, ctx('M', 'El Mirador', 'primaria'), 'Requiere estudio y manejo del dolor.'),
    caso('A09', 3, 'Fiebre alta en niño de 7 años', { edad: 7, dolor: 3, temperatura: 39.6, fc: 118, fr: 26, pas: 100, spo2: 94, conciencia: 'alerta', respiracion: 'normal', texto: 'Tengo fiebre alta' }, ctx('M', 'Aguas Claras', 'primaria'), 'Estable, requiere tratamiento rápido.'),
    caso('A10', 4, 'Cefalea moderada sin alarma', { edad: 36, dolor: 5, temperatura: 36.8, fc: 80, fr: 16, pas: 120, spo2: 95, conciencia: 'alerta', respiracion: 'normal' }, ctx('F', 'La Esperanza', 'universitaria'), 'Sin riesgo evidente, con posible complicación.'),
    caso('A11', 4, 'Infección urinaria baja', { edad: 31, dolor: 4, temperatura: 37.9, fc: 88, fr: 17, pas: 114, spo2: 95, conciencia: 'alerta', respiracion: 'normal' }, ctx('F', 'Los Nogales', 'secundaria'), 'Puede complicarse si no se atiende.'),
    caso('A12', 4, 'Esguince de tobillo', { edad: 22, dolor: 5, temperatura: 36.6, fc: 84, fr: 16, pas: 118, spo2: 96, conciencia: 'alerta', respiracion: 'normal' }, ctx('M', 'San Rafael', 'secundaria'), 'No compromete el estado general.'),
    caso('A13', 5, 'Gripe sin fiebre', { edad: 27, dolor: 1, temperatura: 37, fc: 78, fr: 15, pas: 115, spo2: 94, conciencia: 'alerta', respiracion: 'normal' }, ctx('F', 'Alto de la Cruz', 'técnico'), 'Sin deterioro.'),
    caso('A14', 5, 'Solicitud de certificado médico', { edad: 54, dolor: 0, temperatura: 36.5, fc: 70, fr: 14, pas: 126, spo2: 93, conciencia: 'alerta', respiracion: 'normal' }, ctx('M', 'El Mirador', 'primaria'), 'Sin deterioro.'),
    caso('A15', 5, 'Control de crecimiento en lactante sano', { edad: 1, dolor: 0, temperatura: 36.7, fc: 125, fr: 32, pas: 88, spo2: 94, conciencia: 'alerta', respiracion: 'normal' }, ctx('F', 'San Rafael', 'no aplica'), 'Sin deterioro.')
  ];
})(globalThis);
