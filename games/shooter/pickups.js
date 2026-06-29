const PICKUP_RESPAWN_TIME = 18;
const PICKUP_AMOUNT = 8;
const PICKUP_RANGE = 0.7;

const AMMO_SPAWNS = [
  { x: 4.5, y: 2.5 },
  { x: 10.5, y: 2.5 },
  { x: 6.5, y: 7.5 },
  { x: 13.5, y: 7.5 },
  { x: 4.5, y: 12.5 },
  { x: 10.5, y: 12.5 },
];

const ammoPickups = [];

function resetPickups() {
  ammoPickups.length = 0;
  AMMO_SPAWNS.forEach((spawn) => {
    ammoPickups.push({
      x: spawn.x,
      y: spawn.y,
      active: true,
      respawnTimer: 0,
    });
  });
}

function updatePickups(dt) {
  for (const pickup of ammoPickups) {
    if (!pickup.active) {
      pickup.respawnTimer -= dt;
      if (pickup.respawnTimer <= 0) pickup.active = true;
      continue;
    }

    const dx = player.x - pickup.x;
    const dy = player.y - pickup.y;
    if (Math.hypot(dx, dy) < PICKUP_RANGE) {
      if (addReserveAmmo(PICKUP_AMOUNT)) {
        pickup.active = false;
        pickup.respawnTimer = PICKUP_RESPAWN_TIME;
        playPickupSound();
      }
    }
  }
}

function renderAmmoPickups(ctx, player, width, height, zBuffer) {
  const { dirX, dirY, planeX, planeY } = getPlayerVectors(player);

  const sorted = ammoPickups
    .filter((p) => p.active)
    .map((p) => ({
      pickup: p,
      dist: (player.x - p.x) ** 2 + (player.y - p.y) ** 2,
    }))
    .sort((a, b) => b.dist - a.dist);

  for (const { pickup } of sorted) {
    const spriteX = pickup.x - player.x;
    const spriteY = pickup.y - player.y;
    const invDet = 1 / (planeX * dirY - dirX * planeY);
    const transformX = invDet * (dirY * spriteX - dirX * spriteY);
    const transformY = invDet * (-planeY * spriteX + planeX * spriteY);
    if (transformY <= 0.3) continue;

    const spriteScreenX = ((width / 2) * (1 + transformX / transformY)) | 0;
    const spriteHeight = Math.max(8, (height / transformY) * 0.35) | 0;
    const spriteWidth = spriteHeight * 0.7;
    const drawStartY = ((-spriteHeight / 2 + height / 2) | 0);
    const drawStartX = ((-spriteWidth / 2 + spriteScreenX) | 0);

    const centerX = Math.max(0, Math.min(width - 1, spriteScreenX));
    if (transformY >= zBuffer[centerX]) continue;

    const shade = Math.max(0.4, 1 - transformY / MAX_DEPTH);
    ctx.save();
    ctx.globalAlpha = shade;
    ctx.fillStyle = "#c8a820";
    ctx.fillRect(drawStartX, drawStartY, spriteWidth, spriteHeight * 0.6);
    ctx.fillStyle = "#8a7020";
    ctx.fillRect(drawStartX + 2, drawStartY + spriteHeight * 0.55, spriteWidth - 4, spriteHeight * 0.35);
    ctx.fillStyle = "#e8d040";
    ctx.font = `bold ${Math.max(6, (spriteHeight * 0.35) | 0)}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("AMMO", drawStartX + spriteWidth / 2, drawStartY + spriteHeight * 0.4);
    ctx.restore();
  }
}