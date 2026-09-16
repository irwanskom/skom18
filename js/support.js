document.addEventListener('DOMContentLoaded', () => {
  const waFloat = document.querySelector('.wa-float');
  if (!waFloat) return;

  const waNumber = '6281343640048';
  const quickOptions = [
    { label: 'Sertifikasi Halal Pangan', text: "Assalamu'alaikum, saya ingin konsultasi sertifikasi halal untuk produk pangan." },
    { label: 'Sertifikasi Halal Kosmetik', text: "Assalamu'alaikum, saya ingin konsultasi sertifikasi halal untuk produk kosmetik." },
    { label: 'Sertifikasi Halal Produk Kimia', text: "Assalamu'alaikum, saya ingin konsultasi sertifikasi halal untuk produk kimia." },
    { label: 'Pertanyaan Umum', text: "Assalamu'alaikum, saya ingin bertanya seputar layanan Signature Halal." },
  ];

  const panel = document.createElement('div');
  panel.className = 'support-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Chat dengan Signature Halal');
  panel.innerHTML = `
    <div class="support-panel-head">
      <span>Chat dengan Kami</span>
      <button type="button" class="support-panel-close" aria-label="Tutup">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <p class="support-panel-sub">Pilih topik agar kami bisa langsung membantu, atau kirim pesan bebas.</p>
    <div class="support-panel-options">
      ${quickOptions.map(opt =>
        `<a href="https://wa.me/${waNumber}?text=${encodeURIComponent(opt.text)}" target="_blank" rel="noopener">
          <i class="fa-brands fa-whatsapp"></i> ${opt.label}
        </a>`
      ).join('')}
    </div>
  `;
  waFloat.insertAdjacentElement('afterend', panel);

  const openClass = 'open';
  const closePanel = () => {
    panel.classList.remove(openClass);
    waFloat.setAttribute('aria-expanded', 'false');
  };
  const togglePanel = (e) => {
    e.preventDefault();
    const willOpen = !panel.classList.contains(openClass);
    panel.classList.toggle(openClass, willOpen);
    waFloat.setAttribute('aria-expanded', String(willOpen));
  };

  waFloat.setAttribute('aria-expanded', 'false');
  waFloat.setAttribute('aria-haspopup', 'dialog');
  waFloat.addEventListener('click', togglePanel);
  panel.querySelector('.support-panel-close').addEventListener('click', closePanel);

  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !waFloat.contains(e.target)) closePanel();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });
});
