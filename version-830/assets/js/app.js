import { H as Hls } from "./hls.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) =>
  Array.from(root.querySelectorAll(selector));

function initMobileNav() {
  const toggle = $(".mobile-toggle");
  const nav = $(".mobile-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });
}

function initHero() {
  const slides = $$(".hero-slide");
  const dots = $$(".hero-dot");
  if (!slides.length || !dots.length) return;
  let index = slides.findIndex((slide) =>
    slide.classList.contains("is-active"),
  );
  if (index < 0) index = 0;

  const show = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const next = Number(dot.getAttribute("data-hero-index") || 0);
      show(next);
    });
  });

  setInterval(() => show(index + 1), 5200);
}

function normalize(value) {
  return (value || "").toString().trim().toLowerCase();
}

function initFilters() {
  const panels = $$("[data-filter-scope]");
  panels.forEach((panel) => {
    const scope = panel.parentElement || document;
    const input = $("[data-filter-input]", panel);
    const year = $("[data-filter-year]", panel);
    const type = $("[data-filter-type]", panel);
    const sort = $("[data-filter-sort]", panel);
    const grid = $(".filter-grid", scope);
    if (!grid) return;
    const cards = $$(".filter-card", grid);

    const apply = () => {
      const keyword = normalize(input && input.value);
      const selectedYear = normalize(year && year.value);
      const selectedType = normalize(type && type.value);
      const selectedSort = normalize(sort && sort.value) || "year";

      cards.forEach((card) => {
        const haystack = normalize(
          [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year"),
          ].join(" "),
        );
        const okKeyword = !keyword || haystack.includes(keyword);
        const okYear =
          !selectedYear ||
          normalize(card.getAttribute("data-year")) === selectedYear;
        const okType =
          !selectedType ||
          normalize(card.getAttribute("data-type")).includes(selectedType);
        card.classList.toggle("is-hidden", !(okKeyword && okYear && okType));
      });

      const sorted = cards.slice().sort((a, b) => {
        if (selectedSort === "heat") {
          return (
            Number(b.getAttribute("data-heat") || 0) -
            Number(a.getAttribute("data-heat") || 0)
          );
        }
        if (selectedSort === "title") {
          return normalize(a.getAttribute("data-title")).localeCompare(
            normalize(b.getAttribute("data-title")),
            "zh-Hans-CN",
          );
        }
        return (
          Number(b.getAttribute("data-year") || 0) -
          Number(a.getAttribute("data-year") || 0)
        );
      });
      sorted.forEach((card) => grid.appendChild(card));
    };

    [input, year, type, sort].forEach((control) => {
      if (!control) return;
      control.addEventListener("input", apply);
      control.addEventListener("change", apply);
    });

    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && input) input.value = q;
    apply();
  });
}

function initPlayer() {
  const config = $("#video-config");
  const video = $("#movie-player");
  const button = $("#play-button");
  if (!config || !video || !button) return;

  let source = "";
  try {
    source = JSON.parse(config.textContent || "{}").source || "";
  } catch (error) {
    source = "";
  }
  if (!source) return;

  let ready = false;
  let hls = null;

  const load = () => {
    if (ready) return;
    ready = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }
    video.src = source;
  };

  const play = () => {
    load();
    button.classList.add("is-hidden");
    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {
        button.classList.remove("is-hidden");
      });
    }
  };

  button.addEventListener("click", play);
  video.addEventListener("click", () => {
    if (!ready || video.paused) play();
  });
  video.addEventListener("play", () => button.classList.add("is-hidden"));
  video.addEventListener("pause", () => {
    if (video.currentTime === 0 || video.ended)
      button.classList.remove("is-hidden");
  });
  window.addEventListener("pagehide", () => {
    if (hls) hls.destroy();
  });
}

initMobileNav();
initHero();
initFilters();
initPlayer();
