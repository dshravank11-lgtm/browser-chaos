console.log('content.js loaded', window.location.href);
let activeSkull = false;
let activeAudio = null;
let activeOverlay = null;
let activeTimeout = null;
let activeStyle = null;

function getRandomSong() {
  const songs = ['phonk.mp3', 'phonk1.mp3', 'phonk2.mp3', 'phonk3.mp3'];
  return songs[Math.floor(Math.random() * songs.length)];
}

function stopSkullEffect() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
  if (activeOverlay && activeOverlay.remove) activeOverlay.remove();
  if (activeStyle && activeStyle.remove) activeStyle.remove();
  document.documentElement.style.filter = "";
  activeSkull = false;
  if (activeTimeout) clearTimeout(activeTimeout);
  activeTimeout = null;
  activeOverlay = null;
  activeStyle = null;
}

function startSkullEffect(countdownSeconds, isInstant){
  if (activeSkull) return;
  activeSkull = true;

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background: radial-gradient(circle, rgba(0,0,0,0) 30%, rgba(0,0,0,0.8) 100%) !important;
    z-index: 9999998 !important;
    pointer-events: all !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    color: red !important;
    font-family: monospace !important;
    font-weight: bold !important;
    text-align: center !important;
  `;
  const timerText = document.createElement('div');
  timerText.style.cssText = `
    font-size: 72px !important;
    text-shadow: 0 0 10px black !important;
  `;
  overlay.appendChild(timerText);
  document.body.appendChild(overlay);
  activeOverlay = overlay;

  const applyEffect = function() {
    document.documentElement.style.filter = "grayscale(100%) contrast(150%)";

    const skull = document.createElement('img');
    skull.src = chrome.runtime.getURL('skull.png');
    skull.style.cssText = `
      position: fixed !important;
      bottom: 30px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      z-index: 9999999 !important;
      width: 200px !important;
      height: auto !important;
      pointer-events: none !important;
      box-shadow: 0 0 30px rgba(255,0,0,0.6) !important;
      border-radius: 10px !important;
    `;
    if (isInstant) {
      const shakeStyle = document.createElement('style');
      shakeStyle.textContent = `
        @keyframes chaosShake {
          0%, 100% { transform: translateX(-50%) rotate(0deg); }
          25% { transform: translateX(-50%) rotate(10deg); }
          75% {transform: translateX(-50%) rotate(-10deg); }
        }
      `;
      document.head.appendChild(shakeStyle);
      activeStyle = shakeStyle;
      skull.style.animation = "chaosShake 0.5s ease-in-out !important";
    }
    document.body.appendChild(skull);

    const song = getRandomSong();
    const audio = new Audio(chrome.runtime.getURL(song));
    audio.volume = 0.5;
    audio.play().catch(function(e){
      console.log("audio blocked", e);
    });
    activeAudio = audio;

    activeTimeout = setTimeout(function() {
      stopSkullEffect();
      if (skull && skull.remove) skull.remove();
    }, 5000);
  };

  if (countdownSeconds > 0) {
    let seconds = countdownSeconds;
    timerText.innerText = seconds;
    const interval = setInterval(function(){
      seconds--;
      if (seconds > 0) {
        timerText.innerText = seconds;
      } else {
    clearInterval(interval);
    timerText.innerText="67"; 
    setTimeout(function(){
        timerText.innerText = "";
        applyEffect();
    }, 30);
}
    }, 1000);
  } else {
    applyEffect();
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "skull") {
    startSkullEffect(0, false);
    sendResponse({ success: true });
  } else if (request.action === "instantSkull"){
    startSkullEffect(2, true);
    sendResponse({ success: true });
  }
  return true;
});

let typed = "";
document.addEventListener('keydown', function(e) {
  typed += e.key;
  if (typed.endsWith("67")) {
    document.body.style.transition = "transform 2s ease-in-out";
    document.body.style.transform = "rotate(180deg)";
    alert("67 DETECTED 676767677667676767");
    typed = "";
  }
  if (typed.length > 10) typed = typed.slice(1);
});

let mineText = "";
document.addEventListener('keydown', function(e){
  mineText += e.key.toLowerCase();
  if (mineText.includes("minecraft")){
    const overlay = document.createElement('div');
    overlay.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:1000000; display:grid; grid-template-columns: repeat(10, 1fr); grid-template-rows:repeat(10,1fr); background:rgba(0,0,0,0.1);";
    document.body.appendChild(overlay);
    for (let i = 0; i < 100; i++) {
      const block = document.createElement('div');
      block.style.cssText = "background: #8B6B4D; border: 2px solid #5D3A1A; cursor: crosshair; box-shadow: inset 0 0 5px rgba(0,0,0,0.5); transition: opacity 0.2s;";
      block.addEventListener('click', function(){
        block.style.opacity = "0";
        block.style.pointerEvents = "none";
        setTimeout(function() {
          if (block && block.remove) block.remove();
        }, 200);
      });
      overlay.appendChild(block);
    }
    alert("Mining Mode On");
    mineText = "";
  }
  if (mineText.length > 20) mineText = mineText.slice(-20);
});
