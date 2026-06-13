(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function escapeText(value) {
    return (value || "").toString().replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var active = 0;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    window.setInterval(function () {
      show(active + 1);
    }, 5200);
  }

  function initCatalogFilter() {
    var input = document.querySelector("[data-catalog-filter]");
    var list = document.querySelector("[data-catalog-list]");
    var empty = document.querySelector("[data-filter-empty]");
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .compact-card"));
    function apply() {
      var query = normalize(input.value);
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type")
        ].join(" "));
        var matched = !query || haystack.indexOf(query) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", shown === 0);
      }
    }
    input.addEventListener("input", apply);
    apply();
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeText(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card movie-card-grid\">",
      "<a class=\"movie-poster\" href=\"" + escapeText(movie.url) + "\" aria-label=\"观看" + escapeText(movie.title) + "\">",
      "<img src=\"" + escapeText(movie.cover) + "\" alt=\"" + escapeText(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"poster-shade\"></span><span class=\"poster-play\">▶</span></a>",
      "<div class=\"movie-info\"><div class=\"movie-meta-line\"><a href=\"" + escapeText(movie.categoryUrl) + "\">" + escapeText(movie.category) + "</a><span>" + escapeText(movie.year) + "</span><span>" + escapeText(movie.region) + "</span></div>",
      "<h3><a href=\"" + escapeText(movie.url) + "\">" + escapeText(movie.title) + "</a></h3>",
      "<p>" + escapeText(movie.oneLine) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div></div></article>"
    ].join("");
  }

  function initSearchPage() {
    var target = document.querySelector("[data-search-results]");
    if (!target || !window.SEARCH_DATA) {
      return;
    }
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var empty = document.querySelector("[data-search-empty]");
    var title = document.querySelector("[data-search-title]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }
    function render() {
      var query = normalize(input ? input.value : initial);
      var words = query.split(/\s+/).filter(Boolean);
      var results = window.SEARCH_DATA.filter(function (movie) {
        if (!words.length) {
          return true;
        }
        var haystack = normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, (movie.tags || []).join(" ")].join(" "));
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, words.length ? 160 : 48);
      target.innerHTML = results.map(cardTemplate).join("");
      if (title) {
        title.textContent = words.length ? "搜索结果" : "热门影片";
      }
      if (empty) {
        empty.classList.toggle("is-visible", results.length === 0);
      }
    }
    if (form && input) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = input.value.trim();
        var url = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
        window.history.replaceState(null, "", url);
        render();
      });
      input.addEventListener("input", render);
    }
    render();
  }

  ready(function () {
    initMenu();
    initHero();
    initCatalogFilter();
    initSearchPage();
  });
})();
