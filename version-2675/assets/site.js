(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (toggle && nav) {
      toggle.addEventListener("click", function() {
        nav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function(hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function start() {
        if (slides.length < 2) {
          return;
        }
        stop();
        timer = window.setInterval(function() {
          show(index + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function() {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function() {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function(dot) {
        dot.addEventListener("click", function() {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-search-input]").forEach(function(input) {
      var selector = input.getAttribute("data-search-scope");
      var scope = selector ? document.querySelector(selector) : document;
      if (!scope) {
        scope = document;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-button]"));
      var empty = scope.querySelector("[data-empty-result]");
      var filter = "全部";

      function apply() {
        var q = input.value.trim().toLowerCase();
        var shown = 0;
        cards.forEach(function(card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || ""
          ].join(" ").toLowerCase();
          var type = card.getAttribute("data-type") || "";
          var searchOk = !q || text.indexOf(q) !== -1;
          var filterOk = filter === "全部" || type.indexOf(filter) !== -1 || text.indexOf(filter.toLowerCase()) !== -1;
          card.classList.toggle("hidden-by-search", !searchOk);
          card.classList.toggle("hidden-by-filter", !filterOk);
          if (searchOk && filterOk) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", shown === 0);
        }
      }

      input.addEventListener("input", apply);
      buttons.forEach(function(button) {
        button.addEventListener("click", function() {
          filter = button.getAttribute("data-filter-value") || "全部";
          buttons.forEach(function(item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });
    });
  });

  window.initMoviePlayer = function(videoId, coverId, source) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    if (!video || !source) {
      return;
    }
    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function(event, data) {
          if (data && data.fatal) {
            video.setAttribute("data-player-state", "error");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function start() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function() {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }

    video.addEventListener("click", function() {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };
})();
