// Mapa interactivo de la arquitectura, adaptado del ejemplo del curso al sistema difuso.
(function (raiz) {
  const T = raiz.Triaje;
  const { $, $$, esc } = T.ui;

  const ejemploRegla = () => T.textoRegla(T.reglas.find((r) => r.id === 'R04'));

  const MODULOS = {
    interfaz: {
      zona: 'usuario', nombre: 'Interfaz de usuario', corto: 'Captura signos, síntomas y expresiones del paciente.',
      descripcion: 'Formulario que usa el personal durante el triaje. Acepta datos incompletos y no pide nombres ni documentos.',
      puntos: ['Campos por signo vital, con rangos válidos.', 'Ayuda para aclarar expresiones ambiguas.', 'Decisión final a cargo del profesional.'],
      ejemplo: () => JSON.stringify({ edad: 67, dolor: 2, fc: 118, pas: 96, texto: 'Me duele leve' }, null, 2)
    },
    explicacion: {
      zona: 'usuario', nombre: 'Subsistema de explicación', corto: 'Responde por qué se sugirió cada nivel.',
      descripcion: 'Traduce el cálculo en reglas, grados de pertenencia y pasos legibles. El enunciado exige esta transparencia.',
      puntos: ['Muestra la regla y su fuerza.', 'Indica cuándo actuó el piso de seguridad.', 'Avisa qué datos faltaron.', 'Contrasta lo dicho con lo medido.'],
      ejemplo: () => `La regla R38 tuvo fuerza 1.00:\n${T.textoRegla(T.reglas.find((r) => r.id === 'R38'))}.`
    },
    motor: {
      zona: 'nucleo', nombre: 'Motor de inferencia difusa', corto: 'Mamdani en dos capas con piso de seguridad.',
      descripcion: 'Aplica la secuencia de la inferencia difusa con encadenamiento hacia adelante: de los signos a los compromisos y de ahí a la prioridad.',
      puntos: ['Fuzzificación según grupo etario.', 'Y = mínimo, O = máximo.', 'Agregación por máximo.', 'Defuzzificación por centroide.', 'Piso de seguridad por banderas y reglas críticas.'],
      ejemplo: () => 'signos → fuzzificar → capa 1 (compromisos)\n      → capa 2 (prioridad) → agregar\n      → centroide → piso de seguridad → nivel'
    },
    base: {
      zona: 'nucleo', nombre: 'Base de conocimiento', corto: `${T.reglas.length} reglas, variables, banderas y ontología.`,
      descripcion: 'Conocimiento permanente y separado del motor. Cada regla conserva su fuente.',
      puntos: ['Funciones de pertenencia por grupo etario.', 'Ajuste de SpO₂ por altitud.', 'Ontología de síntomas y urgencias.'],
      ejemplo: ejemploRegla
    },
    hechos: {
      zona: 'nucleo', nombre: 'Base de hechos', corto: 'Datos del paciente y compromisos deducidos.',
      descripcion: 'Memoria de trabajo de una valoración. Se borra al cerrar la página.',
      puntos: ['Guarda grados de pertenencia.', 'Recibe lo deducido por la capa 1.', 'Marca los datos faltantes.'],
      ejemplo: () => 'spo2.baja = 0.50\nfr.alta = 0.67\nrespiratorio.grave = 0.50 (R04)'
    },
    adquisicion: {
      zona: 'desarrollo', nombre: 'Adquisición de conocimiento', corto: 'Matriz que une expresiones, umbrales y fuentes.',
      descripcion: 'Traduce la norma, las guías y el lenguaje del paciente a variables y reglas. Está documentada en docs/matriz_adquisicion.md.',
      puntos: ['Resolución 5596 de 2015 para los niveles.', 'NEWS2, PALS y AIEPI para los umbrales.', 'MinSalud/OPS para SpO₂ en altitud.'],
      ejemplo: () => '"no respira bien"\n  → disnea, obstrucción nasal, ansiedad o dolor torácico\n  → medir SpO₂ y frecuencia respiratoria'
    },
    roles: {
      zona: 'desarrollo', nombre: 'Personal y experto', corto: 'Validan el conocimiento y deciden en cada caso.',
      descripcion: 'El sistema apoya, pero no decide. El personal registra si acepta o modifica el nivel sugerido.',
      puntos: ['Baja complejidad: auxiliar con supervisión médica (art. 8).', 'Un experto debe revisar las reglas antes de cualquier uso real.'],
      ejemplo: () => 'Sugerido: Triage III\nDecidido: Triage II\nMotivo: mala apariencia general'
    }
  };

  const ZONAS = [
    ['usuario', 'ENTORNO DE USUARIO', 'Datos y preguntas ↕ prioridad y explicación'],
    ['nucleo', 'NÚCLEO DE RAZONAMIENTO', 'Ingeniería del conocimiento ↕ actualización de reglas'],
    ['desarrollo', 'ENTORNO DE DESARROLLO', null]
  ];

  function seleccionar(id) {
    const m = MODULOS[id];
    $$('.modulo').forEach((b) => b.classList.toggle('activo', b.dataset.modulo === id));
    $('#inspector').innerHTML = `<h2>${esc(m.nombre)}</h2>
      <p class="ayuda" style="margin-top:6px">${esc(m.descripcion)}</p>
      <ul>${m.puntos.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
      <h3>Ejemplo</h3><pre>${esc(m.ejemplo())}</pre>`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const zonas = ZONAS.map(([zona, rotulo, flujo]) => {
      const modulos = Object.entries(MODULOS).filter(([, m]) => m.zona === zona);
      return `<div class="zona ${zona}"><p>${rotulo}</p><div class="modulos">
        ${modulos.map(([id, m]) => `<button class="modulo" data-modulo="${id}"><strong>${esc(m.nombre)}</strong><span>${esc(m.corto)}</span></button>`).join('')}
        </div></div>${flujo ? `<p class="flujo">${esc(flujo)}</p>` : ''}`;
    }).join('');

    $('#vista-arquitectura').innerHTML = `<div class="mapa">
      <div class="tarjeta"><h2>Arquitectura del sistema experto</h2>
        <p class="ayuda">Seleccione un módulo para ver su función.</p>${zonas}</div>
      <div class="tarjeta inspector" id="inspector"></div></div>`;

    $('#vista-arquitectura').addEventListener('click', (ev) => {
      const boton = ev.target.closest('.modulo');
      if (boton) seleccionar(boton.dataset.modulo);
    });
    seleccionar('motor');
  });
})(globalThis);
