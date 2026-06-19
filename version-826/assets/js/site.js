const navToggle = document.querySelector('[data-nav-toggle]');
const siteNav = document.querySelector('[data-site-nav]');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

document.querySelectorAll('img[data-soft-fallback]').forEach((image) => {
  image.addEventListener('error', () => {
    image.classList.add('is-missing');
  });
});

const hero = document.querySelector('[data-hero-carousel]');

if (hero) {
  const slides = [...hero.querySelectorAll('[data-hero-slide]')];
  const dots = [...hero.querySelectorAll('[data-hero-dot]')];
  const previous = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  let active = 0;

  const showSlide = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === active);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === active);
    });
  };

  if (slides.length > 1) {
    previous?.addEventListener('click', () => showSlide(active - 1));
    next?.addEventListener('click', () => showSlide(active + 1));
    dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));
    window.setInterval(() => showSlide(active + 1), 5000);
  }
}

const filterForm = document.querySelector('[data-filter-form]');
const filterInput = document.querySelector('[data-filter-input]');
const typeSelect = document.querySelector('[data-filter-type]');
const yearSelect = document.querySelector('[data-filter-year]');
const resultCount = document.querySelector('[data-result-count]');
const noResults = document.querySelector('[data-no-results]');
const cards = [...document.querySelectorAll('.searchable-card')];

const filterCards = () => {
  if (!cards.length) {
    return;
  }

  const query = (filterInput?.value || '').trim().toLowerCase();
  const selectedType = typeSelect?.value || '';
  const selectedYear = yearSelect?.value || '';
  let visibleCount = 0;

  cards.forEach((card) => {
    const text = (card.getAttribute('data-text') || '').toLowerCase();
    const type = card.getAttribute('data-type') || '';
    const year = card.getAttribute('data-year') || '';
    const matchQuery = !query || text.includes(query);
    const matchType = !selectedType || type === selectedType;
    const matchYear = !selectedYear || year === selectedYear;
    const isVisible = matchQuery && matchType && matchYear;

    card.style.display = isVisible ? '' : 'none';
    if (isVisible) {
      visibleCount += 1;
    }
  });

  if (resultCount) {
    resultCount.textContent = String(visibleCount);
  }

  if (noResults) {
    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
  }
};

if (filterForm) {
  filterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    filterCards();
  });

  filterInput?.addEventListener('input', filterCards);
  typeSelect?.addEventListener('change', filterCards);
  yearSelect?.addEventListener('change', filterCards);

  const parameters = new URLSearchParams(window.location.search);
  const query = parameters.get('q');
  if (query && filterInput) {
    filterInput.value = query;
  }
  filterCards();
}
