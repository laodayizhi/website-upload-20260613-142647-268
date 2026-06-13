(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function bindMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function bindHero() {
        var root = document.querySelector('[data-hero-carousel]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
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
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function bindFilters() {
        var grid = document.querySelector('[data-listing-grid]');
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
        var input = document.querySelector('[data-search-input]');
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-type], [data-filter-category]'));
        var activeType = 'all';
        var activeCategory = 'all';

        function apply() {
            var term = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var cardType = card.getAttribute('data-type') || '';
                var cardCategory = card.getAttribute('data-category') || '';
                var matchesText = !term || text.indexOf(term) !== -1;
                var matchesType = activeType === 'all' || cardType === activeType;
                var matchesCategory = activeCategory === 'all' || cardCategory === activeCategory;
                card.classList.toggle('is-hidden-by-filter', !(matchesText && matchesType && matchesCategory));
            });
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                input.value = q;
            }
            input.addEventListener('input', apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var type = button.getAttribute('data-filter-type');
                var category = button.getAttribute('data-filter-category');
                if (type) {
                    activeType = type;
                    Array.prototype.slice.call(document.querySelectorAll('[data-filter-type]')).forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });
                }
                if (category) {
                    activeCategory = category;
                    Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]')).forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });
                }
                apply();
            });
        });
        apply();
    }

    function bindPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video[data-hls-src]');
            var button = player.querySelector('[data-player-button]');
            if (!video || !button) {
                return;
            }
            var source = video.getAttribute('data-hls-src');
            var activated = false;
            var hlsInstance = null;

            function attach() {
                if (activated) {
                    return;
                }
                activated = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    return;
                }
                video.src = source;
            }

            function play() {
                attach();
                button.classList.add('is-hidden');
                video.controls = true;
                var action = video.play();
                if (action && typeof action.catch === 'function') {
                    action.catch(function () {
                        button.classList.remove('is-hidden');
                    });
                }
            }

            button.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (!activated || video.paused) {
                    play();
                }
            });
            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    ready(function () {
        bindMenu();
        bindHero();
        bindFilters();
        bindPlayers();
    });
}());
