const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  lives: document.getElementById("lives"),
  cash: document.getElementById("cash"),
  wave: document.getElementById("wave"),
  waveCount: document.getElementById("waveCount"),
  hint: document.getElementById("hint"),
  startWave: document.getElementById("startWave"),
  speed: document.getElementById("speed"),
  pause: document.getElementById("pause"),
  openMenu: document.getElementById("openMenu"),
  towerButtons: Array.from(document.querySelectorAll(".tower-btn")),
  menu: document.getElementById("menu"),
  menuMessage: document.getElementById("menuMessage"),
  startGame: document.getElementById("startGame"),
  resumeGame: document.getElementById("resumeGame"),
  levelList: document.getElementById("levelList"),
  upgradePanel: document.getElementById("upgradePanel"),
  upgradeName: document.getElementById("upgradeName"),
  upgradeStats: document.getElementById("upgradeStats"),
  upgradeBtn: document.getElementById("upgradeBtn"),
  sellBtn: document.getElementById("sellBtn"),
  popup: document.getElementById("popup"),
  popupTitle: document.getElementById("popupTitle"),
  popupBody: document.getElementById("popupBody"),
  popupClose: document.getElementById("popupClose"),
  langPrompt: document.getElementById("langPrompt"),
  rotatePrompt: document.getElementById("rotatePrompt"),
};

const gridSize = 40;
const map = {
  width: canvas.width,
  height: canvas.height,
};

const levels = [
  {
    name: "Harbor Bend",
    desc: "A twisting middle path with long sightlines.",
    cash: 160,
    lives: 20,
    wavesToWin: 5,
    difficulty: 1,
    theme: {
      grass: "#1d2b24",
      path: "#3a2c20",
      grid: "rgba(255,255,255,0.04)",
      glow: "rgba(245, 177, 46, 0.08)",
      style: "industrial",
      image: "assets/level1.jpg",
    },
    path: [
      { x: -40, y: 320 },
      { x: 180, y: 320 },
      { x: 300, y: 180 },
      { x: 520, y: 180 },
      { x: 640, y: 360 },
      { x: 820, y: 360 },
      { x: 940, y: 240 },
      { x: 1040, y: 240 },
    ],
  },
  {
    name: "Forked Road",
    desc: "A double-back path that crowds the center.",
    cash: 180,
    lives: 18,
    wavesToWin: 5,
    difficulty: 1.15,
    theme: {
      grass: "#1b2430",
      path: "#2c3b4a",
      grid: "rgba(160, 200, 255, 0.06)",
      glow: "rgba(125, 211, 252, 0.12)",
      style: "futuristic",
      image: "assets/level2.png",
    },
    path: [
      { x: -40, y: 140 },
      { x: 220, y: 140 },
      { x: 320, y: 260 },
      { x: 520, y: 260 },
      { x: 640, y: 120 },
      { x: 820, y: 120 },
      { x: 900, y: 260 },
      { x: 760, y: 420 },
      { x: 520, y: 420 },
      { x: 360, y: 520 },
      { x: 1040, y: 520 },
    ],
  },
  {
    name: "Canyon Run",
    desc: "Shorter path, faster waves.",
    cash: 200,
    lives: 16,
    wavesToWin: 5,
    difficulty: 1.35,
    theme: {
      grass: "#2b1d1b",
      path: "#4a2f24",
      grid: "rgba(255, 190, 130, 0.06)",
      glow: "rgba(255, 107, 61, 0.12)",
      style: "industrial",
      image: "assets/level3.png",
    },
    path: [
      { x: -40, y: 260 },
      { x: 160, y: 260 },
      { x: 280, y: 360 },
      { x: 520, y: 360 },
      { x: 640, y: 200 },
      { x: 820, y: 200 },
      { x: 900, y: 340 },
      { x: 1040, y: 340 },
    ],
  },
];

const towerTypes = {
  gun: {
    name: "Gun",
    cost: 50,
    range: 120,
    fireRate: 0.25,
    damage: 10,
    bulletSpeed: 420,
    color: "#f5b12e",
  },
  cannon: {
    name: "Cannon",
    cost: 120,
    range: 160,
    fireRate: 0.9,
    damage: 30,
    bulletSpeed: 260,
    splash: 60,
    color: "#ff6b3d",
  },
  sniper: {
    name: "Sniper",
    cost: 160,
    range: 240,
    fireRate: 1.3,
    damage: 60,
    bulletSpeed: 520,
    color: "#7dd3fc",
  },
  cryo: {
    name: "Cryo Tower",
    cost: 140,
    range: 150,
    fireRate: 0.8,
    damage: 6,
    bulletSpeed: 360,
    color: "#7cddff",
    slow: 0.5,
    slowDuration: 2.8,
  },
};

const enemyTypes = {
  normal: { name: "Normal", hp: 1, speed: 1, radius: 20, bounty: 1 },
  fast: { name: "Fast", hp: 0.7, speed: 1.45, radius: 16, bounty: 0.9 },
  tank: { name: "Tank", hp: 2.2, speed: 0.75, radius: 24, bounty: 1.4 },
  boss: { name: "Boss", hp: 7.5, speed: 0.55, radius: 60, bounty: 5.0 },
};

const enemyImage = new Image();
enemyImage.src = "assets/enemy.png";
enemyImage.onerror = () => {
  setMenuMessage("Enemy image missing. Check assets/enemy.png.");
};

const towerImageSources = {
  gun: "assets/gun1.jpg",
  cannon: "assets/gun2.jpg",
  sniper: "assets/gun3.jpg",
  cryo: "assets/gun4.jpg",
};
const towerImages = {};

function makeTransparentWhite(source) {
  const canvas = document.createElement("canvas");
  canvas.width = source.naturalWidth;
  canvas.height = source.naturalHeight;
  const ctx2 = canvas.getContext("2d");
  ctx2.drawImage(source, 0, 0);
  const imgData = ctx2.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 235 && g > 235 && b > 235) {
      data[i + 3] = 0;
    }
  }
  ctx2.putImageData(imgData, 0, 0);
  return canvas;
}

function loadTowerImages() {
  Object.entries(towerImageSources).forEach(([key, src]) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      towerImages[key] = makeTransparentWhite(img);
    };
  });
}

