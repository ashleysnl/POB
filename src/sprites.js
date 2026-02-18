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
    var baseY = 80 + bob;
    var deckY = baseY + 19;

    px(ctx, 166, baseY + 16, 134, 8, "#e4e9ef");
    px(ctx, 160, baseY + 24, 142, 22, P.platformLight);
    px(ctx, 162, baseY + 44, 138, 7, P.platformMid);
    px(ctx, 170, baseY + 51, 116, 6, P.platformDark);

    for (var r = 0; r < 13; r++) {
      var rx = 168 + r * 10;
      px(ctx, rx, baseY + 47 + (r % 2), 1, 6, "#cad0d8");
      if (r < 12) {
        px(ctx, rx + 2, baseY + 49 + (r % 2), 6, 1, "#9da7b3");
      }
    }

    px(ctx, 173, deckY - 2, 58, 10, P.helideck);
    ctx.strokeStyle = P.helideckMark;
    ctx.lineWidth = 1;
    ctx.strokeRect(184, deckY, 40, 6);
    px(ctx, 196, deckY, 3, 6, P.helideckMark);
    px(ctx, 208, deckY, 3, 6, P.helideckMark);

    px(ctx, 223, deckY - 2, 64, 4, "#d2d8df");
    for (var w = 0; w < 10; w++) {
      px(ctx, 224 + w * 6, deckY + 2, 4, 2, "#9ba4b0");
    }

    px(ctx, 208, baseY - 18, 16, 35, P.platformDark);
    px(ctx, 240, baseY - 18, 16, 35, P.platformDark);
    px(ctx, 210, baseY - 24, 12, 7, "#8c939f");
    px(ctx, 242, baseY - 24, 12, 7, "#8c939f");

    for (var m = 0; m < 8; m++) {
      px(ctx, 210 + (m % 2) * 6, baseY - 16 + m * 4, 10, 1, "#a9b0bb");
      px(ctx, 242 + (m % 2) * 6, baseY - 16 + m * 4, 10, 1, "#a9b0bb");
    }

    for (var s = 0; s < 14; s++) {
      px(ctx, 175 + s * 7, baseY + 29 + (s % 3), 2, 2, "#6f7682");
    }

    px(ctx, 228, baseY - 12, 4, 30, P.crane);
    for (var c = 0; c < 14; c++) {
      px(ctx, 232 + c * 2, baseY - 11 + c, 2, 1, "#c8cfd8");
    }

    px(ctx, 270, baseY - 18, 3, 28, "#aeb6bf");
    for (var c2 = 0; c2 < 15; c2++) {
      px(ctx, 273 + c2 * 2, baseY + 9 - c2, 2, 1, "#9ea6b2");
    }

    if (state.hazards.craneSwing) {
      var swing = Math.sin(state.time * 8) * 10;
      px(ctx, 296 + swing, baseY - 6, 8, 2, P.warning);
    } else {
      px(ctx, 300, baseY - 6, 8, 2, P.platformDark);
    }

    px(ctx, 167, deckY, 4, 3, state.landingLights ? P.green : P.warning);
    px(ctx, 227, deckY, 4, 3, state.landingLights ? P.green : P.warning);

    px(ctx, 194, baseY + 57, 20, 38, "#333840");
    px(ctx, 234, baseY + 57, 20, 38, "#333840");
    px(ctx, 215, baseY + 57, 14, 40, "#4f5864");

    px(ctx, 188, baseY + 94, 74, 5, "#6b717c");
    px(ctx, 182, baseY + 99, 86, 3, "#4f565f");

    ctx.fillStyle = "rgba(15,35,65,0.28)";
    ctx.fillRect(193, 122, 60, 54);
    ctx.fillRect(204, 134, 20, 28);

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
