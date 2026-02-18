(function () {
  function Input() {
    this.keys = Object.create(null);
    this.justPressed = Object.create(null);
    this.axes = { x: 0, y: 0 };
    this.touch = {
      active: false,
      x: 0,
      y: 0,
      hover: false,
      land: false,
      sensitivity: 1
    };
  }

  Input.prototype.init = function (els, settings) {
    var self = this;
    this.touch.sensitivity = settings.touchSensitivity || 1;

    window.addEventListener("keydown", function (e) {
      var key = e.key.toLowerCase();
      if (!self.keys[key]) {
        self.justPressed[key] = true;
      }
      self.keys[key] = true;
      if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].indexOf(key) >= 0) {
        e.preventDefault();
      }
    });

    window.addEventListener("keyup", function (e) {
      self.keys[e.key.toLowerCase()] = false;
    });

    if (!els) {
      return;
    }

    var zone = els.stickZone;
    var knob = els.stickKnob;
    var hoverBtn = els.btnHover;
    var landBtn = els.btnLand;
    var activePointer = null;

    function setStick(clientX, clientY) {
      var rect = zone.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = (clientX - cx) / (rect.width * 0.35);
      var dy = (clientY - cy) / (rect.height * 0.35);
      var len = Math.hypot(dx, dy);
      if (len > 1) {
        dx /= len;
        dy /= len;
      }
      self.touch.active = true;
      self.touch.x = dx * self.touch.sensitivity;
      self.touch.y = dy * self.touch.sensitivity;
      knob.style.left = (43 + dx * 25) + "px";
      knob.style.top = (43 + dy * 25) + "px";
    }

    function resetStick() {
      self.touch.active = false;
      self.touch.x = 0;
      self.touch.y = 0;
      knob.style.left = "43px";
      knob.style.top = "43px";
    }

    zone.addEventListener("pointerdown", function (e) {
      activePointer = e.pointerId;
      zone.setPointerCapture(e.pointerId);
      setStick(e.clientX, e.clientY);
    });

    zone.addEventListener("pointermove", function (e) {
      if (activePointer === e.pointerId) {
        setStick(e.clientX, e.clientY);
      }
    });

    zone.addEventListener("pointerup", function (e) {
      if (activePointer === e.pointerId) {
        activePointer = null;
        resetStick();
      }
    });

    zone.addEventListener("pointercancel", resetStick);

    function holdButton(el, key) {
      el.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        self.touch[key] = true;
      });
      el.addEventListener("pointerup", function () {
        self.touch[key] = false;
      });
      el.addEventListener("pointercancel", function () {
        self.touch[key] = false;
      });
      el.addEventListener("pointerleave", function () {
        self.touch[key] = false;
      });
    }

    holdButton(hoverBtn, "hover");
    holdButton(landBtn, "land");
  };

  Input.prototype.consumePress = function (keyName) {
    var k = keyName.toLowerCase();
    var seen = !!this.justPressed[k];
    this.justPressed[k] = false;
    return seen;
  };

  Input.prototype.isDown = function (keyName) {
    return !!this.keys[keyName.toLowerCase()];
  };

  Input.prototype.frameAxes = function () {
    var x = 0;
    var y = 0;

    if (this.isDown("a") || this.isDown("arrowleft")) {
      x -= 1;
    }
    if (this.isDown("d") || this.isDown("arrowright")) {
      x += 1;
    }
    if (this.isDown("w") || this.isDown("arrowup")) {
      y -= 1;
    }
    if (this.isDown("s") || this.isDown("arrowdown")) {
      y += 1;
    }

    if (this.touch.active) {
      x = this.touch.x;
      y = this.touch.y;
    }

    this.axes.x = x;
    this.axes.y = y;
    return this.axes;
  };

  Input.prototype.isHovering = function () {
    return this.isDown(" ") || this.touch.hover;
  };

  Input.prototype.isLandPressed = function () {
    return this.touch.land || this.isDown("enter");
  };

  window.ORRInput = Input;
})();
