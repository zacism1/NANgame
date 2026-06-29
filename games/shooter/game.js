const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const DISPLAY_WIDTH = 640;
const DISPLAY_HEIGHT = 360;
const RENDER_SCALE = 2;
const RENDER_WIDTH = DISPLAY_WIDTH / RENDER_SCALE;
const VIEW_HEIGHT = DISPLAY_HEIGHT - STATUS_BAR_H;
const RENDER_VIEW_HEIGHT = Math.floor(VIEW_HEIGHT / RENDER_SCALE);

canvas.width = DISPLAY_WIDTH;
canvas.height = DISPLAY_HEIGHT;

const renderCanvas = document.createElement("canvas");
renderCanvas.width = RENDER_WIDTH;
renderCanvas.height = RENDER_VIEW_HEIGHT;
const renderCtx = renderCanvas.getContext("2d");
renderCtx.imageSmoothingEnabled = false;

const framebuffer = renderCtx.createImageData(RENDER_WIDTH, RENDER_VIEW_HEIGHT);
const zBuffer = new Float32Array(RENDER_WIDTH);

let lastTime = 0;
let gameState = "intro";
let spaceWasDown = false;
let eWasDown = false;
let rWasDown = false;
let fps = 0;
let frameCount = 0;
let fpsTimer = 0;

const ui = {
  overlay: document.getElementById("overlay"),
  overlayTitle: document.getElementById("overlayTitle"),
  overlayBody: document.getElementById("overlayBody"),
  introOverlay: document.getElementById("introOverlay"),
  focusPrompt: document.getElementById("focusPrompt"),
  hitFlash: document.getElementById("hitFlash"),
  doorHint: document.getElementById("doorHint"),
};

function showWin() {
  gameState = "won";
  ui.overlayTitle.textContent = "YOU ESCAPED!";
  ui.overlayBody.textContent =
    "You fought through Nan's jail guards and broke free. Zac is out — for now.\n\nSCORE: " + gameStats.score;
  ui.overlay.classList.remove("hidden");
}

function showLose() {
  gameState = "lost";
  ui.overlayTitle.textContent = "CAUGHT!";
  ui.overlayBody.textContent = "Nan's guards got you. The jail doors slam shut...\n\nTry again?";
  ui.overlay.classList.remove("hidden");
}

function resetGame() {
  resetPlayer();
  resetEnemies();
  resetDoors();
  resetPickups();
  resetStats();
  shootCooldown = 0;
  recoil = 0;
  muzzleFlash = 0;
  screenFlash = 0;
  reloadTimer = 0;
  isReloading = false;
  gameState = "playing";
  ui.overlay.classList.add("hidden");
  ui.introOverlay.classList.add("hidden");
}

function startIntro() {
  resetPlayer();
  resetEnemies();
  resetDoors();
  resetPickups();
  resetStats();
  gameState = "intro";
  ui.overlay.classList.add("hidden");
  ui.introOverlay.classList.remove("hidden");
}

function flashHit() {
  if (!ui.hitFlash) return;
  ui.hitFlash.classList.add("active");
  clearTimeout(flashHit.timer);
  flashHit.timer = setTimeout(() => ui.hitFlash.classList.remove("active"), 120);
}

function updateDoorHint() {
  const door = getNearestDoor();
  if (door) {
    const text = door.open ? "[E] CLOSE DOOR" : "[E] OPEN DOOR";
    if (ui.doorHint) {
      ui.doorHint.textContent = text;
      ui.doorHint.classList.remove("hidden");
    }
  } else if (ui.doorHint) {
    ui.doorHint.classList.add("hidden");
  }
}

function renderCrosshair() {
  const cx = DISPLAY_WIDTH / 2;
  const cy = VIEW_HEIGHT / 2;
  ctx.strokeStyle = "rgba(220, 220, 200, 0.75)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy);
  ctx.lineTo(cx + 7, cy);
  ctx.moveTo(cx, cy - 7);
  ctx.lineTo(cx, cy + 7);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 80, 60, 0.5)";
  ctx.fillRect(cx - 1, cy - 1, 2, 2);
}

function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  frameCount++;
  if (timestamp - fpsTimer >= 1000) {
    fps = frameCount;
    frameCount = 0;
    fpsTimer = timestamp;
  }

  if (gameState === "playing") {
    updatePlayer(dt);
    updateWeapon(dt);
    updateGuards(dt);
    updatePickups(dt);
    updateDoorHint();

    const spaceDown = keys[" "];
    if (spaceDown && !spaceWasDown) {
      if (tryShoot()) flashHit();
    }
    spaceWasDown = spaceDown;

    const eDown = keys.e || keys.E;
    if (eDown && !eWasDown) {
      tryToggleDoor();
    }
    eWasDown = eDown;

    const rDown = keys.r || keys.R;
    if (rDown && !rWasDown) {
      tryReload();
    }
    rWasDown = rDown;

    if (getAliveEnemyCount() === 0) {
      showWin();
    } else if (gameStats.health <= 0) {
      showLose();
    }
  }

  if (gameState === "intro" || gameState === "playing" || gameState === "won" || gameState === "lost") {
    renderScene(framebuffer.data, RENDER_WIDTH, RENDER_VIEW_HEIGHT, player, zBuffer);
    renderCtx.putImageData(framebuffer, 0, 0);
    renderAmmoPickups(renderCtx, player, RENDER_WIDTH, RENDER_VIEW_HEIGHT, zBuffer);
    renderSprites(renderCtx, player, RENDER_WIDTH, RENDER_VIEW_HEIGHT, zBuffer);
    renderProjectiles(renderCtx, player, RENDER_WIDTH, RENDER_VIEW_HEIGHT);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, DISPLAY_WIDTH, VIEW_HEIGHT);
    ctx.drawImage(
      renderCanvas,
      0, 0, RENDER_WIDTH, RENDER_VIEW_HEIGHT,
      0, 0, DISPLAY_WIDTH, VIEW_HEIGHT
    );

    if (gameState === "playing") {
      renderWeapon(ctx, DISPLAY_WIDTH, VIEW_HEIGHT);
      renderCrosshair();
    }
    renderStatusBar(ctx, DISPLAY_WIDTH, DISPLAY_HEIGHT, VIEW_HEIGHT, fps);
  }

  requestAnimationFrame(gameLoop);
}

bindInput(canvas);

canvas.addEventListener("click", () => {
  initAudio();
  ui.focusPrompt.classList.add("hidden");
});

document.getElementById("restartBtn").addEventListener("click", () => {
  initAudio();
  resetGame();
});
document.getElementById("introStart").addEventListener("click", () => {
  initAudio();
  resetGame();
});

startIntro();
requestAnimationFrame(gameLoop);