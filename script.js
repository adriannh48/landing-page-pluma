(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatValue = (el, value) => {
    if (el.dataset.format === 'percent') return `${Math.round(value)}%`;
    return brl.format(value / 100).replace(/\u00a0/g, ' ');
  };

  // Contagem animada: o texto do HTML já traz o valor final (vale para quem não roda JS).
  function countUp(el) {
    const target = Number(el.dataset.count);
    const delay = Number(el.dataset.delay || 0);
    const duration = 1200;
    el.textContent = formatValue(el, 0);
    setTimeout(() => {
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = formatValue(el, target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
  }

  // Sequências (mockups): tocam quando entram na tela e repetem em loop enquanto visíveis.
  const sequences = document.querySelectorAll('.seq');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    sequences.forEach((seq) => seq.classList.add('play'));
  } else {
    const timers = new WeakMap();

    const play = (seq) => {
      seq.classList.remove('play');
      void seq.offsetWidth; // reinicia as animações CSS
      seq.classList.add('play');
      seq.querySelectorAll('[data-count]').forEach(countUp);
    };

    const loop = (seq, visible) => {
      clearInterval(timers.get(seq));
      if (!visible) return;
      play(seq);
      timers.set(seq, setInterval(() => play(seq), Number(seq.dataset.loop || 10000)));
    };

    const seqObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => loop(entry.target, entry.isIntersecting)),
      { threshold: 0.35 },
    );
    sequences.forEach((seq) => seqObserver.observe(seq));
  }

  // Entrada suave dos blocos ao rolar a página.
  const revealTargets = document.querySelectorAll('[data-reveal], .section h2, .section-lead, .benefit, .how, .plan, .faq details, .cta, .demo-text, .demo-visual');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((el) => el.classList.add('in'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }),
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    revealTargets.forEach((el) => revealObserver.observe(el));
  }

  // Sombra no cabeçalho depois que a página rola.
  const header = document.querySelector('.header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
