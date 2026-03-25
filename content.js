let activeSkull = false;
let activeAudio = null;
let activeOverlay = null;
let activeTimeout = null;
let activeStyle = null;
let typedBuffer = "";

const styleElement = document.createElement('style');
styleElement.textContent = `
  #minePlace {
    position: fixed !important;
    bottom: 0px !important;
    right: 0px !important;
    width: 250px !important;
    height: auto !important;
    z-index: 100000000 !important;
    pointer-events: none !important;
    display: none;
  }

  @keyframes shortBob {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-40px) rotate(-15deg); }
  }

  .bobbing {
    animation: shortBob 0.3s ease-in-out !important;
  }

  #mine-grid-overlay {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    display: none;
    grid-template-columns: repeat(4, 1fr) !important;
    grid-template-rows: repeat(4, 1fr) !important;
    z-index: 99999999 !important;
    pointer-events: none !important;
  }

  .mine-block {
    cursor: pointer !important;
    pointer-events: auto !important;
    position: relative !important;
    background-color: transparent !important;
  }

  .mine-crack-layer {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background-size: cover !important;
    background-position: center !important;
    background-repeat: no-repeat !important;
    pointer-events: none !important;
  }

  #exit-mine-btn {
    position: fixed !important;
    bottom: 20px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    z-index: 100000001 !important;
    background: #e63946 !important;
    color: white !important;
    border: 2px solid white !important;
    padding: 6px 14px !important;
    font-family: 'Courier New', monospace !important;
    font-size: 15px !important;
    font-weight: bold !important;
    cursor: pointer !important;
    display: none;
    border-radius: 4px !important;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3) !important;
  }
`;
document.head.appendChild(styleElement);

const mineHand = document.createElement('img');
mineHand.id = "minePlace";
mineHand.src = chrome.runtime.getURL("hand.png");
document.body.appendChild(mineHand);

const gridContainer = document.createElement('div');
gridContainer.id = "mine-grid-overlay";
document.body.appendChild(gridContainer);

const exitBtn = document.createElement('button');
exitBtn.id = "exit-mine-btn";
exitBtn.innerText = "X";
document.body.appendChild(exitBtn);

for (let i = 0; i < 16; i++) {
  const block = document.createElement('div');
  block.className = 'mine-block';
  block.setAttribute('data-hits', '0');

  const crackLayer = document.createElement('div');
  crackLayer.className = 'mine-crack-layer';
  block.appendChild(crackLayer);

  const row = Math.floor(i / 4);
  const col = i % 4;

  block.addEventListener('click', function() {
    mineHand.classList.remove("bobbing");
    void mineHand.offsetWidth;
    mineHand.classList.add("bobbing");

    let clicks = parseInt(block.getAttribute('data-hits'));
    clicks++;
    block.setAttribute('data-hits', clicks.toString());

    if (clicks === 1) {
      crackLayer.style.backgroundImage = `url(${chrome.runtime.getURL('blockmine1.png')})`;
    } else if (clicks === 2) {
      crackLayer.style.backgroundImage = `url(${chrome.runtime.getURL('blockmine2.png')})`;
    } else if (clicks === 3) {
      crackLayer.style.backgroundImage = 'none';
      block.style.backgroundImage = `url(${chrome.runtime.getURL('minecraft.png')})`;
      block.style.backgroundSize = '100vw 100vh';
      block.style.backgroundPosition = `-${col * 25}vw -${row * 25}vh`;
      block.style.backgroundRepeat = 'no-repeat';
      block.style.pointerEvents = 'none';
    }
  });

  gridContainer.appendChild(block);
}

exitBtn.addEventListener('click', function() {
  gridContainer.style.display = "none";
  exitBtn.style.display = "none";
  mineHand.style.display = "none";

  const blocks = gridContainer.getElementsByClassName('mine-block');
  for (let b of blocks) {
    b.setAttribute('data-hits', '0');
    b.style.backgroundImage = 'none';
    b.style.pointerEvents = 'auto';
    const cracks = b.getElementsByClassName('mine-crack-layer');
    if (cracks.length > 0) {
      cracks[0].style.backgroundImage = 'none';
    }
  }
});

function getRandomSong() {
  const songs = ['phonk.mp3', 'phonk1.mp3', 'phonk2.mp3', 'phonk3.mp3'];
  return songs[Math.floor(Math.random() * songs.length)];
}

function stopSkullEffect() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
  if (activeOverlay && activeOverlay.parentNode) {
    activeOverlay.parentNode.removeChild(activeOverlay);
  }
  if (activeStyle && activeStyle.parentNode) {
    activeStyle.parentNode.removeChild(activeStyle);
  }
  document.documentElement.style.filter = "";
  activeSkull = false;
  if (activeTimeout) {
    clearTimeout(activeTimeout);
    activeTimeout = null;
  }
  activeOverlay = null;
  activeStyle = null;
}

