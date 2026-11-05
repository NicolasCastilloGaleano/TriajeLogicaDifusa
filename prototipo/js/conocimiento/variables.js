// Variables lingüísticas del sistema. Solo datos: el motor no conoce nombres de variables.
// Las fuentes de cada umbral están en docs/matriz_adquisicion.md.
(function (raiz) {
  const T = (raiz.Triaje = raiz.Triaje || {});

  const trap = (a, b, c, d) => ({ tipo: 'trapecio', p: [a, b, c, d] });
  const tri = (a, b, c) => ({ tipo: 'trapecio', p: [a, b, b, c] });
  const union = (...partes) => ({ tipo: 'union', partes });

  // Cinco términos a partir de ocho cortes, con solapamiento entre términos vecinos.
  function cincoTerminos(min, max, p) {
    return {
      muy_baja: { etiqueta: 'muy baja', mf: trap(min, min, p[0], p[1]) },
      baja: { etiqueta: 'baja', mf: trap(p[0], p[1], p[2], p[3]) },
      normal: { etiqueta: 'normal', mf: trap(p[2], p[3], p[4], p[5]) },
      alta: { etiqueta: 'alta', mf: trap(p[4], p[5], p[6], p[7]) },
      muy_alta: { etiqueta: 'muy alta', mf: trap(p[6], p[7], max, max) }
    };
  }

  // La presión no tiene término "alta": 140-165 mmHg sin síntomas no es compromiso agudo.
  function presion(min, max, p) {
    return {
      muy_baja: { etiqueta: 'muy baja', mf: trap(min, min, p[0], p[1]) },
      baja: { etiqueta: 'baja', mf: trap(p[0], p[1], p[2], p[3]) },
      normal: { etiqueta: 'normal', mf: trap(p[2], p[3], p[4], p[5]) },
      muy_alta: { etiqueta: 'muy alta', mf: trap(p[4], p[5], max, max) }
    };
  }

  T.GRUPOS = {
    lactante: { nombre: 'Lactante (< 2 años)', hasta: 2 },
    nino: { nombre: 'Niño o niña (2 a 11 años)', hasta: 12 },
    adulto: { nombre: 'Adulto (12 a 64 años)', hasta: 65 },
    mayor: { nombre: 'Adulto mayor (65 años o más)', hasta: Infinity }
  };

  T.grupoEtario = function (edad) {
    for (const id of Object.keys(T.GRUPOS)) if (edad < T.GRUPOS[id].hasta) return id;
    return 'adulto';
  };

  T.variables = {
    edad: {
      nombre: 'Edad', unidad: 'años', tipo: 'numerica', dominio: [0, 120], paso: 1,
      terminos: {
        lactante: { etiqueta: 'lactante', mf: trap(0, 0, 1.5, 2.5) },
        nino: { etiqueta: 'niño', mf: trap(1.5, 2.5, 11, 13) },
        adulto: { etiqueta: 'adulto', mf: trap(11, 13, 60, 70) },
        mayor: { etiqueta: 'adulto mayor', mf: trap(60, 70, 120, 120) },
        extrema: { etiqueta: 'extrema', mf: union(trap(0, 0, 1.5, 2.5), trap(60, 70, 120, 120)) }
      }
    },
    dolor: {
      nombre: 'Dolor', unidad: '0 a 10', tipo: 'numerica', dominio: [0, 10], paso: 0.1,
      terminos: {
        ausente: { etiqueta: 'ausente', mf: trap(0, 0, 0.5, 1.5) },
        leve: { etiqueta: 'leve', mf: trap(0.5, 1.5, 3, 4.5) },
        moderado: { etiqueta: 'moderado', mf: trap(3, 4.5, 6, 7.5) },
        severo: { etiqueta: 'severo', mf: trap(6, 7.5, 8.5, 9.5) },
        extremo: { etiqueta: 'extremo', mf: trap(8.5, 9.5, 10, 10) }
      }
    },
    temperatura: {
      nombre: 'Temperatura', unidad: '°C', tipo: 'numerica', dominio: [30, 43], paso: 0.1,
      terminos: {
        hipotermia: { etiqueta: 'hipotermia', mf: trap(30, 30, 34.5, 35.5) },
        normal: { etiqueta: 'normal', mf: trap(34.5, 35.5, 37.2, 37.8) },
        baja: { etiqueta: 'fiebre baja', mf: tri(37.2, 37.8, 38.4) },
        media: { etiqueta: 'fiebre media', mf: tri(37.8, 38.5, 39.2) },
        alta: { etiqueta: 'fiebre alta', mf: trap(38.5, 39.2, 43, 43) }
      }
    },
    fc: {
      nombre: 'Frecuencia cardiaca', unidad: 'lpm', tipo: 'numerica', dominio: [0, 250], paso: 1,
      porGrupo: {
        lactante: cincoTerminos(0, 250, [60, 80, 90, 100, 160, 175, 185, 205]),
        nino: cincoTerminos(0, 250, [50, 60, 65, 75, 120, 135, 150, 170]),
        adulto: cincoTerminos(0, 250, [38, 45, 48, 55, 95, 110, 125, 140]),
        mayor: cincoTerminos(0, 250, [38, 45, 48, 55, 95, 105, 118, 130])
      }
    },
    fr: {
      nombre: 'Frecuencia respiratoria', unidad: 'rpm', tipo: 'numerica', dominio: [0, 100], paso: 1,
      porGrupo: {
        lactante: cincoTerminos(0, 100, [12, 18, 20, 25, 50, 60, 65, 75]),
        nino: cincoTerminos(0, 100, [8, 12, 14, 18, 30, 38, 45, 55]),
        adulto: cincoTerminos(0, 100, [7, 9, 10, 12, 20, 23, 25, 30]),
        mayor: cincoTerminos(0, 100, [7, 9, 10, 12, 20, 23, 25, 30])
      }
    },
    pas: {
      nombre: 'Presión arterial sistólica', unidad: 'mmHg', tipo: 'numerica', dominio: [0, 280], paso: 1,
      porGrupo: {
        lactante: presion(0, 280, [55, 65, 68, 75, 120, 145]),
        nino: presion(0, 280, [65, 75, 80, 90, 135, 160]),
        adulto: presion(0, 280, [85, 92, 98, 108, 165, 185]),
        mayor: presion(0, 280, [90, 100, 105, 115, 170, 195])
      }
    },
    spo2: {
      // Cortes interpolados a 2.350 m entre los valores de MinSalud/OPS para 2.200 m y 2.600 m.
      nombre: 'Saturación de oxígeno', unidad: '%', tipo: 'numerica', dominio: [50, 100], paso: 1,
      terminos: {
        critica: { etiqueta: 'crítica', mf: trap(50, 50, 86, 88) },
        baja: { etiqueta: 'baja', mf: trap(86, 88, 90, 92) },
        normal: { etiqueta: 'normal', mf: trap(90, 92, 100, 100) }
      }
    },
    conciencia: {
      nombre: 'Nivel de conciencia', tipo: 'categorica',
      terminos: {
        alerta: { etiqueta: 'alerta' },
        confuso: { etiqueta: 'confuso' },
        voz: { etiqueta: 'responde a la voz' },
        dolor: { etiqueta: 'responde al dolor' },
        no_responde: { etiqueta: 'no responde' }
      }
    },
    respiracion: {
      nombre: 'Trabajo respiratorio observado', tipo: 'categorica',
      terminos: {
        normal: { etiqueta: 'normal' },
        dificultad_leve: { etiqueta: 'dificultad leve' },
        dificultad_grave: { etiqueta: 'dificultad grave' }
      }
    }
  };

  // Lo que debe medirse en cada paciente. La edad se pide aparte.
  T.MEDICIONES = ['dolor', 'temperatura', 'fc', 'fr', 'pas', 'spo2', 'conciencia', 'respiracion'];

  // Conceptos deducidos por la capa 1. Corresponden a los compromisos del art. 5 de la Resolución 5596.
  T.intermedios = {
    // "grave" admite compensación; "critico" exige un valor extremo.
    respiratorio: { nombre: 'Compromiso respiratorio', terminos: { ausente: 'ausente', moderado: 'moderado', grave: 'grave', critico: 'crítico' } },
    hemodinamico: { nombre: 'Compromiso hemodinámico', terminos: { ausente: 'ausente', moderado: 'moderado', grave: 'grave', critico: 'crítico' } },
    neurologico: { nombre: 'Compromiso neurológico', terminos: { ausente: 'ausente', moderado: 'moderado', grave: 'grave' } },
    sistemico: { nombre: 'Compromiso sistémico', terminos: { ausente: 'ausente', leve: 'leve', moderado: 'moderado', grave: 'grave' } },
    algia: { nombre: 'Carga de dolor', terminos: { ausente: 'ausente', leve: 'leve', moderado: 'moderada', grave: 'grave' } }
  };

  // Salida del sistema, 0 a 100. Un mayor valor significa mayor urgencia.
  T.salida = {
    nombre: 'Prioridad', dominio: [0, 100],
    terminos: {
      5: { etiqueta: 'Triage V', mf: trap(0, 0, 10, 25) },
      4: { etiqueta: 'Triage IV', mf: tri(15, 30, 45) },
      3: { etiqueta: 'Triage III', mf: tri(35, 50, 65) },
      2: { etiqueta: 'Triage II', mf: tri(55, 70, 85) },
      1: { etiqueta: 'Triage I', mf: trap(75, 90, 100, 100) }
    },
    // Puntaje mínimo de cada nivel al convertir el centroide.
    cortes: { 1: 80, 2: 60, 3: 40, 4: 20, 5: 0 }
  };

  // Categorías del art. 5 de la Resolución 5596 de 2015, con redacción propia.
  T.NIVELES = {
    1: {
      romano: 'I', nombre: 'Riesgo vital inmediato', tiempo: 'Atención inmediata (art. 5.1)',
      descripcion: 'Riesgo vital con posible necesidad de reanimación por compromiso ventilatorio, respiratorio, hemodinámico o neurológico.',
      accion: 'Pasar de inmediato a sala de procedimientos y llamar al médico. Activar remisión al hospital de referencia.'
    },
    2: {
      romano: 'II', nombre: 'Posible deterioro rápido', tiempo: 'No debe superar 30 minutos (art. 5.2)',
      descripcion: 'La condición puede deteriorarse rápidamente o causar la muerte o la pérdida de un miembro u órgano. Incluye el dolor extremo.',
      accion: 'Avisar al médico, vigilar signos vitales y consultar con el hospital de referencia si hay dudas.'
    },
    3: {
      romano: 'III', nombre: 'Requiere estudio o tratamiento en urgencias', tiempo: 'Tiempo definido por la institución (art. 6.4)',
      descripcion: 'Estable, pero necesita medidas diagnósticas o terapéuticas en urgencias y podría empeorar si no se actúa.',
      accion: 'Atender en consulta prioritaria y repetir signos vitales mientras espera.'
    },
    4: {
      romano: 'IV', nombre: 'Sin riesgo evidente, con riesgo de complicación', tiempo: 'Tiempo definido por la institución (art. 6.4)',
      descripcion: 'No compromete el estado general, pero puede complicarse o dejar secuelas si no se atiende.',
      accion: 'Atender en consulta y explicar signos de alarma mientras espera.'
    },
    5: {
      romano: 'V', nombre: 'Sin deterioro del estado general', tiempo: 'Tiempo definido por la institución (art. 6.4)',
      descripcion: 'Problema agudo o crónico sin evidencia de deterioro ni riesgo evidente para la vida o la funcionalidad.',
      accion: 'El paciente también recibe atención: orientar a consulta y explicar signos de alarma. El triage no sirve para negar atención (art. 4).'
    }
  };
})(globalThis);
