// Clasificador nítido con reglas SI-ENTONCES escritas como if/else. Primera versión del sistema.
// Usa cortes fijos para adultos (NEWS2; SpO₂ de MinSalud/OPS a 2.350 m). Su límite principal es el
// "efecto escalón": un valor a cada lado del corte cambia el resultado por completo.
(function (raiz) {
  const T = (raiz.Triaje = raiz.Triaje || {});

  const REGLAS = {
    C01: { nivel: 1, texto: 'SI no responde o solo responde al dolor ENTONCES Triage I' },
    C02: { nivel: 1, texto: 'SI SpO₂ < 87 % Y PAS < 90 mmHg ENTONCES Triage I' },
    C03: { nivel: 2, texto: 'SI SpO₂ < 87 % ENTONCES Triage II' },
    C04: { nivel: 2, texto: 'SI FR > 24 o FR < 9 rpm ENTONCES Triage II' },
    C05: { nivel: 2, texto: 'SI PAS < 91 mmHg ENTONCES Triage II' },
    C06: { nivel: 2, texto: 'SI FC > 130 o FC < 41 lpm ENTONCES Triage II' },
    C07: { nivel: 2, texto: 'SI solo responde a la voz ENTONCES Triage II' },
    C08: { nivel: 2, texto: 'SI dolor ≥ 9 ENTONCES Triage II' },
    C09: { nivel: 2, texto: 'SI temperatura ≤ 35 °C ENTONCES Triage II' },
    C10: { nivel: 3, texto: 'SI SpO₂ < 91 % ENTONCES Triage III' },
    C11: { nivel: 3, texto: 'SI FR > 20 rpm ENTONCES Triage III' },
    C12: { nivel: 3, texto: 'SI FC > 110 lpm ENTONCES Triage III' },
    C13: { nivel: 3, texto: 'SI PAS < 101 mmHg ENTONCES Triage III' },
    C14: { nivel: 3, texto: 'SI está confuso ENTONCES Triage III' },
    C15: { nivel: 3, texto: 'SI temperatura ≥ 39,1 °C o dolor ≥ 7 ENTONCES Triage III' },
    C16: { nivel: 4, texto: 'SI temperatura ≥ 38 °C o dolor ≥ 4 ENTONCES Triage IV' },
    C17: { nivel: 5, texto: 'SI ninguna regla anterior se cumple ENTONCES Triage V' }
  };

  // Un dato vacío se vuelve NaN, y toda comparación con NaN es falsa: la regla no se cumple.
  const numero = (x) => (x === null || x === undefined || x === '' ? NaN : Number(x));

  T.reglasNitidas = REGLAS;

  T.clasificarNitido = function (entrada) {
    const fc = numero(entrada.fc);
    const fr = numero(entrada.fr);
    const pas = numero(entrada.pas);
    const spo2 = numero(entrada.spo2);
    const temp = numero(entrada.temperatura);
    const dolor = numero(entrada.dolor);
    const conciencia = entrada.conciencia;

    // La primera regla que se cumple decide.
    let id;
    if (conciencia === 'no_responde' || conciencia === 'dolor') id = 'C01';
    else if (spo2 < 87 && pas < 90) id = 'C02';
    else if (spo2 < 87) id = 'C03';
    else if (fr > 24 || fr < 9) id = 'C04';
    else if (pas < 91) id = 'C05';
    else if (fc > 130 || fc < 41) id = 'C06';
    else if (conciencia === 'voz') id = 'C07';
    else if (dolor >= 9) id = 'C08';
    else if (temp <= 35) id = 'C09';
    else if (spo2 < 91) id = 'C10';
    else if (fr > 20) id = 'C11';
    else if (fc > 110) id = 'C12';
    else if (pas < 101) id = 'C13';
    else if (conciencia === 'confuso') id = 'C14';
    else if (temp >= 39.1 || dolor >= 7) id = 'C15';
    else if (temp >= 38 || dolor >= 4) id = 'C16';
    else id = 'C17';

    // Las banderas rojas fijan un nivel mínimo.
    const banderas = T.banderas.filter((b) => (entrada.banderas || []).includes(b.id));
    const nivelReglas = REGLAS[id].nivel;
    const nivel = Math.min(nivelReglas, ...banderas.map((b) => b.nivel));

    const faltantes = ['fc', 'fr', 'pas', 'spo2', 'temperatura', 'dolor', 'conciencia'].filter((c) => {
      const v = entrada[c];
      return v === null || v === undefined || v === '';
    });

    return { nivel, nivelReglas, regla: { id, ...REGLAS[id] }, banderas, faltantes };
  };
})(globalThis);