function startSkullEffect(countdownSeconds, isInstant) {
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
          75% { transform: translateX(-50%) rotate(-10deg); }
        }
      `;
      document.head.appendChild(shakeStyle);
      activeStyle = shakeStyle;
      skull.style.animation = "chaosShake 0.5s ease-in-out infinite !important";
    }

    document.body.appendChild(skull);

    const audio = new Audio(chrome.runtime.getURL(getRandomSong()));
    audio.volume = 0.5;
    audio.play().catch(function(e) {
      console.log("Audio failed to play", e);
    });
    activeAudio = audio;

    activeTimeout = setTimeout(function() {
      stopSkullEffect();
      if (skull && skull.parentNode) {
        skull.parentNode.removeChild(skull);
      }
    }, 5000);
  };

  if (countdownSeconds > 0) {
    let seconds = countdownSeconds;
    timerText.innerText = seconds;
    const interval = setInterval(function() {
      seconds--;
      if (seconds > 0) {
        timerText.innerText = seconds;
      } else {
        clearInterval(interval);
        timerText.innerText = "67";
        setTimeout(function() {
          timerText.innerText = "";
          applyEffect();
        }, 30);
      }
    }, 1000);
  } else {
    applyEffect();
  }
}

let gravityActive = false;
let defyGravity = false;

function removeGravityBtn() {
  const btn = document.getElementById('gravity-exit-btn');
  if (btn) btn.remove();
}

function addGravityBtn(resetFn) {
  removeGravityBtn();
  const btn = document.createElement('button');
  btn.id = "gravity-exit-btn";
  btn.innerText = "X";
  btn.style.cssText = `
    position: fixed !important;
    bottom: 20px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    z-index: 100000002 !important;
    background: #e63946 !important;
    color: white !important;
    border: 2px solid white !important;
    padding: 6px 14px !important;
    font-family: 'Courier New', monospace !important;
    font-size: 15px !important;
    font-weight: bold !important;
    cursor: pointer !important;
    border-radius: 4px !important;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3) !important;
  `;
  btn.addEventListener('click', resetFn);
  document.body.appendChild(btn);
}

function startGravity() {
  if (gravityActive) {
    document.querySelectorAll('.gravity-fallen').forEach(function(el) {
      el.style.transform = "";
      el.style.transition = "";
      el.classList.remove('gravity-fallen');
    });
    gravityActive = false;
    removeGravityBtn();
    return;
  }

  gravityActive = true;

  const elements = document.querySelectorAll('img, h1, h2, h3, h4, p, a, button, input, textarea, select, div > span, form, nav, header, svg, video, iframe');
  elements.forEach(function(el) {
    const rect = el.getBoundingClientRect();
    const scrollY = window.scrollY;
    const absoluteBottom = rect.bottom + scrollY;
    const pageHeight = document.body.scrollHeight;
    const distanceToFall = pageHeight - absoluteBottom - 10;

    el.style.transition = "transform " + (0.8 + Math.random() * 5.2) + "s ease-in";
    el.style.transform = "translateY(" + distanceToFall + "px) rotate(" + ((Math.random() - 0.5) * 25) + "deg)";
    el.classList.add('gravity-fallen');
  });

  addGravityBtn(function() {
    document.querySelectorAll('.gravity-fallen').forEach(function(el) {
      el.style.transform = "";
      el.style.transition = "";
      el.classList.remove('gravity-fallen');
    });
    gravityActive = false;
    removeGravityBtn();
  });
}

function startRise() {
  if (defyGravity) {
    document.querySelectorAll('.gravity-risen').forEach(function(el) {
      el.style.transform = "";
      el.style.transition = "";
      el.classList.remove('gravity-risen');
    });
    defyGravity = false;
    removeGravityBtn();
    return;
  }

  defyGravity = true;

  const elements = document.querySelectorAll('img, h1, h2, h3, h4, p, a, button, input, textarea, select, div > span, form, nav, header, svg, video, iframe');
  elements.forEach(function(el) {
    const rect = el.getBoundingClientRect();
    const distanceToRise = rect.bottom + window.scrollY + 200;

    el.style.transition = "transform " + (0.8 + Math.random() * 5.2) + "s ease-in";
    el.style.transform = "translateY(" + (-distanceToRise) + "px) rotate(" +((Math.random() - 0.5) * 25) + "deg)";
    el.classList.add('gravity-risen');
  });

  addGravityBtn(function() {
    document.querySelectorAll('.gravity-risen').forEach(function(el) {
      el.style.transform = "";
      el.style.transition = "";
      el.classList.remove('gravity-risen');
    });
    defyGravity = false;
    removeGravityBtn();
  });
}


document.addEventListener('keydown', function(e){
  typedBuffer += e.key.toLowerCase();

  if (typedBuffer.endsWith("67")) {
    document.body.style.transition = "transform 2s ease-in-out";
    document.body.style.transform = "rotate(180deg)";
    alert("67 DETECTED 676767677667676767");
    typedBuffer = "";
  }

  if (typedBuffer.endsWith("mine")){
    gridContainer.style.display = "grid";
    exitBtn.style.display = "block";
    mineHand.style.display = "block";
    typedBuffer = "";
  }

  if (typedBuffer.endsWith("fall")){
    startGravity();
    typedBuffer = "";
  }

  if (typedBuffer.endsWith("leviosa")){
    startRise();
    typedBuffer = "";
  }

  if (typedBuffer.length > 20) {
    typedBuffer = typedBuffer.slice(-20);
  }
});

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

let idleTimer = null;

function resetIdleTimer(){
  clearTimeout(idleTimer);
  idleTimer = setTimeout(function() {
    window.open('https://www.youtube.com/watch?v=5mGuCdlCcNM', '_blank');
  }, 5 * 60 * 1000);
}

['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'].forEach(function(event) {
  document.addEventListener(event, resetIdleTimer, true);
});

resetIdleTimer();
