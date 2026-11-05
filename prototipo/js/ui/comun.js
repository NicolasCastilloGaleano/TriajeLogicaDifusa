// Utilidades compartidas por las pestañas.
(function (raiz) {
  const T = raiz.Triaje;
  const UI = (T.ui = {});

  UI.$ = (selector, base = document) => base.querySelector(selector);
  UI.$$ = (selector, base = document) => Array.from(base.querySelectorAll(selector));

  const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  UI.esc = (texto) => String(texto ?? '').replace(/[&<>"']/g, (c) => ENTIDADES[c]);

  UI.insignia = (nivel) => `<span class="insignia color-${nivel}">${T.NIVELES[nivel].romano}</span>`;
  UI.porcentaje = (x) => `${(x * 100).toFixed(0)} %`;

  const COLORES = ['#22b8cf', '#a78bfa', '#f97316', '#22c55e', '#f472b6'];
  UI.COLOR_NIVEL = { 1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#22c55e', 5: '#3b82f6' };

  // Dibuja funciones de pertenencia o curvas ya calculadas sobre un eje común.
  UI.grafica = function ({ series, dominio, marca, rotuloMarca }) {
    const ancho = 560;
    const alto = 190;
    const m = { izq: 30, der: 12, sup: 12, inf: 24 };
    const X = (x) => m.izq + ((x - dominio[0]) / (dominio[1] - dominio[0])) * (ancho - m.izq - m.der);
    const Y = (y) => alto - m.inf - y * (alto - m.sup - m.inf);

    const rellenos = series.map((s, i) => {
      const color = s.color || COLORES[i % COLORES.length];
      const puntos = s.puntos.map((p) => `${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');
      const base = `${X(s.puntos[0].x).toFixed(1)},${Y(0)} ${puntos} ${X(s.puntos[s.puntos.length - 1].x).toFixed(1)},${Y(0)}`;
      return `<polygon points="${base}" fill="${color}" fill-opacity="${s.relleno ?? 0.14}"/>`
        + `<polyline points="${puntos}" fill="none" stroke="${color}" stroke-width="2"/>`;
    }).join('');

    const marcas = [0, 0.25, 0.5, 0.75, 1].map((f) => {
      const x = dominio[0] + f * (dominio[1] - dominio[0]);
      return `<text x="${X(x)}" y="${alto - 7}" text-anchor="middle">${Number(x.toFixed(1))}</text>`;
    }).join('');

    const linea = marca === undefined || marca === null ? '' : `
      <line x1="${X(marca)}" x2="${X(marca)}" y1="${m.sup}" y2="${Y(0)}" stroke="#fff" stroke-dasharray="4 3"/>
      <text x="${Math.min(X(marca) + 5, ancho - 90)}" y="${m.sup + 10}" style="fill:#fff">${UI.esc(rotuloMarca || '')}</text>`;

    return `<svg class="grafica" viewBox="0 0 ${ancho} ${alto}" role="img">
      <line class="eje" x1="${m.izq}" x2="${ancho - m.der}" y1="${Y(0)}" y2="${Y(0)}"/>
      <line class="eje" x1="${m.izq}" x2="${m.izq}" y1="${m.sup}" y2="${Y(0)}"/>
      <text x="${m.izq - 5}" y="${Y(1) + 4}" text-anchor="end">1</text>
      <text x="${m.izq - 5}" y="${Y(0) + 4}" text-anchor="end">0</text>
      ${rellenos}${linea}${marcas}
    </svg>`;
  };

  // Convierte términos en series con puntos de quiebre, para que los hombros se vean rectos.
  UI.seriesDeTerminos = function (terminos, dominio) {
    return Object.keys(terminos).map((id, i) => {
      const mf = terminos[id].mf;
      const puntos = [];
      const paso = (dominio[1] - dominio[0]) / 400;
      for (let x = dominio[0]; x <= dominio[1] + paso / 2; x += paso) puntos.push({ x, y: T.difuso.pertenencia(mf, x) });
      return { nombre: terminos[id].etiqueta, puntos, color: COLORES[i % COLORES.length] };
    });
  };

  UI.leyenda = (series) => `<div class="leyenda">${series.map((s) => `<span><i style="background:${s.color}"></i>${UI.esc(s.nombre)}</span>`).join('')}</div>`;

  function activarPestana(id) {
    UI.$$('.pestana').forEach((b) => b.classList.toggle('activa', b.dataset.pestana === id));
    UI.$$('.vista').forEach((v) => { v.hidden = v.id !== `vista-${id}`; });
    if (UI.alAbrir && UI.alAbrir[id]) UI.alAbrir[id]();
    window.scrollTo(0, 0);
  }

  UI.alAbrir = {};
  UI.activarPestana = activarPestana;

  document.addEventListener('DOMContentLoaded', () => {
    UI.$$('.pestana').forEach((b) => b.addEventListener('click', () => activarPestana(b.dataset.pestana)));
  });
})(globalThis);
