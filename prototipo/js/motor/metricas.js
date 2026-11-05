// Métricas de validación. La pestaña Validación y las pruebas usan este mismo código.
(function (raiz) {
  const T = (raiz.Triaje = raiz.Triaje || {});

  const NIVELES = [1, 2, 3, 4, 5];
  const promedio = (lista) => lista.reduce((s, x) => s + x, 0) / lista.length;

  function matrizConfusion(filas) {
    const m = NIVELES.map(() => NIVELES.map(() => 0));
    for (const f of filas) m[f.esperado - 1][f.obtenido - 1] += 1;
    return m;
  }

  // Kappa con pesos cuadráticos: un error de dos niveles pesa cuatro veces uno de un nivel.
  function kappaPonderado(m) {
    const k = m.length;
    const total = m.flat().reduce((s, x) => s + x, 0);
    const filas = m.map((f) => f.reduce((s, x) => s + x, 0));
    const columnas = m[0].map((_, j) => m.reduce((s, f) => s + f[j], 0));
    let observado = 0;
    let esperado = 0;
    for (let i = 0; i < k; i += 1) {
      for (let j = 0; j < k; j += 1) {
        const peso = ((i - j) ** 2) / ((k - 1) ** 2);
        observado += peso * m[i][j];
        esperado += peso * (filas[i] * columnas[j]) / total;
      }
    }
    return esperado === 0 ? 1 : 1 - (observado / esperado);
  }

  T.correrCasos = function (casos) {
    return casos.map((caso) => {
      const r = T.inferir({ ...caso.datos, ...caso.contexto });
      return {
        caso, esperado: caso.esperado, obtenido: r.nivelFinal, puntaje: r.puntaje, tiempoMs: r.tiempoMs, resultado: r,
        avisos: T.contrastar(caso.datos, r, caso.datos.texto)
      };
    });
  };

  T.calcularMetricas = function (filas) {
    const m = matrizConfusion(filas);
    const altos = filas.filter((f) => f.esperado <= 2);
    const conExplicacion = filas.filter((f) => f.resultado.reglasActivadas.length > 0 || f.resultado.pisoAplicado.length > 0);
    return {
      total: filas.length,
      matriz: m,
      concordancia: filas.filter((f) => f.esperado === f.obtenido).length / filas.length,
      concordanciaUnNivel: filas.filter((f) => Math.abs(f.esperado - f.obtenido) <= 1).length / filas.length,
      kappa: kappaPonderado(m),
      sensibilidadAltos: altos.length ? altos.filter((f) => f.obtenido <= 2).length / altos.length : 1,
      subtriaje: filas.filter((f) => f.obtenido > f.esperado).length / filas.length,
      sobretriaje: filas.filter((f) => f.obtenido < f.esperado).length / filas.length,
      explicabilidad: conExplicacion.length / filas.length,
      tiempoPromedioMs: promedio(filas.map((f) => f.tiempoMs)),
      tiempoMaximoMs: Math.max(...filas.map((f) => f.tiempoMs))
    };
  };

  // Sesgos: concordancia por subgrupo, y resultado de un mismo caso al cambiar datos no clínicos.
  T.analizarSesgos = function (casos) {
    const filas = T.correrCasos(casos);
    const porGrupo = Object.keys(T.GRUPOS).map((id) => {
      const grupo = filas.filter((f) => f.resultado.grupo === id);
      return {
        id, nombre: T.GRUPOS[id].nombre, n: grupo.length,
        aciertos: grupo.filter((f) => f.esperado === f.obtenido).length,
        subtriaje: grupo.filter((f) => f.obtenido > f.esperado).length
      };
    });

    const alternativas = {
      sexo: ['F', 'M'],
      vereda: ['San Rafael', 'El Mirador', 'La Esperanza', 'Aguas Claras', 'Alto de la Cruz', 'Los Nogales'],
      escolaridad: ['ninguna', 'primaria', 'secundaria', 'universitaria']
    };
    const cambios = [];
    let pruebas = 0;
    for (const f of filas) {
      for (const campo of Object.keys(alternativas)) {
        for (const valor of alternativas[campo]) {
          pruebas += 1;
          const r = T.inferir({ ...f.caso.datos, ...f.caso.contexto, [campo]: valor });
          if (r.nivelFinal !== f.obtenido || r.puntaje !== f.puntaje) cambios.push({ caso: f.caso.id, campo, valor });
        }
      }
    }

    // Mismos signos a distintas edades: muestra el efecto esperado de los rangos por grupo.
    const fijo = { dolor: 2, temperatura: 37, fc: 110, fr: 26, pas: 100, spo2: 91, conciencia: 'alerta', respiracion: 'normal', banderas: [] };
    const porEdad = [0.8, 6, 30, 75].map((edad) => {
      const r = T.inferir({ ...fijo, edad });
      return { edad, grupo: T.GRUPOS[r.grupo].nombre, nivel: r.nivelFinal, puntaje: r.puntaje };
    });

    return { porGrupo, invarianza: { pruebas, cambios }, porEdad, signosFijos: fijo };
  };
})(globalThis);
