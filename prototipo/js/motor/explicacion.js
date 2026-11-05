// Subsistema de explicación: convierte el resultado del motor en texto legible.
(function (raiz) {
  const T = (raiz.Triaje = raiz.Triaje || {});

  function nombreVariable(id) {
    if (T.variables[id]) return T.variables[id].nombre;
    if (T.intermedios[id]) return T.intermedios[id].nombre;
    if (id === 'bandera') return 'Bandera roja';
    if (id === 'comorbilidad') return 'Antecedente de riesgo';
    return id;
  }

  function nombreTermino(id, termino) {
    if (Array.isArray(termino)) return termino.map((t) => nombreTermino(id, t)).join(' o ');
    if (id === 'prioridad') return T.salida.terminos[termino].etiqueta;
    if (id === 'bandera') return { critica: 'crítica', alta: 'alta', media: 'media', baja: 'baja' }[termino];
    if (id === 'comorbilidad') return 'presente';
    if (T.intermedios[id]) return T.intermedios[id].terminos[termino];
    const v = T.variables[id];
    const terminos = v.porGrupo ? v.porGrupo.adulto : v.terminos;
    return terminos[termino].etiqueta;
  }

  T.textoRegla = function (regla) {
    const union = regla.op === 'Y' ? ' Y ' : ' O ';
    const si = regla.si.map(([v, t]) => `${nombreVariable(v)} es ${nombreTermino(v, t)}`).join(union);
    const [v, t] = regla.entonces;
    const entonces = v === 'prioridad' ? nombreTermino(v, t) : `${nombreVariable(v)} es ${nombreTermino(v, t)}`;
    return `SI ${si} ENTONCES ${entonces}`;
  };

  // Lista el término dominante de cada variable medida, para el resumen.
  T.hallazgos = function (resultado) {
    const lista = [];
    for (const id of Object.keys(T.variables)) {
      const grados = resultado.grados[id];
      if (!grados || id === 'edad') continue;
      const [termino, grado] = Object.entries(grados).sort((a, b) => b[1] - a[1])[0];
      lista.push({ id, nombre: nombreVariable(id), termino: nombreTermino(id, termino), grado });
    }
    return lista;
  };

  T.explicar = function (resultado) {
    const nivel = T.NIVELES[resultado.nivelFinal];
    const decisivas = resultado.reglasActivadas.filter((e) => e.regla.capa === 2).sort((a, b) => b.fuerza - a.fuerza);
    const pasos = [];

    if (decisivas.length) {
      const e = decisivas.find((x) => Number(x.regla.entonces[1]) === resultado.nivelFinal) || decisivas[0];
      pasos.push(`La regla ${e.regla.id} tuvo fuerza ${e.fuerza.toFixed(2)}: ${T.textoRegla(e.regla)}.`);
    }
    if (resultado.puntaje !== null) {
      const c = T.NIVELES[resultado.nivelCentroide];
      pasos.push(`El centroide dio ${resultado.puntaje.toFixed(1)} sobre 100, que corresponde a Triage ${c.romano}.`);
    } else {
      pasos.push('Ninguna regla de prioridad pudo evaluarse con los datos disponibles.');
    }
    for (const p of resultado.pisoAplicado) pasos.push(`Piso de seguridad: ${p.motivo}. Por eso el nivel sube a Triage ${T.NIVELES[p.nivel].romano}.`);
    if (resultado.faltantes.length) {
      pasos.push(`Sin medir: ${resultado.faltantes.map(nombreVariable).join(', ').toLowerCase()}. Estos datos no se tomaron como normales.`);
    }
    return { titulo: `Triage ${nivel.romano}: ${nivel.nombre}`, pasos };
  };

  T.nombreVariable = nombreVariable;
  T.nombreTermino = nombreTermino;
})(globalThis);
