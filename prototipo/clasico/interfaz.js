// Interfaz de la versión con reglas nítidas.
(function (raiz) {
  const T = raiz.Triaje;
  const $ = (s) => document.querySelector(s);
  const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ENTIDADES[c]);

  const NUMERICOS = ['edad', 'dolor', 'temperatura', 'fc', 'fr', 'pas', 'spo2'];

  function pintarFormulario() {
    const numericos = NUMERICOS.map((id) => {
      const v = T.variables[id];
      return `<div class="campo"><label for="n-${id}">${esc(v.nombre)} <span class="unidad">(${esc(v.unidad)})</span></label>
        <input type="number" id="n-${id}" step="any" min="${v.dominio[0]}" max="${v.dominio[1]}"></div>`;
    }).join('');
    const opciones = Object.entries(T.variables.conciencia.terminos).map(([t, d]) => `<option value="${t}">${esc(d.etiqueta)}</option>`).join('');
    $('#campos').innerHTML = `${numericos}<div class="campo"><label for="n-conciencia">Nivel de conciencia</label>
      <select id="n-conciencia"><option value="">Sin evaluar</option>${opciones}</select></div>`;
    $('#lista-banderas').innerHTML = T.banderas.filter((b) => !b.derivada).map((b) => `<label class="bandera">
      <input type="checkbox" name="bandera" value="${b.id}"><span>${esc(b.etiqueta)}<em>mínimo Triage ${T.NIVELES[b.nivel].romano}</em></span></label>`).join('');
  }

  function leer() {
    const e = { banderas: Array.from(document.querySelectorAll('input[name="bandera"]:checked')).map((c) => c.value) };
    for (const id of NUMERICOS) e[id] = $(`#n-${id}`).value === '' ? null : Number($(`#n-${id}`).value);
    e.conciencia = $('#n-conciencia').value || null;
    return e;
  }

  function pintarResultado(e) {
    const r = T.clasificarNitido(e);
    const n = T.NIVELES[r.nivel];
    const avisos = [];
    if (e.edad !== null && e.edad < 12) avisos.push('Los cortes son de adultos: en niños este resultado no es confiable.');
    if (r.faltantes.length) avisos.push(`Sin medir: ${r.faltantes.map((f) => T.variables[f].nombre.toLowerCase()).join(', ')}. Esta versión simplemente ignora esas reglas.`);
    for (const b of r.banderas) if (b.nivel < r.nivelReglas) avisos.push(`La bandera "${b.etiqueta}" subió el nivel a Triage ${T.NIVELES[b.nivel].romano}.`);

    $('#resultado').innerHTML = `
      <div class="tarjeta nivel color-${r.nivel} nivel-${r.nivel}">
        <div class="nivel-romano">${n.romano}</div>
        <div><h2>${esc(n.nombre)}</h2><p class="tiempo">${esc(n.tiempo)}</p></div>
      </div>
      <div class="tarjeta">
        <h3>Regla que decidió</h3>
        <div class="regla"><div class="regla-cabecera"><span>${r.regla.id}</span></div><div class="regla-texto">${esc(r.regla.texto)}</div></div>
        ${avisos.map((a) => `<div class="alerta">${esc(a)}</div>`).join('')}
      </div>`;
    document.querySelectorAll('#tabla-reglas tr[data-regla]').forEach((tr) => tr.classList.toggle('activa', tr.dataset.regla === r.regla.id));
  }

  function pintarEscalon() {
    const base = { edad: 30, dolor: 0, fc: 75, fr: 16, pas: 118, spo2: 95, conciencia: 'alerta', banderas: [] };
    const filas = [37.9, 38.0].map((t) => {
      const r = T.clasificarNitido({ ...base, temperatura: t });
      return `<tr><td>${t.toFixed(1)} °C</td><td><span class="insignia color-${r.nivel}">${T.NIVELES[r.nivel].romano}</span></td><td class="mono">${r.regla.id}</td></tr>`;
    }).join('');
    $('#escalon').innerHTML = `<div class="tabla-marco"><table><thead><tr><th>Temperatura</th><th>Nivel</th><th>Regla</th></tr></thead><tbody>${filas}</tbody></table></div>`;
  }

  function pintarBase() {
    $('#tabla-reglas').innerHTML = Object.entries(T.reglasNitidas).map(([id, r]) => `<tr data-regla="${id}"><td class="mono">${id}</td><td>${esc(r.texto)}</td></tr>`).join('');

    const variables = Object.entries(T.variables).map(([, v]) => {
      const terminos = v.porGrupo ? v.porGrupo.adulto : v.terminos;
      return `<tr><td>${esc(v.nombre)}</td><td>${esc(Object.values(terminos).map((t) => t.etiqueta).join(', '))}</td><td>${v.porGrupo ? 'Sí' : 'No'}</td></tr>`;
    }).join('');
    $('#tabla-variables').innerHTML = variables;

    const hijos = (padre) => T.ontologia.clases.filter((c) => c.padre === padre);
    const rama = (c) => `<li><code>${c.id}</code> <span>${esc(c.descripcion)}</span>${hijos(c.id).length ? `<ul>${hijos(c.id).map(rama).join('')}</ul>` : ''}</li>`;
    $('#ontologia').innerHTML = hijos(null).map(rama).join('');

    $('#tabla-expresiones').innerHTML = T.expresiones.map((x) => `<tr><td>"${esc(x.frase)}"</td><td>${esc(x.interpretaciones.join(', '))}</td><td>${esc(x.aclarar)}</td></tr>`).join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    pintarFormulario();
    pintarBase();
    pintarEscalon();
    $('#formulario').addEventListener('submit', (ev) => {
      ev.preventDefault();
      pintarResultado(leer());
    });
  });
})(globalThis);
