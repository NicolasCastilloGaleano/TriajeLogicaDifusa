// Expresiones coloquiales del enunciado. Cada una trae sus interpretaciones, la medición que la
// aclara y un contraste entre lo dicho y lo medido. Nunca cambian el resultado por sí solas:
// el personal confirma cada interpretación.
(function (raiz) {
  const T = (raiz.Triaje = raiz.Triaje || {});

  const hay = (v) => v !== null && v !== undefined && v !== '';

  T.expresiones = [
    {
      id: 'dolor_leve', frase: 'Me duele leve', claves: ['duele leve', 'dolor leve', 'poquito dolor', 'duele poquito'],
      interpretaciones: ['Dolor 2/10', 'Dolor 6/10 en alguien que lo minimiza'],
      aclarar: 'Pida un número de 0 a 10 y observe la expresión del paciente.',
      contrastar(e, r) {
        if (!hay(e.dolor)) return 'Dice "leve", pero falta la escala numérica de dolor.';
        if (e.dolor >= 5) return `Dice "leve", pero el dolor registrado es ${e.dolor}/10.`;
        if (r.nivelFinal <= 2) return 'Dice "leve", pero los signos vitales indican alta urgencia: el paciente puede estar minimizando.';
        return null;
      }
    },
    {
      id: 'fiebre_alta', frase: 'Tengo fiebre alta', claves: ['fiebre alta', 'mucha fiebre', 'ardiendo'],
      interpretaciones: ['Percepción subjetiva de calor', '38,5 °C o más medidos'],
      aclarar: 'Mida la temperatura.',
      contrastar(e) {
        if (!hay(e.temperatura)) return 'Dice tener fiebre alta, pero falta medir la temperatura.';
        if (e.temperatura < 37.8) return `Dice tener fiebre alta, pero la medición es ${e.temperatura} °C. Pregunte si tomó antipiréticos.`;
        return null;
      }
    },
    {
      id: 'no_respira', frase: 'No respira bien', claves: ['no respira', 'no puedo respirar', 'me ahogo', 'falta el aire', 'falta aire'],
      interpretaciones: ['Disnea', 'Obstrucción nasal', 'Ansiedad', 'Dolor torácico'],
      aclarar: 'Mida SpO₂ y frecuencia respiratoria, y observe el trabajo respiratorio.',
      contrastar(e) {
        if (!hay(e.spo2) || !hay(e.fr)) return 'Refiere dificultad para respirar, pero faltan SpO₂ o frecuencia respiratoria.';
        if (e.respiracion === 'normal') return 'Refiere dificultad para respirar, pero el trabajo respiratorio se registró normal. Descarte obstrucción nasal o ansiedad y reevalúe.';
        return null;
      }
    },
    {
      id: 'decaido', frase: 'Estoy decaído', claves: ['decaido', 'decaida', 'sin fuerzas', 'desanimado'],
      interpretaciones: ['Cansancio', 'Enfermedad febril', 'En un niño: letargo con signos de alarma'],
      aclarar: 'En niños evalúe si despierta bien, si come y si responde. Marque la bandera de letargo si aplica.',
      contrastar(e) {
        if (hay(e.edad) && e.edad < 12 && !(e.banderas || []).includes('letargo_nino')) return 'En un niño, "decaído" puede ser letargo. Confirme si despierta y come con normalidad.';
        return null;
      }
    },
    {
      id: 'presion', frase: 'Se me subió la presión', claves: ['subio la presion', 'presion alta', 'presion subida'],
      interpretaciones: ['Crisis hipertensiva', 'Cefalea o mareo atribuidos a la presión'],
      aclarar: 'Mida la presión arterial.',
      contrastar(e) {
        if (!hay(e.pas)) return 'Dice que le subió la presión, pero falta medirla.';
        if (e.pas < 140) return `Dice que le subió la presión, pero la sistólica es ${e.pas} mmHg. Busque otra causa del malestar.`;
        return null;
      }
    },
    {
      id: 'ataque', frase: 'Me dio un ataque', claves: ['ataque'],
      interpretaciones: ['Convulsión', 'Crisis de ansiedad', 'Desmayo', 'Evento cerebrovascular'],
      aclarar: 'Pregunte qué vieron los acompañantes y cuánto duró. Marque la bandera que corresponda.',
      contrastar(e) {
        const relacionadas = ['convulsion_activa', 'convulsion_reciente', 'sincope', 'deficit_neurologico'];
        if (!(e.banderas || []).some((b) => relacionadas.includes(b))) return '"Ataque" es ambiguo: falta precisar si fue convulsión, desmayo, déficit neurológico o ansiedad.';
        return null;
      }
    },
    {
      id: 'mareo', frase: 'Tengo mareo', claves: ['mareo', 'mareado', 'mareada'],
      interpretaciones: ['Vértigo', 'Presión baja', 'Deshidratación', 'Presíncope'],
      aclarar: 'Mida presión y frecuencia cardiaca. Pregunte si hubo desmayo.',
      contrastar(e) {
        if (!hay(e.pas) || !hay(e.fc)) return 'Refiere mareo, pero faltan presión o frecuencia cardiaca.';
        return null;
      }
    },
    {
      id: 'no_aguanto', frase: 'No aguanto el dolor', claves: ['no aguanto', 'no soporto', 'insoportable'],
      interpretaciones: ['Dolor severo o extremo', 'Angustia asociada al dolor'],
      aclarar: 'Pida un número de 0 a 10 y observe si el dolor limita movimiento o habla.',
      contrastar(e) {
        if (!hay(e.dolor)) return 'Dice no aguantar el dolor, pero falta la escala numérica.';
        if (e.dolor < 7) return `Dice no aguantar el dolor, pero se registró ${e.dolor}/10. Confirme el puntaje.`;
        return null;
      }
    },
    {
      id: 'malestar_vago', frase: 'Me siento raro', claves: ['me siento rar', 'me siento mal', 'malestar', 'indigestion'],
      interpretaciones: ['Malestar sin importancia', 'Infección inicial', 'Síndrome coronario atípico'],
      aclarar: 'Pregunte por sudoración, náuseas, falta de aire o dolor en mandíbula o brazo. Las presentaciones atípicas son más comunes en mujeres, adultos mayores y personas con diabetes.',
      contrastar(e) {
        if (!(e.banderas || []).includes('coronario_atipico')) return 'Malestar poco específico: descarte síntomas coronarios atípicos antes de asignar baja prioridad.';
        return null;
      }
    },
    {
      id: 'pecho_brazo', frase: 'Me duele el pecho y se corre al brazo', claves: ['corre al brazo', 'pecho y', 'dolor de pecho', 'duele el pecho'],
      interpretaciones: ['Posible síndrome coronario', 'Dolor osteomuscular'],
      aclarar: 'Marque la bandera si el dolor se irradia. Si hay dudas, consulte con el hospital de referencia.',
      contrastar(e) {
        if (!(e.banderas || []).includes('dolor_toracico')) return 'Refiere dolor de pecho y no está marcada la bandera de dolor torácico. Confírmelo antes de continuar.';
        return null;
      }
    }
  ];

  function normalizar(texto) {
    return String(texto || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  T.buscarExpresiones = function (texto) {
    const limpio = normalizar(texto);
    return T.expresiones.filter((x) => x.claves.some((c) => limpio.includes(c)));
  };

  // Devuelve solo las discrepancias entre lo dicho y lo registrado.
  T.contrastar = function (entrada, resultado, texto) {
    return T.buscarExpresiones(texto)
      .map((x) => ({ expresion: x.frase, mensaje: x.contrastar(entrada, resultado) }))
      .filter((x) => x.mensaje);
  };
})(globalThis);
