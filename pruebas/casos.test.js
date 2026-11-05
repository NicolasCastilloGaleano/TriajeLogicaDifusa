const test = require('node:test');
const assert = require('node:assert/strict');
const T = require('./cargar.js');

test('hay 20 casos de validación que cubren los cinco niveles', () => {
  assert.equal(T.casosValidacion.length, 20);
  assert.deepEqual([...new Set(T.casosValidacion.map((c) => c.esperado))].sort(), [1, 2, 3, 4, 5]);
  const ajuste = new Set(T.casosAjuste.concat(T.casosPrimeraRonda, T.casosSegundaRonda).map((c) => c.id));
  assert.ok(T.casosValidacion.every((c) => !ajuste.has(c.id)));
});

test('los casos cubren niños, adultos mayores, datos faltantes y expresiones ambiguas', () => {
  const casos = T.casosValidacion;
  assert.ok(casos.some((c) => c.datos.edad < 12));
  assert.ok(casos.some((c) => c.datos.edad >= 65));
  assert.ok(casos.some((c) => T.inferir(c.datos).faltantes.length > 0));
  assert.ok(casos.some((c) => T.buscarExpresiones(c.datos.texto).length > 0));
});

// Registra el resultado obtenido al correr estos casos una sola vez, con errores incluidos.
// Si esta prueba falla, las reglas cambiaron: hay que escribir casos nuevos, no editar las cifras.
test('resultados de la validación', () => {
  const m = T.calcularMetricas(T.correrCasos(T.casosValidacion));
  assert.equal(m.concordancia, 0.7);
  assert.equal(m.concordanciaUnNivel, 0.95);
  assert.ok(Math.abs(m.kappa - 0.8393) < 0.001, `kappa ${m.kappa}`);
  assert.equal(m.sensibilidadAltos, 0.6);
  assert.equal(m.subtriaje, 0.2);
  assert.equal(m.sobretriaje, 0.1);
  assert.equal(m.explicabilidad, 1);
  assert.ok(m.tiempoPromedioMs < 100, `tiempo ${m.tiempoPromedioMs} ms`);
});

test('conjuntos de ajuste: los errores corregidos no regresan', () => {
  const ajuste = T.calcularMetricas(T.correrCasos(T.casosAjuste));
  assert.equal(ajuste.concordancia, 1);
  for (const casos of [T.casosPrimeraRonda, T.casosSegundaRonda]) {
    const m = T.calcularMetricas(T.correrCasos(casos));
    assert.equal(m.concordancia, 0.95);
    assert.equal(m.subtriaje, 0);
  }
});

test('sexo, vereda y escolaridad no cambian el resultado', () => {
  const { invarianza } = T.analizarSesgos(T.casosValidacion);
  assert.equal(invarianza.pruebas, 240);
  assert.deepEqual(invarianza.cambios, []);
});

test('ningún caso sale sin explicación', () => {
  for (const fila of T.correrCasos(T.casosValidacion.concat(T.casosAjuste))) {
    assert.ok(T.explicar(fila.resultado).pasos.length > 0, fila.caso.id);
  }
});