const levelImages = levels.map((level) => {
  if (!level.theme.image) return null;
  const img = new Image();
  img.src = level.theme.image;
  return img;
});

let pathPoints = levels[0].path;
let money = levels[0].cash;
let lives = levels[0].lives;
let wave = 0;
let selectedTower = null;
let selectedPlacedTower = null;
let gameSpeed = 1;
let gameState = "menu";
let currentLevel = 0;
let pendingNextLevel = null;
let currentTheme = levels[0].theme;
const unlockKey = "face-td-unlocks";
const langKey = "face-td-lang";
let unlockedLevels = [];
let currentLang = "en";

const i18n = {
  en: {
    title: "Saysuda Game",
    subtitle: "STOP NAN",
    hintSelect: "Select a tower to begin.",
    hintPlace: "Select a tower and click the grass to place it.",
    hintPlaced: "Tower placed.",
    hintBlocked: "Can't place on the path.",
    hintOccupied: "Space already occupied.",
    hintNoCash: "Not enough cash for that tower.",
    hintWave: (w) => `Wave ${w} incoming.`,
    hintSlip: "An enemy slipped through!",
    hintWaveClear: "Wave cleared. Start the next wave when ready.",
    hintGameOver: "Game over. Open the menu to restart.",
    hintAllClear: "All waves cleared!",
    hintSelectTower: "Tower selected. Upgrade or sell from the panel.",
    hintUpgrade: "Tower upgraded.",
    hintUpgradeNoCash: "Not enough cash to upgrade.",
    hintSell: "Tower sold.",
    menuMessage: "Campaign: Level 1 has 5 waves. Click Start Level to begin.",
    menuLocked: "Locked. Clear previous level.",
    menuWin: (next) =>
      next ? "Victory! Tap Next Level to continue."
        : "Campaign complete! Tap Replay to play again.",
    popupTitle: "Level Cleared!",
    popupButton: "Next Level",
    replayButton: "Replay Campaign",
    startLevel: "Start Level",
    resume: "Back to Game",
    startWave: "Start Next Wave",
    pause: "Pause",
    resumePause: "Resume",
    menu: "Menu",
    speed: "Speed",
    lives: "Lives",
    cash: "Cash",
    wave: "Wave",
    progress: "Progress",
    build: "Build",
    selectedTower: "Selected Tower",
    upgrade: (cost) => `Upgrade ($${cost})`,
    maxLevel: "Max Level",
    sell: "Sell (50%)",
    tipsTitle: "Tips",
    tips1: "Place towers along the path curves for maximum coverage.",
    tips2: "Gun towers are best for early waves. Cannons handle clusters.",
    towers: {
      gun: { name: "Gun", desc: "Fast fire, light damage" },
      cannon: { name: "Cannon", desc: "Slow fire, splash damage" },
      sniper: { name: "Sniper", desc: "Long range, huge damage" },
      cryo: { name: "Cryo Tower", desc: "Slows enemies by 50%" },
    },
    levels: [
      { name: "Harbor Bend", desc: "A twisting middle path with long sightlines." },
      { name: "Forked Road", desc: "A double-back path that crowds the center." },
      { name: "Canyon Run", desc: "Shorter path, faster waves." },
    ],
    chooseLevel: "Choose Level",
    menuNote: "Audio activates after your first click. Shortcuts: Space = wave, U = upgrade.",
    rotate: "Please rotate your phone to landscape.",
    langTitle: "Choose Language",
  },
  th: {
    title: "Saysuda Game",
    subtitle: "STOP NAN",
    hintSelect: "เลือกป้อมเพื่อเริ่มเกม",
    hintPlace: "เลือกป้อมแล้วแตะพื้นที่ว่างเพื่อวาง",
    hintPlaced: "วางป้อมแล้ว",
    hintBlocked: "วางบนทางเดินไม่ได้",
    hintOccupied: "ตำแหน่งนี้มีป้อมแล้ว",
    hintNoCash: "เงินไม่พอสำหรับป้อมนี้",
    hintWave: (w) => `รอบที่ ${w} กำลังมา`,
    hintSlip: "ศัตรูหลุดผ่านไป!",
    hintWaveClear: "เคลียร์รอบแล้ว เริ่มรอบถัดไปได้",
    hintGameOver: "เกมจบ เปิดเมนูเพื่อเริ่มใหม่",
    hintAllClear: "เคลียร์ครบทุกคลื่นแล้ว!",
    hintSelectTower: "เลือกป้อมแล้ว อัปเกรดหรือขายได้จากแถบด้านข้าง",
    hintUpgrade: "อัปเกรดป้อมแล้ว",
    hintUpgradeNoCash: "เงินไม่พอสำหรับอัปเกรด",
    hintSell: "ขายป้อมแล้ว",
    menuMessage: "โหมดแคมเปญ: ด่าน 1 มี 5 รอบ กดเริ่มด่านเพื่อเริ่ม",
    menuLocked: "ด่านนี้ยังล็อกอยู่ ต้องผ่านด่านก่อนหน้า",
    menuWin: (next) =>
      next ? "ผ่านด่านแล้ว! กดด่านถัดไปเพื่อไปต่อ"
        : "จบแคมเปญแล้ว! กดเล่นซ้ำได้",
    popupTitle: "ผ่านด่านแล้ว!",
    popupButton: "ด่านถัดไป",
    replayButton: "เล่นแคมเปญอีกครั้ง",
    startLevel: "เริ่มด่าน",
    resume: "กลับเข้าเกม",
    startWave: "เริ่มรอบถัดไป",
    pause: "หยุดชั่วคราว",
    resumePause: "เล่นต่อ",
    menu: "เมนู",
    speed: "ความเร็ว",
    lives: "พลังชีวิต",
    cash: "เงิน",
    wave: "รอบ",
    progress: "ความคืบหน้า",
    build: "สร้าง",
    selectedTower: "ป้อมที่เลือก",
    upgrade: (cost) => `อัปเกรด (${cost}$)`,
    maxLevel: "เต็มระดับ",
    sell: "ขาย (50%)",
    tipsTitle: "เคล็ดลับ",
    tips1: "วางป้อมตามโค้งเพื่อโจมตีได้นานขึ้น",
    tips2: "ปืนเหมาะกับต้นเกม ปืนใหญ่เหมาะกับกลุ่มศัตรู",
    towers: {
      gun: { name: "ปืนกล", desc: "ยิงเร็ว ดาเมจเบา" },
      cannon: { name: "ปืนใหญ่", desc: "ยิงช้า ดาเมจหมู่" },
      sniper: { name: "สไนเปอร์", desc: "ระยะไกล ดาเมจสูง" },
      cryo: { name: "ป้อมเยือกแข็ง", desc: "ทำให้ศัตรูช้าลง 50%" },
    },
    levels: [
      { name: "โค้งท่าเรือ", desc: "ทางคดเคี้ยว ยิงได้ไกล" },
      { name: "ทางแยก", desc: "ทางวกกลับ หนาแน่นตรงกลาง" },
      { name: "หุบเขา", desc: "ทางสั้น คลื่นเร็ว" },
    ],
    chooseLevel: "เลือกด่าน",
    menuNote: "เสียงจะเริ่มหลังคลิกครั้งแรก ปุ่มลัด: Space=เริ่มรอบ, U=อัปเกรด",
    rotate: "โปรดหมุนหน้าจอเป็นแนวนอน",
    langTitle: "เลือกภาษา",
  },
};

