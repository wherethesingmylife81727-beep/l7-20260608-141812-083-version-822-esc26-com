(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobilePanel.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                play();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                play();
            });
        });

        showSlide(0);
        play();
    }

    var filterInput = document.querySelector('.page-filter');
    var yearSelect = document.querySelector('.year-filter');
    var list = document.querySelector('[data-filter-list]');

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function applyFilter() {
        if (!list) {
            return;
        }
        var keyword = normalize(filterInput ? filterInput.value : '');
        var year = yearSelect ? yearSelect.value : '';
        var cards = list.querySelectorAll('.movie-card, .compact-card');

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year')
            ].join(' '));
            var yearMatched = !year || card.getAttribute('data-year') === year;
            var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
            card.style.display = yearMatched && keywordMatched ? '' : 'none';
        });
    }

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q');
        if (initial) {
            filterInput.value = initial;
        }
        filterInput.addEventListener('input', applyFilter);
    }

    if (yearSelect) {
        yearSelect.addEventListener('change', applyFilter);
    }

    applyFilter();
})();
