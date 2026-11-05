// Banderas rojas: hallazgos que no se miden con un número y que fijan un nivel mínimo de urgencia.
// nivel 1 = crítica, 2 = alta, 3 = media, 4 = baja.
(function (raiz) {
  const T = (raiz.Triaje = raiz.Triaje || {});

  T.GRADOS_BANDERA = { 1: 'critica', 2: 'alta', 3: 'media', 4: 'baja' };

  // Antecedentes que aumentan el riesgo. Solo pueden subir la prioridad: un valor bajo nunca se
  // toma como "normal para este paciente", porque eso puede ocultar un deterioro.
  T.antecedentes = [
    { id: 'diabetes', etiqueta: 'Diabetes' },
    { id: 'inmunosupresion', etiqueta: 'Defensas bajas (quimioterapia, VIH, trasplante, corticoides)' },
    { id: 'cardiaca', etiqueta: 'Enfermedad del corazón' },
    { id: 'renal', etiqueta: 'Enfermedad renal crónica' },
    { id: 'respiratoria_cronica', etiqueta: 'Enfermedad pulmonar crónica' }
  ];

  T.banderas = [
    { id: 'paro', nivel: 1, grupo: 'Vital', etiqueta: 'No respira o no tiene pulso' },
    { id: 'via_aerea', nivel: 1, grupo: 'Vital', etiqueta: 'Vía aérea obstruida (se ahoga, no pasa aire)' },
    { id: 'convulsion_activa', nivel: 1, grupo: 'Neurológico', etiqueta: 'Convulsión en este momento' },
    { id: 'hemorragia_masiva', nivel: 1, grupo: 'Trauma', etiqueta: 'Sangrado que no para con presión' },

    { id: 'dolor_toracico', nivel: 2, grupo: 'Cardiovascular', etiqueta: 'Dolor de pecho que se corre al brazo, cuello o mandíbula' },
    { id: 'coronario_atipico', nivel: 2, grupo: 'Cardiovascular', etiqueta: 'Malestar en pecho o epigastrio con sudoración, náuseas o falta de aire' },
    { id: 'confusion_trauma', nivel: 2, grupo: 'Neurológico', etiqueta: 'Confusión o somnolencia nueva tras una caída o golpe en la cabeza' },
    { id: 'deficit_neurologico', nivel: 2, grupo: 'Neurológico', etiqueta: 'Cara torcida, debilidad de un lado o habla enredada, de inicio súbito' },
    { id: 'convulsion_reciente', nivel: 2, grupo: 'Neurológico', etiqueta: 'Convulsión reciente que ya cedió' },
    { id: 'trauma_grave', nivel: 2, grupo: 'Trauma', etiqueta: 'Trauma grave (caída de altura, machete, accidente de vehículo)' },
    { id: 'sangrado_abundante', nivel: 2, grupo: 'Trauma', etiqueta: 'Sangrado abundante ya controlado' },
    { id: 'alarma_obstetrica', nivel: 2, grupo: 'Obstétrico', etiqueta: 'Embarazo con sangrado, dolor abdominal fuerte o convulsión' },
    { id: 'letargo_nino', nivel: 2, grupo: 'Pediátrico', etiqueta: 'Niño letárgico: muy decaído, no despierta bien, no come' },
    { id: 'anafilaxia', nivel: 2, grupo: 'Toxicológico', etiqueta: 'Reacción alérgica con hinchazón de labios o lengua' },
    { id: 'plaguicidas', nivel: 2, grupo: 'Toxicológico', etiqueta: 'Intoxicación por plaguicidas u otro veneno' },
    { id: 'mordedura', nivel: 2, grupo: 'Toxicológico', etiqueta: 'Mordedura de serpiente' },
    { id: 'riesgo_suicida', nivel: 2, grupo: 'Salud mental', etiqueta: 'Ideas o intento de hacerse daño' },
    {
      id: 'fiebre_lactante', nivel: 2, grupo: 'Pediátrico', etiqueta: 'Lactante menor de 3 meses con 38 °C o más',
      derivada: { edadMenorQue: 0.25, temperaturaDesde: 38 }
    },

    { id: 'sincope', nivel: 3, grupo: 'Cardiovascular', etiqueta: 'Desmayo reciente, ya recuperado' },
    { id: 'deshidratacion', nivel: 3, grupo: 'General', etiqueta: 'Vómito o diarrea persistente, no tolera líquidos' },
    { id: 'embarazo', nivel: 3, grupo: 'Obstétrico', etiqueta: 'Embarazo con síntomas, sin signos de alarma' },

    { id: 'lesion_menor', nivel: 4, grupo: 'Trauma', etiqueta: 'Herida o lesión menor que necesita curación o sutura' }
  ];
})(globalThis);
