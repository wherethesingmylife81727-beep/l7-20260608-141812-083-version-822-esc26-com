(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function openSearch(query) {
    var target = './search.html';
    if (query) {
      target += '?q=' + encodeURIComponent(query);
    }
    window.location.href = target;
  }

  function bindMenu() {
    var button = qs('.menu-toggle');
    var panel = qs('.nav-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = panel.classList.toggle('open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function bindSearchForms() {
    qsa('.site-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"], input[type="search"]');
        openSearch(input ? input.value.trim() : '');
      });
    });
  }

  function filterCards(input) {
    var list = qs('.searchable-list');
    if (!list) {
      return;
    }
    var cards = qsa('.movie-card', list);
    var empty = qs('.empty-state');
    var value = normalize(input.value);
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year'),
        card.textContent
      ].join(' '));
      var matched = !value || haystack.indexOf(value) !== -1;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  function bindLocalFilter() {
    var input = qs('.local-filter');
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (query && !input.value) {
      input.value = query;
    }
    filterCards(input);
    input.addEventListener('input', function () {
      filterCards(input);
    });
  }

  function bindCarousel() {
    var carousel = qs('[data-carousel]');
    if (!carousel) {
      return;
    }
    var slides = qsa('.hero-slide', carousel);
    var dots = qsa('.hero-dot', carousel);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindMenu();
    bindSearchForms();
    bindLocalFilter();
    bindCarousel();
  });
})();
