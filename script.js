const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  lives: document.getElementById("lives"),
  cash: document.getElementById("cash"),
  wave: document.getElementById("wave"),
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
    wavesToWin: 8,
    difficulty: 1,
    theme: {
      grass: "#1d2b24",
      path: "#3a2c20",
      grid: "rgba(255,255,255,0.04)",
      glow: "rgba(245, 177, 46, 0.08)",
    },
    path: [
      { x: -40, y: 280 },
      { x: 200, y: 280 },
      { x: 200, y: 120 },
      { x: 520, y: 120 },
      { x: 520, y: 360 },
      { x: 820, y: 360 },
      { x: 820, y: 200 },
      { x: 1040, y: 200 },
    ],
  },
  {
    name: "Forked Road",
    desc: "A double-back path that crowds the center.",
    cash: 180,
    lives: 18,
    wavesToWin: 9,
    difficulty: 1.15,
    theme: {
      grass: "#1b2430",
      path: "#2c3b4a",
      grid: "rgba(160, 200, 255, 0.06)",
      glow: "rgba(125, 211, 252, 0.12)",
    },
    path: [
      { x: -40, y: 120 },
      { x: 240, y: 120 },
      { x: 240, y: 420 },
      { x: 480, y: 420 },
      { x: 480, y: 180 },
      { x: 700, y: 180 },
      { x: 700, y: 460 },
      { x: 980, y: 460 },
      { x: 980, y: 280 },
      { x: 1040, y: 280 },
    ],
  },
  {
    name: "Canyon Run",
    desc: "Shorter path, faster waves.",
    cash: 200,
    lives: 16,
    wavesToWin: 10,
    difficulty: 1.35,
    theme: {
      grass: "#2b1d1b",
      path: "#4a2f24",
      grid: "rgba(255, 190, 130, 0.06)",
      glow: "rgba(255, 107, 61, 0.12)",
    },
    path: [
      { x: -40, y: 320 },
      { x: 180, y: 320 },
      { x: 180, y: 80 },
      { x: 420, y: 80 },
      { x: 420, y: 300 },
      { x: 660, y: 300 },
      { x: 660, y: 120 },
      { x: 900, y: 120 },
      { x: 900, y: 420 },
      { x: 1040, y: 420 },
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
  tesla: {
    name: "Tesla",
    cost: 140,
    range: 140,
    fireRate: 0.7,
    damage: 18,
    chain: 3,
    color: "#a855f7",
    beam: true,
  },
};

const enemyTypes = {
  normal: { name: "Normal", hp: 1, speed: 1, radius: 20, bounty: 1, ring: "#f6f1e8" },
  fast: { name: "Fast", hp: 0.7, speed: 1.45, radius: 16, bounty: 0.9, ring: "#7dd3fc" },
  tank: { name: "Tank", hp: 2.2, speed: 0.75, radius: 24, bounty: 1.4, ring: "#f59e0b" },
  boss: { name: "Boss", hp: 6.0, speed: 0.6, radius: 32, bounty: 4.0, ring: "#a855f7" },
};

const enemyImage = new Image();
enemyImage.src = "assets/enemy.png";
enemyImage.onerror = () => {
  setMenuMessage("Enemy image missing. Check assets/enemy.png.");
};

let pathPoints = levels[0].path;
let money = levels[0].cash;
let lives = levels[0].lives;
let wave = 0;
let selectedTower = null;
let selectedPlacedTower = null;
let gameSpeed = 1;
let gameState = "menu";
let currentLevel = 0;
let currentTheme = levels[0].theme;
const unlockKey = "face-td-unlocks";
let unlockedLevels = [];

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

function setMenuMessage(text) {
  ui.menuMessage.textContent = text || "";
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
  const bossCount = number % 5 === 0 ? 1 : 0;
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
    setHint("Not enough cash for that tower.");
    return;
  }
  if (isOnPath(x, y)) {
    setHint("Can't place on the path.");
    return;
  }
  if (isOccupied(x, y)) {
    setHint("Space already occupied.");
    return;
  }

  towers.push({
    x,
    y,
    type: selectedTower,
    cooldown: 0,
    level: 0,
    angle: 0,
  });
  money -= type.cost;
  updateUI();
  playSound("place");
  setHint("Tower placed.");
}

function startWave() {
  if (waveInProgress || gameState !== "playing") return;
  if (wave >= wavesTarget()) {
    setHint("All waves cleared. Open the menu to continue.");
    return;
  }
  wave += 1;
  const waveData = buildWave(wave);
  enemiesToSpawn = waveData.count;
  spawnTimer = 0.2;
  spawnInterval = Math.max(0.3, 0.8 - wave * 0.03);
  waveInProgress = true;
  setHint(`Wave ${wave} incoming.`);
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
  };
  enemies.push(enemy);
}

function updateEnemies(dt) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
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
        setHint("An enemy slipped through!");
        updateUI();
        if (lives <= 0) {
          setHint("Game over. Open the menu to restart.");
          playSound("gameover");
          setMenuMessage("Game over. Try again?");
          setGameState("menu");
        }
      }
      continue;
    }
    const vx = (dx / dist) * enemy.speed * dt;
    const vy = (dy / dist) * enemy.speed * dt;
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
            }
          }
        } else {
          applyDamage(enemy, bullet.damage);
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
  setMenuMessage(`Level cleared! ${levels[nextLevel] ? "Next level unlocked." : "You beat all levels!"}`);
  renderLevels();
  showPopup(
    "Level Cleared!",
    levels[nextLevel] ? "Next level unlocked. Ready for the next challenge?" : "You beat all levels! Want to replay?"
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
      setHint("All waves cleared!");
      handleWin();
    } else {
      setHint("Wave cleared. Start the next wave when ready.");
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
  ctx.fillStyle = currentTheme.grass;
  ctx.fillRect(0, 0, map.width, map.height);

  const gradient = ctx.createLinearGradient(0, 0, map.width, map.height);
  gradient.addColorStop(0, currentTheme.glow);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, map.width, map.height);

  ctx.fillStyle = "rgba(255,255,255,0.03)";
  for (let x = 0; x < map.width; x += 120) {
    ctx.fillRect(x, 0, 30, map.height);
  }
}

