import { H as Hls } from "./video-vendor-dru42stk.js";

const qs = (selector, parent = document) => parent.querySelector(selector);
const qsa = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

function setupMobileMenu() {
  const button = qs("[data-menu-toggle]");
  const nav = qs("[data-main-nav]");

  if (!button || !nav) {
    return;
  }

  button.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });
}

function setupHero() {
  const hero = qs("[data-hero]");
  if (!hero) {
    return;
  }

  const slides = qsa(".hero-slide", hero);
  const dots = qsa(".hero-dot", hero);
  const prev = qs("[data-hero-prev]", hero);
  const next = qs("[data-hero-next]", hero);
  let current = 0;
  let timer = null;

  const show = (index) => {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === current);
      dot.setAttribute("aria-current", dotIndex === current ? "true" : "false");
    });
  };

  const restart = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(current + 1), 5000);
  };

  prev?.addEventListener("click", () => {
    show(current - 1);
    restart();
  });

  next?.addEventListener("click", () => {
    show(current + 1);
    restart();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      show(index);
      restart();
    });
  });

  show(0);
  restart();
}

function setupGlobalSearchForms() {
  qsa("[data-global-search]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = qs("input[name='q']", form);
      const query = input ? input.value.trim() : "";
      const action = form.getAttribute("action") || "search.html";
      const separator = action.includes("?") ? "&" : "?";

      window.location.href = query
        ? `${action}${separator}q=${encodeURIComponent(query)}`
        : action;
    });
  });
}

function setupCardFilters() {
  const filterRoot = qs("[data-filter-root]");
  if (!filterRoot) {
    return;
  }

  const input = qs("[data-filter-input]", filterRoot);
  const yearSelect = qs("[data-filter-year]", filterRoot);
  const typeSelect = qs("[data-filter-type]", filterRoot);
  const cards = qsa("[data-card]");
  const count = qs("[data-result-count]", filterRoot);
  const empty = qs("[data-empty-result]");

  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (q && input) {
    input.value = q;
  }

  const getText = (card) => {
    return [
      card.dataset.title,
      card.dataset.year,
      card.dataset.region,
      card.dataset.type,
      card.dataset.genre,
      card.dataset.tags
    ].join(" ").toLowerCase();
  };

  const apply = () => {
    const keyword = input ? input.value.trim().toLowerCase() : "";
    const year = yearSelect ? yearSelect.value : "";
    const type = typeSelect ? typeSelect.value : "";
    let visible = 0;

    cards.forEach((card) => {
      const matchKeyword = !keyword || getText(card).includes(keyword);
      const matchYear = !year || card.dataset.year === year;
      const matchType = !type || card.dataset.type.includes(type);
      const show = matchKeyword && matchYear && matchType;

      card.classList.toggle("hidden-by-filter", !show);

      if (show) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = `当前显示 ${visible} 个作品`;
    }

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  };

  input?.addEventListener("input", apply);
  yearSelect?.addEventListener("change", apply);
  typeSelect?.addEventListener("change", apply);
  apply();
}

function setupPlayers() {
  qsa("[data-m3u8]").forEach((player) => {
    const button = qs("[data-player-button]", player);
    const video = qs("video", player);
    const status = qs("[data-player-status]", player);

    if (!button || !video) {
      return;
    }

    const source = player.dataset.m3u8;
    let hls = null;
    let initialized = false;

    const setStatus = (message) => {
      if (status) {
        status.textContent = message;
      }
    };

    const playVideo = () => {
      const result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(() => {
          setStatus("播放已准备好，请再次点击播放按钮。");
        });
      }
    };

    const initialize = () => {
      if (initialized) {
        player.classList.add("is-ready");
        playVideo();
        return;
      }

      initialized = true;
      player.classList.add("is-loading");
      setStatus("正在加载播放源...");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", () => {
          player.classList.add("is-ready");
          player.classList.remove("is-loading");
          setStatus("播放已准备。");
          playVideo();
        }, { once: true });
      } else if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          player.classList.add("is-ready");
          player.classList.remove("is-loading");
          setStatus("播放已准备。");
          playVideo();
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data && data.fatal) {
            setStatus("视频加载失败，请刷新页面重试或稍后再看。");
            player.classList.remove("is-loading");
          }
        });
      } else {
        setStatus("当前浏览器不支持 HLS 播放。");
        player.classList.remove("is-loading");
      }
    };

    button.addEventListener("click", initialize);
    video.addEventListener("play", () => player.classList.add("is-playing"));
    video.addEventListener("pause", () => player.classList.remove("is-playing"));

    window.addEventListener("beforeunload", () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

setupMobileMenu();
setupHero();
setupGlobalSearchForms();
setupCardFilters();
setupPlayers();
