(function () {
  function AudioSystem() {
    this.ctx = null;
    this.master = null;
    this.rotorOsc = null;
    this.rotorGain = null;
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
    this.rotorOsc.frequency.value = 55;
    this.rotorGain = this.ctx.createGain();
    this.rotorGain.gain.value = 0.0;
    this.rotorOsc.connect(this.rotorGain);
    this.rotorGain.connect(this.master);
    this.rotorOsc.start();

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
    var targetHz = 48 + speedNorm * 42 + (hovering ? 16 : 0);
    var targetVol = 0.03 + speedNorm * 0.08;
    this.rotorOsc.frequency.linearRampToValueAtTime(targetHz, now + 0.07);
    this.rotorGain.gain.linearRampToValueAtTime(targetVol, now + 0.07);
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
