(function () {
  function qs(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function textValue(value) {
    return (value || '').toString().toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function openMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function runHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qs('.hero-slide', hero);
    var dots = qs('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5600);
      });
    });
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  function runFilters() {
    qs('[data-filter-form]').forEach(function (form) {
      var input = form.querySelector('[data-search-input]');
      var list = document.querySelector('[data-filter-list]');
      if (!input || !list) {
        return;
      }
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q') || '';
      if (initial) {
        input.value = initial;
      }
      function apply() {
        var query = textValue(input.value);
        qs('[data-card]', list).forEach(function (card) {
          var haystack = textValue([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' '));
          card.hidden = query && haystack.indexOf(query) === -1;
        });
      }
      input.addEventListener('input', apply);
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
      apply();
    });
  }

  function attachStream(video, stream) {
    if (!video || !stream) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = stream;
      }
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsInstance) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      }
      return;
    }
    if (!video.src) {
      video.src = stream;
    }
  }

  function runPlayers() {
    qs('.player-shell').forEach(function (shell) {
      var video = shell.querySelector('video');
      var cover = shell.querySelector('.player-cover');
      var stream = shell.getAttribute('data-stream');
      if (!video || !cover || !stream) {
        return;
      }
      function start() {
        attachStream(video, stream);
        shell.classList.add('is-playing');
        var playTask = video.play();
        if (playTask && typeof playTask.catch === 'function') {
          playTask.catch(function () {});
        }
      }
      cover.addEventListener('click', start);
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    openMenu();
    runHero();
    runFilters();
    runPlayers();
  });
})();
