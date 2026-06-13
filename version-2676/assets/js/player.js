(function () {
  function startPlayer() {
    var configNode = document.getElementById('player-config');
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');
    if (!configNode || !video || !cover) {
      return;
    }
    var config = JSON.parse(configNode.textContent || '{}');
    var streamUrl = config.url || '';
    var attached = false;

    function attachStream() {
      if (attached || !streamUrl) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function playVideo() {
      attachStream();
      cover.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      var playing = video.play();
      if (playing && typeof playing.catch === 'function') {
        playing.catch(function () {
          video.setAttribute('controls', 'controls');
        });
      }
    }

    cover.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (!attached) {
        playVideo();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startPlayer);
  } else {
    startPlayer();
  }
})();
