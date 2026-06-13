(function () {
  function bindPlayer(root) {
    var video = root.querySelector('video');
    var button = root.querySelector('.player-overlay');
    var url = root.getAttribute('data-video-url');
    var attached = false;
    var hls = null;

    function attach() {
      if (attached || !video || !url) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      attached = true;
    }

    function play() {
      attach();
      root.classList.add('is-playing');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          root.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        root.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          root.classList.remove('is-playing');
        }
      });
      video.addEventListener('ended', function () {
        root.classList.remove('is-playing');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll('.player-shell').forEach(bindPlayer);
    });
  } else {
    document.querySelectorAll('.player-shell').forEach(bindPlayer);
  }
})();
