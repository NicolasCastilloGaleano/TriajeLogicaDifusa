// Pestaña de valoración: formulario, resultado y explicación.
(function (raiz) {
  const T = raiz.Triaje;
  const { $, $$, esc } = T.ui;
  const UI = T.ui;

  const CAMPOS_NUMERICOS = ['edad', 'dolor', 'temperatura', 'fc', 'fr', 'pas', 'spo2'];
  const AYUDA_EDAD = 'años (0,5 = 6 meses)';

  let consecutivo = 1;
  let ultimo = null;

  const codigoActual = () => `P-${String(consecutivo).padStart(3, '0')}`;

  function pintarCampos() {
    const numericos = CAMPOS_NUMERICOS.map((id) => {
      const v = T.variables[id];
      const unidad = id === 'edad' ? AYUDA_EDAD : v.unidad;
      return `<div class="campo"><label for="c-${id}">${esc(v.nombre)} <span class="unidad">(${esc(unidad)})</span></label>
        <input type="number" id="c-${id}" name="${id}" step="any" min="${v.dominio[0]}" max="${v.dominio[1]}" inputmode="decimal"></div>`;
    });
    const categoricos = ['conciencia', 'respiracion'].map((id) => {
      const v = T.variables[id];
      const opciones = Object.entries(v.terminos).map(([t, d]) => `<option value="${t}">${esc(d.etiqueta)}</option>`).join('');
      return `<div class="campo"><label for="c-${id}">${esc(v.nombre)}</label>
        <select id="c-${id}" name="${id}"><option value="">Sin evaluar</option>${opciones}</select></div>`;
    });
    $('#campos-medidos').innerHTML = numericos.concat(categoricos).join('');
  }

  function pintarBanderas() {
    const grupos = {};
    for (const b of T.banderas) if (!b.derivada) (grupos[b.grupo] = grupos[b.grupo] || []).push(b);
    $('#banderas').innerHTML = Object.entries(grupos).map(([grupo, lista]) => `
      <div class="grupo-banderas"><p>${esc(grupo)}</p>
      ${lista.map((b) => `<label class="bandera"><input type="checkbox" name="bandera" value="${b.id}">
        <span>${esc(b.etiqueta)}<em>mínimo Triage ${T.NIVELES[b.nivel].romano}</em></span></label>`).join('')}
      </div>`).join('');
  }

  function pintarAntecedentes() {
    $('#antecedentes').innerHTML = T.antecedentes.map((a) => `<label class="bandera"><input type="checkbox" name="antecedente" value="${a.id}"><span>${esc(a.etiqueta)}</span></label>`).join('');
  }

  function pintarFrases() {
    $('#frases').innerHTML = T.expresiones.map((x) => `<button type="button" class="frase" data-frase="${esc(x.frase)}">${esc(x.frase)}</button>`).join('');
  }

  function pintarInterpretaciones() {
    const halladas = T.buscarExpresiones($('#texto-paciente').value);
    $('#interpretaciones').innerHTML = halladas.map((x) => `
      <div class="interpretacion"><strong>"${esc(x.frase)}" puede significar:</strong>
      <span>${esc(x.interpretaciones.join(', '))}.</span> ${esc(x.aclarar)}</div>`).join('');
  }

  function pintarEjemplos() {
    const opciones = T.casosAjuste.map((c) => `<option value="${c.id}">${esc(c.descripcion)}</option>`).join('');
    $('#ejemplo').innerHTML = `<option value="">Ninguno</option>${opciones}`;
  }

  function leerFormulario() {
    const entrada = {
      banderas: $$('input[name="bandera"]:checked').map((c) => c.value),
      antecedentes: $$('input[name="antecedente"]:checked').map((c) => c.value)
    };
    for (const id of CAMPOS_NUMERICOS) {
      const crudo = $(`#c-${id}`).value;
      entrada[id] = crudo === '' ? null : Number(crudo);
    }
    entrada.conciencia = $('#c-conciencia').value || null;
    entrada.respiracion = $('#c-respiracion').value || null;
    return entrada;
  }

  function validar() {
    const errores = [];
    for (const id of CAMPOS_NUMERICOS) {
      const campo = $(`#c-${id}`);
      const v = T.variables[id];
      const fuera = !campo.validity.valid;
      campo.classList.toggle('invalido', fuera);
      if (fuera) errores.push(`${v.nombre} debe estar entre ${v.dominio[0]} y ${v.dominio[1]}.`);
    }
    if (!errores.length && !$('#c-edad').value) errores.push('Registre la edad: define los rangos de los signos vitales.');
    const caja = $('#error-formulario');
    caja.textContent = errores.join(' ');
    caja.hidden = errores.length === 0;
    return errores.length === 0;
  }

  function cargarCaso(id) {
    limpiar();
    const caso = T.casosAjuste.find((c) => c.id === id);
    if (!caso) return;
    $('#ejemplo').value = id;
    for (const campo of CAMPOS_NUMERICOS.concat('conciencia', 'respiracion')) {
      const valor = caso.datos[campo];
      $(`#c-${campo}`).value = valor === null || valor === undefined ? '' : valor;
    }
    for (const b of caso.datos.banderas) $(`input[name="bandera"][value="${b}"]`).checked = true;
    for (const a of caso.datos.antecedentes || []) $(`input[name="antecedente"][value="${a}"]`).checked = true;
    $('#texto-paciente').value = caso.datos.texto;
    pintarInterpretaciones();
  }

  function limpiar() {
    $('#formulario').reset();
    $$('.invalido').forEach((c) => c.classList.remove('invalido'));
    $('#error-formulario').hidden = true;
    pintarInterpretaciones();
  }

  function filaBarra(nombre, grado) {
    return `<div class="barra-fila"><span>${esc(nombre)}</span><div class="barra"><i style="width:${(grado * 100).toFixed(0)}%"></i></div><span class="valor">${grado.toFixed(2)}</span></div>`;
  }

  function bloquePertenencias(r) {
    const entradas = Object.keys(T.variables).filter((id) => r.grados[id]).map((id) => {
      const activos = Object.entries(r.grados[id]).filter(([, g]) => g > 0);
      return `<h4>${esc(T.nombreVariable(id))}</h4>${activos.map(([t, g]) => filaBarra(T.nombreTermino(id, t), g)).join('')}`;
    }).join('');
    const compromisos = Object.keys(T.intermedios).map((id) => {
      const activos = Object.entries(r.grados[id]).filter(([, g]) => g > 0);
      return `<h4>${esc(T.nombreVariable(id))}</h4>${activos.length ? activos.map(([t, g]) => filaBarra(T.nombreTermino(id, t), g)).join('') : '<p class="ayuda">Sin datos para deducirlo.</p>'}`;
    }).join('');
    return `<details><summary>Grados de pertenencia (fuzzificación)</summary>${entradas}</details>
      <details open><summary>Compromisos deducidos (capa 1)</summary>${compromisos}</details>`;
  }

  function bloqueReglas(r) {
    const tarjeta = (e) => `<div class="regla">
      <div class="regla-cabecera"><span>${e.regla.id}, capa ${e.regla.capa}</span><span>fuerza ${e.fuerza.toFixed(2)}</span></div>
      <div class="regla-texto">${esc(T.textoRegla(e.regla))}</div>
      <div class="regla-fuente">Fuente: ${esc(e.regla.fuente)}</div></div>`;
    const capa2 = r.reglasActivadas.filter((e) => e.regla.capa === 2).sort((a, b) => b.fuerza - a.fuerza);
    const capa1 = r.reglasActivadas.filter((e) => e.regla.capa === 1);
    return `<details open><summary>Reglas de prioridad activadas (${capa2.length})</summary>${capa2.map(tarjeta).join('') || '<p class="ayuda">Ninguna.</p>'}</details>
      <details><summary>Reglas de compromiso activadas (${capa1.length})</summary>${capa1.map(tarjeta).join('')}</details>`;
  }

  function bloqueCurva(r) {
    if (r.puntaje === null) return '';
    const serie = { nombre: 'Salida agregada', puntos: r.curva, color: '#22b8cf', relleno: 0.3 };
    return `<details><summary>Agregación y defuzzificación</summary>
      ${UI.grafica({ series: [serie], dominio: T.salida.dominio, marca: r.puntaje, rotuloMarca: `centroide ${r.puntaje.toFixed(1)}` })}</details>`;
  }

  function escala(r) {
    if (r.puntaje === null) return '<p class="ayuda">Sin puntaje: faltan datos para evaluar las reglas.</p>';
    const tramos = [[5, 20], [4, 20], [3, 20], [2, 20], [1, 20]];
    return `<div class="escala-marco">
      <div class="escala">${tramos.map(([n, ancho]) => `<span style="width:${ancho}%;background:${UI.COLOR_NIVEL[n]}"></span>`).join('')}</div>
      <div class="marcador" style="left:${r.puntaje.toFixed(1)}%"></div></div>
      <div class="escala-rotulos"><span>Menor urgencia</span><span>Puntaje difuso ${r.puntaje.toFixed(1)}</span><span>Mayor urgencia</span></div>`;
  }

  function pintarResultado(entrada, r, texto) {
    const nivel = T.NIVELES[r.nivelFinal];
    const explicacion = T.explicar(r);
    const contrastes = T.contrastar(entrada, r, texto);
    const opciones = [1, 2, 3, 4, 5].map((n) => `<option value="${n}" ${n === r.nivelFinal ? 'selected' : ''}>Triage ${T.NIVELES[n].romano}</option>`).join('');

    $('#resultado').innerHTML = `
      <div class="tarjeta nivel nivel-${r.nivelFinal} color-${r.nivelFinal}">
        <div class="nivel-romano">${nivel.romano}</div>
        <div>
          <h2>${esc(nivel.nombre)} ${r.provisional ? '<span class="chip">Provisional</span>' : ''}</h2>
          <p class="tiempo">${esc(nivel.tiempo)}</p>
          <p class="accion">${esc(nivel.accion)}</p>
        </div>
      </div>
      <div class="tarjeta">
        ${escala(r)}
        ${contrastes.map((c) => `<div class="alerta"><strong>Revise lo dicho frente a lo registrado</strong>${esc(c.mensaje)}</div>`).join('')}
        <h3>¿Por qué este nivel?</h3>
        <ol class="pasos">${explicacion.pasos.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>
        ${bloqueReglas(r)}
        ${bloquePertenencias(r)}
        ${bloqueCurva(r)}
        <p class="ayuda" style="margin-top:10px">Calculado en ${r.tiempoMs.toFixed(1)} ms. Grupo: ${esc(T.GRUPOS[r.grupo].nombre)}.</p>
      </div>
      <div class="tarjeta">
        <h2>Decisión del profesional</h2>
        <p class="ayuda">La sugerencia no es definitiva. Si cambia el nivel, deje el motivo sin datos personales.</p>
        <div class="decision">
          <div class="campo"><label for="nivel-decidido">Nivel decidido</label><select id="nivel-decidido">${opciones}</select></div>
          <div class="campo"><label for="motivo">Motivo del cambio</label><input type="text" id="motivo" maxlength="160"></div>
        </div>
        <p id="error-decision" class="error" role="alert" hidden>Indique el motivo del cambio de nivel.</p>
        <div class="acciones"><button type="button" id="a-cola" class="boton principal">Agregar a la cola</button></div>
      </div>`;
  }

  function calcular() {
    if (!validar()) return;
    const entrada = leerFormulario();
    const texto = $('#texto-paciente').value;
    const resultado = T.inferir(entrada);
    ultimo = { codigo: codigoActual(), resultado };
    pintarResultado(entrada, resultado, texto);
    if (window.matchMedia('(max-width: 980px)').matches) $('#resultado').scrollIntoView();
  }

  function agregarACola() {
    const decidido = Number($('#nivel-decidido').value);
    const motivo = $('#motivo').value.trim();
    const sugerido = ultimo.resultado.nivelFinal;
    if (decidido !== sugerido && !motivo) {
      $('#error-decision').hidden = false;
      return;
    }
    UI.cola.agregar({
      codigo: ultimo.codigo, sugerido, decidido, motivo: decidido === sugerido ? '' : motivo,
      puntaje: ultimo.resultado.puntaje, grupo: ultimo.resultado.grupo
    });
    consecutivo += 1;
    ultimo = null;
    $('#codigo-paciente').textContent = codigoActual();
    limpiar();
    $('#resultado').innerHTML = '<div class="tarjeta vacio"><h2>Paciente agregado</h2><p>Revise la pestaña Cola o valore al siguiente paciente.</p></div>';
    window.scrollTo(0, 0);
  }

  document.addEventListener('DOMContentLoaded', () => {
    pintarCampos();
    pintarBanderas();
    pintarAntecedentes();
    pintarFrases();
    pintarEjemplos();

    $('#formulario').addEventListener('submit', (ev) => {
      ev.preventDefault();
      calcular();
    });
    $('#limpiar').addEventListener('click', limpiar);
    $('#ejemplo').addEventListener('change', (ev) => cargarCaso(ev.target.value));
    $('#texto-paciente').addEventListener('input', pintarInterpretaciones);
    $('#frases').addEventListener('click', (ev) => {
      const frase = ev.target.dataset.frase;
      if (!frase) return;
      const caja = $('#texto-paciente');
      caja.value = caja.value ? `${caja.value}. ${frase}` : frase;
      pintarInterpretaciones();
    });
    $('#resultado').addEventListener('click', (ev) => {
      if (ev.target.id === 'a-cola') agregarACola();
    });
  });
})(globalThis);
