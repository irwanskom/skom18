document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Preloader
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader && preloader.classList.add('hide'), 300);
  });

  // Navbar scroll state + scroll progress bar
  const navbar = document.querySelector('.navbar');
  const progressBar = document.querySelector('.scroll-progress span');
  const onScroll = () => {
    if (window.scrollY > 12) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    const backTop = document.querySelector('.back-top');
    if (backTop) backTop.classList.toggle('show', window.scrollY > 480);

    if (progressBar) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      progressBar.style.width = pct + '%';
    }
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Nav scrollspy: highlight the link for the section currently in view
  const sections = document.querySelectorAll('section[id]');
  const navLinkByHash = new Map();
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(a => {
    navLinkByHash.set(a.getAttribute('href'), a);
  });
  if ('IntersectionObserver' in window && sections.length && navLinkByHash.size) {
    const spyIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const link = navLinkByHash.get('#' + entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinkByHash.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(s => spyIo.observe(s));
  }

  // Hero slider: rotate headline/background through each site section
  const heroSlider = document.querySelector('.hero-slider');
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDots = document.querySelectorAll('.hero-dot');
  if (heroSlider && heroSlides.length && heroDots.length) {
    let currentSlide = 0;
    let heroTimer = null;

    const goToSlide = (index) => {
      currentSlide = (index + heroSlides.length) % heroSlides.length;
      heroSlides.forEach((slide, i) => slide.classList.toggle('is-active', i === currentSlide));
      heroDots.forEach((dot, i) => dot.classList.toggle('is-active', i === currentSlide));
    };

    const startHeroTimer = () => {
      if (prefersReducedMotion) return;
      stopHeroTimer();
      heroTimer = setInterval(() => goToSlide(currentSlide + 1), 5500);
    };
    const stopHeroTimer = () => {
      if (heroTimer) { clearInterval(heroTimer); heroTimer = null; }
    };

    heroDots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        goToSlide(i);
        startHeroTimer();
      });
    });

    heroSlider.addEventListener('mouseenter', stopHeroTimer);
    heroSlider.addEventListener('mouseleave', startHeroTimer);

    startHeroTimer();
  }

  // Mobile menu toggle
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  // Back to top
  const backTop = document.querySelector('.back-top');
  if (backTop) {
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Scroll reveal, staggered per group of siblings so grids/lists cascade in
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (!prefersReducedMotion) {
    const staggerCounts = new Map();
    revealEls.forEach(el => {
      const parent = el.parentElement;
      const idx = staggerCounts.get(parent) || 0;
      staggerCounts.set(parent, idx + 1);
      el.style.transitionDelay = Math.min(idx * 70, 420) + 'ms';
    });
  }
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // Animated counters for statistic numbers
  const countEls = document.querySelectorAll('[data-count-to]');
  if (countEls.length) {
    const animateCount = (el) => {
      const target = parseInt(el.getAttribute('data-count-to'), 10);
      if (isNaN(target)) return;
      if (prefersReducedMotion) { el.textContent = target; return; }
      const duration = 900;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      const countIo = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      countEls.forEach(el => countIo.observe(el));
    }
  }

  // Contact form -> WhatsApp handoff
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = data.get('name') || '';
      const company = data.get('company') || '';
      const phone = data.get('phone') || '';
      const service = data.get('service') || '';
      const message = data.get('message') || '';

      const text =
        `Assalamu'alaikum, saya ingin konsultasi sertifikasi halal.\n` +
        `Nama: ${name}\n` +
        `Perusahaan: ${company}\n` +
        `No. HP: ${phone}\n` +
        `Layanan: ${service}\n` +
        `Pesan: ${message}`;

      const waNumber = '6281343640048';
      window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank');
      form.reset();
    });
  }
});