const towers = [];
const enemies = [];
const bullets = [];
const effects = [];
const zaps = [];
const flashes = [];
const smokes = [];

const waves = [];
let waveInProgress = false;
let spawnTimer = 0;
let enemiesToSpawn = 0;
let spawnInterval = 0.8;

let audioContext = null;
let audioEnabled = false;

function initAudio() {
  if (audioContext) return;
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  audioEnabled = true;
}

function playTone({ freq = 440, duration = 0.08, type = "sine", volume = 0.15 }) {
  if (!audioEnabled || !audioContext) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  osc.stop(audioContext.currentTime + duration);
}

function playSound(type) {
  if (type === "place") playTone({ freq: 520, duration: 0.07, type: "triangle" });
  if (type === "shoot") playTone({ freq: 620, duration: 0.05, type: "square", volume: 0.08 });
  if (type === "cannon") playTone({ freq: 220, duration: 0.1, type: "sawtooth", volume: 0.12 });
  if (type === "sniper") playTone({ freq: 760, duration: 0.1, type: "triangle", volume: 0.1 });
  if (type === "zap") playTone({ freq: 980, duration: 0.07, type: "sine", volume: 0.09 });
  if (type === "hit") playTone({ freq: 300, duration: 0.05, type: "sine", volume: 0.06 });
  if (type === "cash") playTone({ freq: 680, duration: 0.08, type: "triangle", volume: 0.1 });
  if (type === "wave") playTone({ freq: 420, duration: 0.12, type: "square", volume: 0.1 });
  if (type === "gameover") playTone({ freq: 140, duration: 0.2, type: "sawtooth", volume: 0.2 });
}

function loadUnlocks() {
  const saved = localStorage.getItem(unlockKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === levels.length) {
        unlockedLevels = parsed;
        return;
      }
    } catch (error) {
      // ignore parse errors
    }
  }
  unlockedLevels = levels.map((_, index) => index === 0);
  saveUnlocks();
}

function saveUnlocks() {
  localStorage.setItem(unlockKey, JSON.stringify(unlockedLevels));
}

function loadLanguage() {
  const saved = localStorage.getItem(langKey);
  if (saved && (saved === "en" || saved === "th")) {
    currentLang = saved;
  } else {
    currentLang = "en";
  }
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem(langKey, lang);
  applyLanguage();
  ui.langPrompt.classList.add("hidden");
}

function setMenuMessage(text) {
  ui.menuMessage.textContent = text || "";
}

function applyLanguage() {
  const t = i18n[currentLang];
  document.querySelector(".brand").textContent = t.title;
  document.querySelector(".sub").textContent = t.subtitle;
  document.querySelector(".menu-card h1").textContent = t.title;
  document.getElementById("startGame").textContent = t.startLevel;
  document.getElementById("resumeGame").textContent = t.resume;
  document.getElementById("startWave").textContent = t.startWave;
  document.getElementById("pause").textContent = t.pause;
  document.getElementById("openMenu").textContent = t.menu;
  document.querySelector(".menu-title").textContent = t.chooseLevel;
  document.querySelector(".menu-note").textContent = t.menuNote;
  document.querySelectorAll(".panel-title")[0].textContent = t.build;
  document.querySelectorAll(".panel-title")[1].textContent = t.wave;
  document.querySelectorAll(".panel-title")[2].textContent = t.selectedTower;
  document.querySelectorAll(".panel-title")[3].textContent = t.tipsTitle;
  document.querySelectorAll(".stats .stat span")[0].textContent = t.lives;
  document.querySelectorAll(".stats .stat span")[1].textContent = t.cash;
  document.querySelectorAll(".stats .stat span")[2].textContent = t.wave;
  document.querySelectorAll(".stats .stat span")[3].textContent = t.progress;
  document.querySelectorAll(".panel-block.small p")[0].textContent = t.tips1;
  document.querySelectorAll(".panel-block.small p")[1].textContent = t.tips2;
  ui.towerButtons.forEach((button) => {
    const key = button.dataset.tower;
    const nameEl = button.querySelector(".tower-name");
    const descEl = button.querySelector(".tower-desc");
    if (t.towers[key]) {
      nameEl.textContent = t.towers[key].name;
      descEl.textContent = t.towers[key].desc;
    }
  });
  document.querySelectorAll(".row span")[0].textContent = t.speed;
  document.querySelectorAll(".row span")[1].textContent = t.pause;
  ui.popupTitle.textContent = t.popupTitle;
  ui.popupClose.textContent = t.popupButton;
  ui.rotatePrompt.querySelector(".rotate-card").textContent = t.rotate;
  ui.langPrompt.querySelector(".lang-title").textContent = t.langTitle;
  setMenuMessage(t.menuMessage);
  setHint(t.hintPlace);
  updateUpgradePanel();
  renderLevels();
}

