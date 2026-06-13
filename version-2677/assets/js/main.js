(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        var open = mobileNav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    document.querySelectorAll('.js-site-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var active = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === active);
        });
      }

      function start() {
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          window.clearInterval(timer);
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          start();
        });
      });

      show(0);
      start();
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
      var section = panel.closest('section') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
      var searchInput = panel.querySelector('[data-filter-search]');
      var regionSelect = panel.querySelector('[data-filter-region]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var query = new URLSearchParams(window.location.search).get('q');

      if (query && searchInput) {
        searchInput.value = query;
      }

      function apply() {
        var searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var regionValue = regionSelect ? regionSelect.value : '';
        var yearValue = yearSelect ? yearSelect.value : '';

        cards.forEach(function (card) {
          var cardQuery = (card.getAttribute('data-query') || '').toLowerCase();
          var cardRegion = card.getAttribute('data-region') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var matchSearch = !searchValue || cardQuery.indexOf(searchValue) !== -1;
          var matchRegion = !regionValue || cardRegion === regionValue;
          var matchYear = !yearValue || cardYear === yearValue;
          card.hidden = !(matchSearch && matchRegion && matchYear);
        });
      }

      [searchInput, regionSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  });
})();
