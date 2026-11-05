// Carga los mismos scripts que usa index.html, en el mismo orden.
const ARCHIVOS = [
  'js/conocimiento/variables.js',
  'js/conocimiento/banderas.js',
  'js/conocimiento/reglas.js',
  'js/conocimiento/ontologia.js',
  'js/conocimiento/expresiones.js',
  'clasico/reglas_si_entonces.js',
  'js/motor/difuso.js',
  'js/motor/inferencia.js',
  'js/motor/explicacion.js',
  'js/motor/metricas.js',
  'datos/casos.js'
];

const path = require('node:path');
const fs = require('node:fs');

for (const archivo of ARCHIVOS) {
  const ruta = path.join(__dirname, '..', 'prototipo', archivo);
  if (fs.existsSync(ruta)) require(ruta);
}

module.exports = globalThis.Triaje;