function showPopup(title, body) {
  ui.popupTitle.textContent = title;
  ui.popupBody.textContent = body;
  ui.popup.classList.remove("hidden");
}

function hidePopup() {
  ui.popup.classList.add("hidden");
}

function buildWave(number) {
  const levelBoost = levels[currentLevel].difficulty;
  const count = Math.floor(6 + number * 2.6 * levelBoost);
  const health = Math.floor(40 + number * 20 * levelBoost);
  const speed = 40 + number * 2 + currentLevel * 4;
  let bossCount = number % 5 === 0 ? 1 : 0;
  if (number % 5 === 0 && currentLevel >= 1) bossCount += 1;
  if (number % 5 === 0 && currentLevel >= 2) bossCount += 1;
  return { count, health, speed, bounty: 12 + number * 2, bossCount };
}

function wavesTarget() {
  return levels[currentLevel].wavesToWin;
}

function setHint(text) {
  ui.hint.textContent = text;
}

function updateUI() {
  ui.lives.textContent = lives;
  ui.cash.textContent = money;
  ui.wave.textContent = wave;
  ui.waveCount.textContent = `${wave}/${wavesTarget()}`;
  updateUpgradePanel();
}

function gridSnap(value) {
  return Math.floor(value / gridSize) * gridSize + gridSize / 2;
}

function isOnPath(x, y) {
  for (let i = 0; i < pathPoints.length - 1; i++) {
    const a = pathPoints[i];
    const b = pathPoints[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    const t = ((x - a.x) * dx + (y - a.y) * dy) / (length * length);
    if (t >= 0 && t <= 1) {
      const px = a.x + dx * t;
      const py = a.y + dy * t;
      if (Math.hypot(x - px, y - py) < 32) return true;
    }
  }
  return false;
}

function isOccupied(x, y) {
  return towers.some((tower) => Math.hypot(tower.x - x, tower.y - y) < gridSize * 0.6);
}

function getTowerStats(tower) {
  const base = towerTypes[tower.type];
  const level = tower.level || 0;
  const damage = base.damage * (1 + 0.35 * level);
  const range = base.range * (1 + 0.12 * level);
  const fireRate = Math.max(0.12, base.fireRate * (1 - 0.12 * level));
  const bulletSpeed = base.bulletSpeed ? base.bulletSpeed * (1 + 0.08 * level) : 0;
  return {
    ...base,
    damage,
    range,
    fireRate,
    bulletSpeed,
    chain: base.chain || 0,
    slow: base.slow || 0,
    slowDuration: base.slowDuration || 0,
  };
}

function getUpgradeCost(tower) {
  const base = towerTypes[tower.type].cost;
  const level = tower.level || 0;
  return Math.floor(base * (0.7 + 0.6 * (level + 1)));
}

function maxLevelReached(tower) {
  return (tower.level || 0) >= 2;
}

function placeTower(x, y) {
  if (!selectedTower) return;
  const type = towerTypes[selectedTower];
  if (money < type.cost) {
    setHint(i18n[currentLang].hintNoCash);
    return;
  }
  if (isOnPath(x, y)) {
    setHint(i18n[currentLang].hintBlocked);
    return;
  }
  if (isOccupied(x, y)) {
    setHint(i18n[currentLang].hintOccupied);
    return;
  }

  towers.push({
    x,
    y,
    type: selectedTower,
    cooldown: 0,
    level: 0,
    angle: 0,
    spent: type.cost,
  });
  money -= type.cost;
  updateUI();
  playSound("place");
  setHint(i18n[currentLang].hintPlaced);
}

function startWave() {
  if (waveInProgress || gameState !== "playing") return;
  if (wave >= wavesTarget()) {
    setHint(i18n[currentLang].hintAllClear);
    return;
  }
  wave += 1;
  const waveData = buildWave(wave);
  enemiesToSpawn = waveData.count;
  spawnTimer = 0.2;
  spawnInterval = Math.max(0.3, 0.8 - wave * 0.03);
  waveInProgress = true;
  setHint(i18n[currentLang].hintWave(wave));
  waves.push(waveData);
  playSound("wave");
  updateUI();
}

function rollEnemyType(waveData) {
  if (waveData.bossCount > 0) {
    waveData.bossCount -= 1;
    return "boss";
  }
  const roll = Math.random();
  if (wave >= 4 && roll < 0.22) return "fast";
  if (wave >= 5 && roll < 0.42) return "tank";
  return "normal";
}

function spawnEnemy() {
  const waveData = waves[waves.length - 1];
  const kind = rollEnemyType(waveData);
  const type = enemyTypes[kind];
  const enemy = {
    x: pathPoints[0].x,
    y: pathPoints[0].y,
    hp: waveData.health * type.hp,
    maxHp: waveData.health * type.hp,
    speed: waveData.speed * type.speed,
    bounty: Math.floor(waveData.bounty * type.bounty),
    waypoint: 1,
    radius: type.radius,
    kind,
    slowFactor: 1,
    slowTimer: 0,
  };
  enemies.push(enemy);
}

function updateEnemies(dt) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    if (enemy.slowTimer && enemy.slowTimer > 0) {
      enemy.slowTimer -= dt;
      if (enemy.slowTimer <= 0) {
        enemy.slowFactor = 1;
      }
    }
    const target = pathPoints[enemy.waypoint];
    if (!target) {
      enemies.splice(i, 1);
      continue;
    }
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 2) {
      enemy.waypoint += 1;
      if (enemy.waypoint >= pathPoints.length) {
        enemies.splice(i, 1);
        lives -= 1;
        setHint(i18n[currentLang].hintSlip);
        updateUI();
        if (lives <= 0) {
          setHint(i18n[currentLang].hintGameOver);
          playSound("gameover");
          setMenuMessage(i18n[currentLang].hintGameOver);
          setGameState("menu");
        }
      }
      continue;
    }
    const slow = enemy.slowFactor || 1;
    const vx = (dx / dist) * enemy.speed * slow * dt;
    const vy = (dy / dist) * enemy.speed * slow * dt;
    enemy.x += vx;
    enemy.y += vy;
  }
}