function drawPath() {
  ctx.strokeStyle = currentTheme.path;
  ctx.lineWidth = 50;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
  for (const point of pathPoints.slice(1)) {
    ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();

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
    } else if (tower.type === "tesla") {
      ctx.fillStyle = type.color;
      ctx.strokeStyle = "#101416";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 16 * sizeBoost, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#c084fc";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4 * sizeBoost, -8 * sizeBoost);
      ctx.lineTo(8 * sizeBoost, 8 * sizeBoost);
      ctx.moveTo(4 * sizeBoost, -8 * sizeBoost);
      ctx.lineTo(-8 * sizeBoost, 8 * sizeBoost);
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
    const size = enemy.radius * 2.2;
    if (enemyImage.complete && enemyImage.naturalWidth > 0) {
      ctx.drawImage(enemyImage, -size / 2, -size / 2, size, size);
    } else {
      ctx.fillStyle = "#d86a5a";
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    const ringColor = enemyTypes[enemy.kind]?.ring || "#f6f1e8";
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius + 4, 0, Math.PI * 2);
    ctx.stroke();
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
  setHint("Select a tower to begin.");
}

function updateUpgradePanel() {
  const empty = ui.upgradePanel.querySelector(".upgrade-empty");
  const details = ui.upgradePanel.querySelector(".upgrade-details");
  if (!selectedPlacedTower) {
    empty.classList.remove("hidden");
    details.classList.add("hidden");
    return;
  }
  const type = getTowerStats(selectedPlacedTower);
  const level = selectedPlacedTower.level || 0;
  empty.classList.add("hidden");
  details.classList.remove("hidden");
  ui.upgradeName.textContent = `${towerTypes[selectedPlacedTower.type].name} Lv.${level + 1}`;
  ui.upgradeStats.textContent = `Damage ${type.damage.toFixed(0)} | Range ${type.range.toFixed(0)} | Rate ${type.fireRate.toFixed(2)}s`;
  if (maxLevelReached(selectedPlacedTower)) {
    ui.upgradeBtn.textContent = "Max Level";
    ui.upgradeBtn.disabled = true;
  } else {
    const cost = getUpgradeCost(selectedPlacedTower);
    ui.upgradeBtn.textContent = `Upgrade ($${cost})`;
    ui.upgradeBtn.disabled = money < cost;
  }
}

function selectPlacedTower(tower) {
  selectedPlacedTower = tower;
  selectedTower = null;
  ui.towerButtons.forEach((btn) => btn.classList.remove("active"));
  updateUpgradePanel();
}

function renderLevels() {
  ui.levelList.innerHTML = "";
  levels.forEach((level, index) => {
    const card = document.createElement("div");
    card.className = "level-card";
    const locked = !unlockedLevels[index];
    if (index === currentLevel && !locked) card.classList.add("active");
    if (locked) card.classList.add("locked");
    card.innerHTML = `
      <div class="level-name">${level.name}</div>
      <div class="level-desc">${locked ? "Locked. Clear previous level." : level.desc}</div>
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
    setHint("Not enough cash to upgrade.");
    return;
  }
  money -= cost;
  selectedPlacedTower.level += 1;
  updateUI();
  updateUpgradePanel();
  setHint("Tower upgraded.");
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
    setHint("Tower selected. Upgrade or sell from the panel.");
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
    ui.pause.textContent = "Resume";
    setGameState("paused");
  } else if (gameState === "paused") {
    gameState = "playing";
    ui.pause.textContent = "Pause";
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
  setGameState("menu");
});

ui.startGame.addEventListener("click", () => {
  initAudio();
  if (!unlockedLevels[currentLevel]) {
    setMenuMessage("That level is locked.");
    return;
  }
  resetGame(currentLevel);
  ui.pause.textContent = "Pause";
  hidePopup();
  setGameState("playing");
});

ui.resumeGame.addEventListener("click", () => {
  initAudio();
  ui.pause.textContent = "Pause";
  setGameState("playing");
});

ui.upgradeBtn.addEventListener("click", () => {
  initAudio();
  attemptUpgrade();
});

ui.sellBtn.addEventListener("click", () => {
  initAudio();
  if (!selectedPlacedTower) return;
  const type = towerTypes[selectedPlacedTower.type];
  const refund = Math.floor(type.cost * (0.6 + 0.15 * (selectedPlacedTower.level || 0)));
  money += refund;
  const index = towers.indexOf(selectedPlacedTower);
  if (index >= 0) towers.splice(index, 1);
  selectedPlacedTower = null;
  updateUI();
  updateUpgradePanel();
  setHint("Tower sold.");
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
    setHint(`Placing ${type.name}. Cost $${type.cost}.`);
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

loadUnlocks();
renderLevels();
updateUI();
setGameState("menu");
setHint("Select a tower to begin.");
requestAnimationFrame(update);
