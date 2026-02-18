(function () {
  var P = {
    sky1: "#95c7e8",
    sky2: "#6aa8d6",
    cloud: "#f2e8d5",
    sea1: "#2e5ea8",
    sea2: "#224780",
    foam: "#aed9f5",
    platformDark: "#2b2f3a",
    platformMid: "#727986",
    platformLight: "#c7ced6",
    helideck: "#d0d56d",
    helideckMark: "#f6f6f1",
    crane: "#de9050",
    warning: "#ef476f",
    green: "#7ccf6a",
    red: "#f15454",
    yellow: "#f4cd62",
    black: "#111111",
    white: "#ffffff",
    fog: "rgba(230,240,250,0.16)",
    seaSmoke: "rgba(220,240,255,0.22)",
    iceberg: "#d7ecff",
    boat: "#ff7f50",
    boatHull: "#783f20",
    puffin: "#f8f8f8",
    puffinBeak: "#ffa43c",
    confettiA: "#ffbe0b",
    confettiB: "#3a86ff",
    confettiC: "#ff006e"
  };

  function px(ctx, x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  function drawCloud(ctx, x, y, scale) {
    px(ctx, x, y + 4 * scale, 16 * scale, 6 * scale, P.cloud);
    px(ctx, x + 4 * scale, y, 6 * scale, 6 * scale, P.cloud);
    px(ctx, x + 10 * scale, y + 2 * scale, 6 * scale, 5 * scale, P.cloud);
  }

  function drawPlatform(ctx, state) {
    var bob = Math.sin(state.time * 0.35) * 1.5;
    var baseY = 88 + bob;
    px(ctx, 176, baseY, 110, 32, P.platformLight);
    px(ctx, 170, baseY + 20, 120, 16, P.platformMid);

    px(ctx, 198, baseY + 35, 16, 42, P.platformDark);
    px(ctx, 238, baseY + 35, 16, 42, P.platformDark);
    px(ctx, 210, baseY + 35, 12, 44, P.platformMid);

    px(ctx, 174, baseY + 8, 50, 8, P.helideck);
    ctx.strokeStyle = P.helideckMark;
    ctx.lineWidth = 1;
    ctx.strokeRect(182, baseY + 10, 33, 5);
    px(ctx, 196, baseY + 10, 3, 5, P.helideckMark);
    px(ctx, 205, baseY + 10, 3, 5, P.helideckMark);

    px(ctx, 246, baseY - 4, 4, 18, P.crane);
    px(ctx, 250, baseY - 2, 22, 3, P.crane);

    if (state.hazards.craneSwing) {
      var swing = Math.sin(state.time * 8) * 10;
      px(ctx, 266 + swing, baseY + 2, 8, 2, P.warning);
    } else {
      px(ctx, 268, baseY + 2, 8, 2, P.platformDark);
    }

    px(ctx, 168, baseY + 8, 4, 3, state.landingLights ? P.green : P.warning);
    px(ctx, 224, baseY + 8, 4, 3, state.landingLights ? P.green : P.warning);

    if (state.day >= 3) {
      px(ctx, 32, 36, 4, 28, P.platformDark);
      px(ctx, 30, 33, 8, 4, P.warning);
    }
  }

  function drawOcean(ctx, state) {
    var y = 120;
    px(ctx, 0, y, 320, 60, P.sea1);
    for (var i = 0; i < 24; i++) {
      var sx = (i * 17 + state.time * 18) % 330;
      var sy = y + 4 + ((i * 13) % 48);
      var shimmer = (i + Math.floor(state.time * 2)) % 2 === 0 ? P.foam : P.sea2;
      px(ctx, sx - 10, sy, 6, 1, shimmer);
    }
    var waveAmp = 2 + state.weather.sea * 5;
    for (var x = 0; x < 320; x += 8) {
      var wy = y + Math.sin((x + state.time * 30) * 0.09) * waveAmp;
      px(ctx, x, wy, 8, 1, P.foam);
    }
    if (state.hazards.seaSmoke || state.day >= 4) {
      ctx.fillStyle = P.seaSmoke;
      for (var s = 0; s < 10; s++) {
        ctx.fillRect((s * 31 + state.time * 10) % 330, 113 + (s % 3) * 2, 22, 3);
      }
    }
  }

  function drawHeli(ctx, heli, state) {
    var x = heli.x;
    var y = heli.y;
    px(ctx, x - 6, y - 2, 12, 4, P.red);
    px(ctx, x - 4, y - 4, 7, 2, P.platformLight);
    px(ctx, x - 8, y - 1, 2, 2, P.platformMid);
    px(ctx, x + 6, y - 1, 4, 1, P.platformDark);

    var rotorW = 10 + Math.floor(Math.abs(Math.sin(state.time * 22)) * 8);
    px(ctx, x - rotorW / 2, y - 5, rotorW, 1, P.black);
    px(ctx, x - 4, y + 2, 8, 1, P.black);

    if (state.landingLights) {
      px(ctx, x + 8, y, 5, 1, P.yellow);
    }

    if (state.weather.fog > 0.55 && !state.landingLights) {
      px(ctx, x - 2, y, 2, 2, P.warning);
    }

    var shadowY = 111 + (y - 70) * 0.2;
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(x - 5, shadowY, 10, 2);
  }

  function drawBoat(ctx, boat) {
    px(ctx, boat.x - 6, boat.y, 12, 3, P.boatHull);
    px(ctx, boat.x - 4, boat.y - 2, 8, 2, P.boat);
    px(ctx, boat.x + 1, boat.y - 5, 1, 3, P.white);
  }

  function drawPuffin(ctx, puffin) {
    px(ctx, puffin.x, puffin.y, 4, 2, P.puffin);
    px(ctx, puffin.x + 3, puffin.y + 1, 2, 1, P.puffinBeak);
    px(ctx, puffin.x + 1, puffin.y - 1, 1, 1, P.black);
  }

  function drawIceberg(ctx, ice) {
    px(ctx, ice.x, ice.y, ice.w, ice.h, P.iceberg);
    px(ctx, ice.x + 2, ice.y - 2, Math.max(2, ice.w - 4), 2, P.white);
  }

  function drawFog(ctx, strength, t) {
    if (strength <= 0.05) {
      return;
    }
    ctx.fillStyle = P.fog;
    var cols = Math.floor(24 * strength);
    for (var i = 0; i < cols; i++) {
      var x = (i * 19 + t * 8) % 330;
      for (var y = 0; y < 180; y += 6) {
        if (((i + y) % 3) === 0) {
          ctx.fillRect(x, y, 12, 3);
        }
      }
    }
  }

  function drawConfettiPuffins(ctx, puffs) {
    for (var i = 0; i < puffs.length; i++) {
      var p = puffs[i];
      px(ctx, p.x, p.y, 2, 2, p.c);
      if (p.kind === "puffin") {
        px(ctx, p.x + 2, p.y + 1, 2, 1, P.puffinBeak);
      }
    }
  }

  window.ORRSprites = {
    palette: P,
    pixel: px,
    drawCloud: drawCloud,
    drawPlatform: drawPlatform,
    drawOcean: drawOcean,
    drawHeli: drawHeli,
    drawBoat: drawBoat,
    drawPuffin: drawPuffin,
    drawIceberg: drawIceberg,
    drawFog: drawFog,
    drawConfettiPuffins: drawConfettiPuffins
  };
})();
