const PLAYER_RADIUS = 0.2;
const MOVE_SPEED = 3.2;
const ROT_SPEED = 2.4;

const player = {
  x: PLAYER_SPAWN.x,
  y: PLAYER_SPAWN.y,
  angle: PLAYER_SPAWN.angle,
};

const keys = {};

function resetPlayer() {
  player.x = PLAYER_SPAWN.x;
  player.y = PLAYER_SPAWN.y;
  player.angle = PLAYER_SPAWN.angle;
}

function tryMove(newX, newY) {
  const offsets = [
    [PLAYER_RADIUS, PLAYER_RADIUS],
    [-PLAYER_RADIUS, PLAYER_RADIUS],
    [PLAYER_RADIUS, -PLAYER_RADIUS],
    [-PLAYER_RADIUS, -PLAYER_RADIUS],
  ];

  let canMove = true;
  for (const [ox, oy] of offsets) {
    if (isWallAt(newX + ox, newY + oy)) {
      canMove = false;
      break;
    }
  }

  if (canMove) {
    player.x = newX;
    player.y = newY;
    return true;
  }

  if (!isWallAt(newX, player.y)) player.x = newX;
  if (!isWallAt(player.x, newY)) player.y = newY;
  return false;
}

function updatePlayer(dt) {
  const rot = ROT_SPEED * dt;
  const speed = MOVE_SPEED * dt;

  if (keys.ArrowLeft) player.angle -= rot;
  if (keys.ArrowRight) player.angle += rot;

  const dirX = Math.cos(player.angle);
  const dirY = Math.sin(player.angle);
  const strafeX = -dirY;
  const strafeY = dirX;

  let moveX = 0;
  let moveY = 0;

  if (keys.ArrowUp || keys.w || keys.W) {
    moveX += dirX * speed;
    moveY += dirY * speed;
  }
  if (keys.ArrowDown || keys.s || keys.S) {
    moveX -= dirX * speed;
    moveY -= dirY * speed;
  }
  if (keys.a || keys.A) {
    moveX -= strafeX * speed;
    moveY -= strafeY * speed;
  }
  if (keys.d || keys.D) {
    moveX += strafeX * speed;
    moveY += strafeY * speed;
  }

  if (moveX !== 0 || moveY !== 0) {
    tryMove(player.x + moveX, player.y + moveY);
  }
}

function bindInput(canvas) {
  window.addEventListener("keydown", (event) => {
    keys[event.key] = true;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "e", "E", "r", "R"].includes(event.key)) {
      event.preventDefault();
    }
  });

  window.addEventListener("keyup", (event) => {
    keys[event.key] = false;
  });

  canvas.addEventListener("click", () => canvas.focus());
}