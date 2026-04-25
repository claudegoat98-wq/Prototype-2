/* ============================================
   NovaPulse Digital — Music Player Widget
   Web Audio API waveform visualizer
   ============================================ */

const MusicPlayer = {
  isPlaying: false,
  isMinimized: true,
  currentTrack: null,
  audioCtx: null,
  oscillator: null,
  gainNode: null,
  analyser: null,
  animFrame: null,
  canvas: null,
  canvasCtx: null,
  progress: 0,
  duration: 30, // 30 second previews
  timer: null,

  tracks: [
    { id: 'cosmic-1', name: 'Midnight Cosmos', artist: 'NovaPulse', bpm: 85, key: 'Am', freq: 220, type: 'sine', product: 'music-cosmic-beats' },
    { id: 'cosmic-2', name: 'Starfall Groove', artist: 'NovaPulse', bpm: 90, key: 'Dm', freq: 293.66, type: 'triangle', product: 'music-cosmic-beats' },
    { id: 'cosmic-3', name: 'Nebula Drift', artist: 'NovaPulse', bpm: 75, key: 'Em', freq: 329.63, type: 'sine', product: 'music-cosmic-beats' },
    { id: 'ambient-1', name: 'Tranquil Dawn', artist: 'NovaPulse', bpm: 60, key: 'C', freq: 261.63, type: 'sine', product: 'music-ambient-dreams' },
    { id: 'ambient-2', name: 'Forest Whisper', artist: 'NovaPulse', bpm: 65, key: 'G', freq: 196, type: 'triangle', product: 'music-ambient-dreams' },
  ],

  init() {
    this.createWidget();
    this.bindEvents();
  },

  createWidget() {
    if (document.getElementById('music-player-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'music-player-widget';
    widget.className = 'music-player minimized';
    widget.innerHTML = `
      <button class="music-player-toggle" id="music-toggle" title="Music Preview Player">
        <span class="music-toggle-icon">🎵</span>
        <span class="music-toggle-pulse"></span>
      </button>
      <div class="music-player-expanded" id="music-expanded">
        <div class="music-player-header">
          <span style="font-weight:600;font-size:13px;">🎧 Preview Player</span>
          <button class="music-player-close" id="music-close">✕</button>
        </div>
        <canvas id="music-waveform" width="260" height="60"></canvas>
        <div class="music-track-info">
          <div class="music-track-name" id="music-track-name">Select a track</div>
          <div class="music-track-artist" id="music-track-artist">NovaPulse Music</div>
        </div>
        <div class="music-progress-bar">
          <div class="music-progress-fill" id="music-progress-fill"></div>
        </div>
        <div class="music-controls">
          <button class="music-btn" id="music-prev" title="Previous">⏮</button>
          <button class="music-btn music-btn-play" id="music-play" title="Play/Pause">▶</button>
          <button class="music-btn" id="music-next" title="Next">⏭</button>
          <button class="music-btn music-btn-cart" id="music-buy" title="Buy this album">🛒</button>
        </div>
        <div class="music-tracklist" id="music-tracklist"></div>
      </div>
    `;
    document.body.appendChild(widget);

    this.canvas = document.getElementById('music-waveform');
    this.canvasCtx = this.canvas.getContext('2d');
    this.renderTrackList();
  },

  renderTrackList() {
    const list = document.getElementById('music-tracklist');
    if (!list) return;
    list.innerHTML = this.tracks.map((t, i) => `
      <div class="music-track-item ${this.currentTrack === i ? 'active' : ''}" data-track="${i}">
        <span class="music-track-num">${this.currentTrack === i && this.isPlaying ? '♪' : (i + 1)}</span>
        <span class="music-track-title">${t.name}</span>
        <span class="music-track-bpm">${t.bpm}bpm</span>
      </div>
    `).join('');

    list.querySelectorAll('.music-track-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.track);
        this.playTrack(idx);
      });
    });
  },

  bindEvents() {
    document.getElementById('music-toggle')?.addEventListener('click', () => this.toggleExpand());
    document.getElementById('music-close')?.addEventListener('click', () => this.toggleExpand());
    document.getElementById('music-play')?.addEventListener('click', () => this.togglePlay());
    document.getElementById('music-prev')?.addEventListener('click', () => this.prevTrack());
    document.getElementById('music-next')?.addEventListener('click', () => this.nextTrack());
    document.getElementById('music-buy')?.addEventListener('click', () => {
      if (this.currentTrack !== null) {
        const track = this.tracks[this.currentTrack];
        if (window.cart) cart.addItem(track.product);
        if (window.showToast) showToast(`Added "${track.name}" album to cart!`, 'success');
      }
    });
  },

  toggleExpand() {
    const widget = document.getElementById('music-player-widget');
    if (!widget) return;
    this.isMinimized = !this.isMinimized;
    widget.classList.toggle('minimized', this.isMinimized);
  },

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      if (this.currentTrack === null) this.currentTrack = 0;
      this.playTrack(this.currentTrack);
    }
  },

  playTrack(index) {
    this.stop();
    this.currentTrack = index;
    const track = this.tracks[index];

    // Update UI
    document.getElementById('music-track-name').textContent = track.name;
    document.getElementById('music-track-artist').textContent = `${track.artist} · ${track.key} · ${track.bpm}bpm`;
    document.getElementById('music-play').textContent = '⏸';

    // Create audio
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 256;
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = 0.15;

    // Create a richer sound with harmonics
    const osc1 = this.audioCtx.createOscillator();
    osc1.type = track.type;
    osc1.frequency.value = track.freq;

    const osc2 = this.audioCtx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = track.freq * 1.5; // fifth harmonic

    const osc3 = this.audioCtx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = track.freq * 2; // octave

    const gain2 = this.audioCtx.createGain();
    gain2.gain.value = 0.06;
    const gain3 = this.audioCtx.createGain();
    gain3.gain.value = 0.03;

    osc1.connect(this.gainNode);
    osc2.connect(gain2);
    gain2.connect(this.gainNode);
    osc3.connect(gain3);
    gain3.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    // LFO for vibrato
    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    lfo.frequency.value = 4 + Math.random() * 2;
    lfoGain.gain.value = 3;
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfo.start();

    osc1.start();
    osc2.start();
    osc3.start();
    this.oscillator = [osc1, osc2, osc3, lfo];

    this.isPlaying = true;
    this.progress = 0;
    this.startProgress();
    this.drawWaveform();
    this.renderTrackList();
  },

  pause() {
    if (this.audioCtx) {
      this.audioCtx.suspend();
    }
    this.isPlaying = false;
    document.getElementById('music-play').textContent = '▶';
    if (this.timer) clearInterval(this.timer);
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.renderTrackList();
  },

  stop() {
    if (this.oscillator) {
      this.oscillator.forEach(o => { try { o.stop(); } catch(e) {} });
      this.oscillator = null;
    }
    if (this.audioCtx) {
      try { this.audioCtx.close(); } catch(e) {}
      this.audioCtx = null;
    }
    this.isPlaying = false;
    this.progress = 0;
    if (this.timer) clearInterval(this.timer);
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    document.getElementById('music-play').textContent = '▶';
    const fill = document.getElementById('music-progress-fill');
    if (fill) fill.style.width = '0%';
  },

  startProgress() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.progress += 0.1;
      const pct = (this.progress / this.duration) * 100;
      const fill = document.getElementById('music-progress-fill');
      if (fill) fill.style.width = pct + '%';
      if (this.progress >= this.duration) {
        this.nextTrack();
      }
    }, 100);
  },

  prevTrack() {
    if (this.currentTrack === null) return;
    const prev = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
    this.playTrack(prev);
  },

  nextTrack() {
    if (this.currentTrack === null) this.currentTrack = -1;
    const next = (this.currentTrack + 1) % this.tracks.length;
    this.playTrack(next);
  },

  drawWaveform() {
    if (!this.analyser || !this.canvasCtx) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = this.canvas;
    const ctx = this.canvasCtx;
    const W = canvas.width;
    const H = canvas.height;

    const draw = () => {
      this.animFrame = requestAnimationFrame(draw);
      this.analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, W, H);

      const barWidth = (W / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * H * 0.85;
        const hue = 270 + (i / bufferLength) * 60;
        ctx.fillStyle = `hsla(${hue}, 80%, 65%, 0.9)`;
        ctx.fillRect(x, H - barHeight, barWidth - 1, barHeight);

        // Mirror reflection
        ctx.fillStyle = `hsla(${hue}, 80%, 65%, 0.15)`;
        ctx.fillRect(x, 0, barWidth - 1, H - barHeight);

        x += barWidth;
      }
    };

    draw();
  }
};

document.addEventListener('DOMContentLoaded', () => MusicPlayer.init());
window.MusicPlayer = MusicPlayer;