function findTargets(tower, limit = 1) {
  const type = getTowerStats(tower);
  return enemies
    .map((enemy) => ({ enemy, dist: Math.hypot(enemy.x - tower.x, enemy.y - tower.y) }))
    .filter((entry) => entry.dist <= type.range)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, limit)
    .map((entry) => entry.enemy);
}

function updateTowers(dt) {
  for (const tower of towers) {
    const type = getTowerStats(tower);
    tower.cooldown -= dt;
    if (tower.cooldown <= 0) {
      if (type.beam) {
        const targets = findTargets(tower, type.chain || 1);
        if (targets.length) {
          const angle = Math.atan2(targets[0].y - tower.y, targets[0].x - tower.x);
          tower.angle = angle;
          targets.forEach((enemy) => {
            applyDamage(enemy, type.damage);
            zaps.push({
              x1: tower.x,
              y1: tower.y,
              x2: enemy.x,
              y2: enemy.y,
              alpha: 1,
            });
          });
          playSound("zap");
          tower.cooldown = type.fireRate;
        }
      } else {
        const target = findTargets(tower, 1)[0];
        if (target) {
          const angle = Math.atan2(target.y - tower.y, target.x - tower.x);
          tower.angle = angle;
          const barrel = tower.type === "sniper" ? 22 : tower.type === "cannon" ? 18 : 16;
          const spawnX = tower.x + Math.cos(angle) * barrel;
          const spawnY = tower.y + Math.sin(angle) * barrel;
          flashes.push({ x: spawnX, y: spawnY, angle, alpha: 1, size: tower.type === "cannon" ? 12 : 8 });
          for (let i = 0; i < (tower.type === "cannon" ? 6 : 3); i++) {
            smokes.push({
              x: spawnX + (Math.random() - 0.5) * 6,
              y: spawnY + (Math.random() - 0.5) * 6,
              vx: (Math.random() - 0.5) * 8,
              vy: -10 - Math.random() * 10,
              alpha: 0.6,
              radius: 4 + Math.random() * 4,
            });
          }
          bullets.push({
            x: spawnX,
            y: spawnY,
            vx: Math.cos(angle) * type.bulletSpeed,
            vy: Math.sin(angle) * type.bulletSpeed,
            damage: type.damage,
            splash: type.splash || 0,
            color: type.color,
            kind: tower.type,
            gravity: tower.type === "cannon" ? 220 : 0,
            slow: type.slow || 0,
            slowDuration: type.slowDuration || 0,
          });
          if (tower.type === "cannon") playSound("cannon");
          else if (tower.type === "sniper") playSound("sniper");
          else playSound("shoot");
          tower.cooldown = type.fireRate;
        }
      }
    }
  }
}

function applyDamage(enemy, amount) {
  enemy.hp -= amount;
  playSound("hit");
  if (enemy.hp <= 0) {
    money += enemy.bounty;
    effects.push({ x: enemy.x, y: enemy.y, radius: 6, alpha: 1 });
    const index = enemies.indexOf(enemy);
    if (index >= 0) enemies.splice(index, 1);
    updateUI();
    playSound("cash");
  }
}

function applySlow(enemy, slowFactor, duration) {
  if (!slowFactor || !duration) return;
  enemy.slowTimer = Math.max(enemy.slowTimer || 0, duration);
  enemy.slowFactor = Math.min(enemy.slowFactor || 1, slowFactor);
}

function updateBullets(dt) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    if (bullet.gravity) {
      bullet.vy += bullet.gravity * dt;
    }
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;

    let hit = false;
    for (const enemy of enemies) {
      if (Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y) < enemy.radius) {
        if (bullet.splash > 0) {
          for (const near of enemies) {
            if (Math.hypot(near.x - bullet.x, near.y - bullet.y) <= bullet.splash) {
              applyDamage(near, bullet.damage);
              applySlow(near, bullet.slow, bullet.slowDuration);
            }
          }
        } else {
          applyDamage(enemy, bullet.damage);
          applySlow(enemy, bullet.slow, bullet.slowDuration);
        }
        hit = true;
        break;
      }
    }

    if (hit || bullet.x < -50 || bullet.x > map.width + 50 || bullet.y < -50 || bullet.y > map.height + 50) {
      if (bullet.kind === "cannon") {
        effects.push({ x: bullet.x, y: bullet.y, radius: 8, alpha: 1 });
      }
      bullets.splice(i, 1);
    }
  }
}

function updateEffects(dt) {
  for (let i = effects.length - 1; i >= 0; i--) {
    const effect = effects[i];
    effect.radius += 80 * dt;
    effect.alpha -= 1.4 * dt;
    if (effect.alpha <= 0) effects.splice(i, 1);
  }

  for (let i = zaps.length - 1; i >= 0; i--) {
    const zap = zaps[i];
    zap.alpha -= 2.2 * dt;
    if (zap.alpha <= 0) zaps.splice(i, 1);
  }

  for (let i = flashes.length - 1; i >= 0; i--) {
    const flash = flashes[i];
    flash.alpha -= 6 * dt;
    if (flash.alpha <= 0) flashes.splice(i, 1);
  }

  for (let i = smokes.length - 1; i >= 0; i--) {
    const puff = smokes[i];
    puff.x += puff.vx * dt;
    puff.y += puff.vy * dt;
    puff.alpha -= 1.2 * dt;
    puff.radius += 8 * dt;
    if (puff.alpha <= 0) smokes.splice(i, 1);
  }
}

function handleWin() {
  const nextLevel = currentLevel + 1;
  if (levels[nextLevel]) {
    unlockedLevels[nextLevel] = true;
    saveUnlocks();
  }
  pendingNextLevel = levels[nextLevel] ? nextLevel : 0;
  setMenuMessage(i18n[currentLang].popupTitle);
  renderLevels();
  ui.popupClose.textContent = levels[nextLevel]
    ? i18n[currentLang].popupButton
    : i18n[currentLang].replayButton;
  showPopup(
    i18n[currentLang].popupTitle,
    i18n[currentLang].menuWin(levels[nextLevel])
  );
}

