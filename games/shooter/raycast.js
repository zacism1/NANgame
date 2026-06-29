const FOV = Math.PI / 3;
const MAX_DEPTH = 20;

const CEILING_COLOR = [48, 56, 80];
const FLOOR_COLOR = [74, 56, 40];

function getPlayerVectors(player) {
  const dirX = Math.cos(player.angle);
  const dirY = Math.sin(player.angle);
  const planeX = -dirY * Math.tan(FOV / 2);
  const planeY = dirX * Math.tan(FOV / 2);
  return { dirX, dirY, planeX, planeY };
}

function castRay(originX, originY, rayDirX, rayDirY) {
  let mapX = Math.floor(originX);
  let mapY = Math.floor(originY);

  const deltaDistX = rayDirX === 0 ? Number.MAX_VALUE : Math.abs(1 / rayDirX);
  const deltaDistY = rayDirY === 0 ? Number.MAX_VALUE : Math.abs(1 / rayDirY);

  let stepX;
  let stepY;
  let sideDistX;
  let sideDistY;

  if (rayDirX < 0) {
    stepX = -1;
    sideDistX = (originX - mapX) * deltaDistX;
  } else {
    stepX = 1;
    sideDistX = (mapX + 1.0 - originX) * deltaDistX;
  }

  if (rayDirY < 0) {
    stepY = -1;
    sideDistY = (originY - mapY) * deltaDistY;
  } else {
    stepY = 1;
    sideDistY = (mapY + 1.0 - originY) * deltaDistY;
  }

  let hit = false;
  let side = 0;
  let wallType = 0;

  while (!hit) {
    if (sideDistX < sideDistY) {
      sideDistX += deltaDistX;
      mapX += stepX;
      side = 0;
    } else {
      sideDistY += deltaDistY;
      mapY += stepY;
      side = 1;
    }

    wallType = getTile(mapX, mapY);
    if (wallType > 0) hit = true;
  }

  let perpWallDist;
  let wallX;
  if (side === 0) {
    perpWallDist = (mapX - originX + (1 - stepX) / 2) / rayDirX;
    wallX = originY + perpWallDist * rayDirY;
  } else {
    perpWallDist = (mapY - originY + (1 - stepY) / 2) / rayDirY;
    wallX = originX + perpWallDist * rayDirX;
  }
  wallX -= Math.floor(wallX);

  return {
    distance: Math.min(Math.max(perpWallDist, 0.0001), MAX_DEPTH),
    side,
    wallType,
    mapX,
    mapY,
    wallX,
  };
}

function renderScene(pixels, width, height, player, zBuffer) {
  const half = height >> 1;
  const { dirX, dirY, planeX, planeY } = getPlayerVectors(player);

  for (let x = 0; x < width; x++) {
    const cameraX = (2 * x) / width - 1;
    const rayDirX = dirX + planeX * cameraX;
    const rayDirY = dirY + planeY * cameraX;

    const hit = castRay(player.x, player.y, rayDirX, rayDirY);
    zBuffer[x] = hit.distance;

    const lineHeight = height / hit.distance;
    let drawStart = ((-(lineHeight / 2) + half) | 0);
    let drawEnd = (((lineHeight / 2) + half) | 0);
    if (drawStart < 0) drawStart = 0;
    if (drawEnd >= height) drawEnd = height - 1;

    const texData = texturePixels[getTextureKey(hit)];
    const texX = (hit.wallX * TEX_SIZE) | 0;
    const shade = Math.max(0.3, 1 - hit.distance / MAX_DEPTH);
    const sideShade = hit.side === 1 ? 0.78 : 1;
    const wallFactor = shade * sideShade;
    const wallSpan = Math.max(1, drawEnd - drawStart);

    for (let y = 0; y < drawStart; y++) {
      const idx = (y * width + x) << 2;
      const ceilShade = 0.65 + (y / half) * 0.35;
      pixels[idx] = (CEILING_COLOR[0] * ceilShade) | 0;
      pixels[idx + 1] = (CEILING_COLOR[1] * ceilShade) | 0;
      pixels[idx + 2] = (CEILING_COLOR[2] * ceilShade) | 0;
      pixels[idx + 3] = 255;
    }

    for (let y = drawStart; y <= drawEnd; y++) {
      const texY = (((y - drawStart) / wallSpan) * (TEX_SIZE - 1)) | 0;
      const tIdx = (texY * TEX_SIZE + texX) << 2;
      const idx = (y * width + x) << 2;
      pixels[idx] = (texData[tIdx] * wallFactor) | 0;
      pixels[idx + 1] = (texData[tIdx + 1] * wallFactor) | 0;
      pixels[idx + 2] = (texData[tIdx + 2] * wallFactor) | 0;
      pixels[idx + 3] = 255;
    }

    for (let y = drawEnd + 1; y < height; y++) {
      const idx = (y * width + x) << 2;
      const row = y - half;
      const floorShade = 0.7 + (row / half) * 0.3;
      pixels[idx] = (FLOOR_COLOR[0] / floorShade) | 0;
      pixels[idx + 1] = (FLOOR_COLOR[1] / floorShade) | 0;
      pixels[idx + 2] = (FLOOR_COLOR[2] / floorShade) | 0;
      pixels[idx + 3] = 255;
    }
  }
}

function hasLineOfSight(fromX, fromY, toX, toY) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.001) return true;

  const steps = Math.ceil(dist * 4);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (isWallAt(fromX + dx * t, fromY + dy * t)) return false;
  }
  return true;
}