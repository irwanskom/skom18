document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const success = document.querySelector('.form-success');
  if (!form || !success) return;

  const namaEl = document.getElementById('nama');
  const waEl = document.getElementById('wa');
  const sektorEl = document.getElementById('sektor');
  const pesanEl = document.getElementById('pesan');
  const submitBtn = form.querySelector('.btn-submit');
  const resetBtn = success.querySelector('.btn-reset');

  const isReady = () => namaEl.value.trim().length > 1 && waEl.value.trim().length > 7;

  const updateSubmitState = () => {
    const ready = isReady();
    submitBtn.disabled = !ready;
    submitBtn.classList.toggle('is-ready', ready);
  };

  [namaEl, waEl].forEach(el => el.addEventListener('input', updateSubmitState));
  updateSubmitState();

  const buildWaLink = () => {
    const lines = [
      "Halo Signature Halal, saya ingin konsultasi sertifikasi halal.",
      namaEl.value.trim() ? "Nama: " + namaEl.value.trim() : "",
      sektorEl.value ? "Sektor: " + sektorEl.value : "",
      pesanEl.value.trim() ? "Kebutuhan: " + pesanEl.value.trim() : ""
    ].filter(Boolean);
    return "https://wa.me/6281343640048?text=" + encodeURIComponent(lines.join("\n"));
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!isReady()) return;
    window.open(buildWaLink(), "_blank", "noopener");
    form.hidden = true;
    success.hidden = false;
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      updateSubmitState();
      success.hidden = true;
      form.hidden = false;
    });
  }
});
