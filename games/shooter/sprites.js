const enemyImage = new Image();
enemyImage.src = "../../assets/nan/enemy.png";

const enemyFrames = [];

enemyImage.onload = () => {
  enemyFrames[0] = enemyImage;
  enemyFrames[1] = buildMouthFrame(enemyImage, 0.55);
  enemyFrames[2] = buildMouthFrame(enemyImage, 1);
};

function buildMouthFrame(source, openness) {
  const c = document.createElement("canvas");
  c.width = source.naturalWidth;
  c.height = source.naturalHeight;
  const ctx = c.getContext("2d");
  ctx.drawImage(source, 0, 0);

  const cx = c.width * 0.5;
  const cy = c.height * 0.68;
  const rw = c.width * 0.14 * openness;
  const rh = c.height * 0.09 * openness;

  ctx.fillStyle = "#2a0808";
  ctx.beginPath();
  ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#5a1010";
  ctx.beginPath();
  ctx.ellipse(cx, cy + rh * 0.2, rw * 0.7, rh * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

function getEnemySprite(enemy) {
  if (enemyFrames.length === 0 || !enemyFrames[0]) return enemyImage;
  return enemyFrames[enemy.mouthFrame] || enemyFrames[0];
}

function renderSprites(ctx, player, width, height, zBuffer) {
  const base = enemyFrames[0] || enemyImage;
  if (!base.complete || base.naturalWidth === 0) return;

  const { dirX, dirY, planeX, planeY } = getPlayerVectors(player);
  const sorted = enemies
    .filter((enemy) => enemy.alive)
    .map((enemy) => ({
      enemy,
      dist: (player.x - enemy.x) ** 2 + (player.y - enemy.y) ** 2,
    }))
    .sort((a, b) => b.dist - a.dist);

  for (const { enemy } of sorted) {
    const spriteX = enemy.x - player.x;
    const spriteY = enemy.y - player.y;

    const invDet = 1 / (planeX * dirY - dirX * planeY);
    const transformX = invDet * (dirY * spriteX - dirX * spriteY);
    const transformY = invDet * (-planeY * spriteX + planeX * spriteY);

    if (transformY <= 0.2) continue;

    const spriteScreenX = ((width / 2) * (1 + transformX / transformY)) | 0;
    const spriteHeight = (height / transformY) | 0;
    if (spriteHeight < 2) continue;

    const spriteWidth = spriteHeight;
    const drawStartY = Math.max(0, ((-spriteHeight / 2 + height / 2) | 0));
    const drawStartX = ((-spriteWidth / 2 + spriteScreenX) | 0);

    const centerX = Math.max(0, Math.min(width - 1, spriteScreenX));
    if (transformY >= zBuffer[centerX]) continue;

    const shade = Math.max(0.35, 1 - transformY / MAX_DEPTH);
    const sprite = getEnemySprite(enemy);
    ctx.save();
    ctx.globalAlpha = shade;
    ctx.drawImage(sprite, drawStartX, drawStartY, spriteWidth, spriteHeight);
    ctx.restore();
  }
}