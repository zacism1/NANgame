const MAP_LAYOUT = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 2, 2, 2, 0, 0, 0, 0, 3, 3, 3, 0, 0, 1],
  [1, 0, 0, 2, 0, 2, 0, 0, 0, 0, 3, 0, 3, 0, 0, 1],
  [1, 0, 0, 2, 0, 2, 0, 0, 0, 0, 3, 0, 3, 0, 0, 1],
  [1, 0, 0, 2, 2, 2, 0, 0, 0, 0, 3, 3, 3, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 0, 0, 1],
  [1, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 1],
  [1, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 4, 0, 0, 1],
  [1, 0, 0, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const MAP_WIDTH = MAP_LAYOUT[0].length;
const MAP_HEIGHT = MAP_LAYOUT.length;
const DOOR_TILE = 5;

const DECOR_MAP = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const PLAYER_SPAWN = { x: 2.5, y: 2.5, angle: 0.4 };

const ENEMY_SPAWNS = [
  { x: 8.5, y: 3.5, patrol: [{ x: 8.5, y: 3.5 }, { x: 12.5, y: 3.5 }, { x: 12.5, y: 6.5 }] },
  { x: 12.5, y: 4.5, patrol: [{ x: 12.5, y: 4.5 }, { x: 12.5, y: 7.5 }, { x: 9.5, y: 7.5 }] },
  { x: 7.5, y: 10.5, patrol: [{ x: 7.5, y: 10.5 }, { x: 5.5, y: 10.5 }, { x: 5.5, y: 13.5 }] },
  { x: 11.5, y: 12.5, patrol: [{ x: 11.5, y: 12.5 }, { x: 13.5, y: 12.5 }, { x: 13.5, y: 10.5 }] },
  { x: 5.5, y: 7.5, patrol: [{ x: 5.5, y: 7.5 }, { x: 5.5, y: 5.5 }, { x: 8.5, y: 5.5 }] },
];

const doors = [
  { x: 7, y: 8, open: false },
  { x: 8, y: 8, open: false },
];

function resetDoors() {
  doors.forEach((door) => {
    door.open = false;
  });
}

function getDoorAt(mapX, mapY) {
  return doors.find((door) => door.x === mapX && door.y === mapY);
}

function getTile(mapX, mapY) {
  if (mapX < 0 || mapY < 0 || mapX >= MAP_WIDTH || mapY >= MAP_HEIGHT) {
    return 1;
  }
  const tile = MAP_LAYOUT[mapY][mapX];
  if (tile === DOOR_TILE) {
    const door = getDoorAt(mapX, mapY);
    return door && door.open ? 0 : DOOR_TILE;
  }
  return tile;
}

function isWallAt(worldX, worldY) {
  return getTile(Math.floor(worldX), Math.floor(worldY)) > 0;
}

function getNearestDoor() {
  let nearest = null;
  let nearestDist = Infinity;
  for (const door of doors) {
    const dx = door.x + 0.5 - player.x;
    const dy = door.y + 0.5 - player.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1.6 && dist < nearestDist) {
      nearestDist = dist;
      nearest = door;
    }
  }
  return nearest;
}

function tryToggleDoor() {
  const door = getNearestDoor();
  if (!door) return false;
  door.open = !door.open;
  playDoorSound();
  return true;
}