// Pestaña de validación: corre los 20 casos en vivo con el mismo código de las pruebas.
(function (raiz) {
  const T = raiz.Triaje;
  const { $, esc } = T.ui;
  const UI = T.ui;

  function metrica(valor, nombre) {
    return `<div class="metrica"><strong>${esc(valor)}</strong><span>${esc(nombre)}</span></div>`;
  }

  function matriz(m) {
    const romanos = [1, 2, 3, 4, 5].map((n) => T.NIVELES[n].romano);
    const celda = (valor, i, j) => {
      const clase = !valor ? '' : i === j ? 'acierto' : j > i ? 'sub' : 'sobre';
      return `<td class="${clase}">${valor}</td>`;
    };
    return `<div class="tabla-marco"><table class="matriz">
      <thead><tr><th>Esperado \\ Obtenido</th>${romanos.map((r) => `<th>${r}</th>`).join('')}</tr></thead>
      <tbody>${m.map((fila, i) => `<tr><th>${romanos[i]}</th>${fila.map((v, j) => celda(v, i, j)).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="ayuda" style="margin-top:6px">Amarillo: sobretriaje, el sistema fue más urgente de lo esperado. Rojo: subtriaje, el error más grave.</p>`;
  }

  function tipoError(fila) {
    if (fila.esperado === fila.obtenido) return '';
    return `<span class="proximo">${fila.obtenido < fila.esperado ? 'Sobretriaje' : 'Subtriaje'}</span>`;
  }

  function tablaCasos(filas) {
    return `<div class="tabla-marco"><table>
      <thead><tr><th>Caso</th><th>Descripción</th><th>Esperado</th><th>Obtenido</th><th>Puntaje</th><th>Motivo del nivel esperado</th></tr></thead>
      <tbody>${filas.map((f) => `<tr>
        <td class="mono">${f.caso.id}</td><td>${esc(f.caso.descripcion)}</td>
        <td>${UI.insignia(f.esperado)}</td>
        <td>${UI.insignia(f.obtenido)} ${tipoError(f)}</td>
        <td class="mono">${f.puntaje === null ? '-' : f.puntaje.toFixed(1)}</td>
        <td>${esc(f.caso.razon)}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function sesgos(s) {
    return `<h3>Por grupo etario</h3>
      <div class="tabla-marco"><table><thead><tr><th>Grupo</th><th>Casos</th><th>Concordantes</th><th>Subtriaje</th></tr></thead>
      <tbody>${s.porGrupo.map((g) => `<tr><td>${esc(g.nombre)}</td><td>${g.n}</td><td>${g.aciertos}</td><td>${g.subtriaje}</td></tr>`).join('')}</tbody></table></div>
      <p class="ayuda" style="margin-top:6px">Con tan pocos casos por grupo, estas cifras no permiten afirmar equidad. Sirven como alerta.</p>
      <h3>Datos no clínicos</h3>
      <p>Se repitió cada caso cambiando sexo, vereda y escolaridad: ${s.invarianza.pruebas} corridas, ${s.invarianza.cambios.length} cambios de resultado. Estos datos no son variables del sistema. Esto no descarta un sesgo indirecto, por ejemplo en cómo un paciente expresa el dolor.</p>
      <h3>Mismos signos, distinta edad</h3>
      <p class="ayuda">Dolor ${s.signosFijos.dolor}, ${s.signosFijos.temperatura} °C, FC ${s.signosFijos.fc}, FR ${s.signosFijos.fr}, PAS ${s.signosFijos.pas}, SpO₂ ${s.signosFijos.spo2} %. La diferencia es esperada: cada grupo tiene sus propios rangos.</p>
      <div class="tabla-marco"><table><thead><tr><th>Edad</th><th>Grupo</th><th>Nivel</th><th>Puntaje</th></tr></thead>
      <tbody>${s.porEdad.map((e) => `<tr><td>${e.edad}</td><td>${esc(e.grupo)}</td><td>${UI.insignia(e.nivel)}</td><td class="mono">${e.puntaje.toFixed(1)}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function pintar() {
    const filas = T.correrCasos(T.casosValidacion);
    const m = T.calcularMetricas(filas);
    $('#vista-validacion').innerHTML = `
      <div class="tarjeta">
        <h2>Validación con ${m.total} casos sintéticos</h2>
        <p class="ayuda">Tercera ronda, con casos difíciles a propósito. Los niveles esperados los fijó el equipo con las definiciones del art. 5, antes de correr los casos, y estos no se usaron para calibrar. No los revisó un profesional de salud: las cifras no demuestran eficacia clínica.</p>
        <div class="mosaico">
          ${metrica(UI.porcentaje(m.concordancia), 'Concordancia exacta')}
          ${metrica(m.kappa.toFixed(2), 'Kappa ponderado')}
          ${metrica(UI.porcentaje(m.sensibilidadAltos), 'Sensibilidad en Triage I y II')}
          ${metrica(UI.porcentaje(m.subtriaje), 'Subtriaje')}
          ${metrica(UI.porcentaje(m.sobretriaje), 'Sobretriaje')}
          ${metrica(UI.porcentaje(m.explicabilidad), 'Resultados con explicación')}
          ${metrica(`${m.tiempoPromedioMs.toFixed(1)} ms`, 'Tiempo promedio')}
        </div>
      </div>
      <div class="tarjeta"><h2>Matriz de confusión</h2><div style="margin-top:8px">${matriz(m.matriz)}</div></div>
      <div class="tarjeta"><h2>Casos</h2><div style="margin-top:8px">${tablaCasos(filas)}</div></div>
      <div class="tarjeta"><h2>Análisis de sesgos</h2>${sesgos(T.analizarSesgos(T.casosValidacion))}</div>`;
  }

  UI.alAbrir.validacion = pintar;
})(globalThis);
