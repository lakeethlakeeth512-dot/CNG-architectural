const header = document.getElementById('header');
const menuButton = document.getElementById('menuButton');
const navLinks = document.getElementById('navLinks');
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalClose = document.getElementById('modalClose');
const teamModal = document.getElementById('teamModal');
const teamModalImage = document.getElementById('teamModalImage');
const teamModalTitle = document.getElementById('teamModalTitle');
const teamModalDetails = document.getElementById('teamModalDetails');
const teamModalClose = document.getElementById('teamModalClose');
const projectForm = document.getElementById('project-form');
const orderSummary = {
  country: document.getElementById('summary-country'),
  service: document.getElementById('summary-service'),
  size: document.getElementById('summary-size'),
  unit: document.getElementById('summary-unit'),
  delivery: document.getElementById('summary-delivery'),
  addons: document.getElementById('summary-addons'),
  total: document.getElementById('summary-total')
};

const whatsappFloat = document.createElement('a');
whatsappFloat.className = 'whatsapp-float';
whatsappFloat.href = 'https://wa.me/94754567316';
whatsappFloat.target = '_blank';
whatsappFloat.rel = 'noopener noreferrer';
whatsappFloat.setAttribute('aria-label', 'Chat with CNG Architecture on WhatsApp');
whatsappFloat.setAttribute('data-tooltip', 'Chat on WhatsApp');
whatsappFloat.innerHTML = '<img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="">';
document.body.appendChild(whatsappFloat);

const emailFloat = document.createElement('a');
emailFloat.className = 'contact-float email-float';
emailFloat.href = 'https://mail.google.com/mail/?view=cm&fs=1&to=ahaath21%40gmail.com';
emailFloat.setAttribute('aria-label', 'Email CNG Architecture');
emailFloat.setAttribute('data-tooltip', 'Open Gmail');
emailFloat.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 5.5h18v13H3z"/><path d="m3.5 6 8.5 7 8.5-7"/></svg>';
document.body.appendChild(emailFloat);

let logoAnimationTimer;
let logoAnimationActive = false;

document.addEventListener('pointerdown', () => {
  if (logoAnimationActive) return;
  logoAnimationActive = true;
  document.body.classList.add('logo-touch');
  clearTimeout(logoAnimationTimer);
  logoAnimationTimer = window.setTimeout(() => {
    document.body.classList.remove('logo-touch');
    logoAnimationActive = false;
  }, 3000);
}, { passive: true });

projectForm?.addEventListener('submit', event => {
  event.preventDefault();
  if (!projectForm.reportValidity()) return;

  const formData = new FormData(projectForm);
  const channel = event.submitter?.value || 'gmail';
  const name = formData.get('name');
  const email = formData.get('email');
  const phone = formData.get('phone') || 'Not provided';
  const dialCode = formData.get('dialCode') || '';
  const country = formData.get('country') || 'Not selected';
  const service = formData.get('service') || 'Not selected';
  const size = formData.get('size') || 'Not selected';
  const unit = formData.get('unit') || 'Not selected';
  const delivery = formData.get('delivery') || 'Not selected';
  const addons = formData.getAll('addons');
  const files = [...projectForm.querySelector('[name="files"]').files].map(file => file.name);
  const message = formData.get('message');
  const total = calculateOrderTotal();
  const currency = getCurrencyDetails();
  const subject = `New project order from ${name}`;
  const body = [
    'New project order for CNG Architecture',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Country: ${country}`,
    `Customer phone: ${dialCode} ${phone}`,
    `Service: ${service}`,
    `Project size: ${size}`,
    `Measurement unit: ${unit}`,
    `Delivery: ${delivery}`,
    `Add-ons: ${addons.length ? addons.join(', ') : 'None'}`,
    `Estimated total: ${formatCurrency(total * currency.rate, currency.code)} (base USD estimate: $${total})`,
    `Selected files: ${files.length ? files.join(', ') : 'None'}`,
    '',
    'Project details:',
    message
  ].join('\n');
  if (channel === 'whatsapp') {
    const whatsappUrl = `https://wa.me/94754567316?text=${encodeURIComponent(body)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=ahaath21%40gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(gmailUrl, '_blank', 'noopener,noreferrer');
});

const getCheckedValue = name => projectForm?.querySelector(`input[name="${name}"]:checked`);
const getCurrencyDetails = () => {
  const countrySelect = projectForm?.querySelector('[name="country"]');
  const option = countrySelect?.selectedOptions[0];
  return { code: option?.dataset.currency || 'USD', rate: Number(option?.dataset.rate || 1), country: option?.value || 'Choose your country', dial: option?.dataset.dial || '+94' };
};

const formatCurrency = (amount, currencyCode) => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode, maximumFractionDigits: currencyCode === 'JPY' || currencyCode === 'KRW' || currencyCode === 'ISK' ? 0 : 2 }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
};

