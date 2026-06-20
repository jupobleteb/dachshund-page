/* Trivia salchichera — dos niveles: Dueños y Veterinarios.
   Cada acierto estira a tu perro. */
(function () {
  const BANKS = {
    dueno: {
      label: "Dueños",
      emoji: "🐾",
      intro: "Para fans y dueños de la raza.",
      unit: "cm de sabiduría salchichera",
      questions: [
        { q: "¿Para qué fueron criados originalmente los perros salchicha?",
          options: ["Para cazar tejones", "Para pastorear ovejas", "Para tirar de trineos", "Para rescates en agua"],
          answer: 0, fact: "Por eso su cuerpo bajo y largo: cabía perfecto en las madrigueras." },
        { q: "¿En qué país se desarrolló la raza?",
          options: ["Francia", "Alemania", "Inglaterra", "Rusia"],
          answer: 1, fact: "\"Dachshund\" es una palabra alemana de pura cepa." },
        { q: "¿Qué significa \"Dachshund\" en alemán?",
          options: ["Perro veloz", "Perro pequeño", "Perro-tejón", "Perro guardián"],
          answer: 2, fact: "Dachs = tejón, Hund = perro. Literal." },
        { q: "¿Cuál es el problema de salud más asociado a su espalda larga?",
          options: ["Problemas de cadera", "Enfermedad del disco (IVDD)", "Sordera", "Problemas de visión"],
          answer: 1, fact: "La IVDD es el motivo #1 para cuidar saltos y peso." },
        { q: "¿Cuántos tipos de pelaje tiene la raza?",
          options: ["Uno", "Dos", "Tres", "Cinco"],
          answer: 2, fact: "Liso, largo y duro (wirehaired)." },
        { q: "¿Qué es lo MÁS recomendable para proteger su columna?",
          options: ["Que salte mucho para ejercitarse", "Mantenerlo en su peso ideal", "Subir y bajar escaleras seguido", "Cargarlo solo por las patas delanteras"],
          answer: 1, fact: "El sobrepeso multiplica la presión sobre sus discos." },
        { q: "¿Cuánto suele vivir un perro salchicha bien cuidado?",
          options: ["4 a 6 años", "7 a 9 años", "12 a 16 años", "20 a 25 años"],
          answer: 2, fact: "Son perros longevos: ¡muchos años de compañía!" },
        { q: "¿Cuál fue la primera mascota oficial de unos Juegos Olímpicos?",
          options: ["Un oso", "Un dachshund llamado Waldi", "Un águila", "Un tigre"],
          answer: 1, fact: "Waldi, en los Juegos de Múnich 1972." },
        { q: "¿Cómo conviene cargar a una salchicha?",
          options: ["Solo del pecho, colgando", "Sosteniendo pecho y cuartos traseros", "Por la cola", "Tomándolo de las patas"],
          answer: 1, fact: "Apoya ambos extremos para no forzar la columna." },
        { q: "¿Qué patrón de pelaje moteado es típico de la raza?",
          options: ["Atigrado", "Dálmata", "Dapple", "Rayado"],
          answer: 2, fact: "El \"dapple\" da esos preciosos manchones irregulares." },
        { q: "¿Cuáles son los dos tamaños oficiales más reconocidos?",
          options: ["Toy y gigante", "Estándar y miniatura", "Pequeño y mediano", "Junior y senior"],
          answer: 1, fact: "Estándar y miniatura (algunos estándares añaden el tamaño 'conejo')." },
        { q: "Para que baje del sofá sin dañarse la espalda, lo ideal es…",
          options: ["Que salte siempre", "Ponerle una rampa o escaleritas", "Cargarlo de la cola", "Dejarlo en el suelo"],
          answer: 1, fact: "Las rampas evitan impactos repetidos en sus discos." },
        { q: "¿Cómo se describe mejor el carácter típico de la raza?",
          options: ["Tímido y perezoso", "Valiente y testarudo", "Indiferente", "Miedoso siempre"],
          answer: 1, fact: "Fueron criados para enfrentar tejones: pura actitud." },
        { q: "¿Qué evento divertido reúne a muchos salchichas?",
          options: ["Carreras de salchichas (Wiener Nationals)", "Saltos de altura", "Natación sincronizada", "Carreras de relevos"],
          answer: 0, fact: "Decenas de salchichas corriendo cortito: pura ternura." },
        { q: "¿Qué señal indica un peso saludable en un salchicha?",
          options: ["Que no se le palpen las costillas", "Cintura marcada y costillas fáciles de palpar", "Barriga redonda", "Que pese lo más posible"],
          answer: 1, fact: "Cintura visible desde arriba = buen estado corporal." }
      ]
    },
    vet: {
      label: "Veterinarios",
      emoji: "🩺",
      intro: "Nivel clínico. Solo para quienes saben de verdad.",
      unit: "cm de criterio clínico",
      questions: [
        { q: "La IVDD en razas condrodistróficas como el Dachshund corresponde típicamente a:",
          options: ["Hernia de Hansen tipo I (extrusión)", "Hernia de Hansen tipo II (protrusión)", "Hernia de Hansen tipo III (explosiva traumática)", "Discoespondilitis"],
          answer: 0, fact: "La degeneración condroide favorece la extrusión aguda del núcleo (Hansen I)." },
        { q: "¿Qué hallazgo genético se asocia a la condrodistrofia y al riesgo de IVDD en la raza?",
          options: ["Mutación en el gen MDR1", "Retrogén FGF4 insertado en el cromosoma 12", "Deleción en el gen SOD1", "Mutación en DLA clase II"],
          answer: 1, fact: "El retrogén FGF4 (CFA12) explica patas cortas y predisposición discal (Brown et al., 2017)." },
        { q: "En la escala neurológica modificada, el grado 5 (V) de IVDD toracolumbar se define por:",
          options: ["Dolor sin déficit", "Ataxia ambulatoria", "Paraplejía no ambulatoria con micción conservada", "Paraplejía con ausencia de percepción de dolor profundo"],
          answer: 3, fact: "Grado V = paraplejía + pérdida de nocicepción profunda: el peor escenario." },
        { q: "Factor pronóstico negativo más determinante para la recuperación quirúrgica en IVDD grado V:",
          options: ["Edad del paciente", "Ausencia de dolor profundo por más de 48 h", "Peso corporal", "Sexo del paciente"],
          answer: 1, fact: "Perder nocicepción profunda >48 h reduce drásticamente la tasa de recuperación." },
        { q: "Estudio de imagen de elección para diagnosticar y localizar una hernia discal:",
          options: ["Radiografía simple", "Ecografía abdominal", "Resonancia magnética", "Mielografía siempre como primera opción"],
          answer: 2, fact: "La RM define mejor médula, disco y planificación quirúrgica." },
        { q: "El cruce de dos ejemplares dapple (doble merle) se asocia principalmente a:",
          options: ["Sordera y defectos oculares (microftalmia/ceguera)", "Enanismo hipofisario", "Megaesófago", "Criptorquidia"],
          answer: 0, fact: "El doble merle eleva el riesgo de sordera congénita y anomalías oculares." },
        { q: "¿A qué endocrinopatía está particularmente predispuesto el Dachshund?",
          options: ["Hipotiroidismo exclusivamente", "Hiperadrenocorticismo (Cushing)", "Diabetes insípida central", "Hipoparatiroidismo"],
          answer: 1, fact: "Es una de las razas con mayor predisposición a Cushing." },
        { q: "Manejo conservador apropiado de una IVDD grado 1–2 (dolor/ataxia leve):",
          options: ["Cirugía descompresiva inmediata", "Reposo estricto en jaula 4–6 semanas más analgesia", "Ejercicio forzado para fortalecer", "Corticoides a dosis altas de forma prolongada"],
          answer: 1, fact: "El reposo estricto con control del dolor es la base del manejo médico." },
        { q: "Enfermedad por almacenamiento (epilepsia mioclónica) frecuente en el Teckel miniatura de pelo duro:",
          options: ["Enfermedad de Lafora (NHLRC1/EPM2B)", "Leucodistrofia de células globoides", "Gangliosidosis GM1", "Ceroidolipofuscinosis CLN2"],
          answer: 0, fact: "La enfermedad de Lafora tiene una prevalencia notable en esta variedad." },
        { q: "La PRA tipo cord1 descrita en el Dachshund miniatura de pelo largo se asocia al gen:",
          options: ["PRCD", "RPGRIP1", "RHO", "BEST1"],
          answer: 1, fact: "cord1-PRA se vincula a una mutación en RPGRIP1." },
        { q: "Técnica quirúrgica descompresiva más habitual para hernia discal toracolumbar:",
          options: ["Laminectomía dorsal amplia de rutina", "Hemilaminectomía", "Disectomía percutánea", "Estabilización con tornillos siempre"],
          answer: 1, fact: "La hemilaminectomía permite acceso lateral al canal y retirar el material extruido." },
        { q: "El tipo de degeneración del disco característico de las razas condrodistróficas es:",
          options: ["Metaplasia fibroide", "Metaplasia/degeneración condroide", "Calcificación distrófica aislada", "Degeneración mucoide pura"],
          answer: 1, fact: "La degeneración condroide precoz predispone a la extrusión (Hansen I)." },
        { q: "Localización anatómica más frecuente de las extrusiones discales en la raza:",
          options: ["Región cervical C1–C2", "Unión toracolumbar (aprox. T11–L3)", "Lumbosacra L7–S1", "Cráneo-cervical", ],
          answer: 1, fact: "La transición toracolumbar concentra la mayoría de las hernias clínicas." },
        { q: "¿A qué tipo de urolitiasis presenta predisposición racial el Dachshund?",
          options: ["Urato (por shunt portosistémico)", "Cistina", "Sílice", "Xantina"],
          answer: 1, fact: "Está entre las razas predispuestas a cálculos de cistina, sobre todo en machos." },
        { q: "La alopecia por dilución del color (color dilution alopecia) aparece sobre todo en ejemplares con pelaje:",
          options: ["Negro y fuego intenso", "Diluido (azul/isabela)", "Rojo sólido", "Dapple"],
          answer: 1, fact: "Los colores diluidos (azul, isabela) predisponen a esta displasia folicular." }
      ]
    }
  };

  const root = document.getElementById("trivia-app");
  if (!root) return;

  let bank = null, index = 0, score = 0, answered = false;

  function renderStart() {
    root.innerHTML = `
      <div class="trivia__card trivia__result">
        <h3>Elige tu nivel</h3>
        <p style="color:#6a584a;margin:6px 0 22px">Mismo perro, dos retos. ¿Hasta dónde llega tu salchicha?</p>
        <div class="trivia__modes">
          <button class="trivia__mode" data-bank="dueno">
            <span class="trivia__mode-emoji">🐾</span>
            <strong>Dueños</strong>
            <small>${BANKS.dueno.questions.length} preguntas · para fans de la raza</small>
          </button>
          <button class="trivia__mode trivia__mode--vet" data-bank="vet">
            <span class="trivia__mode-emoji">🩺</span>
            <strong>Veterinarios</strong>
            <small>${BANKS.vet.questions.length} preguntas · nivel clínico avanzado</small>
          </button>
        </div>
      </div>`;
    root.querySelectorAll(".trivia__mode").forEach((b) =>
      b.addEventListener("click", () => { bank = BANKS[b.dataset.bank]; index = 0; score = 0; renderQuestion(); })
    );
  }

  function dogProgressSVG(ratio) {
    const bodyW = 60 + ratio * 230;
    const headX = 70 + bodyW;
    return `
      <svg viewBox="0 0 420 120" class="result-dog" role="img" aria-label="Tu salchicha">
        <ellipse cx="220" cy="110" rx="170" ry="7" fill="rgba(0,0,0,.07)"/>
        <path d="M52 64 Q26 52 32 30" fill="none" stroke="#a86b3c" stroke-width="11" stroke-linecap="round"/>
        <rect x="74" y="80" width="14" height="34" rx="7" fill="#9c5f33"/>
        <rect x="${50 + bodyW - 30}" y="80" width="14" height="34" rx="7" fill="#9c5f33"/>
        <rect x="50" y="48" width="${bodyW}" height="44" rx="22" fill="#b0743f"/>
        <rect x="50" y="48" width="${bodyW}" height="18" rx="9" fill="#bd824c"/>
        <circle cx="${headX}" cy="62" r="28" fill="#b0743f"/>
        <rect x="${headX + 8}" y="58" width="38" height="22" rx="11" fill="#bd824c"/>
        <circle cx="${headX + 44}" cy="68" r="6" fill="#3a2a20"/>
        <path d="M${headX - 12} 38 Q${headX - 28} 33 ${headX - 30} 70 Q${headX - 12} 73 ${headX - 4} 48 Z" fill="#8a5329"/>
        <circle cx="${headX - 2}" cy="54" r="4" fill="#2a1d15"/>
      </svg>`;
  }

  function renderQuestion() {
    answered = false;
    const Q = bank.questions;
    const item = Q[index];
    root.innerHTML = `
      <div class="trivia__card">
        <p class="trivia__progress">${bank.emoji} ${bank.label} · Pregunta ${index + 1} de ${Q.length} · Aciertos: ${score}</p>
        <div class="trivia__dogbar"><div style="width:${(score / Q.length) * 100}%"></div></div>
        <h3 class="trivia__q">${item.q}</h3>
        <div class="trivia__options">
          ${item.options.map((o, i) => `<button class="trivia__opt" data-i="${i}">${o}</button>`).join("")}
        </div>
        <p class="trivia__feedback" id="triviaFeedback"></p>
        <div id="triviaNext"></div>
      </div>`;
    root.querySelectorAll(".trivia__opt").forEach((btn) =>
      btn.addEventListener("click", () => choose(parseInt(btn.dataset.i, 10)))
    );
  }

  function choose(i) {
    if (answered) return;
    answered = true;
    const Q = bank.questions;
    const item = Q[index];
    const opts = root.querySelectorAll(".trivia__opt");
    opts.forEach((b) => (b.disabled = true));
    opts[item.answer].classList.add("correct");

    const fb = document.getElementById("triviaFeedback");
    if (i === item.answer) {
      score++;
      fb.textContent = "✅ ¡Correcto! " + item.fact;
      fb.style.color = "#4f8a36";
    } else {
      opts[i].classList.add("wrong");
      fb.textContent = "❌ Casi. " + item.fact;
      fb.style.color = "#c0432a";
    }
    const barEl = root.querySelector(".trivia__dogbar > div");
    if (barEl) barEl.style.width = (score / Q.length) * 100 + "%";

    const last = index === Q.length - 1;
    document.getElementById("triviaNext").innerHTML =
      `<button class="btn btn--primary trivia__next" id="triviaNextBtn">${last ? "Ver resultado" : "Siguiente"}</button>`;
    document.getElementById("triviaNextBtn").addEventListener("click", () => {
      if (last) renderResult();
      else { index++; renderQuestion(); }
    });
  }

  function renderResult() {
    const Q = bank.questions;
    const ratio = score / Q.length;
    const cm = Math.round(20 + ratio * 80);
    let title, msg;
    if (bank.label === "Veterinarios") {
      if (ratio === 1) { title = "¡Eminencia clínica! 🏆"; msg = "Dominas la medicina del Dachshund de pe a pa."; }
      else if (ratio >= 0.73) { title = "Gran criterio clínico 🩺"; msg = "Nivel especialista, con detalles por pulir."; }
      else if (ratio >= 0.4) { title = "En residencia 📚"; msg = "Buena base; repasa IVDD y genética de la raza."; }
      else { title = "A repasar el temario 🔬"; msg = "Hay material que reforzar. ¡Vuelve a intentarlo!"; }
    } else {
      if (ratio === 1) { title = "¡Maestro tejonero! 🏅"; msg = "Sabes más de salchichas que el propio criador."; }
      else if (ratio >= 0.73) { title = "¡Gran salchichero! 🌭"; msg = "Te falta poquísimo para el récord."; }
      else if (ratio >= 0.4) { title = "Salchicha en formación 🐾"; msg = "Vas por buen camino, repasa la sección de salud."; }
      else { title = "Cachorro novato 🍼"; msg = "¡A leer más sobre la raza y vuelve a intentarlo!"; }
    }

    root.innerHTML = `
      <div class="trivia__card trivia__result">
        <p class="trivia__score">${score}/${Q.length}</p>
        <h3>${title}</h3>
        <p class="trivia__measure">Tu salchicha mide ${cm} ${bank.unit}</p>
        ${dogProgressSVG(ratio)}
        <p>${msg}</p>
        <div class="trivia__result-btns">
          <button class="btn btn--primary" id="triviaRetry">Repetir nivel</button>
          <button class="btn btn--ghost" id="triviaChange">Cambiar de nivel</button>
        </div>
      </div>`;
    document.getElementById("triviaRetry").addEventListener("click", () => { index = 0; score = 0; renderQuestion(); });
    document.getElementById("triviaChange").addEventListener("click", renderStart);
  }

  renderStart();
})();
