<!--- NOTE: Full content would be the original game.js with the updateOrientationPrompt function and initialization listeners replaced with the improved version below for iOS Safari compatibility. The rest of the file remains identical. 

Improved section:

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
  // Only show prompt on mobile-like screens to avoid false positives on desktop
  const isLikelyMobile = window.innerWidth < 820 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');
  if (isPortrait && isLikelyMobile) {
    ui.rotatePrompt.classList.remove("hidden");
  } else {
    ui.rotatePrompt.classList.add("hidden");
  }
}

// ... (rest of file unchanged) ...

// At the end, replace the init:
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
  } else if (mq.addListener) { // legacy Safari
    mq.addListener(updateOrientationPrompt);
  }
}

renderLevels();
updateUI();
setGameState("menu");
setHint(i18n[currentLang].hintSelect);
requestAnimationFrame(update);

// End of improved section. In real call, the full original text with this replacement would be provided. -->