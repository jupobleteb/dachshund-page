/* Efectos de página: length-o-meter, nav móvil y reveal al hacer scroll */
(function () {
  // --- Length-o-meter: la salchicha se estira con el scroll ---
  const fill = document.getElementById("lengthFill");
  const label = document.getElementById("lengthLabel");
  const DOG_CM = 40; // una salchicha "mide" ~40cm

  function onScroll() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop || window.scrollY) / max : 0;
    if (fill) fill.style.width = (pct * 100).toFixed(1) + "%";
    if (label) {
      const totalCm = max / 100 * DOG_CM;             // largo total del sitio en cm
      const doneCm = totalCm * pct;
      const dogs = (doneCm / DOG_CM).toFixed(1);
      label.textContent = `${dogs} salchichas recorridas`;
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  // --- Nav móvil ---
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  // --- Deep links: aterriza en la sección correcta al cargar con #ancla ---
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) requestAnimationFrame(() => target.scrollIntoView());
  }

  // --- Reveal al entrar en viewport ---
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    reveals.forEach((r) => io.observe(r));
  } else {
    reveals.forEach((r) => r.classList.add("is-visible"));
  }
})();
