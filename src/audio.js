(function () {
  function AudioSystem() {
    this.ctx = null;
    this.master = null;
    this.rotorOsc = null;
    this.rotorSub = null;
    this.rotorGain = null;
    this.windOsc = null;
    this.windGain = null;
    this.seaOsc = null;
    this.seaGain = null;
    this.boatOsc = null;
    this.boatGain = null;
    this.enabled = true;
    this.started = false;
  }

  AudioSystem.prototype.init = function (enabled) {
    this.enabled = enabled;
  };

  AudioSystem.prototype.unlock = function () {
    if (!this.enabled || this.started) {
      return;
    }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
      this.enabled = false;
      return;
    }
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.2;
    this.master.connect(this.ctx.destination);

    this.rotorOsc = this.ctx.createOscillator();
    this.rotorOsc.type = "sawtooth";
    this.rotorOsc.frequency.value = 50;
    this.rotorSub = this.ctx.createOscillator();
    this.rotorSub.type = "triangle";
    this.rotorSub.frequency.value = 24;
    this.rotorGain = this.ctx.createGain();
    this.rotorGain.gain.value = 0.0;
    this.rotorOsc.connect(this.rotorGain);
    this.rotorSub.connect(this.rotorGain);
    this.rotorGain.connect(this.master);
    this.rotorOsc.start();
    this.rotorSub.start();

    this.windOsc = this.ctx.createOscillator();
    this.windOsc.type = "triangle";
    this.windOsc.frequency.value = 150;
    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0.0;
    this.windOsc.connect(this.windGain);
    this.windGain.connect(this.master);
    this.windOsc.start();

    this.seaOsc = this.ctx.createOscillator();
    this.seaOsc.type = "sine";
    this.seaOsc.frequency.value = 44;
    this.seaGain = this.ctx.createGain();
    this.seaGain.gain.value = 0.0;
    this.seaOsc.connect(this.seaGain);
    this.seaGain.connect(this.master);
    this.seaOsc.start();

    this.boatOsc = this.ctx.createOscillator();
    this.boatOsc.type = "square";
    this.boatOsc.frequency.value = 78;
    this.boatGain = this.ctx.createGain();
    this.boatGain.gain.value = 0.0;
    this.boatOsc.connect(this.boatGain);
    this.boatGain.connect(this.master);
    this.boatOsc.start();

    this.started = true;
  };

  AudioSystem.prototype.setEnabled = function (v) {
    this.enabled = v;
    if (!v && this.master) {
      this.master.gain.value = 0;
    }
    if (v && this.master) {
      this.master.gain.value = 0.2;
    }
  };

  AudioSystem.prototype.updateRotor = function (speedNorm, hovering) {
    if (!this.started || !this.enabled) {
      return;
    }
    var now = this.ctx.currentTime;
    var targetHz = 46 + speedNorm * 46 + (hovering ? 14 : 0);
    var targetVol = 0.025 + speedNorm * 0.085;
    this.rotorOsc.frequency.linearRampToValueAtTime(targetHz, now + 0.07);
    this.rotorSub.frequency.linearRampToValueAtTime(20 + speedNorm * 18, now + 0.08);
    this.rotorGain.gain.linearRampToValueAtTime(targetVol, now + 0.07);
  };

  AudioSystem.prototype.updateAmbience = function (weather, inBoatMode) {
    if (!this.started || !this.enabled) {
      return;
    }
    var now = this.ctx.currentTime;
    var wind = weather.wind || 0;
    var sea = weather.sea || 0;
    this.windOsc.frequency.linearRampToValueAtTime(130 + wind * 210, now + 0.12);
    this.windGain.gain.linearRampToValueAtTime(0.004 + wind * 0.02, now + 0.12);
    this.seaOsc.frequency.linearRampToValueAtTime(40 + sea * 26, now + 0.12);
    this.seaGain.gain.linearRampToValueAtTime(0.006 + sea * 0.018, now + 0.12);
    this.boatGain.gain.linearRampToValueAtTime(inBoatMode ? 0.028 + sea * 0.02 : 0.0, now + 0.08);
    this.boatOsc.frequency.linearRampToValueAtTime(70 + sea * 24, now + 0.08);
  };

  AudioSystem.prototype.beep = function (freq, dur, type, gain) {
    if (!this.started || !this.enabled) {
      return;
    }
    var now = this.ctx.currentTime;
    var o = this.ctx.createOscillator();
    var g = this.ctx.createGain();
    o.type = type || "square";
    o.frequency.value = freq;
    g.gain.value = gain || 0.05;
    o.connect(g);
    g.connect(this.master);
    o.start(now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.stop(now + dur);
  };

  AudioSystem.prototype.landingChime = function () {
    this.beep(660, 0.12, "triangle", 0.07);
    setTimeout(this.beep.bind(this, 990, 0.13, "triangle", 0.07), 70);
  };

  AudioSystem.prototype.warning = function () {
    this.beep(220, 0.15, "square", 0.06);
  };

  AudioSystem.prototype.impact = function () {
    this.beep(140, 0.12, "sawtooth", 0.09);
    setTimeout(this.beep.bind(this, 95, 0.14, "square", 0.06), 60);
  };

  AudioSystem.prototype.success = function () {
    this.beep(523, 0.14, "square", 0.06);
    setTimeout(this.beep.bind(this, 659, 0.14, "square", 0.06), 100);
    setTimeout(this.beep.bind(this, 784, 0.18, "square", 0.06), 200);
  };

  AudioSystem.prototype.gameOver = function () {
    this.beep(280, 0.22, "sawtooth", 0.08);
    setTimeout(this.beep.bind(this, 170, 0.28, "sawtooth", 0.08), 120);
  };

  window.ORRAudio = AudioSystem;
})();
