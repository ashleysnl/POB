(function () {
  var U = window.ORRUtils;

  function Game(seed) {
    this.seed = seed || U.makeDailySeed();
    this.rng = new U.RNG(this.seed);
    this.width = 320;
    this.height = 180;
    this.mode = "title";
    this.time = 0;
    this.clockSpeed = 3;
    this.shiftDuration = 540;
    this.timeLeft = this.shiftDuration;
    this.day = 1;
    this.endless = false;
    this.dailyMode = false;
    this.score = 0;
    this.bestScore = U.getBestScore();
    this.tripStreak = 0;
    this.backlog = 24;
    this.happiness = 85;
    this.production = 85;
    this.incidentTimer = 0;
    this.incidentCooldown = 0;
    this.boatCooldown = 0;
    this.arrivalTimer = 18;
    this.eventTimer = 8;
    this.landingLights = false;
    this.hazardTimers = {};
    this.hazards = {
      puffin: false,
      mauzyFog: false,
      craneSwing: false,
      refuelDelay: false,
      radioConfusion: false,
      capelinDock: false,
      screechIn: false,
      kitchenParty: false,
      townieBayman: false,
      teaToutons: false,
      seaSmoke: false,
      opsGrounded: false
    };
    this.messages = [];
    this.lastMessage = "Where ya to? Bring that chopper in nice now.";
    this.landingHold = 0;
    this.confetti = [];
    this.collectibles = [];
    this.weather = { fog: 0.15, wind: 0.15, sea: 0.2 };
    this.heli = {
      x: 54,
      y: 84,
      vx: 0,
      vy: 0,
      alive: true,
      respawnTimer: 0
    };
    this.puffins = [];
    this.boat = null;
  }

  Game.prototype.resetHeli = function () {
    this.heli.x = 54;
    this.heli.y = 84;
    this.heli.vx = 0;
    this.heli.vy = 0;
    this.heli.alive = true;
    this.landingHold = 0;
  };

  Game.prototype.pushMessage = function (msg) {
    this.lastMessage = msg;
    this.messages.push({ text: msg, timer: 3.2 });
  };

  Game.prototype.startShift = function (opts) {
    opts = opts || {};
    if (opts.seed) {
      this.seed = opts.seed;
    }
    if (typeof opts.dailyMode === "boolean") {
      this.dailyMode = opts.dailyMode;
    }
    if (opts.day) {
      this.day = opts.day;
      this.endless = false;
    }
    if (opts.endless) {
      this.endless = true;
      this.day = 5;
    }

    this.rng = new U.RNG(this.seed + this.day * 211);
    this.mode = "play";
    this.time = 0;
    this.timeLeft = this.shiftDuration;
    this.score = 0;
    this.tripStreak = 0;
    this.backlog = this.endless ? 40 : (18 + this.day * 6);
    this.happiness = 86;
    this.production = 86;
    this.incidentTimer = 0;
    this.incidentCooldown = 0;
    this.boatCooldown = 0;
    this.arrivalTimer = 16;
    this.eventTimer = 7;
    this.landingLights = false;
    this.messages = [];
    this.confetti = [];
    this.collectibles = [];
    this.puffins = [];
    this.hazardTimers = {};
    for (var k in this.hazards) {
      this.hazards[k] = false;
    }
    this.boat = null;
    this.weather = this.getBaseWeather();
    this.resetHeli();
    this.pushMessage("Shift started. Keep her safe, b'y.");
  };

  Game.prototype.getBaseWeather = function () {
    var d = this.day;
    if (this.endless) {
      d = Math.min(10, 4 + Math.floor(this.time / 45));
    }
    if (d <= 1) {
      return { fog: 0.12, wind: 0.12, sea: 0.2 };
    }
    if (d === 2) {
      return { fog: 0.5, wind: 0.22, sea: 0.32 };
    }
    if (d === 3) {
      return { fog: 0.36, wind: 0.58, sea: 0.52 };
    }
    return { fog: 0.58, wind: 0.72, sea: 0.76 };
  };

  Game.prototype.togglePause = function () {
    if (this.mode === "play" || this.mode === "boat") {
      this.mode = "pause";
      return;
    }
    if (this.mode === "pause") {
      this.mode = this.boat ? "boat" : "play";
    }
  };

  Game.prototype.toggleLights = function () {
    this.landingLights = !this.landingLights;
    this.pushMessage(this.landingLights ? "Landing lights on, right on." : "Landing lights off.");
  };

  Game.prototype.activateHazard = function (id, dur) {
    this.hazardTimers[id] = dur;
    this.hazards[id] = true;
  };

  Game.prototype.updateHazards = function (dt) {
    for (var k in this.hazardTimers) {
      this.hazardTimers[k] -= dt;
      if (this.hazardTimers[k] <= 0) {
        this.hazards[k] = false;
        delete this.hazardTimers[k];
      }
    }

    this.eventTimer -= dt;
    if (this.eventTimer > 0) {
      return;
    }

    this.eventTimer = this.rng.range(10, 17) - (this.endless ? 2 : 0);
    var events = [
      {
        id: "puffin",
        minDay: 1,
        dur: 9,
        msg: "Puffin fly-by! Bird strike warning, mind now!"
      },
      {
        id: "mauzyFog",
        minDay: 2,
        dur: 10,
        msg: "Mauzy fog bank rolling in. B'y, she's some thick out!"
      },
      {
        id: "craneSwing",
        minDay: 3,
        dur: 8,
        msg: "Crane swing hazard, keep that tail clear."
      },
      {
        id: "refuelDelay",
        minDay: 1,
        dur: 8,
        msg: "Refuel delay at deck. Hold your horses."
      },
      {
        id: "radioConfusion",
        minDay: 2,
        dur: 7,
        msg: "Radio confusion from Signal Hill repeater cameo. Say again?"
      },
      {
        id: "capelinDock",
        minDay: 2,
        dur: 10,
        msg: "Capelin rolled up on the dock. Slippery as all get out."
      },
      {
        id: "screechIn",
        minDay: 1,
        dur: 10,
        msg: "Screech-in confidence buff. Steady hand unlocked."
      },
      {
        id: "kitchenParty",
        minDay: 1,
        dur: 12,
        msg: "Kitchen party playlist on deck. Morale boost, b'y."
      },
      {
        id: "townieBayman",
        minDay: 1,
        dur: 6,
        msg: "Townie vs Bayman joke popup. Whole crew cackling."
      },
      {
        id: "teaToutons",
        minDay: 1,
        dur: 8,
        msg: "Tea and toutons break. Quick repair and warm hands."
      },
      {
        id: "seaSmoke",
        minDay: 4,
        dur: 10,
        msg: "Sea smoke set in low over the water."
      }
    ];

    var possible = [];
    for (var i = 0; i < events.length; i++) {
      var e = events[i];
      if (this.day >= e.minDay || this.endless) {
        possible.push(e);
      }
    }
    var pick = this.rng.pick(possible);
    this.activateHazard(pick.id, pick.dur);
    this.pushMessage(pick.msg);

    if (pick.id === "puffin") {
      for (var p = 0; p < 3; p++) {
        this.puffins.push({
          x: -30 - p * 15,
          y: this.rng.range(58, 102),
          vx: this.rng.range(22, 36)
        });
      }
    }

    if (pick.id === "townieBayman") {
      if (this.rng.chance(0.5)) {
        this.happiness = U.clamp(this.happiness + 2, 0, 100);
      } else {
        this.happiness = U.clamp(this.happiness - 2, 0, 100);
      }
    }

    if (pick.id === "teaToutons") {
      this.incidentTimer = Math.max(0, this.incidentTimer - 2);
      this.production = U.clamp(this.production + 2, 0, 100);
    }
  };

  Game.prototype.updateWeather = function (dt) {
    var base = this.getBaseWeather();
    var t = this.time;
    var fog = base.fog + Math.sin(t * 0.2) * 0.07;
    var wind = base.wind + Math.sin(t * 0.33 + 2.1) * 0.06;
    var sea = base.sea + Math.sin(t * 0.28 + 1.2) * 0.08;

    if (this.hazards.mauzyFog) {
      fog += 0.28;
    }
    if (this.hazards.seaSmoke) {
      fog += 0.1;
      sea += 0.07;
    }

    this.weather.fog = U.clamp(fog, 0, 1);
    this.weather.wind = U.clamp(wind, 0, 1);
    this.weather.sea = U.clamp(sea, 0, 1);

    if (this.weather.wind > 0.8 && this.weather.sea > 0.78 && this.rng.chance(0.004 + dt * 0.004)) {
      this.activateHazard("opsGrounded", 8);
      this.pushMessage("Ops reasons: flights grounded. Send boat if you dare.");
    }
  };

  Game.prototype.updateCrewSystems = function (dt) {
    this.arrivalTimer -= dt;
    if (this.arrivalTimer <= 0) {
      var incoming = this.rng.int(2, this.endless ? 9 : 6);
      this.backlog += incoming;
      this.arrivalTimer = this.rng.range(14, 24);
      this.pushMessage(incoming + " more crew queued. Rotation never sleeps.");
    }

    var backlogPressure = Math.max(0, (this.backlog - 20) / 38);
    this.happiness -= backlogPressure * dt * 2.4;

    if (this.hazards.kitchenParty) {
      this.happiness += dt * 1.8;
    }

    if (this.hazards.screechIn) {
      this.happiness += dt * 0.6;
    }

    if (this.incidentTimer > 0) {
      this.incidentTimer -= dt;
      this.production -= dt * 3.2;
    }

    if (this.happiness < 45) {
      this.production -= dt * ((45 - this.happiness) / 35) * 2.2;
    } else {
      this.production += dt * 0.45;
    }

    this.happiness = U.clamp(this.happiness, 0, 100);
    this.production = U.clamp(this.production, 0, 100);
    this.boatCooldown = Math.max(0, this.boatCooldown - dt);
    this.incidentCooldown = Math.max(0, this.incidentCooldown - dt);
  };

  Game.prototype.heliIncident = function (msg, severity) {
    severity = severity || 1;
    this.pushMessage(msg);
    this.tripStreak = 0;
    this.happiness = U.clamp(this.happiness - 5 * severity, 0, 100);
    this.production = U.clamp(this.production - 3 * severity, 0, 100);
    this.incidentTimer = Math.max(this.incidentTimer, 3 + severity * 2);
    this.heli.respawnTimer = 1.2;
    this.heli.alive = false;
  };

  Game.prototype.resolveLanding = function (speed) {
    if (this.hazards.opsGrounded) {
      this.pushMessage("Deck says negative. Flights grounded right now.");
      return;
    }

    var seatCount = Math.min(12, this.backlog);
    this.backlog -= seatCount;
    this.happiness = U.clamp(this.happiness + 7, 0, 100);
    this.production = U.clamp(this.production + 2.8, 0, 100);
    this.score += seatCount * 10 + this.tripStreak * 8 + Math.floor(this.production);
    this.tripStreak += 1;

    if (speed < 2.6) {
      this.score += 45;
      this.pushMessage("Clean landing streak x" + this.tripStreak + "! Deadly stuff.");
    } else {
      this.pushMessage("Landed safe. " + seatCount + " heading home. Right on.");
    }

    if (this.rng.chance(0.25)) {
      var bonus = this.rng.pick([
        { name: "puffin plush", pts: 30 },
        { name: "touton", pts: 20 },
        { name: "rubber boot", pts: 25 }
      ]);
      this.score += bonus.pts;
      this.pushMessage("Bonus collectible: " + bonus.name + " (" + bonus.pts + " pts)");
    }

    this.heli.alive = false;
    this.heli.respawnTimer = 1.4;
    this.landingHold = 0;
  };

  Game.prototype.callBoat = function () {
    if (this.mode !== "play" || this.boatCooldown > 0) {
      return false;
    }
    this.mode = "boat";
    this.boat = {
      x: 24,
      y: 147,
      vy: 0,
      timer: 24,
      integrity: 100,
      hits: 0,
      dockY: 138,
      icebergs: []
    };

    var count = 4 + Math.floor(this.weather.sea * 4);
    for (var i = 0; i < count; i++) {
      this.boat.icebergs.push({
        x: this.rng.range(80, 300),
        y: this.rng.range(130, 174),
        w: this.rng.int(5, 12),
        h: this.rng.int(3, 7),
        vx: this.rng.range(6, 18) * (this.day >= 4 ? 1.4 : 0.8)
      });
    }
    this.pushMessage("Boat dispatched. Thread it through now, b'y.");
    return true;
  };

  Game.prototype.finishBoat = function (success) {
    this.mode = "play";
    this.boatCooldown = 22;

    if (success) {
      var maxSeats = this.boat.integrity > 55 ? 30 : 18;
      var seats = Math.min(maxSeats, this.backlog);
      this.backlog -= seats;
      this.happiness = U.clamp(this.happiness + 4, 0, 100);
      this.production = U.clamp(this.production + 1.5, 0, 100);
      this.score += seats * 8;
      this.pushMessage("Boat made dock. " + seats + " sent home. Some good.");
    } else {
      this.happiness = U.clamp(this.happiness - 9, 0, 100);
      this.production = U.clamp(this.production - 4, 0, 100);
      this.pushMessage("Boat run failed in rough seas. Not ideal, b'y.");
    }
    this.boat = null;
  };

  Game.prototype.updatePuffins = function (dt) {
    for (var i = this.puffins.length - 1; i >= 0; i--) {
      var p = this.puffins[i];
      p.x += p.vx * dt;
      p.y += Math.sin(this.time * 8 + i) * 8 * dt;
      if (p.x > this.width + 12) {
        this.puffins.splice(i, 1);
        continue;
      }

      if (this.heli.alive) {
        var dx = p.x - this.heli.x;
        var dy = p.y - this.heli.y;
        if (Math.hypot(dx, dy) < 6) {
          this.puffins.splice(i, 1);
          this.heliIncident("Puffin close call. Rotor clipped feathers.", 1.3);
        }
      }
    }
  };

  Game.prototype.updateHeli = function (dt, input) {
    var h = this.heli;
    if (!h.alive) {
      h.respawnTimer -= dt;
      if (h.respawnTimer <= 0) {
        this.resetHeli();
      }
      return;
    }

    var axes = input.frameAxes();
    var ax = axes.x;
    var ay = axes.y;
    var assist = input.isHovering();

    if (this.hazards.radioConfusion) {
      ax += Math.sin(this.time * 19) * 0.25;
      ay += Math.cos(this.time * 16) * 0.25;
    }

    var accel = this.hazards.refuelDelay ? 25 : 34;
    var driftScale = this.hazards.screechIn ? 0.35 : 1;
    var windX = (this.weather.wind * 26 + Math.sin(this.time * 1.7) * 5) * driftScale;
    var windY = Math.sin(this.time * 0.9) * this.weather.wind * 9 * driftScale;

    h.vx += (ax * accel + windX * 0.1) * dt;
    h.vy += (ay * accel + windY * 0.1) * dt;

    if (assist) {
      h.vx *= 0.9;
      h.vy *= 0.9;
    } else {
      h.vx *= 0.97;
      h.vy *= 0.97;
    }

    h.x += h.vx * dt;
    h.y += h.vy * dt;

    if (h.x < 8 || h.x > this.width - 8 || h.y < 12 || h.y > this.height - 8) {
      this.heliIncident("Whoa now! Hard boundary hit.", 1.4);
      return;
    }

    var deck = this.getHelideck();
    var dx = h.x - deck.x;
    var dy = h.y - deck.y;
    var speed = Math.hypot(h.vx, h.vy);

    var landingRadius = this.hazards.craneSwing ? 9 : 12;
    if (this.hazards.capelinDock) {
      landingRadius -= 2;
    }

    if (Math.hypot(dx, dy) < landingRadius) {
      var safeSpeed = this.hazards.capelinDock ? 3.3 : 4.2;
      var hardSpeed = 8.6;
      if (speed <= safeSpeed && (assist || input.isLandPressed())) {
        this.landingHold += dt;
        if (this.landingHold >= 1.0) {
          this.resolveLanding(speed);
        }
      } else if (speed > safeSpeed && speed < hardSpeed && this.incidentCooldown <= 0) {
        this.incidentCooldown = 1.4;
        this.heliIncident("Hard landing on a capelin-slick deck.", 1.1);
      } else if (speed >= hardSpeed && this.incidentCooldown <= 0) {
        this.incidentCooldown = 1.4;
        this.heliIncident("Too hot into deck. Incident pause triggered.", 1.6);
      } else {
        this.landingHold = 0;
      }
    } else {
      this.landingHold = 0;
    }

    if (this.hazards.craneSwing && h.x > 260 && h.y < 104 && this.rng.chance(0.02)) {
      this.heliIncident("Crane swing clipped the approach lane.", 1.5);
    }
  };

  Game.prototype.getHelideck = function () {
    var bob = Math.sin(this.time * 0.35) * 1.5;
    return { x: 198, y: 99 + bob, r: 11 };
  };

  Game.prototype.updateBoatGame = function (dt, input) {
    var b = this.boat;
    if (!b) {
      this.mode = "play";
      return;
    }

    b.timer -= dt;
    var axes = input.frameAxes();
    var sea = this.weather.sea;
    var steer = axes.y;
    var wave = Math.sin(this.time * (4 + sea * 4) + b.x * 0.05) * (1 + sea * 6);

    b.vy += steer * (24 - sea * 10) * dt;
    b.vy *= 0.94 - sea * 0.04;
    b.y += b.vy * dt + wave * dt * 2.3;
    b.x += (30 - sea * 8) * dt;

    if (this.day >= 4 || sea > 0.7) {
      for (var i = 0; i < b.icebergs.length; i++) {
        var ice = b.icebergs[i];
        ice.x -= ice.vx * dt;
        if (ice.x < -20) {
          ice.x = 330 + this.rng.range(0, 60);
          ice.y = this.rng.range(130, 173);
        }

        if (
          b.x > ice.x - 5 &&
          b.x < ice.x + ice.w + 5 &&
          b.y + 2 > ice.y - 2 &&
          b.y < ice.y + ice.h + 2
        ) {
          b.integrity -= 22;
          b.hits += 1;
          ice.x = -40;
          this.pushMessage("Iceberg bump! Keep 'er together.");
        }
      }
    }

    if (b.y < 128 || b.y > 176) {
      b.integrity -= 16 * dt;
    }

    if (b.integrity <= 0 || b.timer <= 0) {
      this.finishBoat(false);
      return;
    }

    if (b.x >= 282) {
      var linedUp = Math.abs(b.y - b.dockY) < 12;
      this.finishBoat(linedUp);
    }
  };

  Game.prototype.updateMessages = function (dt) {
    for (var i = this.messages.length - 1; i >= 0; i--) {
      this.messages[i].timer -= dt;
      if (this.messages[i].timer <= 0) {
        this.messages.splice(i, 1);
      }
    }
  };

  Game.prototype.spawnConfetti = function () {
    for (var i = 0; i < 80; i++) {
      this.confetti.push({
        x: this.rng.range(20, 300),
        y: this.rng.range(8, 70),
        vy: this.rng.range(12, 30),
        c: this.rng.pick(["#ffbe0b", "#3a86ff", "#ff006e", "#ffffff"]),
        kind: this.rng.chance(0.16) ? "puffin" : "confetti"
      });
    }
  };

  Game.prototype.updateConfetti = function (dt) {
    for (var i = this.confetti.length - 1; i >= 0; i--) {
      var c = this.confetti[i];
      c.y += c.vy * dt;
      if (c.y > this.height) {
        this.confetti.splice(i, 1);
      }
    }
  };

  Game.prototype.checkEnd = function () {
    if (this.production <= 0 || this.happiness <= 0) {
      this.mode = "gameover";
      this.pushMessage("Game over. She's gone right off the rails, me son.");
      return;
    }

    if (this.timeLeft <= 0) {
      if (this.production >= 70 && this.happiness >= 70) {
        this.mode = "win";
        this.pushMessage("Shift complete! Confetti puffins for everyone.");
        this.spawnConfetti();
        if (!this.endless && this.day < 4) {
          this.day += 1;
        } else if (!this.endless) {
          this.endless = true;
        }
      } else {
        this.mode = "gameover";
        this.pushMessage("Shift done but morale's in the bilge. Have a tea and reset.");
      }
    }
  };

  Game.prototype.update = function (dt, input) {
    if (this.mode === "title" || this.mode === "pause") {
      return;
    }

    this.time += dt;
    this.updateMessages(dt);

    if (this.mode === "boat") {
      this.timeLeft -= dt * this.clockSpeed;
      this.updateWeather(dt);
      this.updateBoatGame(dt, input);
      this.updateCrewSystems(dt * 0.45);
      this.checkEnd();
      return;
    }

    if (this.mode === "play") {
      this.timeLeft -= dt * this.clockSpeed;
      this.updateHazards(dt);
      this.updateWeather(dt);
      this.updatePuffins(dt);
      this.updateHeli(dt, input);
      this.updateCrewSystems(dt);
      this.checkEnd();
      return;
    }

    if (this.mode === "win" || this.mode === "gameover") {
      this.updateConfetti(dt);
    }
  };

  Game.prototype.finalizeRun = function () {
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      U.setBestScore(this.bestScore);
    }
    U.saveLastRun({
      score: this.score,
      day: this.day,
      endless: this.endless,
      happiness: Math.round(this.happiness),
      production: Math.round(this.production),
      backlog: this.backlog,
      seed: this.seed,
      at: Date.now()
    });
  };

  window.ORRGame = Game;
})();
