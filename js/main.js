document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------- Theme -- */

  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');

  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = () =>
    root.getAttribute('data-theme') || (systemDark.matches ? 'dark' : 'light');

  const paintToggle = () => {
    if (!themeToggle) return;
    const dark = currentTheme() === 'dark';
    const icon = themeToggle.querySelector('i');
    if (icon) icon.className = dark ? 'fa-regular fa-sun' : 'fa-regular fa-moon';
    themeToggle.setAttribute(
      'aria-label',
      dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'
    );
  };

  paintToggle();
  systemDark.addEventListener('change', paintToggle);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('sh-theme', next); } catch (e) {}
      paintToggle();
    });
  }

  /* ------------------------------------------- Navbar state, no scroll -- */

  const nav = document.getElementById('nav');
  if (nav && 'IntersectionObserver' in window) {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;height:1px;width:1px;';
    document.body.prepend(sentinel);

    new IntersectionObserver(
      ([entry]) => nav.classList.toggle('is-stuck', !entry.isIntersecting),
      { threshold: 0 }
    ).observe(sentinel);
  }

  /* -------------------------------------------------------- Mobile menu -- */

  const navToggle = document.getElementById('nav-toggle');
  const navPanel = document.getElementById('nav-panel');

  const closeMenu = () => {
    if (!navToggle || !navPanel) return;
    navPanel.hidden = true;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Buka menu navigasi');
  };

  if (navToggle && navPanel) {
    navToggle.addEventListener('click', () => {
      const open = navPanel.hidden;
      navPanel.hidden = !open;
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
    });

    navPanel.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }

  /* ------------------------------------------------------ Nav scrollspy -- */

  const linksByHash = new Map();
  document.querySelectorAll('.nav-links a[href^="#"]').forEach((a) => {
    linksByHash.set(a.getAttribute('href'), a);
  });

  const sections = document.querySelectorAll('section[id]');
  if ('IntersectionObserver' in window && sections.length && linksByHash.size) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = linksByHash.get('#' + entry.target.id);
          if (!link || !entry.isIntersecting) return;
          linksByHash.forEach((l) => l.classList.remove('is-active'));
          link.classList.add('is-active');
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ------------------------------------------------- Reveal on enter -- */

  const revealEls = document.querySelectorAll('[data-reveal]');

  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealEls.forEach((el) => el.classList.add('is-in'));
  } else {
    const stagger = new Map();
    revealEls.forEach((el) => {
      const parent = el.parentElement;
      const index = stagger.get(parent) || 0;
      stagger.set(parent, index + 1);
      el.style.transitionDelay = Math.min(index * 60, 300) + 'ms';
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------ Contact form to WhatsApp -- */

  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = document.getElementById('form-submit');
  const status = document.getElementById('form-status');

  const setFieldError = (input, show) => {
    const field = input.closest('.field');
    const error = field && field.querySelector('.field-error');
    if (!field) return;
    if (show) field.setAttribute('data-invalid', ''); else field.removeAttribute('data-invalid');
    if (error) error.hidden = !show;
    input.setAttribute('aria-invalid', String(show));
  };

  form.querySelectorAll('input[required]').forEach((input) => {
    input.addEventListener('input', () => {
      if (input.value.trim()) setFieldError(input, false);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const required = [...form.querySelectorAll('input[required]')];
    let firstInvalid = null;

    required.forEach((input) => {
      const empty = !input.value.trim();
      setFieldError(input, empty);
      if (empty && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      if (status) status.textContent = '';
      firstInvalid.focus();
      return;
    }

    const data = new FormData(form);
    const value = (key) => String(data.get(key) || '').trim();

    const lines = [
      "Assalamu'alaikum, saya ingin konsultasi sertifikasi halal.",
      'Nama: ' + value('name'),
      'Perusahaan: ' + (value('company') || '-'),
      'No. HP: ' + value('phone'),
      'Layanan: ' + value('service'),
      'Pesan: ' + (value('message') || '-')
    ];

    if (submitBtn) {
      submitBtn.setAttribute('data-busy', '');
      submitBtn.textContent = 'Membuka WhatsApp';
    }

    const url = 'https://wa.me/6281343640048?text=' + encodeURIComponent(lines.join('\n'));
    const opened = window.open(url, '_blank', 'noopener');

    if (status) {
      status.textContent = opened
        ? 'Pesan Anda siap dikirim di WhatsApp.'
        : 'Popup diblokir browser. Hubungi kami langsung di 0813-4364-0048.';
    }

    if (opened) form.reset();

    window.setTimeout(() => {
      if (!submitBtn) return;
      submitBtn.removeAttribute('data-busy');
      submitBtn.textContent = 'Kirim via WhatsApp';
    }, 1200);
  });
});
