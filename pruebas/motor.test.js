const test = require('node:test');
const assert = require('node:assert/strict');
const T = require('./cargar.js');

const sano = (cambios = {}) => ({
  edad: 30, dolor: 0, temperatura: 36.8, fc: 75, fr: 16, pas: 118, spo2: 95,
  conciencia: 'alerta', respiracion: 'normal', banderas: [], ...cambios
});

const cerca = (a, b, tolerancia = 0.01) => assert.ok(Math.abs(a - b) <= tolerancia, `${a} no está cerca de ${b}`);

test('trapecio: bordes, meseta y hombros', () => {
  const { trapecio } = T.difuso;
  assert.equal(trapecio(5, [0, 10, 20, 30]), 0.5);
  assert.equal(trapecio(15, [0, 10, 20, 30]), 1);
  assert.equal(trapecio(25, [0, 10, 20, 30]), 0.5);
  assert.equal(trapecio(-1, [0, 10, 20, 30]), 0);
  assert.equal(trapecio(0, [0, 0, 5, 10]), 1);
  assert.equal(trapecio(10, [5, 8, 10, 10]), 1);
});

test('centroide: valores calculados a mano', () => {
  const { agregar, centroide } = T.difuso;
  // Triángulo simétrico en 50: el centro de gravedad es 50.
  const simetrico = { a: { mf: { tipo: 'trapecio', p: [30, 50, 50, 70] } } };
  cerca(centroide(agregar(simetrico, { a: 1 }, [0, 100], 0.5)), 50);
  // Dos rectángulos iguales de ancho 10 en 10-20 y 80-90: el centro es 50.
  const dos = {
    a: { mf: { tipo: 'trapecio', p: [10, 10, 20, 20] } },
    b: { mf: { tipo: 'trapecio', p: [80, 80, 90, 90] } }
  };
  cerca(centroide(agregar(dos, { a: 1, b: 1 }, [0, 100], 0.5)), 50);
  assert.equal(centroide(agregar(dos, {}, [0, 100], 0.5)), null);
});

test('la base tiene entre 30 y 50 reglas, con identificadores únicos', () => {
  assert.ok(T.reglas.length >= 30 && T.reglas.length <= 50, `Son ${T.reglas.length} reglas`);
  assert.equal(new Set(T.reglas.map((r) => r.id)).size, T.reglas.length);
});

test('ninguna regla usa variables o términos inexistentes', () => {
  const existe = (variable, termino, grupo = 'adulto') => {
    if (Array.isArray(termino)) return termino.every((t) => existe(variable, t, grupo));
    if (variable === 'bandera') return Object.values(T.GRADOS_BANDERA).includes(termino);
    if (variable === 'comorbilidad') return termino === 'riesgo';
    if (variable === 'prioridad') return termino in T.salida.terminos;
    if (T.intermedios[variable]) return termino in T.intermedios[variable].terminos;
    return Boolean(T.variables[variable]) && termino in T.terminosDe(variable, grupo);
  };
  for (const regla of T.reglas) {
    for (const grupo of Object.keys(T.GRUPOS)) {
      for (const [v, t] of regla.si) assert.ok(existe(v, t, grupo), `${regla.id}: ${v}.${t} en ${grupo}`);
    }
    assert.ok(existe(...regla.entonces), `${regla.id}: consecuente`);
  }
});

test('cada término de entrada se usa en alguna regla', () => {
  const usados = new Set(T.reglas.flatMap((r) => r.si.map(([v, t]) => `${v}.${t}`)));
  for (const id of T.MEDICIONES) {
    for (const termino of Object.keys(T.terminosDe(id, 'adulto'))) {
      assert.ok(usados.has(`${id}.${termino}`), `${id}.${termino} sin regla`);
    }
  }
});

test('paciente sano queda en Triage V y no hay pisos', () => {
  const r = T.inferir(sano());
  assert.equal(r.nivelFinal, 5);
  assert.equal(r.pisos.length, 0);
});

test('la explicación cita al menos una regla activada', () => {
  const r = T.inferir(sano({ temperatura: 39.5, dolor: 8 }));
  assert.ok(r.reglasActivadas.length > 0);
  assert.match(T.explicar(r).pasos[0], /La regla R\d\d/);
});