function updateSpawn(dt) {
  if (!waveInProgress || gameState !== "playing") return;
  spawnTimer -= dt;
  if (spawnTimer <= 0 && enemiesToSpawn > 0) {
    spawnEnemy();
    enemiesToSpawn -= 1;
    spawnTimer = spawnInterval;
  }

  if (enemiesToSpawn === 0 && enemies.length === 0) {
    waveInProgress = false;
    if (wave >= wavesTarget()) {
      setHint(i18n[currentLang].hintAllClear);
      handleWin();
    } else {
      setHint(i18n[currentLang].hintWaveClear);
    }
  }
}

function drawGrid() {
  ctx.strokeStyle = currentTheme.grid;
  ctx.lineWidth = 1;
  for (let x = 0; x <= map.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, map.height);
    ctx.stroke();
  }
  for (let y = 0; y <= map.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(map.width, y);
    ctx.stroke();
  }
}

function drawBackground() {
  const levelImage = levelImages[currentLevel];
  if (levelImage && levelImage.complete && levelImage.naturalWidth > 0) {
    const canvasRatio = map.width / map.height;
    const imageRatio = levelImage.naturalWidth / levelImage.naturalHeight;
    let drawWidth = map.width;
    let drawHeight = map.height;
    let offsetX = 0;
    let offsetY = 0;
    if (imageRatio > canvasRatio) {
      drawWidth = map.height * imageRatio;
      offsetX = (map.width - drawWidth) / 2;
    } else {
      drawHeight = map.width / imageRatio;
      offsetY = (map.height - drawHeight) / 2;
    }
    ctx.drawImage(levelImage, offsetX, offsetY, drawWidth, drawHeight);
    ctx.fillStyle = "rgba(10, 14, 18, 0.35)";
    ctx.fillRect(0, 0, map.width, map.height);
  } else {
    ctx.fillStyle = currentTheme.grass;
    ctx.fillRect(0, 0, map.width, map.height);
  }

  const gradient = ctx.createLinearGradient(0, 0, map.width, map.height);
  gradient.addColorStop(0, currentTheme.glow);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, map.width, map.height);

  if (currentTheme.style === "industrial") {
    ctx.fillStyle = "rgba(255,255,255,0.035)";
    for (let x = 0; x < map.width; x += 110) {
      ctx.fillRect(x, 0, 28, map.height);
    }
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 2;
    for (let y = 40; y < map.height; y += 120) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(map.width, y);
      ctx.stroke();
    }
  } else {
    ctx.strokeStyle = "rgba(120, 200, 255, 0.12)";
    ctx.lineWidth = 1;
    for (let x = 0; x < map.width; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 40, map.height);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(124, 92, 255, 0.1)";
    for (let y = 0; y < map.height; y += 70) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(map.width, y + 30);
      ctx.stroke();
    }
  }
}

