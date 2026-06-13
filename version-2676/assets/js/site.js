(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          showSlide(active + 1);
        }, 5200);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
        restartTimer();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('mouseenter', function () {
        showSlide(Number(thumb.getAttribute('data-hero-thumb') || 0));
        restartTimer();
      });
    });

    restartTimer();

    var filterInput = document.querySelector('[data-filter-input]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    function applyFilters() {
      var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var typeValue = typeFilter ? typeFilter.value : '';
      var yearValue = yearFilter ? yearFilter.value : '';
      cards.forEach(function (card) {
        var haystack = card.getAttribute('data-search') || '';
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matched = true;
        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (typeValue && cardType !== typeValue) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }
        card.classList.toggle('is-hidden', !matched);
      });
    }

    if (filterInput) {
      var params = new URLSearchParams(window.location.search);
      if (params.get('q')) {
        filterInput.value = params.get('q');
      }
      filterInput.addEventListener('input', applyFilters);
    }
    if (typeFilter) {
      typeFilter.addEventListener('change', applyFilters);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilters);
    }
    applyFilters();
  });
})();
