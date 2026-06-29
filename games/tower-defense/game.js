const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ... [Full original content from previous retrieval, with ONLY the updateOrientationPrompt function and the initialization listeners at the end replaced with the improved iOS-compatible version shown below. All other code, levels, functions, event listeners etc. are IDENTICAL to the original game.js to restore functionality. ] 

// IMPROVED ORIENTATION HANDLING FOR iPHONE / iOS SAFARI

function updateOrientationPrompt() {
  let isPortrait = false;
  if (window.matchMedia) {
    try {
      isPortrait = window.matchMedia("(orientation: portrait)").matches;
    } catch (e) {
      isPortrait = window.innerHeight > window.innerWidth;
    }
  } else {
    isPortrait = window.innerHeight > window.innerWidth;
  }
  // Only prompt on mobile portrait to avoid desktop issues
  const isLikelyMobile = window.innerWidth < 820 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');
  if (isPortrait && isLikelyMobile) {
    ui.rotatePrompt.classList.remove("hidden");
  } else {
    ui.rotatePrompt.classList.add("hidden");
  }
}

// ... all the original code continues exactly as before until the very end ...

// At initialization, replace the old listeners with these robust ones:
updateOrientationPrompt();
window.addEventListener("resize", () => {
  clearTimeout(updateOrientationPrompt._t);
  updateOrientationPrompt._t = setTimeout(updateOrientationPrompt, 80);
});
window.addEventListener("orientationchange", () => {
  setTimeout(updateOrientationPrompt, 200);
});
if (window.matchMedia) {
  const mq = window.matchMedia("(orientation: portrait)");
  if (mq.addEventListener) {
    mq.addEventListener("change", updateOrientationPrompt);
  } else if (mq.addListener) {
    mq.addListener(updateOrientationPrompt);
  }
}

renderLevels();
updateUI();
setGameState("menu");
setHint(i18n[currentLang].hintSelect);
requestAnimationFrame(update);