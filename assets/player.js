(function () {
  function setupPlayer(video) {
    var shell = video.closest('.player-shell');
    var button = shell ? shell.querySelector('.player-start') : null;
    var source = video.querySelector('source');
    var stream = source ? source.getAttribute('src') : video.getAttribute('src');
    var hls = null;

    function loadStream() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }
      video.setAttribute('data-ready', '1');
    }

    function playVideo() {
      loadStream();
      if (shell) {
        shell.classList.add('is-playing');
      }
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.cinema-video')).forEach(setupPlayer);
  });
})();
