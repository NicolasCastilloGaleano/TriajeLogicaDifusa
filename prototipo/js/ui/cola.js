// Cola de atención. Vive solo en memoria: nada se guarda en el navegador.
(function (raiz) {
  const T = raiz.Triaje;
  const UI = T.ui;

  const AVISO_MINUTOS_II = 20;
  const LIMITE_MINUTOS_II = 30;

  const pacientes = [];

  function ordenar(a, b) {
    return a.decidido - b.decidido || (b.puntaje ?? -1) - (a.puntaje ?? -1) || a.llegada - b.llegada;
  }

  function celdaEspera(p, ahora) {
    const minutos = Math.floor((ahora - p.llegada) / 60000);
    if (p.decidido === 1) return '<span class="vencido">Inmediata</span>';
    if (p.decidido === 2) {
      if (minutos >= LIMITE_MINUTOS_II) return `<span class="vencido">${minutos} min: superó 30 min</span>`;
      if (minutos >= AVISO_MINUTOS_II) return `<span class="proximo">${minutos} min: cerca del límite</span>`;
    }
    return `${minutos} min`;
  }

  function pintar() {
    const contador = UI.$('#contador-cola');
    contador.textContent = pacientes.length;
    contador.hidden = pacientes.length === 0;

    const destino = UI.$('#cola');
    if (!pacientes.length) {
      destino.innerHTML = '<p class="vacio">No hay pacientes en espera. Agréguelos desde la pestaña Triaje.</p>';
      return;
    }
    const ahora = Date.now();
    const filas = pacientes.slice().sort(ordenar).map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td class="mono">${UI.esc(p.codigo)}</td>
        <td>${UI.insignia(p.decidido)}</td>
        <td>${UI.insignia(p.sugerido)}</td>
        <td class="mono">${p.puntaje === null ? '-' : p.puntaje.toFixed(1)}</td>
        <td>${UI.esc(T.GRUPOS[p.grupo].nombre)}</td>
        <td>${celdaEspera(p, ahora)}</td>
        <td>${UI.esc(p.motivo) || '<span class="ayuda">Aceptó la sugerencia</span>'}</td>
        <td><button class="boton pequeno" data-atender="${UI.esc(p.codigo)}">Atendido</button></td>
      </tr>`).join('');
    destino.innerHTML = `<div class="tabla-marco"><table>
      <thead><tr><th>#</th><th>Código</th><th>Nivel decidido</th><th>Sugerido</th><th>Puntaje</th><th>Grupo</th><th>Espera</th><th>Cambio del profesional</th><th></th></tr></thead>
      <tbody>${filas}</tbody></table></div>`;
  }

  UI.cola = {
    agregar(paciente) {
      pacientes.push({ ...paciente, llegada: Date.now() });
      pintar();
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    pintar();
    UI.$('#cola').addEventListener('click', (ev) => {
      const codigo = ev.target.dataset.atender;
      if (!codigo) return;
      pacientes.splice(pacientes.findIndex((p) => p.codigo === codigo), 1);
      pintar();
    });
    setInterval(pintar, 15000);
  });
})(globalThis);