const calculateOrderTotal = () => {
  if (!projectForm) return 0;
  const service = getCheckedValue('service');
  const size = getCheckedValue('size');
  const delivery = projectForm.querySelector('[name="delivery"]');
  const addons = [...projectForm.querySelectorAll('[name="addons"]:checked')];
  return [service, size, delivery?.selectedOptions[0], ...addons]
    .reduce((total, item) => total + Number(item?.dataset.price || 0), 0);
};

const updateOrderSummary = () => {
  if (!projectForm || !orderSummary.total) return;
  const service = getCheckedValue('service');
  const size = getCheckedValue('size');
  const delivery = projectForm.querySelector('[name="delivery"]');
  const addons = [...projectForm.querySelectorAll('[name="addons"]:checked')].map(item => item.value);
  const currency = getCurrencyDetails();
  orderSummary.country.textContent = currency.country === 'Choose your country' ? currency.country : `${currency.country} (${currency.code})`;
  orderSummary.service.textContent = service?.value || 'Choose a service';
  orderSummary.size.textContent = size?.value || 'Choose a size';
  orderSummary.unit.textContent = projectForm.querySelector('[name="unit"]')?.value || 'Meter';
  orderSummary.delivery.textContent = delivery?.value || 'Standard';
  orderSummary.addons.textContent = addons.length ? addons.join(' + ') : 'None';
  orderSummary.total.textContent = formatCurrency(calculateOrderTotal() * currency.rate, currency.code);
};

const countrySelect = projectForm?.querySelector('[name="country"]');
const dialCodeSelect = projectForm?.querySelector('[name="dialCode"]');
countrySelect?.addEventListener('change', () => {
  const country = countrySelect.selectedOptions[0];
  dialCodeSelect.innerHTML = `<option value="${country.dataset.dial || '+94'}">${country.dataset.dial || '+94'}</option>`;
  updateOrderSummary();
});

projectForm?.addEventListener('input', updateOrderSummary);
projectForm?.addEventListener('change', updateOrderSummary);
updateOrderSummary();

if (header) window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 12), { passive: true });

menuButton?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});

navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}));

const currentPage = window.location.pathname.split('/').pop() || 'index.html';
navLinks?.querySelectorAll('a').forEach(link => {
  const linkPage = link.getAttribute('href')?.split('#')[0];
  if (linkPage === currentPage || (currentPage === 'index.html' && linkPage === '')) {
    link.setAttribute('aria-current', 'page');
  }
});

const revealItems = document.querySelectorAll('.section-head, .service, .approach-item, .team-card, .project, .page-card, .software-card, .faq-item, .content-grid');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(items => {
    items.forEach(item => {
      if (item.isIntersecting) {
        item.target.classList.add('is-visible');
        revealObserver.unobserve(item.target);
      }
    });
  }, { threshold: .12 });

  revealItems.forEach((item, index) => {
    item.classList.add('reveal');
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach(item => item.classList.add('is-visible'));
}

document.querySelectorAll('.gallery-item').forEach(item => item.addEventListener('click', () => {
  modalImage.src = item.dataset.image;
  modalImage.alt = item.querySelector('img').alt;
  modal.classList.add('open');
  modalClose.focus();
}));

let lastTeamTrigger;

const openTeamModal = card => {
  const image = card.querySelector('img');
  const role = card.querySelector('.team-role');
  const details = card.querySelector('p');
  if (!teamModal || !image || !role || !details) return;

  lastTeamTrigger = card;
  card.setAttribute('aria-label', `View details for ${role.textContent.trim()}`);
  teamModalImage.src = image.src;
  teamModalImage.alt = image.alt;
  teamModalTitle.textContent = role.textContent.trim();
  teamModalDetails.textContent = details.textContent.trim();
  teamModal.hidden = false;
  teamModalClose.focus();
};

document.querySelectorAll('.team-member').forEach(card => {
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.addEventListener('click', () => openTeamModal(card));
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openTeamModal(card);
    }
  });
});

const closeTeamModal = () => {
  if (!teamModal) return;
  teamModal.hidden = true;
  teamModalImage.src = '';
  lastTeamTrigger?.focus();
};

teamModalClose?.addEventListener('click', closeTeamModal);
teamModal?.addEventListener('click', event => {
  if (event.target === teamModal) closeTeamModal();
});

const closeModal = () => {
  modal.classList.remove('open');
  modalImage.src = '';
};

modalClose?.addEventListener('click', closeModal);
modal?.addEventListener('click', event => {
  if (event.target === modal) closeModal();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && modal?.classList.contains('open')) closeModal();
  if (event.key === 'Escape' && teamModal && !teamModal.hidden) closeTeamModal();
});
