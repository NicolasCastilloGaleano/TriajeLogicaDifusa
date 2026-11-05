// Pestaña que muestra la base de conocimiento: variables, reglas, banderas y ontología.
(function (raiz) {
  const T = raiz.Triaje;
  const { $, $$, esc } = T.ui;
  const UI = T.ui;

  const numericas = () => Object.keys(T.variables).filter((id) => T.variables[id].tipo === 'numerica');

  function pintarGrafica() {
    const id = $('#b-variable').value;
    const grupo = $('#b-grupo').value;
    const v = T.variables[id];
    const series = UI.seriesDeTerminos(T.terminosDe(id, grupo), v.dominio);
    const crudo = $('#b-valor').value;
    const valor = crudo === '' ? null : Number(crudo);
    $('#b-grupo').disabled = !v.porGrupo;
    $('#b-grafica').innerHTML = UI.grafica({ series, dominio: v.dominio, marca: valor, rotuloMarca: valor === null ? '' : `${valor} ${v.unidad}` }) + UI.leyenda(series);
    if (valor === null) {
      $('#b-grados').innerHTML = '';
      return;
    }
    const terminos = T.terminosDe(id, grupo);
    const x = Math.min(v.dominio[1], Math.max(v.dominio[0], valor));
    $('#b-grados').innerHTML = Object.keys(terminos).map((t) => {
      const g = T.difuso.pertenencia(terminos[t].mf, x);
      return `<div class="barra-fila"><span>${esc(terminos[t].etiqueta)}</span><div class="barra"><i style="width:${(g * 100).toFixed(0)}%"></i></div><span class="valor">${g.toFixed(2)}</span></div>`;
    }).join('');
  }

  function vistaVariables() {
    const opciones = numericas().map((id) => `<option value="${id}">${esc(T.variables[id].nombre)}</option>`).join('');
    const grupos = Object.keys(T.GRUPOS).map((id) => `<option value="${id}" ${id === 'adulto' ? 'selected' : ''}>${esc(T.GRUPOS[id].nombre)}</option>`).join('');
    return `<div class="barra-herramientas">
        <div><label for="b-variable">Variable</label><select id="b-variable">${opciones}</select></div>
        <div><label for="b-grupo">Grupo etario</label><select id="b-grupo">${grupos}</select></div>
        <div><label for="b-valor">Probar un valor</label><input type="number" id="b-valor" step="any"></div>
      </div>
      <div id="b-grafica"></div><div id="b-grados"></div>
      <p class="ayuda" style="margin-top:10px">Conciencia y trabajo respiratorio son categóricas: valen 1 en el término seleccionado y 0 en los demás.</p>`;
  }

  function vistaReglas() {
    const opciones = '<option value="">Todas las capas</option><option value="1">Capa 1: signos a compromisos</option><option value="2">Capa 2: compromisos a prioridad</option>';
    return `<div class="barra-herramientas">
        <div><label for="r-capa">Capa</label><select id="r-capa">${opciones}</select></div>
        <div><label for="r-texto">Buscar</label><input type="text" id="r-texto" placeholder="Ejemplo: saturación"></div>
      </div>
      <p class="ayuda"><span id="r-total"></span></p>
      <div class="tabla-marco"><table><thead><tr><th>Regla</th><th>Capa</th><th>Enunciado</th><th>Fuente</th></tr></thead><tbody id="r-filas"></tbody></table></div>`;
  }

  function filtrarReglas() {
    const capa = $('#r-capa').value;
    const texto = $('#r-texto').value.toLowerCase();
    const filas = T.reglas.filter((r) => (!capa || String(r.capa) === capa) && T.textoRegla(r).toLowerCase().includes(texto));
    $('#r-total').textContent = `${filas.length} de ${T.reglas.length} reglas`;
    $('#r-filas').innerHTML = filas.map((r) => `<tr><td class="mono">${r.id}</td><td>${r.capa}</td><td>${esc(T.textoRegla(r))}</td><td>${esc(r.fuente)}</td></tr>`).join('');
  }

  function vistaBanderas() {
    const filas = T.banderas.slice().sort((a, b) => a.nivel - b.nivel).map((b) => `
      <tr><td>${esc(b.etiqueta)}</td><td>${esc(b.grupo)}</td><td>${UI.insignia(b.nivel)}</td><td>${b.derivada ? 'Se calcula con edad y temperatura' : 'La marca el personal'}</td></tr>`).join('');
    return `<p class="ayuda">Cada bandera fija un nivel mínimo: el puntaje difuso no puede dejar al paciente por debajo de él.</p>
      <div class="tabla-marco"><table><thead><tr><th>Bandera</th><th>Grupo</th><th>Mínimo</th><th>Origen</th></tr></thead><tbody>${filas}</tbody></table></div>`;
  }

  function vistaOntologia() {
    const { clases, relaciones } = T.ontologia;
    const hijos = (padre) => clases.filter((c) => c.padre === padre);
    const rama = (c) => {
      const sub = hijos(c.id);
      return `<li><code>${c.id}</code> <span>${esc(c.descripcion)}</span>${sub.length ? `<ul>${sub.map(rama).join('')}</ul>` : ''}</li>`;
    };
    return `<h3>Clases</h3><ul class="arbol">${hijos(null).map(rama).join('')}</ul>
      <h3>Relaciones</h3>
      <div class="tabla-marco"><table><thead><tr><th>Relación</th><th>De</th><th>Hacia</th><th>Significado</th></tr></thead>
      <tbody>${relaciones.map((r) => `<tr><td class="mono">${r.id}</td><td class="mono">${r.dominio}</td><td class="mono">${r.rango}</td><td>${esc(r.descripcion)}</td></tr>`).join('')}</tbody></table></div>`;
  }

  const SECCIONES = {
    variables: ['Variables difusas', vistaVariables],
    reglas: ['Reglas', vistaReglas],
    banderas: ['Banderas rojas', vistaBanderas],
    ontologia: ['Ontología', vistaOntologia]
  };

  function abrirSeccion(id) {
    $$('.subpestana').forEach((b) => b.classList.toggle('activa', b.dataset.seccion === id));
    $('#b-contenido').innerHTML = SECCIONES[id][1]();
    if (id === 'variables') pintarGrafica();
    if (id === 'reglas') filtrarReglas();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const vista = $('#vista-base');
    vista.innerHTML = `<div class="tarjeta">
      <h2>Base de conocimiento</h2>
      <p class="ayuda">El conocimiento está separado del motor: cambiar una regla no exige tocar el algoritmo.</p>
      <div class="subpestanas">${Object.entries(SECCIONES).map(([id, [nombre]]) => `<button class="subpestana" data-seccion="${id}">${nombre}</button>`).join('')}</div>
      <div id="b-contenido"></div></div>`;
    abrirSeccion('variables');

    vista.addEventListener('click', (ev) => {
      if (ev.target.dataset.seccion) abrirSeccion(ev.target.dataset.seccion);
    });
    vista.addEventListener('input', (ev) => {
      if (ev.target.id.startsWith('b-')) pintarGrafica();
      if (ev.target.id.startsWith('r-')) filtrarReglas();
    });
  });
})(globalThis);
