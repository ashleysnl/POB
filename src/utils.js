(function () {
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function formatTime(totalSeconds) {
    var safe = Math.max(0, Math.floor(totalSeconds));
    var m = Math.floor(safe / 60).toString().padStart(2, "0");
    var s = (safe % 60).toString().padStart(2, "0");
    return m + ":" + s;
  }

  function makeDailySeed() {
    var d = new Date();
    return parseInt(
      [
        d.getUTCFullYear().toString(),
        (d.getUTCMonth() + 1).toString().padStart(2, "0"),
        d.getUTCDate().toString().padStart(2, "0")
      ].join(""),
      10
    );
  }

  function mulberry32(seed) {
    var s = seed >>> 0;
    return function () {
      s += 0x6d2b79f5;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function RNG(seed) {
    this.seed = seed >>> 0;
    this.r = mulberry32(this.seed);
  }

  RNG.prototype.float = function () {
    return this.r();
  };

  RNG.prototype.range = function (min, max) {
    return min + (max - min) * this.float();
  };

  RNG.prototype.int = function (min, max) {
    return Math.floor(this.range(min, max + 1));
  };

  RNG.prototype.pick = function (arr) {
    return arr[this.int(0, arr.length - 1)];
  };

  RNG.prototype.chance = function (p) {
    return this.float() < p;
  };

  function getSettings() {
    try {
      var raw = localStorage.getItem("orr_settings");
      var data = raw ? JSON.parse(raw) : {};
      return {
        soundOn: data.soundOn !== false,
        touchSensitivity: data.touchSensitivity || 1
      };
    } catch (err) {
      return { soundOn: true, touchSensitivity: 1 };
    }
  }

  function saveSettings(settings) {
    localStorage.setItem("orr_settings", JSON.stringify(settings));
  }

  function getBestScore() {
    return parseInt(localStorage.getItem("orr_best") || "0", 10) || 0;
  }

  function setBestScore(score) {
    localStorage.setItem("orr_best", String(score));
  }

  function saveLastRun(stats) {
    localStorage.setItem("orr_last", JSON.stringify(stats));
  }

  window.ORRUtils = {
    clamp: clamp,
    lerp: lerp,
    RNG: RNG,
    formatTime: formatTime,
    makeDailySeed: makeDailySeed,
    getSettings: getSettings,
    saveSettings: saveSettings,
    getBestScore: getBestScore,
    setBestScore: setBestScore,
    saveLastRun: saveLastRun
  };
})();
