// Base de reglas en dos capas. Solo datos.
// Capa 1: signos y síntomas -> compromisos. Capa 2: compromisos, banderas y edad -> prioridad.
// si: lista de [variable, término]; op: cómo se unen (Y = mínimo, O = máximo).
// Un término puede ser una lista: la condición se cumple con cualquiera de ellos.
(function (raiz) {
  const T = (raiz.Triaje = raiz.Triaje || {});

  const r = (id, capa, op, si, entonces, fuente) => ({ id, capa, op, si, entonces, fuente });
  const a = (nivel) => ['prioridad', nivel];

  T.reglas = [
    // Capa 1, compromiso respiratorio
    r('R01', 1, 'Y', [['spo2', 'critica']], ['respiratorio', 'critico'], 'MinSalud/OPS 2016'),
    r('R02', 1, 'Y', [['respiracion', 'dificultad_grave']], ['respiratorio', 'critico'], 'Enunciado; Res. 5596 art. 5'),
    r('R03', 1, 'O', [['fr', 'muy_alta'], ['fr', 'muy_baja']], ['respiratorio', 'critico'], 'NEWS2; PALS; AIEPI'),
    r('R04', 1, 'Y', [['spo2', 'baja'], ['fr', 'alta']], ['respiratorio', 'grave'], 'NEWS2; MinSalud/OPS 2016'),
    r('R05', 1, 'O', [['spo2', 'baja'], ['respiracion', 'dificultad_leve']], ['respiratorio', 'moderado'], 'MinSalud/OPS 2016; Enunciado'),
    r('R06', 1, 'O', [['fr', 'alta'], ['fr', 'baja']], ['respiratorio', 'moderado'], 'NEWS2; PALS; AIEPI'),
    r('R07', 1, 'Y', [['spo2', 'normal'], ['fr', 'normal'], ['respiracion', 'normal']], ['respiratorio', 'ausente'], 'NEWS2'),

    // Capa 1, compromiso hemodinámico
    r('R08', 1, 'Y', [['pas', 'muy_baja']], ['hemodinamico', 'critico'], 'NEWS2; PALS'),
    r('R09', 1, 'O', [['fc', 'muy_alta'], ['fc', 'muy_baja']], ['hemodinamico', 'critico'], 'NEWS2; PALS'),
    r('R10', 1, 'Y', [['pas', 'baja'], ['fc', 'alta']], ['hemodinamico', 'grave'], 'NEWS2'),
    r('R11', 1, 'O', [['pas', 'baja'], ['pas', 'muy_alta']], ['hemodinamico', 'moderado'], 'NEWS2'),
    r('R12', 1, 'O', [['fc', 'alta'], ['fc', 'baja']], ['hemodinamico', 'moderado'], 'NEWS2; PALS'),
    r('R13', 1, 'Y', [['fc', 'normal'], ['pas', 'normal']], ['hemodinamico', 'ausente'], 'NEWS2'),

    // Capa 1, compromiso neurológico
    r('R14', 1, 'O', [['conciencia', 'no_responde'], ['conciencia', 'dolor'], ['conciencia', 'voz']], ['neurologico', 'grave'], 'NEWS2 (ACVPU)'),
    r('R15', 1, 'Y', [['conciencia', 'confuso']], ['neurologico', 'moderado'], 'NEWS2 (ACVPU)'),
    r('R16', 1, 'Y', [['conciencia', 'alerta']], ['neurologico', 'ausente'], 'NEWS2 (ACVPU)'),

    // Capa 1, compromiso sistémico
    r('R17', 1, 'Y', [['temperatura', 'hipotermia']], ['sistemico', 'grave'], 'NEWS2'),
    r('R18', 1, 'Y', [['temperatura', 'alta'], ['fc', 'alta'], ['fr', 'alta']], ['sistemico', 'grave'], 'NEWS2'),
    r('R19', 1, 'Y', [['temperatura', 'alta']], ['sistemico', 'moderado'], 'NEWS2; Enunciado'),
    r('R20', 1, 'O', [['temperatura', 'media'], ['temperatura', 'baja']], ['sistemico', 'leve'], 'NEWS2; Enunciado'),
    r('R21', 1, 'Y', [['temperatura', 'normal']], ['sistemico', 'ausente'], 'NEWS2'),

    // Capa 1, carga de dolor
    r('R22', 1, 'Y', [['dolor', 'extremo']], ['algia', 'grave'], 'Res. 5596 art. 5.2'),
    r('R23', 1, 'Y', [['dolor', 'severo']], ['algia', 'moderado'], 'Enunciado; Manchester'),
    r('R24', 1, 'Y', [['dolor', 'moderado']], ['algia', 'leve'], 'Enunciado; Manchester'),
    r('R25', 1, 'O', [['dolor', 'ausente'], ['dolor', 'leve']], ['algia', 'ausente'], 'Enunciado'),

    // Capa 2, Triage I. Sin compromiso neurológico, Triage I exige dos sistemas en estado crítico.
    r('R26', 2, 'O', [['conciencia', 'no_responde'], ['conciencia', 'dolor']], a(1), 'Res. 5596 art. 5.1'),
    r('R27', 2, 'Y', [['respiratorio', 'critico'], ['hemodinamico', 'critico']], a(1), 'Res. 5596 art. 5.1'),
    r('R28', 2, 'Y', [['respiratorio', ['grave', 'critico']], ['neurologico', 'grave']], a(1), 'Res. 5596 art. 5.1'),
    r('R29', 2, 'Y', [['hemodinamico', ['grave', 'critico']], ['neurologico', 'grave']], a(1), 'Res. 5596 art. 5.1'),
    r('R30', 2, 'Y', [['bandera', 'critica']], a(1), 'Res. 5596 art. 5.1'),

    // Capa 2, antecedentes de riesgo. "piso" evita que el centroide diluya un nivel III.
    r('R31', 2, 'Y', [['comorbilidad', 'riesgo'], ['sistemico', 'moderado']], a(2), 'Res. 5596 art. 5.2'),
    { ...r('R32', 2, 'Y', [['comorbilidad', 'riesgo'], ['sistemico', 'leve']], a(3), 'Res. 5596 art. 5.3'), piso: true },

    // Capa 2, Triage II
    r('R33', 2, 'Y', [['respiratorio', ['grave', 'critico']]], a(2), 'Res. 5596 art. 5.2'),
    r('R34', 2, 'Y', [['hemodinamico', ['grave', 'critico']]], a(2), 'Res. 5596 art. 5.2'),
    r('R35', 2, 'Y', [['neurologico', 'grave']], a(2), 'Res. 5596 art. 5.2'),
    r('R36', 2, 'Y', [['sistemico', 'grave']], a(2), 'Res. 5596 art. 5.2'),
    r('R37', 2, 'Y', [['algia', 'grave']], a(2), 'Res. 5596 art. 5.2'),
    r('R38', 2, 'Y', [['bandera', 'alta']], a(2), 'Res. 5596 art. 5.2'),
    r('R39', 2, 'Y', [['respiratorio', 'moderado'], ['hemodinamico', 'moderado']], a(2), 'NEWS2'),
    r('R40', 2, 'Y', [['edad', 'extrema'], ['respiratorio', 'moderado']], a(2), 'AIEPI; Enunciado'),
    r('R41', 2, 'Y', [['edad', 'extrema'], ['hemodinamico', 'moderado']], a(2), 'AIEPI; Enunciado'),
    r('R42', 2, 'Y', [['edad', 'lactante'], ['sistemico', 'moderado']], a(2), 'AIEPI'),

    // Capa 2, Triage III
    r('R43', 2, 'Y', [['respiratorio', 'moderado']], a(3), 'Res. 5596 art. 5.3'),
    r('R44', 2, 'Y', [['hemodinamico', 'moderado']], a(3), 'Res. 5596 art. 5.3'),
    r('R45', 2, 'Y', [['neurologico', 'moderado']], a(3), 'Res. 5596 art. 5.3'),
    r('R46', 2, 'Y', [['sistemico', 'moderado']], a(3), 'Res. 5596 art. 5.3'),
    r('R47', 2, 'Y', [['algia', 'moderado']], a(3), 'Res. 5596 art. 5.3'),
    r('R48', 2, 'Y', [['bandera', 'media']], a(3), 'Res. 5596 art. 5.3'),

    // Capa 2, Triage IV y V
    r('R49', 2, 'O', [['sistemico', 'leve'], ['algia', 'leve'], ['bandera', 'baja']], a(4), 'Res. 5596 art. 5.4'),
    r('R50', 2, 'Y', [['respiratorio', 'ausente'], ['hemodinamico', 'ausente'], ['neurologico', 'ausente'], ['sistemico', 'ausente'], ['algia', 'ausente']], a(5), 'Res. 5596 art. 5.5')
  ];
})(globalThis);
