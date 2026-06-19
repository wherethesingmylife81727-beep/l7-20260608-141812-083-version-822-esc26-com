(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupNavigation() {
        var button = document.querySelector(".mobile-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var shell = document.querySelector("[data-hero]");
        if (!shell) {
            return;
        }
        var slides = Array.prototype.slice.call(shell.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(shell.querySelectorAll("[data-hero-dot]"));
        var prev = shell.querySelector("[data-hero-prev]");
        var next = shell.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5600);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        show(0);
        restart();
    }

    function setupFilters() {
        var zones = Array.prototype.slice.call(document.querySelectorAll("[data-filter-zone]"));
        zones.forEach(function (zone) {
            var scope = zone.closest("main") || document;
            var input = zone.querySelector("[data-search-input]");
            var selects = Array.prototype.slice.call(zone.querySelectorAll("[data-filter-select]"));
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var empty = scope.querySelector("[data-empty-state]");
            function apply() {
                var text = normalize(input ? input.value : "");
                var activeFilters = selects.map(function (select) {
                    return {
                        key: select.getAttribute("data-filter-select"),
                        value: normalize(select.value)
                    };
                });
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-title"));
                    var matchedText = !text || haystack.indexOf(text) !== -1;
                    var matchedSelects = activeFilters.every(function (filter) {
                        if (!filter.value) {
                            return true;
                        }
                        var raw = normalize(card.getAttribute("data-" + filter.key));
                        return raw.indexOf(filter.value) !== -1 || haystack.indexOf(filter.value) !== -1;
                    });
                    var show = matchedText && matchedSelects;
                    card.classList.toggle("is-filtered-out", !show);
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
        });
    }

    function buildVideo(video, source) {
        if (!video || !source) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }
        if (globalThis.Hls && globalThis.Hls.isSupported()) {
            var hls = new globalThis.Hls({
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }
        video.src = source;
    }

    globalThis.initMoviePlayer = function (source) {
        ready(function () {
            var box = document.querySelector("[data-player-box]");
            if (!box) {
                return;
            }
            var video = box.querySelector("video");
            var overlay = box.querySelector(".player-overlay");
            var attached = false;
            function ensure() {
                if (!attached) {
                    attached = true;
                    buildVideo(video, source);
                }
            }
            function start() {
                ensure();
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove("is-hidden");
                        }
                    });
                }
            }
            if (overlay) {
                overlay.addEventListener("click", start);
            }
            box.addEventListener("click", function (event) {
                if (event.target === video && !attached) {
                    start();
                }
            });
        });
    };

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });
})();
