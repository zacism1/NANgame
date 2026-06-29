const PLAYER_RADIUS = 0.2;
const MOVE_SPEED = 3.2;
const ROT_SPEED = 2.4;

const player = {
  x: PLAYER_SPAWN.x,
  y: PLAYER_SPAWN.y,
  angle: PLAYER_SPAWN.angle,
};

const keys = {};

// Mobile joystick state
let joystickActive = false;
let joystickX = 0;
let joystickY = 0;
let lastTouchAngle = 0;
let touchLookActive = false;

function resetPlayer() {
  player.x = PLAYER_SPAWN.x;
  player.y = PLAYER_SPAWN.y;
  player.angle = PLAYER_SPAWN.angle;
  joystickActive = false;
  touchLookActive = false;
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

  // Joystick input (mobile)
  if (joystickActive) {
    const jx = joystickX;
    const jy = joystickY;
    const mag = Math.hypot(jx, jy);
    if (mag > 0.15) {  // Deadzone
      const normX = jx / mag;
      const normY = jy / mag;
      // Forward/back relative to facing
      moveX += dirX * speed * normY * 1.2;  // Y axis forward
      moveY += dirY * speed * normY * 1.2;
      // Strafe with X
      moveX += strafeX * speed * normX * 0.9;
      moveY += strafeY * speed * normX * 0.9;
    }
  }

  if (moveX !== 0 || moveY !== 0) {
    tryMove(player.x + moveX, player.y + moveY);
  }

  // Touch look / turn (separate from move joystick)
  if (touchLookActive && lastTouchAngle !== 0) {
    player.angle += lastTouchAngle * rot * 1.5;
    lastTouchAngle *= 0.7; // decay
    if (Math.abs(lastTouchAngle) < 0.01) lastTouchAngle = 0;
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

  // Mobile touch joystick setup (called from game.js after DOM ready)
  setupMobileControls();
}

function setupMobileControls() {
  const joystick = document.getElementById("joystick");
  const knob = document.getElementById("joystickKnob");
  const shootBtn = document.getElementById("shootBtn");
  const reloadBtn = document.getElementById("reloadBtn");
  const interactBtn = document.getElementById("interactBtn");

  if (!joystick || !knob) return;

  let startX = 0, startY = 0;
  let currentX = 0, currentY = 0;

  function updateKnob(x, y) {
    const rect = joystick.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = x - rect.left - cx;
    const dy = y - rect.top - cy;
    const maxDist = rect.width / 2 - 20;
    const dist = Math.hypot(dx, dy);
    const scale = dist > maxDist ? maxDist / dist : 1;
    const kx = dx * scale;
    const ky = dy * scale;

    knob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
    joystickX = kx / (rect.width / 2);
    joystickY = ky / (rect.height / 2);
  }

  function resetKnob() {
    knob.style.transform = "translate(-50%, -50%)";
    joystickX = 0;
    joystickY = 0;
    joystickActive = false;
  }

  // Joystick touch
  joystick.addEventListener("touchstart", (e) => {
    e.preventDefault();
    joystickActive = true;
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    currentX = startX;
    currentY = startY;
    updateKnob(currentX, currentY);
  }, { passive: false });

  joystick.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!joystickActive) return;
    const touch = e.touches[0];
    currentX = touch.clientX;
    currentY = touch.clientY;
    updateKnob(currentX, currentY);
  }, { passive: false });

  joystick.addEventListener("touchend", (e) => {
    e.preventDefault();
    resetKnob();
  });

  joystick.addEventListener("touchcancel", (e) => {
    e.preventDefault();
    resetKnob();
  });

  // Separate touch look on canvas (right side drag for turning)
  let lookStartX = 0;
  canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1 && !joystick.contains(e.target)) {
      touchLookActive = true;
      lookStartX = e.touches[0].clientX;
      lastTouchAngle = 0;
    }
  }, { passive: true });

  canvas.addEventListener("touchmove", (e) => {
    if (touchLookActive && e.touches.length === 1) {
      const dx = e.touches[0].clientX - lookStartX;
      lastTouchAngle = dx * 0.008; // sensitivity
      lookStartX = e.touches[0].clientX;
    }
  }, { passive: true });

  canvas.addEventListener("touchend", () => {
    touchLookActive = false;
    lastTouchAngle = 0;
  });

  // Action buttons
  if (shootBtn) {
    shootBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      keys[" "] = true;
      if (typeof tryShoot === "function" && tryShoot()) {
        if (typeof flashHit === "function") flashHit();
      }
    });
    shootBtn.addEventListener("touchend", (e) => {
      e.preventDefault();
      keys[" "] = false;
    });
  }

  if (reloadBtn) {
    reloadBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      keys.r = true;
      keys.R = true;
    });
    reloadBtn.addEventListener("touchend", (e) => {
      e.preventDefault();
      keys.r = false;
      keys.R = false;
    });
  }

  if (interactBtn) {
    interactBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      keys.e = true;
      keys.E = true;
    });
    interactBtn.addEventListener("touchend", (e) => {
      e.preventDefault();
      keys.e = false;
      keys.E = false;
    });
  }
}
