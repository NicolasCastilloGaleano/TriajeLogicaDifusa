// Motor de inferencia Mamdani en dos capas, con piso de seguridad y manejo de datos faltantes.
(function (raiz) {
  const T = (raiz.Triaje = raiz.Triaje || {});

  const UMBRAL_REGLA_CRITICA = 0.5;
  const FALTANTES_PARA_NIVEL_III = 3;

  const ahora = () => (raiz.performance ? raiz.performance.now() : Date.now());
  const falta = (v) => v === null || v === undefined || v === '' || Number.isNaN(v);

  function terminosDe(id, grupo) {
    const v = T.variables[id];
    return v.porGrupo ? v.porGrupo[grupo] : v.terminos;
  }

  function fuzzificar(id, valor, grupo) {
    const v = T.variables[id];
    const grados = {};
    if (v.tipo === 'categorica') {
      for (const termino of Object.keys(v.terminos)) grados[termino] = termino === valor ? 1 : 0;
      return grados;
    }
    const x = Math.min(v.dominio[1], Math.max(v.dominio[0], Number(valor)));
    const terminos = terminosDe(id, grupo);
    for (const termino of Object.keys(terminos)) grados[termino] = T.difuso.pertenencia(terminos[termino].mf, x);
    return grados;
  }

  function banderasActivas(entrada) {
    const marcadas = entrada.banderas || [];
    return T.banderas.filter((b) => {
      if (marcadas.includes(b.id)) return true;
      const d = b.derivada;
      return Boolean(d) && !falta(entrada.edad) && !falta(entrada.temperatura)
        && entrada.edad < d.edadMenorQue && entrada.temperatura >= d.temperaturaDesde;
    });
  }

  function gradoDe(grados, variable, termino) {
    if (!grados[variable]) return undefined;
    return Array.isArray(termino) ? Math.max(...termino.map((t) => grados[variable][t])) : grados[variable][termino];
  }

  // Una regla Y necesita todos sus datos. Una regla O usa los disponibles.
  function evaluar(regla, grados) {
    const antecedentes = regla.si.map(([variable, termino]) => ({ variable, termino, grado: gradoDe(grados, variable, termino) }));
    const conocidos = antecedentes.filter((a) => a.grado !== undefined).map((a) => a.grado);
    const omitida = regla.op === 'Y' ? conocidos.length < antecedentes.length : conocidos.length === 0;
    if (omitida) return { regla, antecedentes, fuerza: 0, omitida: true };
    const fuerza = regla.op === 'Y' ? Math.min(...conocidos) : Math.max(...conocidos);
    return { regla, antecedentes, fuerza, omitida: false };
  }

  function nivelDePuntaje(puntaje) {
    const { cortes } = T.salida;
    for (const nivel of [1, 2, 3, 4]) if (puntaje >= cortes[nivel]) return nivel;
    return 5;
  }

  function calcularPisos(activas, evaluadas, faltantes) {
    const pisos = [];
    for (const b of activas) pisos.push({ nivel: b.nivel, tipo: 'bandera', motivo: `Bandera roja: ${b.etiqueta}` });
    for (const e of evaluadas) {
      const [variable, nivel] = e.regla.entonces;
      if (variable === 'prioridad' && (Number(nivel) <= 2 || e.regla.piso) && e.fuerza >= UMBRAL_REGLA_CRITICA) {
        pisos.push({ nivel: Number(nivel), tipo: 'regla', motivo: `Regla ${e.regla.id} activada con fuerza ${e.fuerza.toFixed(2)}` });
      }
    }
    if (faltantes.length >= FALTANTES_PARA_NIVEL_III) {
      pisos.push({ nivel: 3, tipo: 'faltantes', motivo: `Faltan ${faltantes.length} datos: el nivel es provisional hasta medirlos` });
    } else if (faltantes.length > 0) {
      pisos.push({ nivel: 4, tipo: 'faltantes', motivo: `Falta ${faltantes.length === 1 ? 'un dato' : 'dos datos'}: no se puede concluir Triage V` });
    }
    return pisos;
  }

  T.inferir = function (entrada) {
    const inicio = ahora();
    const edadConocida = !falta(entrada.edad);
    const grupo = edadConocida ? T.grupoEtario(Number(entrada.edad)) : 'adulto';

    const faltantes = T.MEDICIONES.filter((id) => falta(entrada[id]));
    if (!edadConocida) faltantes.push('edad');

    // Fuzzificación
    const grados = {};
    for (const id of Object.keys(T.variables)) {
      if (!falta(entrada[id])) grados[id] = fuzzificar(id, entrada[id], grupo);
    }

    const activas = banderasActivas(entrada);
    grados.bandera = { critica: 0, alta: 0, media: 0, baja: 0 };
    for (const b of activas) grados.bandera[T.GRADOS_BANDERA[b.nivel]] = 1;

    const antecedentes = T.antecedentes.filter((a) => (entrada.antecedentes || []).includes(a.id));
    grados.comorbilidad = { riesgo: antecedentes.length > 0 ? 1 : 0 };

    // Capa 1: cada compromiso toma la mayor fuerza de las reglas que lo concluyen
    for (const id of Object.keys(T.intermedios)) {
      grados[id] = {};
      for (const termino of Object.keys(T.intermedios[id].terminos)) grados[id][termino] = 0;
    }
    const capa1 = T.reglas.filter((r) => r.capa === 1).map((r) => evaluar(r, grados));
    for (const e of capa1) {
      const [variable, termino] = e.regla.entonces;
      grados[variable][termino] = Math.max(grados[variable][termino], e.fuerza);
    }

    // Capa 2: activación de cada nivel de prioridad
    const capa2 = T.reglas.filter((r) => r.capa === 2).map((r) => evaluar(r, grados));
    const activaciones = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const e of capa2) {
      const nivel = e.regla.entonces[1];
      activaciones[nivel] = Math.max(activaciones[nivel], e.fuerza);
    }

    // Agregación y defuzzificación
    const curva = T.difuso.agregar(T.salida.terminos, activaciones, T.salida.dominio, 0.5);
    const puntaje = T.difuso.centroide(curva);
    const nivelCentroide = puntaje === null ? 5 : nivelDePuntaje(puntaje);

    // El nivel final es el más urgente entre el centroide y los pisos
    const pisos = calcularPisos(activas, capa2, faltantes);
    const nivelFinal = Math.min(nivelCentroide, ...pisos.map((p) => p.nivel));
    const pisoAplicado = pisos.filter((p) => p.nivel === nivelFinal && p.nivel < nivelCentroide);

    const evaluadas = capa1.concat(capa2);
    return {
      grupo,
      grados,
      banderas: activas,
      antecedentes,
      faltantes,
      activaciones,
      curva,
      puntaje,
      nivelCentroide,
      pisos,
      pisoAplicado,
      nivelFinal,
      provisional: faltantes.length >= FALTANTES_PARA_NIVEL_III || puntaje === null,
      reglasActivadas: evaluadas.filter((e) => e.fuerza > 0).sort((a, b) => a.regla.capa - b.regla.capa || b.fuerza - a.fuerza),
      reglasOmitidas: evaluadas.filter((e) => e.omitida),
      tiempoMs: ahora() - inicio
    };
  };

  T.terminosDe = terminosDe;
  T.nivelDePuntaje = nivelDePuntaje;
})(globalThis);
