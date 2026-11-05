// Operaciones de lógica difusa. No depende del dominio.
(function (raiz) {
  const T = (raiz.Triaje = raiz.Triaje || {});

  function trapecio(x, [a, b, c, d]) {
    if (x < a || x > d) return 0;
    if (x >= b && x <= c) return 1;
    return x < b ? (x - a) / (b - a) : (d - x) / (d - c);
  }

  function pertenencia(mf, x) {
    if (mf.tipo === 'trapecio') return trapecio(x, mf.p);
    if (mf.tipo === 'union') return Math.max(...mf.partes.map((parte) => pertenencia(parte, x)));
    throw new Error(`Función de pertenencia desconocida: ${mf.tipo}`);
  }

  // Une las salidas recortadas por su activación y devuelve la curva agregada.
  function agregar(terminos, activaciones, dominio, paso) {
    const curva = [];
    for (let x = dominio[0]; x <= dominio[1]; x += paso) {
      let y = 0;
      for (const id of Object.keys(terminos)) {
        y = Math.max(y, Math.min(activaciones[id] || 0, pertenencia(terminos[id].mf, x)));
      }
      curva.push({ x, y });
    }
    return curva;
  }

  // Centro de gravedad de la curva. Devuelve null si ninguna regla aportó.
  function centroide(curva) {
    let area = 0;
    let momento = 0;
    for (const { x, y } of curva) {
      area += y;
      momento += x * y;
    }
    return area === 0 ? null : momento / area;
  }

  T.difuso = { trapecio, pertenencia, agregar, centroide };
})(globalThis);
