const TEX_SIZE = 64;

const wallTextures = {};
const decorTextures = {};
const texturePixels = {};
let gunSprite = null;

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function fillRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function cacheTexturePixels(key, canvas) {
  texturePixels[key] = canvas.getContext("2d").getImageData(0, 0, TEX_SIZE, TEX_SIZE).data;
}

function buildBrickTexture(mortar, variation) {
  const c = makeCanvas(TEX_SIZE, TEX_SIZE);
  const ctx = c.getContext("2d");
  fillRect(ctx, 0, 0, TEX_SIZE, TEX_SIZE, mortar);

  const bw = 16;
  const bh = 8;
  for (let row = 0; row < TEX_SIZE / bh; row++) {
    const offset = (row % 2) * (bw / 2);
    for (let col = -1; col < TEX_SIZE / bw + 1; col++) {
      const shade = variation[(row + col) % variation.length];
      fillRect(ctx, col * bw + offset, row * bh, bw - 1, bh - 1, shade);
    }
  }
  return c;
}

function buildStoneTexture(colors) {
  const c = makeCanvas(TEX_SIZE, TEX_SIZE);
  const ctx = c.getContext("2d");
  fillRect(ctx, 0, 0, TEX_SIZE, TEX_SIZE, colors[0]);

  for (let i = 0; i < 40; i++) {
    const x = Math.floor(Math.random() * TEX_SIZE);
    const y = Math.floor(Math.random() * TEX_SIZE);
    const s = 2 + Math.floor(Math.random() * 5);
    fillRect(ctx, x, y, s, s, colors[1 + (i % (colors.length - 1))]);
  }

  ctx.strokeStyle = colors[colors.length - 1];
  ctx.lineWidth = 1;
  for (let y = 0; y < TEX_SIZE; y += 16) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(TEX_SIZE, y);
    ctx.stroke();
  }
  return c;
}

function buildPaintingTexture(type) {
  const c = makeCanvas(TEX_SIZE, TEX_SIZE);
  const ctx = c.getContext("2d");

  fillRect(ctx, 0, 0, TEX_SIZE, TEX_SIZE, "#5a4030");
  fillRect(ctx, 4, 4, TEX_SIZE - 8, TEX_SIZE - 8, "#2a2018");
  fillRect(ctx, 8, 8, TEX_SIZE - 16, TEX_SIZE - 16, type.bg);

  if (type.kind === "portrait") {
    fillRect(ctx, 20, 14, 24, 30, type.accent);
    ctx.fillStyle = type.detail;
    ctx.beginPath();
    ctx.arc(32, 22, 8, 0, Math.PI * 2);
    ctx.fill();
    fillRect(ctx, 22, 32, 20, 16, type.accent2);
  } else if (type.kind === "landscape") {
    fillRect(ctx, 10, 28, TEX_SIZE - 20, 18, "#3a6a3a");
    fillRect(ctx, 10, 18, TEX_SIZE - 20, 12, "#4a8ab8");
    ctx.fillStyle = "#e8c860";
    ctx.beginPath();
    ctx.arc(48, 24, 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    fillRect(ctx, 14, 14, 36, 36, type.accent);
    ctx.strokeStyle = type.detail;
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, 28, 28);
    ctx.beginPath();
    ctx.moveTo(18, 18);
    ctx.lineTo(46, 46);
    ctx.moveTo(46, 18);
    ctx.lineTo(18, 46);
    ctx.stroke();
  }

  fillRect(ctx, 6, 6, TEX_SIZE - 12, 3, "#8a7050");
  fillRect(ctx, 6, TEX_SIZE - 9, TEX_SIZE - 12, 3, "#8a7050");
  return c;
}

function buildDoorTexture() {
  const c = makeCanvas(TEX_SIZE, TEX_SIZE);
  const ctx = c.getContext("2d");
  fillRect(ctx, 0, 0, TEX_SIZE, TEX_SIZE, "#4a3020");
  fillRect(ctx, 4, 2, TEX_SIZE - 8, TEX_SIZE - 4, "#6a4830");
  fillRect(ctx, 10, 8, TEX_SIZE - 20, TEX_SIZE - 16, "#5a3c28");

  ctx.strokeStyle = "#3a2418";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 8, TEX_SIZE - 20, TEX_SIZE - 16);

  ctx.fillStyle = "#8a7050";
  ctx.beginPath();
  ctx.arc(TEX_SIZE - 18, TEX_SIZE / 2, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#2a1810";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(TEX_SIZE / 2, 6);
  ctx.lineTo(TEX_SIZE / 2, TEX_SIZE - 6);
  ctx.stroke();

  return c;
}

function buildGunSprite() {
  const c = makeCanvas(96, 72);
  const ctx = c.getContext("2d");

  fillRect(ctx, 38, 18, 44, 14, "#4a4a4a");
  fillRect(ctx, 70, 20, 22, 10, "#3a3a3a");
  fillRect(ctx, 88, 22, 6, 6, "#2a2a2a");
  fillRect(ctx, 30, 28, 18, 28, "#6a5040");
  fillRect(ctx, 24, 48, 30, 16, "#5a4030");
  fillRect(ctx, 20, 56, 12, 10, "#4a3020");
  fillRect(ctx, 44, 30, 10, 20, "#3a3a3a");
  fillRect(ctx, 36, 32, 8, 6, "#2a2a2a");
  fillRect(ctx, 48, 14, 8, 8, "#7a7a7a");
  fillRect(ctx, 50, 10, 4, 6, "#5a5a5a");
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(24, 60, 50, 8);

  return c;
}

function buildAllTextures() {
  wallTextures[1] = buildStoneTexture(["#6a6e7a", "#5a5e6a", "#7a7e8a", "#4a4e58"]);
  wallTextures[2] = buildBrickTexture("#5a3828", ["#9a6a50", "#7a4a38", "#a07058"]);
  wallTextures[3] = buildBrickTexture("#304858", ["#5a7890", "#406070", "#6888a0"]);
  wallTextures[4] = buildStoneTexture(["#6a5a80", "#5a4a70", "#7a6a90", "#4a3a60"]);
  wallTextures[5] = buildDoorTexture();

  decorTextures[1] = buildPaintingTexture({
    kind: "portrait",
    bg: "#6a3030",
    accent: "#c08060",
    accent2: "#4a2828",
    detail: "#e8c8a0",
  });
  decorTextures[2] = buildPaintingTexture({
    kind: "landscape",
    bg: "#3a4a6a",
    accent: "#4a8ab8",
    detail: "#e8c860",
  });
  decorTextures[3] = buildPaintingTexture({
    kind: "abstract",
    bg: "#4a3a5a",
    accent: "#8a6aaa",
    detail: "#c8a8e8",
  });

  for (let i = 1; i <= 5; i++) {
    cacheTexturePixels(`wall${i}`, wallTextures[i]);
  }
  for (let i = 1; i <= 3; i++) {
    cacheTexturePixels(`decor${i}`, decorTextures[i]);
  }

  gunSprite = buildGunSprite();
}

function getDecor(mapX, mapY) {
  if (mapX < 0 || mapY < 0 || mapX >= MAP_WIDTH || mapY >= MAP_HEIGHT) return 0;
  return DECOR_MAP[mapY][mapX] || 0;
}

function getTextureKey(hit) {
  const decor = getDecor(hit.mapX, hit.mapY);
  if (decor > 0 && hit.side === 0) return `decor${decor}`;
  return `wall${hit.wallType}`;
}

buildAllTextures();