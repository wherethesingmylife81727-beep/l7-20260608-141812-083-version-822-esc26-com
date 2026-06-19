(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", mobilePanel.classList.contains("is-open"));
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var currentSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === currentSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === currentSlide);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot") || 0));
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(currentSlide + 1);
      }, 6200);
    }

    var filterInput = document.querySelector(".local-filter-input");
    var filterClear = document.querySelector(".local-filter-clear");
    var filterList = document.querySelector("[data-filter-list]");

    function filterCards() {
      if (!filterInput || !filterList) {
        return;
      }
      var query = filterInput.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        card.classList.toggle("is-filtered-out", query && text.indexOf(query) === -1);
      });
    }

    if (filterInput && filterList) {
      filterInput.addEventListener("input", filterCards);
    }

    if (filterClear && filterInput) {
      filterClear.addEventListener("click", function () {
        filterInput.value = "";
        filterCards();
        filterInput.focus();
      });
    }

    initSearchPage();
  });

  function createMovieCard(movie) {
    return [
      "<article class=\"movie-card\">",
      "  <a class=\"card-cover\" href=\"./" + movie.file + "\">",
      "    <img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "    <span class=\"cover-shade\"></span>",
      "    <span class=\"play-chip\">播放</span>",
      "  </a>",
      "  <div class=\"card-body\">",
      "    <div class=\"meta-row\"><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.year) + "</span></div>",
      "    <h3><a href=\"./" + movie.file + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p>" + escapeHtml(movie.oneLine) + "</p>",
      "    <div class=\"card-footer\"><span>" + escapeHtml(movie.category) + "</span><a href=\"./" + movie.file + "\">详情</a></div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function initSearchPage() {
    var input = document.getElementById("search-page-input");
    var typeFilter = document.getElementById("search-type-filter");
    var button = document.getElementById("search-submit-button");
    var results = document.getElementById("search-results");
    var label = document.getElementById("search-result-label");

    if (!input || !results || !window.MOVIE_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get("q") || "";
    input.value = queryFromUrl;

    function render() {
      var query = input.value.trim().toLowerCase();
      var typeValue = typeFilter ? typeFilter.value : "";
      var matched = window.MOVIE_INDEX.filter(function (movie) {
        var text = [movie.title, movie.oneLine, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.category].join(" ").toLowerCase();
        var typeOk = !typeValue || movie.type.indexOf(typeValue) !== -1 || movie.genre.indexOf(typeValue) !== -1;
        var queryOk = !query || text.indexOf(query) !== -1;
        return typeOk && queryOk;
      }).slice(0, 120);

      results.innerHTML = matched.map(createMovieCard).join("") || "<div class=\"empty-state\">没有找到匹配的影片</div>";
      if (label) {
        label.textContent = query || typeValue ? "已展示匹配内容，可继续调整关键词。" : "精选内容已展示，可输入关键词继续筛选。";
      }
    }

    input.addEventListener("input", render);
    if (typeFilter) {
      typeFilter.addEventListener("change", render);
    }
    if (button) {
      button.addEventListener("click", render);
    }
    render();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  window.startMoviePlayer = function (videoId, buttonId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    var hlsInstance = null;
    var playRequested = false;

    if (!video || !button || !overlay || !sourceUrl) {
      return;
    }

    function attemptPlay() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function bindMedia() {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (playRequested) {
            attemptPlay();
          }
        });
      } else {
        video.src = sourceUrl;
      }
      video.setAttribute("data-ready", "1");
    }

    function playMedia() {
      playRequested = true;
      bindMedia();
      attemptPlay();
    }

    button.addEventListener("click", function (event) {
      event.stopPropagation();
      playMedia();
    });

    overlay.addEventListener("click", function () {
      playMedia();
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        playMedia();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        overlay.classList.remove("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      overlay.classList.remove("is-hidden");
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
}());
