(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMenu();
    initImages();
    initHero();
    initFilters();
    initPlayer();
  });

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-main-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initImages() {
    document.querySelectorAll("img").forEach(function (image) {
      if (image.complete && image.naturalWidth === 0) {
        image.classList.add("missing-image");
      }
      image.addEventListener("error", function () {
        image.classList.add("missing-image");
      });
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-root]").forEach(function (root) {
      var input = root.querySelector("[data-filter-input]");
      var year = root.querySelector("[data-filter-year]");
      var region = root.querySelector("[data-filter-region]");
      var list = document.querySelector("[data-filter-list]");
      var empty = document.querySelector("[data-empty-state]");
      if (!list) {
        return;
      }
      var items = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card], .rank-row"));

      function apply() {
        var q = input ? input.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var r = region ? region.value : "";
        var shown = 0;
        items.forEach(function (item) {
          var text = (item.getAttribute("data-search") || item.textContent || "").toLowerCase();
          var itemYear = item.getAttribute("data-year") || "";
          var itemRegion = item.getAttribute("data-region") || "";
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (y && itemYear !== y) {
            ok = false;
          }
          if (r && itemRegion !== r) {
            ok = false;
          }
          item.style.display = ok ? "" : "none";
          if (ok) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", shown === 0);
        }
      }

      [input, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function initPlayer() {
    var frame = document.querySelector("[data-player]");
    var video = document.querySelector("[data-video-player]");
    var button = document.querySelector("[data-play-button]");
    if (!frame || !video) {
      return;
    }
    var src = video.getAttribute("data-src");
    var hls = null;

    function bindSource() {
      if (!src) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function play() {
      bindSource();
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      frame.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      frame.classList.remove("is-playing");
    });
    video.addEventListener("ended", function () {
      frame.classList.remove("is-playing");
    });
    bindSource();
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
})();
