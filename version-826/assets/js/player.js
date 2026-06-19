import { H as Hls } from './hls-vendor.js';

const video = document.getElementById('player-video');
const overlay = document.getElementById('player-overlay');
const source = video?.getAttribute('data-src');
let hlsInstance = null;

const hideOverlay = () => {
  overlay?.classList.add('is-hidden');
};

const showOverlay = () => {
  overlay?.classList.remove('is-hidden');
};

const startPlayback = async () => {
  if (!video || !source) {
    return;
  }

  hideOverlay();

  try {
    await video.play();
  } catch (error) {
    showOverlay();
  }
};

if (video && source) {
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  } else if (Hls.isSupported()) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hlsInstance.loadSource(source);
    hlsInstance.attachMedia(video);
  } else {
    video.src = source;
  }

  overlay?.addEventListener('click', startPlayback);
  video.addEventListener('click', () => {
    if (video.paused) {
      startPlayback();
    }
  });
  video.addEventListener('play', hideOverlay);
  video.addEventListener('pause', showOverlay);
  video.addEventListener('ended', showOverlay);
}

window.addEventListener('pagehide', () => {
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
});