function drawPath() {
  ctx.strokeStyle = currentTheme.path;
  ctx.lineWidth = 50;
  ctx.lineCap = "round";
  if (levelImages[currentLevel] && levelImages[currentLevel].complete) {
    ctx.globalAlpha = 0.7;
  }
  ctx.beginPath();
  ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
  for (const point of pathPoints.slice(1)) {
    ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 4;
  ctx.setLineDash([16, 16]);
  ctx.beginPath();
  ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
  for (const point of pathPoints.slice(1)) {
    ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawTowers() {
  const baseSizes = { gun: 44, cannon: 52, sniper: 48, cryo: 46 };
  for (const tower of towers) {
    const type = getTowerStats(tower);
    const angle = tower.angle || 0;
    const level = tower.level || 0;
    const sizeBoost = 1 + level * 0.08;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(tower.x + 6, tower.y + 8, 18 * sizeBoost, 10 * sizeBoost, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(tower.x, tower.y);
    ctx.rotate(angle);

    const img = towerImages[tower.type];
    if (img) {
      const base = baseSizes[tower.type] || 46;
      const w = base * sizeBoost;
      const h = base * sizeBoost;
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
    } else {
      if (tower.type === "cannon") {
        ctx.fillStyle = type.color;
        ctx.strokeStyle = "#101416";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 18 * sizeBoost, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#101416";
        ctx.fillRect(-6, -6, 26 * sizeBoost, 12 * sizeBoost);
        ctx.fillStyle = "#2f1a12";
        ctx.fillRect(10, -4, 18 * sizeBoost, 8 * sizeBoost);
      } else if (tower.type === "sniper") {
        ctx.fillStyle = type.color;
        ctx.strokeStyle = "#0b0f12";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 14 * sizeBoost, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#0b0f12";
        ctx.fillRect(-4, -4, 30 * sizeBoost, 8 * sizeBoost);
        ctx.fillStyle = "#334155";
        ctx.fillRect(18, -2, 16 * sizeBoost, 4 * sizeBoost);
      } else if (tower.type === "cryo") {
        ctx.fillStyle = type.color;
        ctx.strokeStyle = "#101416";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 16 * sizeBoost, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#b6f1ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6 * sizeBoost, -8 * sizeBoost);
        ctx.lineTo(10 * sizeBoost, 6 * sizeBoost);
        ctx.moveTo(6 * sizeBoost, -8 * sizeBoost);
        ctx.lineTo(-10 * sizeBoost, 6 * sizeBoost);
        ctx.stroke();
      } else {
        ctx.fillStyle = type.color;
        ctx.strokeStyle = "#101416";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 16 * sizeBoost, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#101416";
        ctx.fillRect(-6, -4, 22 * sizeBoost, 8 * sizeBoost);
      }
    }

    if (level > 0) {
      ctx.strokeStyle = `rgba(245, 177, 46, ${0.15 + level * 0.1})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 22 * sizeBoost, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    if (tower === selectedPlacedTower) {
      ctx.strokeStyle = type.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, type.range, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawEnemies() {
  for (const enemy of enemies) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    const size = enemy.radius * 2.64;
    if (enemyImage.complete && enemyImage.naturalWidth > 0) {
      ctx.drawImage(enemyImage, -size / 2, -size / 2, size, size);
    } else {
      ctx.fillStyle = "#d86a5a";
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    const barWidth = 40;
    const healthRatio = enemy.hp / enemy.maxHp;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 14, barWidth, 6);
    ctx.fillStyle = enemy.kind === "boss" ? "#f59e0b" : "#76ff84";
    ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 14, barWidth * healthRatio, 6);
  }
}

function drawBullets() {
  for (const bullet of bullets) {
    if (bullet.kind === "cannon") {
      ctx.fillStyle = "#3b2f2a";
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#f5b12e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bullet.x - bullet.vx * 0.02, bullet.y - bullet.vy * 0.02);
      ctx.lineTo(bullet.x - bullet.vx * 0.08, bullet.y - bullet.vy * 0.08);
      ctx.stroke();
    } else if (bullet.kind === "sniper") {
      ctx.strokeStyle = "#7dd3fc";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bullet.x, bullet.y);
      ctx.lineTo(bullet.x - bullet.vx * 0.04, bullet.y - bullet.vy * 0.04);
      ctx.stroke();
    } else {
      ctx.fillStyle = bullet.color;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.splash ? 5 : 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawEffects() {
  for (const effect of effects) {
    ctx.strokeStyle = `rgba(255, 215, 120, ${effect.alpha})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (const zap of zaps) {
    ctx.strokeStyle = `rgba(165, 85, 247, ${zap.alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(zap.x1, zap.y1);
    ctx.lineTo(zap.x2, zap.y2);
    ctx.stroke();
  }

  for (const flash of flashes) {
    ctx.save();
    ctx.translate(flash.x, flash.y);
    ctx.rotate(flash.angle);
    ctx.globalAlpha = flash.alpha;
    ctx.fillStyle = "#f5b12e";
    ctx.beginPath();
    ctx.moveTo(0, -flash.size * 0.4);
    ctx.lineTo(flash.size * 1.6, 0);
    ctx.lineTo(0, flash.size * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  for (const puff of smokes) {
    ctx.fillStyle = `rgba(180, 180, 180, ${puff.alpha})`;
    ctx.beginPath();
    ctx.arc(puff.x, puff.y, puff.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlacement(mouse) {
  if (!selectedTower || !mouse) return;
  ctx.save();
  ctx.globalAlpha = 0.4;
  const type = towerTypes[selectedTower];
  ctx.fillStyle = type.color;
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = type.color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, type.range, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawPlacementGrid() {
  if (!selectedTower) return;
  for (let y = gridSize / 2; y < map.height; y += gridSize) {
    for (let x = gridSize / 2; x < map.width; x += gridSize) {
      const blocked = isOnPath(x, y) || isOccupied(x, y);
      ctx.strokeStyle = blocked ? "rgba(255, 80, 80, 0.45)" : "rgba(80, 220, 120, 0.35)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x - gridSize / 2 + 2, y - gridSize / 2 + 2, gridSize - 4, gridSize - 4);
    }
  }
}

function drawPaused() {
  if (gameState !== "paused") return;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(0, 0, map.width, map.height);
  ctx.fillStyle = "#f6f1e8";
  ctx.font = "bold 36px Space Grotesk";
  ctx.textAlign = "center";
  ctx.fillText("Paused", map.width / 2, map.height / 2);
  ctx.restore();
}

let lastTime = 0;
let mousePos = null;

function update(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = ((timestamp - lastTime) / 1000) * gameSpeed;
  lastTime = timestamp;

  drawBackground();
  drawPath();
  drawGrid();
  drawPlacementGrid();

  if (gameState === "playing") {
    updateSpawn(dt);
    updateEnemies(dt);
    updateTowers(dt);
    updateBullets(dt);
    updateEffects(dt);
  }

  drawTowers();
  drawEnemies();
  drawBullets();
  drawEffects();
  drawPlacement(mousePos);
  drawPaused();

  requestAnimationFrame(update);
}

function setGameState(state) {
  gameState = state;
  if (state === "playing") {
    ui.menu.classList.add("hidden");
    ui.resumeGame.style.display = "none";
  } else {
    ui.menu.classList.remove("hidden");
    ui.resumeGame.style.display = state === "paused" ? "inline-flex" : "none";
  }
}

function resetGame(levelIndex) {
  currentLevel = levelIndex;
  const level = levels[levelIndex];
  pathPoints = level.path;
  currentTheme = level.theme;
  money = level.cash;
  lives = level.lives;
  wave = 0;
  towers.length = 0;
  enemies.length = 0;
  bullets.length = 0;
  effects.length = 0;
  zaps.length = 0;
  waves.length = 0;
  waveInProgress = false;
  enemiesToSpawn = 0;
  spawnTimer = 0;
  flashes.length = 0;
  smokes.length = 0;
  selectedPlacedTower = null;
  hidePopup();
  updateUpgradePanel();
  updateUI();
  setMenuMessage("");
  setHint(i18n[currentLang].hintSelect);
}

function updateUpgradePanel() {
  const empty = ui.upgradePanel.querySelector(".upgrade-empty");
  const details = ui.upgradePanel.querySelector(".upgrade-details");
  if (!selectedPlacedTower) {
    empty.classList.remove("hidden");
    details.classList.add("hidden");
    empty.textContent = i18n[currentLang].hintSelect;
    return;
  }
  const type = getTowerStats(selectedPlacedTower);
  const level = selectedPlacedTower.level || 0;
  empty.classList.add("hidden");
  details.classList.remove("hidden");
  const towerText = i18n[currentLang].towers[selectedPlacedTower.type];
  const baseName = towerText ? towerText.name : towerTypes[selectedPlacedTower.type].name;
  ui.upgradeName.textContent = `${baseName} Lv.${level + 1}`;
  ui.upgradeStats.textContent = `Damage ${type.damage.toFixed(0)} | Range ${type.range.toFixed(0)} | Rate ${type.fireRate.toFixed(2)}s`;
  if (maxLevelReached(selectedPlacedTower)) {
    ui.upgradeBtn.textContent = i18n[currentLang].maxLevel;
    ui.upgradeBtn.disabled = true;
  } else {
    const cost = getUpgradeCost(selectedPlacedTower);
    ui.upgradeBtn.textContent = i18n[currentLang].upgrade(cost);
    ui.upgradeBtn.disabled = money < cost;
  }
  ui.sellBtn.textContent = i18n[currentLang].sell;
}

function selectPlacedTower(tower) {
  selectedPlacedTower = tower;
  selectedTower = null;
  ui.towerButtons.forEach((btn) => btn.classList.remove("active"));
  updateUpgradePanel();
}

function renderLevels() {
  ui.levelList.innerHTML = "";
  setMenuMessage(i18n[currentLang].menuMessage);
  levels.forEach((level, index) => {
    const levelText = i18n[currentLang].levels[index] || { name: level.name, desc: level.desc };
    const card = document.createElement("div");
    card.className = "level-card";
    const locked = !unlockedLevels[index];
    if (index === currentLevel && !locked) card.classList.add("active");
    if (locked) card.classList.add("locked");
    card.innerHTML = `
      <div class="level-name">${levelText.name}</div>
      <div class="level-desc">${locked ? i18n[currentLang].menuLocked : levelText.desc}</div>
    `;
    if (!locked) {
      card.addEventListener("click", () => {
        currentLevel = index;
        renderLevels();
      });
    }
    ui.levelList.appendChild(card);
  });
}

function attemptStartWave() {
  if (lives <= 0) return;
  startWave();
}

function attemptUpgrade() {
  if (!selectedPlacedTower || maxLevelReached(selectedPlacedTower)) return;
  const cost = getUpgradeCost(selectedPlacedTower);
  if (money < cost) {
    setHint(i18n[currentLang].hintUpgradeNoCash);
    return;
  }
  money -= cost;
  selectedPlacedTower.level += 1;
  selectedPlacedTower.spent = (selectedPlacedTower.spent || towerTypes[selectedPlacedTower.type].cost) + cost;
  updateUI();
  updateUpgradePanel();
  setHint(i18n[currentLang].hintUpgrade);
  playSound("cash");
}

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  mousePos = { x: gridSnap(x), y: gridSnap(y) };
});

canvas.addEventListener("mouseleave", () => {
  mousePos = null;
});

canvas.addEventListener("click", (event) => {
  initAudio();
  if (gameState !== "playing") return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  const snapped = { x: gridSnap(x), y: gridSnap(y) };

  const clickedTower = towers.find((tower) => Math.hypot(tower.x - snapped.x, tower.y - snapped.y) < gridSize * 0.6);
  if (clickedTower) {
    selectPlacedTower(clickedTower);
    setHint(i18n[currentLang].hintSelectTower);
    return;
  }

  selectedPlacedTower = null;
  updateUpgradePanel();

  if (selectedTower) {
    placeTower(snapped.x, snapped.y);
  }
});

ui.startWave.addEventListener("click", () => {
  initAudio();
  attemptStartWave();
});

ui.speed.addEventListener("click", () => {
  initAudio();
  gameSpeed = gameSpeed === 1 ? 2 : 1;
  ui.speed.textContent = `${gameSpeed}x`;
});

ui.pause.addEventListener("click", () => {
  initAudio();
  if (gameState === "playing") {
    gameState = "paused";
    ui.pause.textContent = i18n[currentLang].resumePause;
    setGameState("paused");
  } else if (gameState === "paused") {
    gameState = "playing";
    ui.pause.textContent = i18n[currentLang].pause;
    setGameState("playing");
  }
});

ui.openMenu.addEventListener("click", () => {
  initAudio();
  setGameState("paused");
});

ui.popupClose.addEventListener("click", () => {
  initAudio();
  hidePopup();
  if (pendingNextLevel !== null) {
    currentLevel = pendingNextLevel;
    resetGame(currentLevel);
    ui.pause.textContent = i18n[currentLang].pause;
    setGameState("playing");
  } else {
    setGameState("menu");
  }
});

ui.startGame.addEventListener("click", () => {
  initAudio();
  if (!unlockedLevels[currentLevel]) {
    setMenuMessage(i18n[currentLang].menuLocked);
    return;
  }
  resetGame(currentLevel);
  ui.pause.textContent = i18n[currentLang].pause;
  hidePopup();
  setGameState("playing");
});

ui.resumeGame.addEventListener("click", () => {
  initAudio();
  ui.pause.textContent = i18n[currentLang].pause;
  setGameState("playing");
});

ui.upgradeBtn.addEventListener("click", () => {
  initAudio();
  attemptUpgrade();
});

ui.sellBtn.addEventListener("click", () => {
  initAudio();
  if (!selectedPlacedTower) return;
  const spent = selectedPlacedTower.spent || towerTypes[selectedPlacedTower.type].cost;
  const refund = Math.floor(spent * 0.5);
  money += refund;
  const index = towers.indexOf(selectedPlacedTower);
  if (index >= 0) towers.splice(index, 1);
  selectedPlacedTower = null;
  updateUI();
  updateUpgradePanel();
  setHint(i18n[currentLang].hintSell);
});

ui.towerButtons.forEach((button) => {
  button.addEventListener("click", () => {
    initAudio();
    ui.towerButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    selectedTower = button.dataset.tower;
    selectedPlacedTower = null;
    updateUpgradePanel();
  const type = towerTypes[selectedTower];
  const towerText = i18n[currentLang].towers[selectedTower];
  const towerName = towerText ? towerText.name : type.name;
  setHint(`${i18n[currentLang].hintPlace} (${towerName} $${type.cost})`);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    if (gameState === "playing") {
      initAudio();
      attemptStartWave();
    }
  }
  if (event.key.toLowerCase() === "u") {
    if (gameState === "playing") {
      initAudio();
      attemptUpgrade();
    }
  }
});

function updateOrientationPrompt() {
  const isPortrait = window.innerHeight > window.innerWidth;
  if (isPortrait) {
    ui.rotatePrompt.classList.remove("hidden");
  } else {
    ui.rotatePrompt.classList.add("hidden");
  }
}

ui.langPrompt.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-lang]");
  if (!button) return;
  setLanguage(button.dataset.lang);
});

loadUnlocks();
loadLanguage();
applyLanguage();
loadTowerImages();
if (!localStorage.getItem(langKey)) {
  ui.langPrompt.classList.remove("hidden");
}
updateOrientationPrompt();
window.addEventListener("resize", updateOrientationPrompt);
renderLevels();
updateUI();
setGameState("menu");
setHint(i18n[currentLang].hintSelect);
requestAnimationFrame(update);
