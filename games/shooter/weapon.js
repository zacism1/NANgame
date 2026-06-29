const SHOOT_COOLDOWN = 0.32;
const SHOOT_RANGE = 12;
const ENEMY_HIT_RADIUS_BASE = 0.55;

const MAG_CAPACITY = 8;
const RELOAD_TIME = 1.1;

let shootCooldown = 0;
let recoil = 0;
let muzzleFlash = 0;
let screenFlash = 0;
let reloadTimer = 0;
let lastHit = false;
let isReloading = false;

function updateWeapon(dt) {
  shootCooldown = Math.max(0, shootCooldown - dt);
  recoil = Math.max(0, recoil - dt * 8);
  muzzleFlash = Math.max(0, muzzleFlash - dt * 14);
  screenFlash = Math.max(0, screenFlash - dt * 10);

  if (isReloading) {
    reloadTimer -= dt;
    if (reloadTimer <= 0) {
      finishReload();
    }
  }
}

function findAimTarget() {
  const rayDirX = Math.cos(player.angle);
  const rayDirY = Math.sin(player.angle);
  let best = null;
  let bestDepth = Infinity;

  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.hypot(dx, dy);
    if (dist > SHOOT_RANGE) continue;

    const forward = dx * rayDirX + dy * rayDirY;
    if (forward <= 0) continue;

    const perpDist = Math.abs(dx * rayDirY - dy * rayDirX);
    const hitRadius = ENEMY_HIT_RADIUS_BASE + dist * 0.06;

    if (perpDist > hitRadius) continue;
    if (!hasLineOfSight(player.x, player.y, enemy.x, enemy.y)) continue;

    if (forward < bestDepth) {
      bestDepth = forward;
      best = enemy;
    }
  }

  return best;
}

function tryReload() {
  if (isReloading || gameStats.ammoMag >= MAG_CAPACITY || gameStats.ammoReserve <= 0) {
    return false;
  }
  isReloading = true;
  reloadTimer = RELOAD_TIME;
  playReloadSound();
  return true;
}

function finishReload() {
  isReloading = false;
  const needed = MAG_CAPACITY - gameStats.ammoMag;
  const taken = Math.min(needed, gameStats.ammoReserve);
  gameStats.ammoMag += taken;
  gameStats.ammoReserve -= taken;
}

function tryShoot() {
  if (shootCooldown > 0 || isReloading) return false;

  if (gameStats.ammoMag <= 0) {
    if (gameStats.ammoReserve > 0) tryReload();
    return false;
  }

  shootCooldown = SHOOT_COOLDOWN;
  recoil = 1;
  muzzleFlash = 1;
  screenFlash = 0.6;
  gameStats.ammoMag -= 1;
  playPlayerShoot();

  const target = findAimTarget();
  lastHit = false;

  if (target) {
    target.hp -= 1;
    playHitSound();
    if (target.hp <= 0) {
      target.alive = false;
      addKill();
    }
    lastHit = true;
  }

  return lastHit;
}

function renderWeapon(ctx, width, viewHeight) {
  if (!gunSprite) return;

  const gunWidth = 130;
  const gunHeight = 98;
  const recoilOffset = Math.floor(recoil * 14);
  const rightOffset = Math.floor(width * 0.06);
  const x = Math.floor(width * 0.54) + rightOffset;
  const y = viewHeight - gunHeight + 6 + recoilOffset;
  const muzzleX = x + gunWidth - 6;
  const muzzleY = y + 24;

  if (screenFlash > 0) {
    ctx.save();
    ctx.globalAlpha = screenFlash * 0.15;
    ctx.fillStyle = "#fff8c0";
    ctx.fillRect(0, 0, width, viewHeight);
    ctx.restore();
  }

  const gradient = ctx.createLinearGradient(0, y - 8, 0, viewHeight);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(0.6, "rgba(0,0,0,0.15)");
  gradient.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = gradient;
  ctx.fillRect(x - 20, y - 8, gunWidth + 40, viewHeight - y + 8);

  ctx.drawImage(gunSprite, x, y, gunWidth, gunHeight);

  if (muzzleFlash > 0) {
    ctx.save();
    ctx.globalAlpha = muzzleFlash;
    ctx.fillStyle = "#fffae0";
    ctx.beginPath();
    ctx.arc(muzzleX, muzzleY, 14 + muzzleFlash * 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = muzzleFlash * 0.85;
    ctx.fillStyle = "#ff9040";
    ctx.beginPath();
    ctx.arc(muzzleX + 8, muzzleY, 8 + muzzleFlash * 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 240, 160, ${muzzleFlash})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(muzzleX, muzzleY);
    ctx.lineTo(muzzleX + 30 + muzzleFlash * 20, muzzleY - 2);
    ctx.stroke();
    ctx.restore();
  }
}