test('cobertura: siempre se activa alguna regla de prioridad si no faltan datos', () => {
  let semilla = 7;
  const azar = (min, max) => {
    semilla = (semilla * 16807) % 2147483647;
    return min + ((semilla / 2147483647) * (max - min));
  };
  const elegir = (lista) => lista[Math.floor(azar(0, lista.length))];
  for (let i = 0; i < 5000; i += 1) {
    const r = T.inferir({
      edad: azar(0, 95), dolor: azar(0, 10), temperatura: azar(33, 42), fc: azar(20, 220), fr: azar(4, 80),
      pas: azar(40, 240), spo2: azar(60, 100),
      conciencia: elegir(Object.keys(T.variables.conciencia.terminos)),
      respiracion: elegir(Object.keys(T.variables.respiracion.terminos)),
      banderas: []
    });
    assert.notEqual(r.puntaje, null, `Caso ${i} sin reglas de prioridad`);
  }
});

test('datos faltantes: no se asumen normales y suben el nivel mínimo', () => {
  const uno = T.inferir(sano({ spo2: null }));
  assert.deepEqual(uno.faltantes, ['spo2']);
  assert.ok(uno.nivelFinal <= 4);

  const tres = T.inferir(sano({ spo2: '', fc: undefined, pas: null }));
  assert.equal(tres.faltantes.length, 3);
  assert.ok(tres.nivelFinal <= 3);
  assert.equal(tres.provisional, true);

  const nada = T.inferir({ edad: 40 });
  assert.equal(nada.puntaje, null);
  assert.equal(nada.nivelFinal, 3);
  assert.equal(nada.provisional, true);
});

test('un dato faltante no borra la gravedad de los datos conocidos', () => {
  const r = T.inferir(sano({ pas: null, spo2: 80 }));
  assert.ok(r.nivelFinal <= 2);
});

test('piso de seguridad: banderas rojas', () => {
  const critica = T.inferir(sano({ banderas: ['convulsion_activa'] }));
  assert.equal(critica.nivelFinal, 1);
  const alta = T.inferir(sano({ banderas: ['dolor_toracico'] }));
  assert.equal(alta.nivelFinal, 2);
  assert.ok(alta.pisoAplicado.some((p) => p.tipo === 'bandera') || alta.nivelCentroide === 2);
  const media = T.inferir(sano({ banderas: ['sincope'] }));
  assert.equal(media.nivelFinal, 3);
});

test('piso de seguridad: una regla crítica no se diluye con dolor o fiebre leves', () => {
  const r = T.inferir(sano({ spo2: 84, dolor: 2, temperatura: 38 }));
  assert.ok(r.nivelFinal <= 2);
});

test('Triage I: un paciente alerta y compensado no llega a I', () => {
  const compensado = { fc: 115, fr: 22, pas: 96, spo2: 90 };
  assert.equal(T.inferir(sano(compensado)).nivelFinal, 2);
  assert.equal(T.inferir(sano({ ...compensado, conciencia: 'voz' })).nivelFinal, 1);
});

test('Triage I: un paciente alerta con dos sistemas críticos sigue en I', () => {
  const r = T.inferir(sano({ fc: 150, fr: 34, pas: 72, spo2: 78, respiracion: 'dificultad_grave' }));
  assert.equal(r.nivelFinal, 1);
});

test('antecedentes: suben la prioridad con fiebre y solos no cambian el resultado', () => {
  const fiebre = { temperatura: 38.4 };
  assert.equal(T.inferir(sano(fiebre)).nivelFinal, 4);
  assert.equal(T.inferir(sano({ ...fiebre, antecedentes: ['diabetes'] })).nivelFinal, 3);
  assert.equal(T.inferir(sano({ temperatura: 39.5, antecedentes: ['inmunosupresion'] })).nivelFinal, 2);
  assert.equal(T.inferir(sano({ antecedentes: ['renal'] })).nivelFinal, 5);
  // El dolor moderado concluye Triage IV y no debe diluir la regla del antecedente.
  assert.equal(T.inferir(sano({ ...fiebre, dolor: 6, antecedentes: ['diabetes'] })).nivelFinal, 3);
});

test('antecedentes: nunca bajan la prioridad', () => {
  let semilla = 11;
  const azar = (min, max) => {
    semilla = (semilla * 16807) % 2147483647;
    return min + ((semilla / 2147483647) * (max - min));
  };
  for (let i = 0; i < 2000; i += 1) {
    const base = sano({ edad: azar(0, 90), dolor: azar(0, 10), temperatura: azar(35, 41), fc: azar(40, 180), fr: azar(8, 50), pas: azar(70, 200), spo2: azar(75, 100) });
    const sin = T.inferir(base).nivelFinal;
    for (const a of T.antecedentes) {
      assert.ok(T.inferir({ ...base, antecedentes: [a.id] }).nivelFinal <= sin, JSON.stringify(base));
    }
  }
});

