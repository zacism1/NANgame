const GUARD_SPEED = 1.4;
const GUARD_SHOOT_RANGE = 9;
const GUARD_SHOOT_COOLDOWN = 1.8;
const PROJECTILE_SPEED = 5.5;
const PROJECTILE_DAMAGE = 12;
const MOUTH_ANIM_DURATION = 0.28;
const GUARD_MAX_HP = 2;

const enemies = [];
const projectiles = [];

function resetEnemies() {
  enemies.length = 0;
  ENEMY_SPAWNS.forEach((spawn) => {
    enemies.push({
      x: spawn.x,
      y: spawn.y,
      alive: true,
      hp: GUARD_MAX_HP,
      maxHp: GUARD_MAX_HP,
      patrol: spawn.patrol.map((p) => ({ x: p.x, y: p.y })),
      patrolIndex: 0,
      shootCooldown: 1 + Math.random(),
      mouthFrame: 0,
      mouthTimer: 0,
    });
  });
  projectiles.length = 0;
}

function getAliveEnemyCount() {
  return enemies.filter((enemy) => enemy.alive).length;
}

function guardCanMove(x, y) {
  const pad = 0.22;
  return !isWallAt(x + pad, y) && !isWallAt(x - pad, y) && !isWallAt(x, y + pad) && !isWallAt(x, y - pad);
}

function updateGuards(dt) {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    if (enemy.mouthTimer > 0) {
      enemy.mouthTimer -= dt;
      if (enemy.mouthTimer > MOUTH_ANIM_DURATION * 0.66) enemy.mouthFrame = 2;
      else if (enemy.mouthTimer > MOUTH_ANIM_DURATION * 0.33) enemy.mouthFrame = 1;
      else if (enemy.mouthTimer <= 0) enemy.mouthFrame = 0;
    }

    enemy.shootCooldown -= dt;

    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distToPlayer = Math.hypot(dx, dy);
    const seesPlayer = distToPlayer < GUARD_SHOOT_RANGE && hasLineOfSight(enemy.x, enemy.y, player.x, player.y);

    if (seesPlayer && enemy.shootCooldown <= 0) {
      guardShoot(enemy);
      enemy.shootCooldown = GUARD_SHOOT_COOLDOWN;
    } else if (!seesPlayer || distToPlayer > GUARD_SHOOT_RANGE * 0.8) {
      const target = enemy.patrol[enemy.patrolIndex];
      const mx = target.x - enemy.x;
      const my = target.y - enemy.y;
      const md = Math.hypot(mx, my);
      if (md < 0.15) {
        enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrol.length;
      } else {
        const step = GUARD_SPEED * dt;
        const nx = enemy.x + (mx / md) * step;
        const ny = enemy.y + (my / md) * step;
        if (guardCanMove(nx, ny)) {
          enemy.x = nx;
          enemy.y = ny;
        } else {
          enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrol.length;
        }
      }
    }
  }

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    proj.x += proj.vx * dt;
    proj.y += proj.vy * dt;
    proj.life -= dt;

    if (proj.life <= 0 || isWallAt(proj.x, proj.y)) {
      projectiles.splice(i, 1);
      continue;
    }

    const pdx = player.x - proj.x;
    const pdy = player.y - proj.y;
    if (Math.hypot(pdx, pdy) < 0.35) {
      damagePlayer(PROJECTILE_DAMAGE);
      projectiles.splice(i, 1);
    }
  }
}

function guardShoot(enemy) {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.hypot(dx, dy) || 1;
  projectiles.push({
    x: enemy.x,
    y: enemy.y,
    vx: (dx / dist) * PROJECTILE_SPEED,
    vy: (dy / dist) * PROJECTILE_SPEED,
    life: 2.5,
  });
  enemy.mouthTimer = MOUTH_ANIM_DURATION;
  enemy.mouthFrame = 2;
  playEnemyShoot();
}

function renderProjectiles(ctx, player, width, height) {
  for (const proj of projectiles) {
    const spriteX = proj.x - player.x;
    const spriteY = proj.y - player.y;
    const { dirX, dirY, planeX, planeY } = getPlayerVectors(player);
    const invDet = 1 / (planeX * dirY - dirX * planeY);
    const transformX = invDet * (dirY * spriteX - dirX * spriteY);
    const transformY = invDet * (-planeY * spriteX + planeX * spriteY);
    if (transformY <= 0.2) continue;

    const screenX = ((width / 2) * (1 + transformX / transformY)) | 0;
    const screenY = ((height / 2) * (1 + 0 / transformY)) | 0;
    const size = Math.max(2, (8 / transformY) | 0);

    ctx.fillStyle = "#ff6040";
    ctx.beginPath();
    ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
    ctx.fill();
  }
}