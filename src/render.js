(function () {
  var S = window.ORRSprites;
  var U = window.ORRUtils;

  function drawBackground(ctx, game) {
    var p = S.palette;
    S.pixel(ctx, 0, 0, 320, 40, p.sky2);
    S.pixel(ctx, 0, 40, 320, 40, p.sky1);
    S.pixel(ctx, 0, 80, 320, 40, "#8fc0df");
    S.pixel(ctx, 0, 120, 320, 60, p.sea2);

    for (var i = 0; i < 6; i++) {
      var cx = (i * 63 + game.time * (2 + i * 0.1)) % 360 - 40;
      var cy = 14 + (i % 3) * 16;
      S.drawCloud(ctx, cx, cy, 1 + (i % 2));
    }

    S.drawOcean(ctx, game);
    S.drawPlatform(ctx, game);
  }

  function drawBoatScene(ctx, game) {
    drawBackground(ctx, game);
    var b = game.boat;
    if (!b) {
      return;
    }

    S.pixel(ctx, 266, b.dockY - 2, 12, 2, S.palette.warning);
    S.pixel(ctx, 276, b.dockY - 5, 2, 8, S.palette.platformLight);

    for (var i = 0; i < b.icebergs.length; i++) {
      S.drawIceberg(ctx, b.icebergs[i]);
    }

    S.drawBoat(ctx, b);

    ctx.fillStyle = "#111";
    ctx.fillRect(4, 148, 126, 26);
    ctx.fillStyle = "#fff";
    ctx.font = "6px monospace";
    ctx.fillText("BOAT RUN", 8, 154);
    ctx.fillText("Time: " + U.formatTime(b.timer), 8, 161);
    ctx.fillText("Integrity: " + Math.max(0, Math.floor(b.integrity)), 8, 168);
  }

  function drawPlayScene(ctx, game, input) {
    drawBackground(ctx, game);

    for (var i = 0; i < game.puffins.length; i++) {
      S.drawPuffin(ctx, game.puffins[i]);
    }

    S.drawHeli(ctx, game.heli, game);

    var deck = game.getHelideck();
    if (Math.hypot(game.heli.x - deck.x, game.heli.y - deck.y) < deck.r + 2) {
      S.pixel(ctx, deck.x - 8, deck.y - 14, 16, 2, "#ffffff");
      if (input.isHovering() || input.isLandPressed()) {
        S.pixel(ctx, deck.x - 6, deck.y - 12, 12, 2, "#7ccf6a");
      }
    }

    if (game.incidentTimer > 0) {
      ctx.fillStyle = "rgba(230,50,70,0.2)";
      ctx.fillRect(0, 0, 320, 180);
    }

    if (game.hazards.opsGrounded) {
      ctx.fillStyle = "rgba(10,10,10,0.55)";
      ctx.fillRect(80, 72, 160, 24);
      ctx.fillStyle = "#ffd166";
      ctx.font = "8px monospace";
      ctx.fillText("Flights Grounded - Ops Reasons", 88, 86);
    }

    if (game.mode === "pause") {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, 320, 180);
      ctx.fillStyle = "#fff";
      ctx.font = "10px monospace";
      ctx.fillText("PAUSED", 143, 94);
    }
  }

  function drawOverlays(ctx, game) {
    S.drawFog(ctx, game.weather.fog * (game.landingLights ? 0.65 : 1), game.time);

    if (game.messages.length > 0) {
      var msg = game.messages[game.messages.length - 1].text;
      ctx.fillStyle = "rgba(10,20,30,0.85)";
      ctx.fillRect(6, 6, 308, 12);
      ctx.fillStyle = "#fff";
      ctx.font = "7px monospace";
      ctx.fillText(msg.slice(0, 64), 10, 14);
    }

    if (game.mode === "win") {
      ctx.fillStyle = "rgba(5,20,12,0.55)";
      ctx.fillRect(40, 58, 240, 54);
      ctx.fillStyle = "#e6ffb5";
      ctx.font = "10px monospace";
      ctx.fillText("SHIFT COMPLETE", 111, 74);
      ctx.font = "7px monospace";
      ctx.fillText("Production and happiness stayed right some high.", 62, 87);
      ctx.fillText("Next shift is waiting where ya to?", 82, 96);
      S.drawConfettiPuffins(ctx, game.confetti);
    }

    if (game.mode === "gameover") {
      ctx.fillStyle = "rgba(40,0,0,0.58)";
      ctx.fillRect(40, 58, 240, 54);
      ctx.fillStyle = "#ffd6d6";
      ctx.font = "10px monospace";
      ctx.fillText("GAME OVER", 126, 74);
      ctx.font = "7px monospace";
      ctx.fillText("Some thick and right rough out there, b'y.", 75, 88);
      ctx.fillText("Have a tea and try again.", 108, 98);
    }
  }

  function render(ctx, game, input) {
    ctx.clearRect(0, 0, 320, 180);

    if (game.mode === "boat") {
      drawBoatScene(ctx, game);
    } else {
      drawPlayScene(ctx, game, input);
    }

    drawOverlays(ctx, game);
  }

  window.ORRRender = {
    render: render
  };
})();