test('bandera baja: una lesión menor no queda en Triage V', () => {
  assert.equal(T.inferir(sano({ banderas: ['lesion_menor'] })).nivelFinal, 4);
});

test('bandera derivada: lactante menor de 3 meses con fiebre', () => {
  const r = T.inferir(sano({ edad: 0.15, fc: 140, fr: 40, pas: 80, temperatura: 38.2 }));
  assert.ok(r.banderas.some((b) => b.id === 'fiebre_lactante'));
  assert.ok(r.nivelFinal <= 2);
});

test('la edad cambia la interpretación de los signos vitales', () => {
  // 150 lpm es taquicardia extrema en un adulto y es normal en un lactante.
  const adulto = T.inferir(sano({ fc: 150 }));
  const lactante = T.inferir(sano({ edad: 0.8, fc: 150, fr: 35, pas: 85 }));
  assert.ok(adulto.nivelFinal <= 2);
  assert.equal(lactante.nivelFinal, 5);
});

test('monotonía: empeorar un signo nunca baja la prioridad', () => {
  const adultoBase = (edad) => {
    const base = {
      lactante: { fc: 130, fr: 35, pas: 90 },
      nino: { fc: 95, fr: 22, pas: 100 },
      adulto: { fc: 75, fr: 16, pas: 118 },
      mayor: { fc: 75, fr: 16, pas: 130 }
    }[T.grupoEtario(edad)];
    return sano({ edad, ...base });
  };
  // Cada barrido va del valor normal hacia el extremo. Un descenso de hasta 1,5 puntos se tolera
  // porque el centroide no es estrictamente monótono, pero el nivel nunca puede bajar.
  const barridos = {
    dolor: [0, 10, 0.25], temperatura: [36.8, 42, 0.1], spo2: [95, 60, -0.5]
  };
  const barridosPorGrupo = (base) => ({
    ...barridos,
    fc_sube: ['fc', base.fc, 240, 2], fc_baja: ['fc', base.fc, 20, -2],
    fr_sube: ['fr', base.fr, 90, 1], fr_baja: ['fr', base.fr, 2, -1],
    pas_baja: ['pas', base.pas, 30, -2], pas_sube: ['pas', base.pas, 270, 2]
  });

  for (const edad of [0.8, 6, 30, 75]) {
    const base = adultoBase(edad);
    for (const [nombre, def] of Object.entries(barridosPorGrupo(base))) {
      const [variable, desde, hasta, paso] = def.length === 4 ? def : [nombre, ...def];
      let nivelAnterior = 5;
      let puntajeAnterior = -1;
      for (let x = desde; paso > 0 ? x <= hasta : x >= hasta; x += paso) {
        const r = T.inferir({ ...base, [variable]: x });
        assert.ok(r.nivelFinal <= nivelAnterior, `Edad ${edad}, ${variable}=${x}: nivel ${r.nivelFinal} tras ${nivelAnterior}`);
        assert.ok(r.puntaje >= puntajeAnterior - 1.5, `Edad ${edad}, ${variable}=${x}: puntaje ${r.puntaje} tras ${puntajeAnterior}`);
        nivelAnterior = r.nivelFinal;
        puntajeAnterior = Math.max(puntajeAnterior, r.puntaje);
      }
    }
  }
});

test('contraste entre lo dicho y lo medido', () => {
  const entrada = sano({ dolor: 7 });
  const r = T.inferir(entrada);
  const avisos = T.contrastar(entrada, r, 'Me duele leve la barriga');
  assert.equal(avisos.length, 1);
  assert.match(avisos[0].mensaje, /7\/10/);

  const fiebre = T.contrastar(sano(), T.inferir(sano()), 'Dice que tiene FIEBRE ALTA');
  assert.match(fiebre[0].mensaje, /36.8/);

  const ataque = T.buscarExpresiones('me dió un ataque ayer');
  assert.equal(ataque[0].id, 'ataque');
});

test('las nueve expresiones del enunciado están en el diccionario', () => {
  const frases = ['me duele leve', 'tengo fiebre alta', 'no respira bien', 'estoy decaido', 'se me subio la presion',
    'me dio un ataque', 'tengo mareo', 'no aguanto el dolor', 'me duele el pecho y se corre al brazo'];
  for (const frase of frases) assert.ok(T.buscarExpresiones(frase).length > 0, frase);
});
