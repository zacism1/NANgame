const STATUS_BAR_H = 56;

const faceImage = new Image();
faceImage.src = "assets/zac.png";

const gameStats = {
  health: 100,
  ammoMag: 8,
  ammoReserve: 16,
  score: 0,
};

function resetStats() {
  gameStats.health = 100;
  gameStats.ammoMag = 8;
  gameStats.ammoReserve = 16;
  gameStats.score = 0;
}

function addKill() {
  gameStats.score += 100;
}

function addReserveAmmo(amount) {
  const maxReserve = 48;
  if (gameStats.ammoReserve >= maxReserve) return false;
  gameStats.ammoReserve = Math.min(maxReserve, gameStats.ammoReserve + amount);
  return true;
}

function damagePlayer(amount) {
  gameStats.health = Math.max(0, gameStats.health - amount);
}

function drawBevelRect(ctx, x, y, w, h, fill, highlight, shadow) {
  ctx.fillStyle = shadow;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  ctx.fillStyle = highlight;
  ctx.fillRect(x + 2, y + 2, w - 4, 2);
  ctx.fillRect(x + 2, y + 2, 2, h - 4);
}

function renderStatusBar(ctx, width, totalHeight, viewHeight, fps = 0) {
  const y = viewHeight;
  const h = STATUS_BAR_H;

  ctx.fillStyle = "#14141e";
  ctx.fillRect(0, y, width, h);

  ctx.fillStyle = "#3a3a52";
  ctx.fillRect(0, y, width, 2);
  ctx.fillRect(0, y, 2, h);
  ctx.fillStyle = "#0a0a12";
  ctx.fillRect(0, y + h - 2, width, 2);
  ctx.fillRect(width - 2, y, 2, h);

  const faceFrameX = 6;
  const faceFrameY = y + 5;
  const faceFrameW = 68;  // Bigger
  const faceFrameH = h - 8;  // Slightly taller

  drawBevelRect(ctx, faceFrameX, faceFrameY, faceFrameW, faceFrameH, "#1e1e2e", "#4a4a62", "#080810");

  if (faceImage.complete && faceImage.naturalWidth > 0) {
    const facePad = 4;
    const faceSize = faceFrameH - facePad * 2 + 4;  // Slightly bigger draw size
    ctx.drawImage(faceImage, faceFrameX + facePad, faceFrameY + facePad, faceSize, faceSize);
  }

  const statsX = faceFrameX + faceFrameW + 14;
  const midY = y + h / 2;

  ctx.textBaseline = "middle";
  ctx.font = "8px 'Press Start 2P', monospace";
  ctx.fillStyle = "#6a6a7a";
  ctx.fillText("HEALTH", statsX, midY - 14);
  ctx.fillText("AMMO", statsX + 110, midY - 14);

  ctx.font = "16px 'Press Start 2P', monospace";
  ctx.fillStyle = gameStats.health <= 25 ? "#ff3030" : "#d82020";
  ctx.fillText(String(gameStats.health).padStart(3, "0"), statsX, midY + 10);

  const lowAmmo = gameStats.ammoMag <= 2 && gameStats.ammoReserve <= 0;
  ctx.fillStyle = lowAmmo ? "#ff6040" : gameStats.ammoMag === 0 ? "#d89030" : "#c8a820";
  const ammoText = `${gameStats.ammoMag}|${gameStats.ammoReserve}`;
  ctx.fillText(ammoText, statsX + 110, midY + 10);

  if (typeof isReloading !== "undefined" && isReloading) {
    ctx.font = "7px 'Press Start 2P', monospace";
    ctx.fillStyle = "#80a0c0";
    ctx.fillText("RLD", statsX + 110, midY + 22);
  }

  const rightX = width - 16;
  ctx.textAlign = "right";
  ctx.font = "8px 'Press Start 2P', monospace";
  ctx.fillStyle = "#6a6a7a";
  ctx.fillText("SCORE", rightX, midY - 14);
  ctx.fillText("GUARDS", rightX, midY + 2);

  ctx.font = "10px 'Press Start 2P', monospace";
  ctx.fillStyle = "#40c060";
  ctx.fillText(String(gameStats.score).padStart(6, "0"), rightX, midY + 16);
  ctx.fillStyle = "#c0c0d0";
  ctx.fillText(String(getAliveEnemyCount()).padStart(2, "0"), rightX - 120, midY + 16);
  ctx.textAlign = "left";

  ctx.strokeStyle = "#2a2a3a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(statsX - 8, y + 6);
  ctx.lineTo(statsX - 8, y + h - 6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(width - 148, y + 6);
  ctx.lineTo(width - 148, y + h - 6);
  ctx.stroke();

  if (fps > 0) {
    ctx.font = "7px 'Press Start 2P', monospace";
    ctx.fillStyle = fps >= 30 ? "#40a050" : "#c04040";
    ctx.textAlign = "right";
    ctx.fillText(`${fps} FPS`, width - 8, y + h - 8);
    ctx.textAlign = "left";
  }
}