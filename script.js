const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const WA_NUMBER = document.documentElement.dataset.whatsapp || '972557128536';

function buildWhatsAppUrl(message) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

function openWhatsApp(message) {
  window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
}

function defaultMessage() {
  return 'שלום Mirox Labs הגעתי דרך האתר ואני רוצה לשמוע פרטים';
}

/* ─── WhatsApp links ─── */
document.querySelectorAll('#waFab, #heroWa, #navWa, #trustWa, #footerWa, #servicesWa, #resultsWa').forEach((el) => {
  el.href = buildWhatsAppUrl(defaultMessage());
});

/* ─── Nav ─── */
const nav = document.getElementById('nav');
const ham = document.getElementById('ham');
const navMenu = document.getElementById('navMenu');

window.addEventListener('scroll', () => {
  nav.classList.toggle('nav--on', window.scrollY > 40);
  const p = document.getElementById('scrollProgress');
  if (p) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    p.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  }
}, { passive: true });

function closeMenu() {
  nav.classList.remove('nav--open');
  ham?.setAttribute('aria-expanded', 'false');
}

ham?.addEventListener('click', () => {
  const open = nav.classList.toggle('nav--open');
  ham.setAttribute('aria-expanded', open);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMenu();
    closeA11yPanel();
  }
});

/* ─── Accessibility menu ─── */
const a11yRoot = document.documentElement;
const a11yToggle = document.getElementById('a11yToggle');
const a11yPanel = document.getElementById('a11yPanel');
const a11yReset = document.getElementById('a11yReset');
const a11yOptions = document.querySelectorAll('[data-a11y-toggle]');
const a11yStorageKey = 'nexora-a11y';
const a11yClassByKey = {
  font: 'a11y-font',
  contrast: 'a11y-contrast',
  links: 'a11y-links',
  motion: 'a11y-reduced-motion',
};

function getStoredA11y() {
  try {
    return JSON.parse(localStorage.getItem(a11yStorageKey)) || {};
  } catch {
    return {};
  }
}

function storeA11y(settings) {
  try {
    localStorage.setItem(a11yStorageKey, JSON.stringify(settings));
  } catch {
    // Local storage can be unavailable in private browsing.
  }
}

function applyA11y(settings) {
  Object.entries(a11yClassByKey).forEach(([key, className]) => {
    a11yRoot.classList.toggle(className, Boolean(settings[key]));
  });
  a11yOptions.forEach((button) => {
    const key = button.dataset.a11yToggle;
    button.setAttribute('aria-pressed', settings[key] ? 'true' : 'false');
  });
}

function closeA11yPanel() {
  if (!a11yPanel || !a11yToggle) return;
  a11yPanel.hidden = true;
  a11yToggle.setAttribute('aria-expanded', 'false');
}

function toggleA11yPanel() {
  if (!a11yPanel || !a11yToggle) return;
  const isOpen = !a11yPanel.hidden;
  a11yPanel.hidden = isOpen;
  a11yToggle.setAttribute('aria-expanded', String(!isOpen));
}

let a11ySettings = getStoredA11y();
applyA11y(a11ySettings);

a11yToggle?.addEventListener('click', toggleA11yPanel);

a11yOptions.forEach((button) => {
  button.addEventListener('click', () => {
    const key = button.dataset.a11yToggle;
    a11ySettings = { ...a11ySettings, [key]: !a11ySettings[key] };
    applyA11y(a11ySettings);
    storeA11y(a11ySettings);
  });
});

a11yReset?.addEventListener('click', () => {
  a11ySettings = {};
  applyA11y(a11ySettings);
  storeA11y(a11ySettings);
});

document.addEventListener('click', (e) => {
  const a11y = document.getElementById('a11y');
  if (a11y && !a11y.contains(e.target)) closeA11yPanel();
});

/* ─── Reveal ─── */
const reveals = document.querySelectorAll('.reveal');
if (prefersReducedMotion) {
  reveals.forEach((el) => el.classList.add('reveal--on'));
} else {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal--on');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach((el) => obs.observe(el));
}

/* ─── Lightweight counters ─── */
const counters = document.querySelectorAll('[data-count]');
function animateCounter(el) {
  const target = Number(el.dataset.count);
  if (!Number.isFinite(target)) return;
  const prefix = el.textContent.trim().startsWith('+') ? '+' : '';
  if (prefersReducedMotion) {
    el.textContent = `${prefix}${target}`;
    return;
  }
  let current = 0;
  const step = Math.max(1, Math.round(target / 28));
  const timer = window.setInterval(() => {
    current = Math.min(target, current + step);
    el.textContent = `${prefix}${current}`;
    if (current >= target) window.clearInterval(timer);
  }, 34);
}
if (counters.length) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.45 });
  counters.forEach((counter) => counterObserver.observe(counter));
}

/* ─── Form → WhatsApp ─── */
const form = document.getElementById('leadForm');

const rules = {
  name: (v) => v.trim().length >= 2 || 'נא למלא שם וטלפון',
  phone: (v) => /^[\d\s\-+()]{9,}$/.test(v.trim()) || 'נא למלא שם וטלפון',
};

function setErr(id, msg) {
  const input = document.getElementById(id);
  const err = document.getElementById(`${id}-err`);
  if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  if (err) err.textContent = msg || '';
}

function validate(id) {
  const input = document.getElementById(id);
  const r = rules[id];
  if (!r) return true;
  if (!input) return true;
  const result = r(input.value);
  if (result === true) { setErr(id, ''); return true; }
  setErr(id, result);
  return false;
}

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (document.getElementById('hp')?.value) return;

  const status = document.getElementById('formStatus');
  let ok = true;
  ['name', 'phone'].forEach((f) => {
    if (!validate(f)) ok = false;
  });
  if (!ok) {
    if (status) status.textContent = 'נא למלא שם וטלפון';
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const company = document.getElementById('company')?.value.trim() || '';
  const service = document.getElementById('service')?.value || '';
  const details = document.getElementById('details')?.value.trim() || '';

  const msg = [
    'שלום Mirox Labs',
    'יש לי עניין בשירות שלכם',
    '',
    `שם: ${name}`,
    `טלפון: ${phone}`,
    `שם העסק: ${company || 'לא צוין'}`,
    `שירות: ${service || 'לא צוין'}`,
    `מה אתם צריכים: ${details || 'לא צוין'}`,
  ].join('\n');

  openWhatsApp(msg);
  if (status) status.textContent = 'תודה נחזור אליכם בהקדם';
});

/* ─── Smooth scroll ─── */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    closeMenu();
    const y = t.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
});
