const test = require('node:test');
const assert = require('node:assert/strict');
const T = require('./cargar.js');

const sano = (cambios = {}) => ({
  edad: 30, dolor: 0, temperatura: 36.8, fc: 75, fr: 16, pas: 118, spo2: 95,
  conciencia: 'alerta', banderas: [], ...cambios
});

test('paciente sano: Triage V por la regla por defecto', () => {
  const r = T.clasificarNitido(sano());
  assert.equal(r.nivel, 5);
  assert.equal(r.regla.id, 'C17');
});

test('casos típicos', () => {
  assert.equal(T.clasificarNitido(sano({ conciencia: 'no_responde' })).nivel, 1);
  assert.equal(T.clasificarNitido(sano({ spo2: 82, pas: 80 })).nivel, 1);
  assert.equal(T.clasificarNitido(sano({ spo2: 85 })).nivel, 2);
  assert.equal(T.clasificarNitido(sano({ dolor: 9.5 })).nivel, 2);
  assert.equal(T.clasificarNitido(sano({ fc: 120 })).nivel, 3);
  assert.equal(T.clasificarNitido(sano({ dolor: 5 })).nivel, 4);
});

test('efecto escalón: una décima de grado cambia el nivel', () => {
  assert.equal(T.clasificarNitido(sano({ temperatura: 37.9 })).nivel, 5);
  assert.equal(T.clasificarNitido(sano({ temperatura: 38.0 })).nivel, 4);
});

test('las banderas fijan un nivel mínimo', () => {
  const r = T.clasificarNitido(sano({ banderas: ['dolor_toracico'] }));
  assert.equal(r.nivelReglas, 5);
  assert.equal(r.nivel, 2);
  assert.equal(T.clasificarNitido(sano({ spo2: 82, pas: 80, banderas: ['sincope'] })).nivel, 1);
});

test('un dato vacío no activa reglas (no se interpreta como cero)', () => {
  const r = T.clasificarNitido(sano({ spo2: null, pas: '' }));
  assert.equal(r.nivel, 5);
  assert.deepEqual(r.faltantes, ['pas', 'spo2']);
});

test('todas las reglas son alcanzables', () => {
  const ejemplos = [
    { conciencia: 'dolor' }, { spo2: 82, pas: 80 }, { spo2: 85 }, { fr: 30 }, { pas: 85 }, { fc: 140 },
    { conciencia: 'voz' }, { dolor: 9 }, { temperatura: 34.8 }, { spo2: 89 }, { fr: 22 }, { fc: 115 },
    { pas: 96 }, { conciencia: 'confuso' }, { temperatura: 39.5 }, { temperatura: 38.2 }, {}
  ];
  const alcanzadas = new Set(ejemplos.map((c) => T.clasificarNitido(sano(c)).regla.id));
  assert.equal(alcanzadas.size, Object.keys(T.reglasNitidas).length);
});
