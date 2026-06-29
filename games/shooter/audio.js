let audioCtx = null;
let audioReady = false;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  audioReady = true;
}

function playTone({ freq = 440, duration = 0.08, type = "square", volume = 0.12, slide = 0 }) {
  if (!audioReady || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  if (slide) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), audioCtx.currentTime + duration);
  }
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playNoiseBurst(duration = 0.06, volume = 0.08) {
  if (!audioReady || !audioCtx) return;
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  source.buffer = buffer;
  gain.gain.value = volume;
  source.connect(gain);
  gain.connect(audioCtx.destination);
  source.start();
}

function playPlayerShoot() {
  playNoiseBurst(0.05, 0.1);
  playTone({ freq: 180, duration: 0.07, type: "sawtooth", volume: 0.1, slide: -120 });
}

function playEnemyShoot() {
  playTone({ freq: 320, duration: 0.06, type: "square", volume: 0.07, slide: -80 });
}

function playDoorSound() {
  playTone({ freq: 140, duration: 0.12, type: "triangle", volume: 0.1 });
  playTone({ freq: 90, duration: 0.1, type: "sine", volume: 0.08, slide: -30 });
}

function playReloadSound() {
  playTone({ freq: 260, duration: 0.05, type: "triangle", volume: 0.08 });
  playTone({ freq: 420, duration: 0.06, type: "triangle", volume: 0.07, slide: 60 });
}

function playPickupSound() {
  playTone({ freq: 520, duration: 0.08, type: "sine", volume: 0.1, slide: 180 });
}

function playHitSound() {
  playTone({ freq: 240, duration: 0.05, type: "square", volume: 0.06 });
}