(function () {
  var U = window.ORRUtils;
  var Input = window.ORRInput;
  var AudioSystem = window.ORRAudio;
  var Game = window.ORRGame;

  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d", { alpha: false });
  ctx.imageSmoothingEnabled = false;

  var hud = {
    backlog: document.getElementById("hudBacklog"),
    happiness: document.getElementById("hudHappiness"),
    production: document.getElementById("hudProduction"),
    weather: document.getElementById("hudWeather"),
    timer: document.getElementById("hudTimer"),
    day: document.getElementById("hudDay"),
    score: document.getElementById("hudScore"),
    best: document.getElementById("hudBest")
  };

  var overlay = document.getElementById("overlay");
  var overlayMessage = document.getElementById("overlayMessage");
  var btnStart = document.getElementById("btnStart");
  var btnRestart = document.getElementById("btnRestart");
  var btnNext = document.getElementById("btnNext");
  var btnBoat = document.getElementById("btnBoat");
  var btnSound = document.getElementById("btnSound");
  var btnDaily = document.getElementById("btnDaily");
  var toast = document.getElementById("toast");

  var settings = U.getSettings();
  var querySeed = new URLSearchParams(window.location.search).get("seed");
  var seed = querySeed ? parseInt(querySeed, 10) : U.makeDailySeed();

  var game = new Game(seed);
  var input = new Input();
  var audio = new AudioSystem();
  audio.init(settings.soundOn);

  input.init(
    {
      stickZone: document.getElementById("stickZone"),
      stickKnob: document.getElementById("stickKnob"),
      btnHover: document.getElementById("btnHover"),
      btnLand: document.getElementById("btnLand")
    },
    settings
  );

  function unlockAudio() {
    audio.unlock();
    window.removeEventListener("pointerdown", unlockAudio);
    window.removeEventListener("keydown", unlockAudio);
  }

  window.addEventListener("pointerdown", unlockAudio, { once: true });
  window.addEventListener("keydown", unlockAudio, { once: true });

  function weatherLabel() {
    var fog = game.weather.fog;
    var wind = game.weather.wind;
    var sea = game.weather.sea;
    var fogIcon = fog > 0.6 ? "Fog: Heavy" : fog > 0.35 ? "Fog: Mauzy" : "Fog: Light";
    var windIcon = wind > 0.65 ? "Wind: Right some" : wind > 0.35 ? "Wind: Breezy" : "Wind: Calm";
    var seaIcon = sea > 0.7 ? "Sea: Rough" : sea > 0.4 ? "Sea: Rolling" : "Sea: Settled";
    return fogIcon + " | " + windIcon + " | " + seaIcon;
  }

  function showOverlay(mode) {
    overlay.hidden = false;
    btnStart.hidden = true;
    btnRestart.hidden = true;
    btnNext.hidden = true;

    if (mode === "title") {
      btnStart.hidden = false;
      overlayMessage.textContent = "Land safe, send workers home, keep morale and production up.";
    } else if (mode === "gameover") {
      btnRestart.hidden = false;
      overlayMessage.textContent = "Shift went sideways. Some thick out and morale dropped.";
    } else if (mode === "win") {
      btnNext.hidden = false;
      overlayMessage.textContent = "Shift complete. Confetti puffins and kitchen party vibes.";
    }
  }

  function hideOverlay() {
    overlay.hidden = true;
  }

  function syncHud() {
    hud.backlog.textContent = "Backlog: " + game.backlog;
    hud.happiness.textContent = "Happiness: " + Math.floor(game.happiness);
    hud.production.textContent = "Production: " + Math.floor(game.production);
    hud.weather.textContent = "Weather: " + weatherLabel();
    hud.timer.textContent = "Shift: " + U.formatTime(game.timeLeft);
    hud.day.textContent = game.endless ? "Endless" : "Day " + game.day;
    hud.score.textContent = "Score: " + Math.floor(game.score);
    hud.best.textContent = "Best: " + game.bestScore;
    toast.textContent = game.lastMessage;
  }

  function startCampaign() {
    var modeDay = game.mode === "win" ? game.day : 1;
    game.startShift({ day: modeDay, dailyMode: false, seed: seed });
    audio.beep(610, 0.09, "triangle", 0.06);
    hideOverlay();
  }

  function startDaily() {
    var dSeed = U.makeDailySeed();
    seed = dSeed;
    game.startShift({ day: 1, dailyMode: true, seed: dSeed });
    game.pushMessage("Daily challenge seed: " + dSeed);
    audio.beep(660, 0.1, "triangle", 0.06);
    hideOverlay();
  }

  function callBoatFromUi() {
    if (game.callBoat()) {
      audio.beep(440, 0.11, "square", 0.06);
    }
  }

  btnStart.addEventListener("click", startCampaign);
  btnRestart.addEventListener("click", function () {
    game.day = 1;
    game.endless = false;
    startCampaign();
  });
  btnNext.addEventListener("click", function () {
    var opts;
    if (game.endless) {
      opts = { endless: true, seed: seed + 99 };
    } else {
      opts = { day: game.day, seed: seed + 31 };
    }
    game.startShift(opts);
    hideOverlay();
  });
  btnBoat.addEventListener("click", callBoatFromUi);
  btnDaily.addEventListener("click", startDaily);
  btnSound.addEventListener("click", function () {
    settings.soundOn = !settings.soundOn;
    U.saveSettings(settings);
    audio.setEnabled(settings.soundOn);
    btnSound.textContent = "Sound: " + (settings.soundOn ? "On" : "Off");
  });

  btnSound.textContent = "Sound: " + (settings.soundOn ? "On" : "Off");

  var lastTs = 0;
  var finalized = false;
  var lastAudioMessage = "";

  function frame(ts) {
    if (!lastTs) {
      lastTs = ts;
    }
    var dt = Math.min(0.033, (ts - lastTs) / 1000);
    lastTs = ts;

    if (input.consumePress("l")) {
      game.toggleLights();
      audio.beep(520, 0.05, "triangle", 0.04);
    }

    if (input.consumePress("p")) {
      game.togglePause();
    }

    if (input.consumePress("b")) {
      callBoatFromUi();
    }

    game.update(dt, input);

    var speedNorm = Math.min(1, Math.hypot(game.heli.vx, game.heli.vy) / 48);
    audio.updateRotor(speedNorm, input.isHovering());
    audio.updateAmbience(game.weather, game.mode === "boat");

    if (game.messages.length > 0) {
      var latest = game.messages[game.messages.length - 1].text;
      if (latest !== lastAudioMessage) {
        lastAudioMessage = latest;
        if (/warning|grounded|incident|hazard|thick|iceberg/i.test(latest)) {
          audio.warning();
        }
        if (/hard landing|too hot|clipped|failed/i.test(latest)) {
          audio.impact();
        }
        if (/landed safe|clean landing|sent home|boat made dock/i.test(latest)) {
          audio.landingChime();
        }
      }
    }

    if ((game.mode === "gameover" || game.mode === "win") && !finalized) {
      finalized = true;
      game.finalizeRun();
      if (game.mode === "gameover") {
        audio.gameOver();
      } else {
        audio.success();
      }
      showOverlay(game.mode);
    }

    if (game.mode === "play" || game.mode === "boat" || game.mode === "pause") {
      finalized = false;
      hideOverlay();
    }

    window.ORRRender.render(ctx, game, input);
    syncHud();
    requestAnimationFrame(frame);
  }

  showOverlay("title");
  syncHud();
  requestAnimationFrame(frame);
})();
