(() => {
  // app/carousel.ts
  function startCarousel(root) {
    const slides = Array.from(root.querySelectorAll(".sport-result"));
    let current = slides.findIndex((slide) => slide.getAttribute("aria-hidden") !== "true");
    const controls = new AbortController();
    const options = { signal: controls.signal };
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const toggle = root.querySelector("[data-play]");
    let paused = motion.matches;
    let timer;
    function schedule() {
      window.clearTimeout(timer);
      toggle.textContent = paused ? "Play" : "Pause";
      toggle.setAttribute("aria-label", paused ? "Play automatic slideshow" : "Pause automatic slideshow");
      if (!paused && !document.hidden) timer = window.setTimeout(() => step(1), 5e3);
    }
    function step(delta) {
      for (const slide of slides) {
        for (const animation of slide.getAnimations()) animation.cancel();
      }
      const outgoing = slides[current];
      current = (current + delta + slides.length) % slides.length;
      const incoming = slides[current];
      outgoing.setAttribute("aria-hidden", "true");
      incoming.setAttribute("aria-hidden", "false");
      if (!motion.matches) {
        const timing = { duration: 400, easing: "cubic-bezier(.32,.02,.22,1)" };
        const offset = (direction) => "translateX(" + direction * 125 + "%)";
        outgoing.animate([
          { transform: "translateX(0)", visibility: "visible" },
          { transform: offset(-delta), visibility: "visible" }
        ], timing);
        incoming.animate([{ transform: offset(delta) }, { transform: "translateX(0)" }], timing);
      }
      schedule();
    }
    const card = root.querySelector(".record");
    let touch = null;
    card.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "touch" || !event.isPrimary) {
        touch = null;
        return;
      }
      touch = { id: event.pointerId, x: event.clientX, y: event.clientY };
      card.setPointerCapture(event.pointerId);
      window.clearTimeout(timer);
    }, options);
    card.addEventListener("pointerup", (event) => {
      if (touch && event.pointerId === touch.id) {
        const dx = event.clientX - touch.x;
        const dy = event.clientY - touch.y;
        touch = null;
        if (Math.abs(dx) >= 42 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          step(dx < 0 ? 1 : -1);
          return;
        }
      }
      schedule();
    }, options);
    card.addEventListener("pointercancel", () => {
      touch = null;
      schedule();
    }, options);
    root.querySelector("[data-previous]").addEventListener("click", () => step(-1), options);
    root.querySelector("[data-next]").addEventListener("click", () => step(1), options);
    toggle.addEventListener("click", () => {
      paused = !paused;
      schedule();
    }, options);
    document.addEventListener("visibilitychange", schedule, options);
    motion.addEventListener("change", () => {
      paused = motion.matches;
      schedule();
    }, options);
    schedule();
    return () => {
      controls.abort();
      window.clearTimeout(timer);
    };
  }

  // <stdin>
  startCarousel(document.querySelector(".carousel"));
})();
