// Ontología básica del dominio. Las relaciones también se usan en docs/ontologia.ttl.
(function (raiz) {
  const T = (raiz.Triaje = raiz.Triaje || {});

  T.ontologia = {
    clases: [
      { id: 'Paciente', padre: null, descripcion: 'Persona que consulta, identificada solo con un código temporal.' },
      { id: 'GrupoEtario', padre: null, descripcion: 'Lactante, niño, adulto o adulto mayor. Cambia los rangos de los signos vitales.' },
      { id: 'Manifestacion', padre: null, descripcion: 'Todo lo que se observa, mide o refiere en el paciente.' },
      { id: 'Sintoma', padre: 'Manifestacion', descripcion: 'Lo que el paciente refiere. Ejemplo: dolor o mareo.' },
      { id: 'ExpresionColoquial', padre: 'Sintoma', descripcion: 'Frase ambigua que requiere aclaración. Ejemplo: "me dio un ataque".' },
      { id: 'SignoVital', padre: 'Manifestacion', descripcion: 'Medición objetiva: FC, FR, PAS, SpO₂ o temperatura.' },
      { id: 'SignoObservado', padre: 'Manifestacion', descripcion: 'Observación del personal: conciencia y trabajo respiratorio.' },
      { id: 'BanderaRoja', padre: 'Manifestacion', descripcion: 'Hallazgo que fija un nivel mínimo de urgencia.' },
      { id: 'Antecedente', padre: null, descripcion: 'Enfermedad previa que solo puede aumentar la prioridad.' },
      { id: 'Compromiso', padre: null, descripcion: 'Afectación de un sistema deducida por la capa 1.' },
      { id: 'CompromisoRespiratorio', padre: 'Compromiso', descripcion: 'Afectación de la ventilación u oxigenación.' },
      { id: 'CompromisoHemodinamico', padre: 'Compromiso', descripcion: 'Afectación de la circulación.' },
      { id: 'CompromisoNeurologico', padre: 'Compromiso', descripcion: 'Afectación del estado de conciencia.' },
      { id: 'CompromisoSistemico', padre: 'Compromiso', descripcion: 'Respuesta general, como fiebre o hipotermia.' },
      { id: 'CargaDeDolor', padre: 'Compromiso', descripcion: 'Intensidad del dolor como criterio de urgencia.' },
      { id: 'NivelTriage', padre: null, descripcion: 'Categorías I a V de la Resolución 5596 de 2015.' },
      { id: 'Regla', padre: null, descripcion: 'Regla difusa SI-ENTONCES de la base de conocimiento.' },
      { id: 'FuenteConocimiento', padre: null, descripcion: 'Norma, guía clínica o enunciado del que sale una regla.' },
      { id: 'DecisionClinica', padre: null, descripcion: 'Decisión final del profesional, que puede modificar la sugerencia.' }
    ],
    relaciones: [
      { id: 'perteneceA', dominio: 'Paciente', rango: 'GrupoEtario', descripcion: 'Grupo de edad del paciente.' },
      { id: 'presenta', dominio: 'Paciente', rango: 'Manifestacion', descripcion: 'Manifestaciones registradas.' },
      { id: 'tieneAntecedente', dominio: 'Paciente', rango: 'Antecedente', descripcion: 'Enfermedades previas registradas.' },
      { id: 'seAclaraCon', dominio: 'ExpresionColoquial', rango: 'SignoVital', descripcion: 'Medición que aclara la frase.' },
      { id: 'evidencia', dominio: 'Manifestacion', rango: 'Compromiso', descripcion: 'La manifestación apoya el compromiso.' },
      { id: 'sugiereNivel', dominio: 'Compromiso', rango: 'NivelTriage', descripcion: 'El compromiso orienta la prioridad.' },
      { id: 'fijaNivelMinimo', dominio: 'BanderaRoja', rango: 'NivelTriage', descripcion: 'Piso de seguridad.' },
      { id: 'tieneFuente', dominio: 'Regla', rango: 'FuenteConocimiento', descripcion: 'Origen de la regla.' },
      { id: 'recibeNivel', dominio: 'Paciente', rango: 'NivelTriage', descripcion: 'Nivel sugerido por el sistema.' },
      { id: 'confirmadoPor', dominio: 'NivelTriage', rango: 'DecisionClinica', descripcion: 'El profesional acepta o cambia el nivel.' }
    ]
  };
})(globalThis);
