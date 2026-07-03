const GAMES = [
  {
    id: "tower-defense",
    title: "Stop Nan TD",
    description: "Place towers and stop Nan from raiding the base. Survive 5 waves across 3 levels.",
    path: "games/tower-defense/",
    status: "playable",
    icon: "assets/nan/enemy.png",
  },
  {
    id: "shooter",
    title: "Escape from NAN's Jail",
    description: "Wolfenstein-style raycasting. Break out of Nan's jail — open doors, dodge guard fire, eliminate every Nan.",
    path: "games/shooter/",
    status: "playable",
    icon: "assets/nan/enemy.png",
  },
  {
    id: "platformer",
    title: "Super NAN Bros",
    description: "Classic multi-level Mario-style platformer. Run, jump on enemies (zac.png), collect coins!",
    path: "games/platformer/",
    status: "playable",
    icon: "assets/nan/enemy.png",
  },
];

function renderGameCards() {
  const grid = document.getElementById("gameGrid");
  if (!grid) return;

  grid.innerHTML = GAMES.map((game) => {
    const playable = game.status === "playable";
    const tag = document.createElement("a");
    tag.className = `game-card ${playable ? "playable" : "coming-soon"}`;
    if (playable) tag.href = game.path;

    tag.innerHTML = `
      <img class="game-card-icon" src="${game.icon}" alt="${game.title}" />
      <h2 class="game-card-title">${game.title}</h2>
      <p class="game-card-desc">${game.description}</p>
      <div class="game-card-footer">
        <span class="game-badge ${playable ? "play" : "soon"}>${playable ? "Play Now" : "Coming Soon"}</span>
        ${playable ? '<span class="game-card-cta">Launch →</span>' : ""}
      </div>
    `;
    return tag.outerHTML;
  }).join("");
}

renderGameCards();