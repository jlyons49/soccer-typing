// High-Performance 2.5D Canvas Stadium, Character Sprite & VFX Renderer for Soccer Typing

// Cross-browser roundRect polyfill
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
    let r = Array.isArray(radii) ? radii[0] : (radii || 0);
    r = Math.min(r, w / 2, h / 2);
    this.beginPath();
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    this.closePath();
    return this;
  };
}

export class StadiumRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    // Sky stars & stadium camera flashes
    this.stars = [];
    this.cameraFlashes = [];
    this.initSkyAndStands();

    // Crowd simulation data
    this.crowd = [];
    this.initCrowd();

    // Net wobble & localized impact state
    this.netWobble = 0;
    this.netWobbleDecay = 0.94;
    this.netImpactPoint = { x: 600, y: 300 };

    // Ball aerodynamic trail history
    this.ballTrail = [];

    // Expanding shockwave rings
    this.shockwaves = [];

    // Particle system (confetti, grass kick, ball sparks, fire trail)
    this.particles = [];

    // Floating text popups (+1000, "TOP BINS!", etc.)
    this.floatingTexts = [];

    // Screen shake
    this.shakeIntensity = 0;

    // Animation frame tick
    this.tick = 0;
  }

  initSkyAndStands() {
    this.stars = [];
    for (let i = 0; i < 45; i++) {
      this.stars.push({
        x: Math.random() * 1200,
        y: Math.random() * 90,
        r: 0.7 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2
      });
    }
    this.cameraFlashes = [];
  }

  initCrowd() {
    this.crowd = [];
    const jerseyColors = ['#e63946', '#2563eb', '#f1faee', '#38bdf8', '#1d4ed8', '#ffb703', '#fb8500', '#10b981', '#dc2626'];
    const skinTones = ['#ffcdb2', '#f4a261', '#e0ac69', '#8d5524', '#c68642', '#fed7aa'];
    const hairColors = ['#1c1917', '#4a2810', '#78350f', '#b45309', '#facc15', '#3f3f46'];

    for (let row = 0; row < 5; row++) {
      const count = 48;
      for (let i = 0; i < count; i++) {
        // Leave aisle gaps for stadium stairs
        const normX = i / count;
        if (Math.abs(normX - 0.25) < 0.018 || Math.abs(normX - 0.75) < 0.018) continue;

        const c1 = jerseyColors[Math.floor(Math.random() * jerseyColors.length)];
        const c2 = jerseyColors[Math.floor(Math.random() * jerseyColors.length)];
        this.crowd.push({
          x: normX + (Math.random() * 0.012 - 0.006),
          row,
          color: c1,
          secondaryColor: c2,
          skin: skinTones[Math.floor(Math.random() * skinTones.length)],
          hair: hairColors[Math.floor(Math.random() * hairColors.length)],
          phase: Math.random() * Math.PI * 2,
          isWavingFlag: Math.random() < 0.12,
          hasScarf: Math.random() < 0.20,
          flagColor: c2,
        });
      }
    }
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Virtual resolution is 1200 x 750
    this.canvas.width = 1200 * dpr;
    this.canvas.height = 750 * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = 1200;
    this.height = 750;
  }

  triggerScreenShake(intensity = 12) {
    this.shakeIntensity = intensity;
  }

  triggerNetRipple(intensity = 1.0, impactX = 600, impactY = 300) {
    this.netWobble = intensity;
    this.netImpactPoint = { x: impactX, y: impactY };
    this.spawnShockwave(impactX, impactY, '#00ff66', 75);
  }

  spawnShockwave(x, y, color = '#00f0ff', maxRadius = 60) {
    this.shockwaves.push({
      x,
      y,
      radius: 8,
      maxRadius,
      color,
      alpha: 1.0
    });
  }

  spawnTargetKeySpark(x, y, color = '#39ff14') {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        gravity: 0.15,
        drag: 0.94,
        color: i % 2 === 0 ? color : '#ffffff',
        size: 3 + Math.random() * 3,
        rotation: Math.random() * Math.PI,
        rotSpeed: 0.2,
        life: 1.0,
        decay: 0.045,
        shape: 'circle'
      });
    }
  }

  spawnConfetti(count = 85) {
    const colors = ['#ff0055', '#00e5ff', '#ffeb3b', '#00ff66', '#ffffff', '#ff9900', '#c77dff', '#38bdf8'];
    for (let i = 0; i < count; i++) {
      const fromLeft = Math.random() < 0.5;
      this.particles.push({
        x: fromLeft ? 60 + Math.random() * 140 : this.width - 60 - Math.random() * 140,
        y: this.height * 0.48 + Math.random() * 80,
        vx: (fromLeft ? 1 : -1) * (5 + Math.random() * 13) + (Math.random() * 4 - 2),
        vy: -(9 + Math.random() * 13),
        gravity: 0.32,
        drag: 0.98,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.35,
        life: 1.0,
        decay: 0.007 + Math.random() * 0.007,
        shape: 'rect'
      });
    }

    // Trigger burst of crowd camera flashes on goal!
    for (let i = 0; i < 18; i++) {
      this.cameraFlashes.push({
        x: 80 + Math.random() * (this.width - 160),
        y: 55 + Math.random() * 95,
        life: 1.0,
        decay: 0.04 + Math.random() * 0.05
      });
    }
  }

  spawnGrassKick(x, y, count = 18) {
    this.spawnShockwave(x, y, '#ffffff', 50);
    for (let i = 0; i < count; i++) {
      const isDirt = Math.random() < 0.3;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 8,
        vy: -(3 + Math.random() * 6),
        gravity: 0.32,
        drag: 0.94,
        color: isDirt ? '#78350f' : (Math.random() < 0.5 ? '#38b000' : '#70e000'),
        size: 3 + Math.random() * 4,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        life: 1.0,
        decay: 0.028,
        shape: 'blade'
      });
    }
  }

  addFloatingText(text, x, y, color = '#ffeb3b', size = 28) {
    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -2.0,
      color,
      size,
      life: 1.0,
      decay: 0.014
    });
  }

  // Main Render Pass
  render(gameState, deltaTime) {
    this.tick++;

    this.ctx.save();

    // Screen Shake effect
    if (this.shakeIntensity > 0) {
      const ox = (Math.random() - 0.5) * this.shakeIntensity;
      const oy = (Math.random() - 0.5) * this.shakeIntensity;
      this.ctx.translate(ox, oy);
      this.shakeIntensity *= 0.88;
      if (this.shakeIntensity < 0.3) this.shakeIntensity = 0;
    }

    // 1. Draw Sky, Stars, Roof Truss, Jumbotron & Floodlights
    this.drawSkyAndStadium(gameState);

    // 2. Draw Multi-Tiered Stadium Stands, Banners & Animated Crowd
    this.drawCrowd(gameState.isGoalScored);

    if (gameState.mode === 'dribblingDrill' && (gameState.state === 'PLAYING' || gameState.state === 'SUMMARY')) {
      // Dribbling Drill Full-Pitch Side-Scrolling View
      this.drawDribblingPitch(gameState);
      this.drawDribblingCones(gameState);
      this.updateAndDrawBallTrail(gameState);
      this.drawStriker(gameState.striker, 1.0, gameState.phase);
      this.drawBall(gameState.ball);
      if (gameState.phase === 'TYPING' || gameState.phase === 'KICKING') {
        this.drawDribbleWordPlate(gameState);
      }
    } else if (gameState.mode === 'touchPractice' && (gameState.state === 'PLAYING' || gameState.state === 'SUMMARY' || gameState.phase === 'FAILED')) {
      // Touch Practice Rapid Alternating Footwork View
      this.drawPitch();
      this.drawTouchPracticeArena(gameState);
      this.updateAndDrawBallTrail(gameState);
      this.drawTouchStriker(gameState.striker, gameState.touchState);
      this.drawBall(gameState.ball);
      if (gameState.phase === 'TYPING' || gameState.phase === 'KICKING' || gameState.phase === 'FAILED' || gameState.phase === 'FINISH') {
        this.drawTouchPracticePlate(gameState);
      }
    } else {
      // 3. Draw Lush 2.5D Pitch (Grass stripes, radial lines, chalk lines, corner flags)
      this.drawPitch();

      // 4. Draw 3D Goal Structure, Stanchions & Reactive Hexagonal Netting
      const goalBounds = this.getGoalBounds();
      this.drawGoalNet(goalBounds, gameState.netBulge);
      this.drawGoalFrame(goalBounds);

      // 5. Draw Goalkeeper Character Sprite
      this.drawGoalkeeper(goalBounds, gameState.keeper, gameState.ball);

      // 6. Draw Target Reticles & Keycap Word Plates on Goal
      if (gameState.phase === 'TYPING' || gameState.phase === 'APPROACH') {
        this.drawTargets(gameState.targets, gameState.activeTargetIndex, gameState.leadUpRatio);
      }

      // 7. Update & Draw Ball Aerodynamic Ribbon Trail
      this.updateAndDrawBallTrail(gameState);

      // 8. Draw Striker Character Sprite
      this.drawStriker(gameState.striker, gameState.leadUpRatio, gameState.phase);

      // 9. Draw Pro Match Soccer Ball
      this.drawBall(gameState.ball);
    }

    // 10. Update & Draw Shockwave Rings & Particles
    this.updateAndDrawShockwaves();
    this.updateAndDrawParticles();

    // 11. Update & Draw Floating Text Popups
    this.updateAndDrawFloatingTexts();

    // 12. Big Broadcast Banner Overlay (GOAL / SAVED / TIME UP / FINISH)
    if (gameState.banner) {
      this.drawBanner(gameState.banner);
    }

    this.ctx.restore();
  }

  getGoalBounds() {
    const left = this.width * 0.22;
    const right = this.width * 0.78;
    const top = this.height * 0.20;
    const bottom = this.height * 0.58;
    return {
      left,
      right,
      top,
      bottom,
      width: right - left,
      height: bottom - top,
      centerX: (left + right) / 2
    };
  }

  drawSkyAndStadium(gameState) {
    // Deep stadium evening sky gradient
    const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.height * 0.25);
    skyGrad.addColorStop(0, '#040814');
    skyGrad.addColorStop(0.55, '#0f172a');
    skyGrad.addColorStop(1, '#1e293b');
    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, this.width, this.height * 0.25);

    // Twinkling stars
    this.stars.forEach(s => {
      const alpha = 0.35 + 0.55 * Math.sin(this.tick * 0.04 + s.phase);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Architectural Curved Stadium Roof Canopy & Steel Truss
    this.ctx.fillStyle = '#090d16';
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(this.width, 0);
    this.ctx.lineTo(this.width, 38);
    this.ctx.quadraticCurveTo(this.width * 0.5, 16, 0, 38);
    this.ctx.closePath();
    this.ctx.fill();

    // Truss diagonal struts
    this.ctx.strokeStyle = '#1e293b';
    this.ctx.lineWidth = 1.5;
    for (let x = 0; x < this.width; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x + 20, 28);
      this.ctx.lineTo(x + 40, 0);
      this.ctx.stroke();
    }

    // Rim trim along roof canopy edge
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 38);
    this.ctx.quadraticCurveTo(this.width * 0.5, 16, this.width, 38);
    this.ctx.stroke();

    // Stadium Center Jumbotron Scoreboard
    this.drawJumbotron(this.width * 0.5, 28, gameState);

    // Floodlight towers on Left & Right
    this.drawFloodlight(95, 42, 1);
    this.drawFloodlight(this.width - 95, 42, -1);
  }

  drawJumbotron(cx, topY, gameState) {
    const w = 220;
    const h = 34;
    this.ctx.save();
    this.ctx.translate(cx, topY);

    // Support struts
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(-70, -18);
    this.ctx.lineTo(-70, 0);
    this.ctx.moveTo(70, -18);
    this.ctx.lineTo(70, 0);
    this.ctx.stroke();

    // Outer casing
    this.ctx.fillStyle = '#090d16';
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.roundRect(-w / 2, -6, w, h, 6);
    this.ctx.fill();
    this.ctx.stroke();

    // LED Inner Screen
    this.ctx.fillStyle = '#020617';
    this.ctx.fillRect(-w / 2 + 4, -2, w - 8, h - 8);

    // Jumbotron Text
    this.ctx.font = 'bold 11px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    if (gameState && gameState.isGoalScored) {
      const flash = Math.floor(this.tick / 6) % 2 === 0;
      this.ctx.fillStyle = flash ? '#00ff66' : '#ffeb3b';
      this.ctx.fillText('★ G O O O A A A L ! ★', 0, 11);
    } else {
      this.ctx.fillStyle = '#38bdf8';
      this.ctx.fillText('STRIKER FC   VS   KEEPER XI', 0, 11);
    }

    this.ctx.restore();
  }

  drawFloodlight(x, y, dir) {
    // Steel Pylon Tower
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(x - 10, y + 48);
    this.ctx.lineTo(x - 6, y);
    this.ctx.moveTo(x + 10, y + 48);
    this.ctx.lineTo(x + 6, y);
    this.ctx.stroke();

    // Floodlight Head Rig
    this.ctx.fillStyle = '#1e293b';
    this.ctx.strokeStyle = '#64748b';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.roundRect(x - 24, y - 12, 48, 28, 4);
    this.ctx.fill();
    this.ctx.stroke();

    // Glowing Halogen Bulbs (2x4 matrix)
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        const lx = x - 16 + c * 10.6;
        const ly = y - 5 + r * 12;

        // Bulb glow halo
        this.ctx.fillStyle = 'rgba(254, 249, 195, 0.35)';
        this.ctx.beginPath();
        this.ctx.arc(lx, ly, 6.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Core bulb
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(lx, ly, 3.2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // Volumetric Light Cone across stadium
    const beamGrad = this.ctx.createRadialGradient(x, y + 4, 8, x + dir * 280, y + 320, 420);
    beamGrad.addColorStop(0, 'rgba(255, 255, 230, 0.24)');
    beamGrad.addColorStop(0.45, 'rgba(200, 235, 255, 0.08)');
    beamGrad.addColorStop(1, 'rgba(200, 235, 255, 0)');

    this.ctx.fillStyle = beamGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(x - 18, y + 12);
    this.ctx.lineTo(x + 18, y + 12);
    this.ctx.lineTo(x + dir * 480, this.height * 0.76);
    this.ctx.lineTo(x - dir * 120, this.height * 0.76);
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawCrowd(isGoalCelebration) {
    const standsTop = 44;
    const standsBottom = this.height * 0.22;
    const standsHeight = standsBottom - standsTop;

    // Concrete Seating Bowl Deck
    const deckGrad = this.ctx.createLinearGradient(0, standsTop, 0, standsBottom);
    deckGrad.addColorStop(0, '#0f172a');
    deckGrad.addColorStop(1, '#1e293b');
    this.ctx.fillStyle = deckGrad;
    this.ctx.fillRect(0, standsTop, this.width, standsHeight);

    // Horizontal tier rows
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    this.ctx.lineWidth = 1;
    for (let r = 1; r <= 5; r++) {
      const ry = standsTop + (r / 6) * standsHeight;
      this.ctx.beginPath();
      this.ctx.moveTo(0, ry);
      this.ctx.lineTo(this.width, ry);
      this.ctx.stroke();
    }

    // Stadium Vomitories (Entrance Tunnels) & Yellow Safety Staircases
    [0.25, 0.75].forEach(pos => {
      const sx = this.width * pos;
      // Staircase aisle
      this.ctx.fillStyle = '#334155';
      this.ctx.fillRect(sx - 16, standsTop + 6, 32, standsHeight - 24);
      // Yellow safety handrail
      this.ctx.strokeStyle = '#facc15';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(sx, standsTop + 8);
      this.ctx.lineTo(sx, standsBottom - 20);
      this.ctx.stroke();
      // Tunnel portal arch
      this.ctx.fillStyle = '#020617';
      this.ctx.fillRect(sx - 12, standsTop + 14, 24, 22);
    });

    // Render Animated Crowd Supporters
    this.crowd.forEach((fan) => {
      const fx = fan.x * this.width;
      const rowY = standsTop + 14 + fan.row * 16;
      const stadiumWave = Math.sin(this.tick * 0.08 - fan.x * 8) * 2.5;
      const jump = isGoalCelebration ? Math.abs(Math.sin(this.tick * 0.28 + fan.phase)) * -9 : stadiumWave;
      const fy = rowY + jump;

      // Torso / Kit
      this.ctx.fillStyle = fan.color;
      this.ctx.beginPath();
      this.ctx.roundRect(fx - 4.5, fy - 1, 9, 8, 2);
      this.ctx.fill();

      // Shoulder stripe
      this.ctx.fillStyle = fan.secondaryColor;
      this.ctx.fillRect(fx - 2, fy - 1, 4, 8);

      // Head
      this.ctx.fillStyle = fan.skin;
      this.ctx.beginPath();
      this.ctx.arc(fx, fy - 5, 3.3, 0, Math.PI * 2);
      this.ctx.fill();

      // Hair cap
      this.ctx.fillStyle = fan.hair;
      this.ctx.beginPath();
      this.ctx.arc(fx, fy - 5.8, 3.3, Math.PI, Math.PI * 2);
      this.ctx.fill();

      // Supporter Scarf held overhead during celebration or random excitement
      if (fan.hasScarf && (isGoalCelebration || Math.sin(this.tick * 0.05 + fan.phase) > 0.6)) {
        this.ctx.strokeStyle = fan.skin;
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(fx - 4, fy);
        this.ctx.lineTo(fx - 6, fy - 10);
        this.ctx.moveTo(fx + 4, fy);
        this.ctx.lineTo(fx + 6, fy - 10);
        this.ctx.stroke();

        // Scarf bar
        this.ctx.fillStyle = fan.color;
        this.ctx.fillRect(fx - 7, fy - 12, 14, 3);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(fx - 3, fy - 12, 6, 3);
      }

      // Waving Checkered Team Flags
      if (fan.isWavingFlag) {
        const waveAngle = Math.sin(this.tick * (isGoalCelebration ? 0.25 : 0.08) + fan.phase) * 0.45;
        const poleTopX = fx + 4 + Math.sin(waveAngle) * 14;
        const poleTopY = fy - 18;

        this.ctx.strokeStyle = '#cbd5e1';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(fx + 3, fy);
        this.ctx.lineTo(poleTopX, poleTopY);
        this.ctx.stroke();

        // Flag cloth
        this.ctx.fillStyle = fan.flagColor;
        this.ctx.beginPath();
        this.ctx.moveTo(poleTopX, poleTopY);
        this.ctx.lineTo(poleTopX + 12, poleTopY + 3 + Math.cos(this.tick * 0.2) * 2);
        this.ctx.lineTo(poleTopX + 10, poleTopY + 10);
        this.ctx.lineTo(poleTopX, poleTopY + 8);
        this.ctx.closePath();
        this.ctx.fill();
      }
    });

    // Random Camera Flashbulbs in the Crowd
    if (Math.random() < 0.08) {
      this.cameraFlashes.push({
        x: 60 + Math.random() * (this.width - 120),
        y: standsTop + 10 + Math.random() * (standsHeight - 30),
        life: 1.0,
        decay: 0.08
      });
    }

    for (let i = this.cameraFlashes.length - 1; i >= 0; i--) {
      const fl = this.cameraFlashes[i];
      fl.life -= fl.decay;
      if (fl.life <= 0) {
        this.cameraFlashes.splice(i, 1);
        continue;
      }
      this.ctx.save();
      this.ctx.translate(fl.x, fl.y);
      this.ctx.globalAlpha = fl.life;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 5 * fl.life, 0, Math.PI * 2);
      this.ctx.fill();
      // Star cross flare
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(-12 * fl.life, 0);
      this.ctx.lineTo(12 * fl.life, 0);
      this.ctx.moveTo(0, -12 * fl.life);
      this.ctx.lineTo(0, 12 * fl.life);
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Supporter Club Tifo Banners along the concrete wall above Ad Board
    this.drawSupporterBanners(standsBottom - 28);

    // Electronic LED Advertising Board at base of stands
    this.drawAdBoard(standsBottom - 16);
  }

  drawSupporterBanners(y) {
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(0, y, this.width, 12);

    const banners = [
      { x: 90, w: 150, bg: '#1e3a8a', border: '#facc15', text: '★ STRIKER FC ULTRAS ★', color: '#ffffff' },
      { x: 360, w: 140, bg: '#991b1b', border: '#ffffff', text: 'TOP BINS ONLY', color: '#fef08a' },
      { x: 710, w: 150, bg: '#065f46', border: '#34d399', text: 'GOLDEN BOOT 1999', color: '#ffffff' },
      { x: 960, w: 150, bg: '#3b0764', border: '#c084fc', text: 'HEFTY RACCOON FC', color: '#00f0ff' }
    ];

    this.ctx.font = 'bold 8px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    banners.forEach(b => {
      this.ctx.fillStyle = b.bg;
      this.ctx.strokeStyle = b.border;
      this.ctx.lineWidth = 1;
      this.ctx.fillRect(b.x, y + 1, b.w, 10);
      this.ctx.strokeRect(b.x, y + 1, b.w, 10);
      this.ctx.fillStyle = b.color;
      this.ctx.fillText(b.text, b.x + b.w / 2, y + 6.5);
    });
  }

  drawAdBoard(y) {
    // LED Ribbon Housing
    this.ctx.fillStyle = '#050811';
    this.ctx.fillRect(0, y, this.width, 18);

    // Glowing Top & Bottom Bevels
    this.ctx.strokeStyle = '#00f0ff';
    this.ctx.lineWidth = 1.2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, y);
    this.ctx.lineTo(this.width, y);
    this.ctx.stroke();

    this.ctx.strokeStyle = '#334155';
    this.ctx.beginPath();
    this.ctx.moveTo(0, y + 18);
    this.ctx.lineTo(this.width, y + 18);
    this.ctx.stroke();

    // Dynamic Scrolling LED Text
    this.ctx.font = 'bold 11px "Consolas", monospace';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';

    const text = '⚽ SOCCER TYPING: STRIKER CHALLENGE   ★   HEFTY RACCOON ARCADE   ★   AIM FOR THE UPPER 90 FOR 1.75x BONUS!   ★   ';
    const scrollX = -(this.tick * 1.4) % 720;
    for (let i = 0; i < 3; i++) {
      this.ctx.fillStyle = i % 2 === 0 ? '#00f0ff' : '#ffeb3b';
      this.ctx.fillText(text, scrollX + i * 720, y + 9.5);
    }
  }

  drawPitch() {
    const pitchTop = this.height * 0.22;
    const pitchHeight = this.height - pitchTop;

    // 1. Horizontal Mowed Turf Stripes with perspective thickness
    const stripes = 10;
    const stripeColors = ['#1e6b24', '#17561c'];

    let curY = pitchTop;
    for (let i = 0; i < stripes; i++) {
      // Stripes get taller closer to camera for authentic 2.5D depth
      const weight = (i + 1.2) / ((stripes * (stripes + 2.4)) / 2);
      const h = weight * pitchHeight;
      this.ctx.fillStyle = stripeColors[i % 2];
      this.ctx.fillRect(0, curY, this.width, h + 1);
      curY += h;
    }

    // 2. Radial Perspective Mowed Lanes (converging toward stadium vanishing point)
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(0, pitchTop, this.width, pitchHeight);
    this.ctx.clip();

    const vanishX = this.width * 0.5;
    const vanishY = -120;
    for (let i = -5; i <= 5; i += 2) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
      this.ctx.beginPath();
      this.ctx.moveTo(vanishX, vanishY);
      this.ctx.lineTo(vanishX + i * 190, this.height);
      this.ctx.lineTo(vanishX + (i + 1) * 190, this.height);
      this.ctx.closePath();
      this.ctx.fill();
    }

    // Stadium Floodlight Spotlights on the Turf
    const spotGrad = this.ctx.createRadialGradient(this.width * 0.5, this.height * 0.62, 40, this.width * 0.5, this.height * 0.62, 550);
    spotGrad.addColorStop(0, 'rgba(255, 255, 220, 0.12)');
    spotGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.04)');
    spotGrad.addColorStop(1, 'rgba(0, 10, 5, 0.42)');
    this.ctx.fillStyle = spotGrad;
    this.ctx.fillRect(0, pitchTop, this.width, pitchHeight);

    this.ctx.restore();

    // 3. Crisp 3D Beveled Chalk Pitch Markings
    const goalLineY = this.height * 0.58;

    // Subtle dark grass shadow under chalk lines
    this.ctx.strokeStyle = 'rgba(0, 20, 5, 0.45)';
    this.ctx.lineWidth = 5.5;
    this.drawPitchChalkPaths(goalLineY, 1.5);

    // Bright white chalk
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
    this.ctx.lineWidth = 3.5;
    this.drawPitchChalkPaths(goalLineY, 0);

    // Penalty Spot with turf scuff halo
    const penSpotX = this.width * 0.5;
    const penSpotY = this.height * 0.78;

    this.ctx.fillStyle = 'rgba(20, 45, 15, 0.5)';
    this.ctx.beginPath();
    this.ctx.ellipse(penSpotX, penSpotY, 14, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.ellipse(penSpotX, penSpotY, 6, 3, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // 4. Animated Corner Flags at Far Left & Right of Goal Line
    this.drawCornerFlag(this.width * 0.06, goalLineY, '#ff0055');
    this.drawCornerFlag(this.width * 0.94, goalLineY, '#ffeb3b');
  }

  drawPitchChalkPaths(goalLineY, yOffset = 0) {
    const y = goalLineY + yOffset;

    // Goal line
    this.ctx.beginPath();
    this.ctx.moveTo(this.width * 0.06, y);
    this.ctx.lineTo(this.width * 0.94, y);
    this.ctx.stroke();

    // 6-Yard Goal Area Box
    this.ctx.beginPath();
    this.ctx.moveTo(this.width * 0.27, y);
    this.ctx.lineTo(this.width * 0.22, y + 42);
    this.ctx.lineTo(this.width * 0.78, y + 42);
    this.ctx.lineTo(this.width * 0.73, y);
    this.ctx.stroke();

    // 18-Yard Penalty Area Box
    this.ctx.beginPath();
    this.ctx.moveTo(this.width * 0.16, y);
    this.ctx.lineTo(this.width * 0.07, this.height * 0.89 + yOffset);
    this.ctx.lineTo(this.width * 0.93, this.height * 0.89 + yOffset);
    this.ctx.lineTo(this.width * 0.84, y);
    this.ctx.stroke();

    // Penalty Arc
    this.ctx.beginPath();
    this.ctx.arc(this.width * 0.5, this.height * 0.89 + yOffset, 82, Math.PI * 0.14, Math.PI * 0.86);
    this.ctx.stroke();
  }

  drawCornerFlag(x, y, flagColor) {
    // Corner arc
    this.ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 14, x < this.width * 0.5 ? 0 : Math.PI * 0.75, x < this.width * 0.5 ? Math.PI * 0.25 : Math.PI);
    this.ctx.stroke();

    // Pole shadow
    this.ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + 12, y + 4);
    this.ctx.stroke();

    // White flexible pole
    this.ctx.strokeStyle = '#f8fafc';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x, y - 28);
    this.ctx.stroke();

    // Fluttering Flag
    const flutter = Math.sin(this.tick * 0.15 + x) * 3;
    this.ctx.fillStyle = flagColor;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - 28);
    this.ctx.lineTo(x + 14, y - 24 + flutter);
    this.ctx.lineTo(x, y - 18);
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawGoalNet(bounds, netBulge = 0) {
    const { left, right, top, bottom, width, height } = bounds;

    // 3D Net Depth Geometry
    const rearDepth = 52;
    const rearScale = 0.91;
    const rearLeft = left + (width * (1 - rearScale)) / 2;
    const rearRight = right - (width * (1 - rearScale)) / 2;
    const rearTop = top - rearDepth * 0.45;
    const rearBottom = bottom - rearDepth * 0.35;

    // Ground shadow inside goal mouth
    this.ctx.fillStyle = 'rgba(5, 22, 10, 0.52)';
    this.ctx.beginPath();
    this.ctx.moveTo(left, bottom);
    this.ctx.lineTo(right, bottom);
    this.ctx.lineTo(rearRight, rearBottom);
    this.ctx.lineTo(rearLeft, rearBottom);
    this.ctx.closePath();
    this.ctx.fill();

    // Dark rear stanchion support bars (curved steel brackets holding the net back)
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    // Left stanchion
    this.ctx.moveTo(left, top);
    this.ctx.quadraticCurveTo(rearLeft - 10, rearTop - 10, rearLeft, rearBottom);
    // Right stanchion
    this.ctx.moveTo(right, top);
    this.ctx.quadraticCurveTo(rearRight + 10, rearTop - 10, rearRight, rearBottom);
    // Rear ground base bar
    this.ctx.moveTo(rearLeft, rearBottom);
    this.ctx.lineTo(rearRight, rearBottom);
    this.ctx.stroke();

    // Localized impact displacement helper
    const getDisplacement = (px, py) => {
      if (this.netWobble <= 0.01) return { dx: 0, dy: 0 };
      const dist = Math.hypot(px - this.netImpactPoint.x, py - this.netImpactPoint.y);
      const falloff = Math.max(0, 1 - dist / 240);
      const wave = Math.sin(this.tick * 0.45 - dist * 0.05) * this.netWobble * 22 * falloff;
      return {
        dx: wave * 0.6,
        dy: wave * 0.8
      };
    };

    this.netWobble *= this.netWobbleDecay;

    // Draw Side Netting Panels (Left & Right)
    this.ctx.fillStyle = 'rgba(226, 232, 240, 0.08)';
    this.ctx.beginPath();
    this.ctx.moveTo(left, top);
    this.ctx.lineTo(rearLeft, rearTop);
    this.ctx.lineTo(rearLeft, rearBottom);
    this.ctx.lineTo(left, bottom);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.moveTo(right, top);
    this.ctx.lineTo(rearRight, rearTop);
    this.ctx.lineTo(rearRight, rearBottom);
    this.ctx.lineTo(right, bottom);
    this.ctx.closePath();
    this.ctx.fill();

    // Netting Mesh Grid with localized ripple physics
    this.ctx.strokeStyle = 'rgba(241, 245, 249, 0.52)';
    this.ctx.lineWidth = 1.1;

    const vSteps = 28;
    const hSteps = 14;

    // Vertical mesh strands
    for (let i = 0; i <= vSteps; i++) {
      const u = i / vSteps;
      const frontX = left + u * width;
      const backBaseX = rearLeft + u * (rearRight - rearLeft);

      this.ctx.beginPath();
      this.ctx.moveTo(frontX, top);

      // Roof segment
      const roofDisp = getDisplacement(backBaseX, rearTop);
      this.ctx.lineTo(backBaseX + roofDisp.dx * 0.3, rearTop + roofDisp.dy * 0.3);

      // Subdivide vertical strand for smooth localized curve around ball impact
      for (let j = 1; j <= hSteps; j++) {
        const v = j / hSteps;
        const py = rearTop + v * (rearBottom - rearTop);
        const disp = getDisplacement(backBaseX, py);
        this.ctx.lineTo(backBaseX + disp.dx, py + disp.dy + netBulge * 10 * Math.sin(v * Math.PI));
      }
      this.ctx.stroke();
    }

    // Horizontal mesh strands
    for (let j = 0; j <= hSteps; j++) {
      const v = j / hSteps;
      const baseY = rearTop + v * (rearBottom - rearTop);

      // Left side horizontal tie
      const frontY = top + v * height;
      this.ctx.beginPath();
      this.ctx.moveTo(left, frontY);
      this.ctx.lineTo(rearLeft, baseY);

      for (let i = 1; i <= vSteps; i++) {
        const u = i / vSteps;
        const px = rearLeft + u * (rearRight - rearLeft);
        const disp = getDisplacement(px, baseY);
        this.ctx.lineTo(px + disp.dx, baseY + disp.dy);
      }

      // Right side horizontal tie
      this.ctx.lineTo(right, frontY);
      this.ctx.stroke();
    }
  }

  drawGoalFrame(bounds) {
    const { left, right, top, bottom } = bounds;
    const postWidth = 14;

    // Ground cast shadows from posts
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    this.ctx.beginPath();
    this.ctx.ellipse(left, bottom + 2, 22, 7, 0, 0, Math.PI * 2);
    this.ctx.ellipse(right, bottom + 2, 22, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // 3D Cylindrical White Posts & Crossbar with metallic specular highlight
    const drawCylinder = (x1, y1, x2, y2, thickness) => {
      const isVertical = x1 === x2;
      const grad = isVertical
        ? this.ctx.createLinearGradient(x1 - thickness / 2, y1, x1 + thickness / 2, y1)
        : this.ctx.createLinearGradient(x1, y1 - thickness / 2, x1, y1 + thickness / 2);

      grad.addColorStop(0, '#64748b');
      grad.addColorStop(0.2, '#e2e8f0');
      grad.addColorStop(0.45, '#ffffff');
      grad.addColorStop(0.75, '#f1f5f9');
      grad.addColorStop(1, '#475569');

      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = thickness;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    };

    // Left & Right Posts
    drawCylinder(left, top, left, bottom, postWidth);
    drawCylinder(right, top, right, bottom, postWidth);
    // Crossbar
    drawCylinder(left - 2, top, right + 2, top, postWidth);

    // Red/Blue Corner Sponsor Sleeves at base of posts
    this.ctx.fillStyle = '#0284c7';
    this.ctx.fillRect(left - postWidth / 2, bottom - 18, postWidth, 14);
    this.ctx.fillRect(right - postWidth / 2, bottom - 18, postWidth, 14);

    // Top Corner Miter Joints
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(left, top, postWidth * 0.55, 0, Math.PI * 2);
    this.ctx.arc(right, top, postWidth * 0.55, 0, Math.PI * 2);
    this.ctx.fill();
  }

  // =========================================================================
  // DETAILED GOALKEEPER CHARACTER SPRITE
  // =========================================================================
  drawGoalkeeper(bounds, keeper, ball) {
    const { bottom, centerX } = bounds;

    const currentX = keeper ? keeper.x : centerX;
    const currentY = keeper ? keeper.y : bottom - 55;
    const diveState = keeper ? keeper.diveState : 'IDLE';
    const diveAngle = keeper ? keeper.diveAngle || 0 : 0;

    this.ctx.save();
    this.ctx.translate(currentX, currentY);

    // Ground shadow (stays near pitch level even when diving)
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 50, diveState === 'IDLE' ? 30 : 42, 8, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    this.ctx.rotate(diveAngle);

    // Athletic rhythmic bounce & foot shuffle in IDLE
    const bounce = diveState === 'IDLE' ? Math.sin(this.tick * 0.16) * 3.5 : 0;
    const stanceSpread = diveState === 'IDLE' ? Math.cos(this.tick * 0.16) * 2 : 0;

    // 1. Legs, Socks & Studded Cleats
    const drawLeg = (hipX, hipY, kneeX, kneeY, footX, footY, bootDir) => {
      // Upper thigh (skin)
      this.ctx.strokeStyle = '#eab676';
      this.ctx.lineWidth = 9;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(hipX, hipY);
      this.ctx.lineTo(kneeX, kneeY);
      this.ctx.stroke();

      // Knee pad
      this.ctx.fillStyle = '#0f172a';
      this.ctx.beginPath();
      this.ctx.arc(kneeX, kneeY, 4.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Athletic Goalkeeper Sock (Neon Yellow with Dark Hoops)
      this.ctx.strokeStyle = '#bef264';
      this.ctx.lineWidth = 8;
      this.ctx.beginPath();
      this.ctx.moveTo(kneeX, kneeY);
      this.ctx.lineTo(footX, footY);
      this.ctx.stroke();

      // Sock stripe hoop
      this.ctx.strokeStyle = '#1e293b';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.moveTo((kneeX + footX) / 2 - 3, (kneeY + footY) / 2);
      this.ctx.lineTo((kneeX + footX) / 2 + 3, (kneeY + footY) / 2);
      this.ctx.stroke();

      // Pro Cleat Boot
      this.ctx.fillStyle = '#f97316';
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.roundRect(footX - 6 + bootDir * 2, footY - 3, 13, 7, 3);
      this.ctx.fill();
      this.ctx.stroke();
    };

    if (diveState === 'IDLE') {
      drawLeg(-10, 14 + bounce * 0.5, -15 - stanceSpread, 30, -17 - stanceSpread, 46, -1);
      drawLeg(10, 14 + bounce * 0.5, 15 + stanceSpread, 30, 17 + stanceSpread, 46, 1);
    } else {
      // Dynamic mid-air diving leg extension
      drawLeg(-8, 14, -22, 32, -32, 48, -1);
      drawLeg(8, 14, 2, 30, -6, 46, 1);
    }

    // 2. Goalkeeper Shorts (Dark Navy with Lime Side Trim)
    this.ctx.fillStyle = '#0f172a';
    this.ctx.beginPath();
    this.ctx.roundRect(-17, 6 + bounce * 0.6, 34, 15, 4);
    this.ctx.fill();
    this.ctx.fillStyle = '#ccff00';
    this.ctx.fillRect(-17, 7 + bounce * 0.6, 3, 13);
    this.ctx.fillRect(14, 7 + bounce * 0.6, 3, 13);

    // 3. Goalkeeper Jersey (Shaded Pro Kit)
    const jerseyGrad = this.ctx.createLinearGradient(-18, -20, 18, 12);
    jerseyGrad.addColorStop(0, '#d9f99d');
    jerseyGrad.addColorStop(0.5, '#a3e635');
    jerseyGrad.addColorStop(1, '#65a30d');
    this.ctx.fillStyle = jerseyGrad;
    this.ctx.strokeStyle = '#1e293b';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.roundRect(-18, -20 + bounce, 36, 30, 6);
    this.ctx.fill();
    this.ctx.stroke();

    // Shoulder geometric grip panels
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(-18, -20 + bounce, 9, 6);
    this.ctx.fillRect(9, -20 + bounce, 9, 6);

    // V-Neck Collar
    this.ctx.fillStyle = '#0f172a';
    this.ctx.beginPath();
    this.ctx.moveTo(-6, -20 + bounce);
    this.ctx.lineTo(6, -20 + bounce);
    this.ctx.lineTo(0, -13 + bounce);
    this.ctx.closePath();
    this.ctx.fill();

    // Squad Number "1" with outline
    this.ctx.font = '900 16px "Impact", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillText('1', 0, -3 + bounce);

    // 4. Articulated Arms & Pro Goalkeeper Latex Gloves
    const drawGlovedArm = (sx, sy, ex, ey, gx, gy) => {
      // Sleeve & Forearm
      this.ctx.strokeStyle = '#84cc16';
      this.ctx.lineWidth = 7.5;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(sx, sy);
      this.ctx.lineTo(ex, ey);
      this.ctx.lineTo(gx, gy);
      this.ctx.stroke();

      // Wrist strap
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(gx, gy, 4.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Oversized Pro Goalkeeper Glove (Crimson & White Latex)
      this.ctx.fillStyle = '#ef4444';
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(gx + (gx < 0 ? -3 : 3), gy - 2, 8.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Glove palm grip pad
      this.ctx.fillStyle = '#fef2f2';
      this.ctx.beginPath();
      this.ctx.arc(gx + (gx < 0 ? -3 : 3), gy - 2, 4, 0, Math.PI * 2);
      this.ctx.fill();
    };

    if (diveState === 'IDLE') {
      const armWave = Math.sin(this.tick * 0.16) * 3;
      drawGlovedArm(-17, -14 + bounce, -28, -4 + bounce, -34, -10 + bounce + armWave);
      drawGlovedArm(17, -14 + bounce, 28, -4 + bounce, 34, -10 + bounce - armWave);
    } else {
      // Outstretched acrobatic two-handed dive reach
      drawGlovedArm(-15, -14, -30, -28, -44, -42);
      drawGlovedArm(15, -14, -8, -30, -26, -46);
    }

    // 5. Head, Hair, Sweatband & Expressive Face
    // Neck
    this.ctx.fillStyle = '#d99b66';
    this.ctx.fillRect(-4, -24 + bounce, 8, 5);

    // Head sphere
    this.ctx.fillStyle = '#eab676';
    this.ctx.beginPath();
    this.ctx.arc(0, -32 + bounce, 12, 0, Math.PI * 2);
    this.ctx.fill();

    // Ears
    this.ctx.beginPath();
    this.ctx.arc(-12, -32 + bounce, 2.5, 0, Math.PI * 2);
    this.ctx.arc(12, -32 + bounce, 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Stylized Athletic Hair
    this.ctx.fillStyle = '#291d12';
    this.ctx.beginPath();
    this.ctx.arc(0, -35 + bounce, 12.2, Math.PI * 0.95, Math.PI * 2.05);
    this.ctx.lineTo(10, -45 + bounce);
    this.ctx.lineTo(4, -43 + bounce);
    this.ctx.lineTo(0, -47 + bounce);
    this.ctx.lineTo(-6, -43 + bounce);
    this.ctx.closePath();
    this.ctx.fill();

    // Athletic Headband
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(-11.5, -38 + bounce, 23, 3.5);

    // Eyes tracking the ball
    const lookX = ball ? Math.max(-2, Math.min(2, (ball.x - currentX) * 0.01)) : 0;
    if (diveState === 'DEFEATED') {
      // Stunned X eyes & open mouth
      this.ctx.strokeStyle = '#0f172a';
      this.ctx.lineWidth = 1.8;
      [-4.5, 4.5].forEach(ex => {
        this.ctx.beginPath();
        this.ctx.moveTo(ex - 2, -33 + bounce);
        this.ctx.lineTo(ex + 2, -29 + bounce);
        this.ctx.moveTo(ex + 2, -33 + bounce);
        this.ctx.lineTo(ex - 2, -29 + bounce);
        this.ctx.stroke();
      });
      // Shocked mouth
      this.ctx.fillStyle = '#0f172a';
      this.ctx.beginPath();
      this.ctx.arc(0, -25 + bounce, 3, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      // Whites of eyes
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(-4.5, -31.5 + bounce, 2.5, 0, Math.PI * 2);
      this.ctx.arc(4.5, -31.5 + bounce, 2.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Pupils
      this.ctx.fillStyle = '#0f172a';
      this.ctx.beginPath();
      this.ctx.arc(-4.5 + lookX, -31.5 + bounce, 1.3, 0, Math.PI * 2);
      this.ctx.arc(4.5 + lookX, -31.5 + bounce, 1.3, 0, Math.PI * 2);
      this.ctx.fill();

      // Determined Eyebrows
      this.ctx.strokeStyle = '#291d12';
      this.ctx.lineWidth = 1.8;
      this.ctx.beginPath();
      this.ctx.moveTo(-7.5, -35 + bounce);
      this.ctx.lineTo(-2, -34 + bounce);
      this.ctx.moveTo(7.5, -35 + bounce);
      this.ctx.lineTo(2, -34 + bounce);
      this.ctx.stroke();

      // Confident Grin
      this.ctx.beginPath();
      this.ctx.arc(0, -27 + bounce, 3, 0.15 * Math.PI, 0.85 * Math.PI);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  // =========================================================================
  // DETAILED PRO STRIKER CHARACTER SPRITE (3/4 Back Perspective)
  // =========================================================================
  drawStriker(striker, leadUpRatio = 1, phase = 'TYPING') {
    const sx = striker ? striker.x : this.width * 0.44;
    const sy = striker ? striker.y : this.height * 0.77;
    const kickFrame = striker ? striker.kickFrame : 0;

    this.ctx.save();
    this.ctx.translate(sx, sy);

    // Running stride oscillation during approach
    const isRunning = (phase === 'TYPING' || phase === 'APPROACH') && kickFrame === 0;
    const runCycle = isRunning ? Math.sin(this.tick * 0.28) : 0;
    const bodyBob = isRunning ? Math.abs(Math.cos(this.tick * 0.28)) * -4 : 0;

    // Ground Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 46, 26, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Helper for articulated leg + sock + cleat
    const drawStrikerLeg = (hipX, hipY, kneeX, kneeY, footX, footY) => {
      // Thigh
      this.ctx.strokeStyle = '#eab676';
      this.ctx.lineWidth = 10;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(hipX, hipY);
      this.ctx.lineTo(kneeX, kneeY);
      this.ctx.stroke();

      // Royal Blue & White Hooped Sock
      this.ctx.strokeStyle = '#1d4ed8';
      this.ctx.lineWidth = 9;
      this.ctx.beginPath();
      this.ctx.moveTo(kneeX, kneeY);
      this.ctx.lineTo(footX, footY);
      this.ctx.stroke();

      // White sock turnover cuff
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(kneeX - 3, kneeY + 3);
      this.ctx.lineTo(kneeX + 3, kneeY + 3);
      this.ctx.stroke();

      // Crimson & Gold Predator Cleat
      this.ctx.fillStyle = '#dc2626';
      this.ctx.strokeStyle = '#facc15';
      this.ctx.lineWidth = 1.2;
      this.ctx.beginPath();
      this.ctx.roundRect(footX - 6, footY - 3, 15, 7, 3);
      this.ctx.fill();
      this.ctx.stroke();
    };

    if (kickFrame === 0) {
      // Animated Running Approach Stride
      const leftLift = Math.max(0, runCycle) * 10;
      const rightLift = Math.max(0, -runCycle) * 10;
      drawStrikerLeg(-8, 22 + bodyBob, -11, 34 - leftLift * 0.5, -13, 45 - leftLift);
      drawStrikerLeg(8, 22 + bodyBob, 11, 34 - rightLift * 0.5, 13, 45 - rightLift);
    } else if (kickFrame === 1) {
      // Deep Plant Foot & High Coiled Backswing
      drawStrikerLeg(-8, 22, -6, 35, -4, 46); // Plant leg
      drawStrikerLeg(9, 20, 22, 26, 32, 16); // Coiled kicking leg
    } else {
      // Explosive Kicking Follow-Through with Motion Arc
      drawStrikerLeg(-8, 22, -10, 35, -12, 46); // Plant leg
      drawStrikerLeg(10, 20, 26, 18, 38, 6); // High follow-through leg

      // Kick Swing Motion Blur Arc
      this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.55)';
      this.ctx.lineWidth = 5;
      this.ctx.beginPath();
      this.ctx.arc(10, 20, 30, -0.3, 0.9);
      this.ctx.stroke();
    }

    // Striker Shorts (Crisp White with Royal Blue & Gold Trim)
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.strokeStyle = '#cbd5e1';
    this.ctx.lineWidth = 1.2;
    this.ctx.beginPath();
    this.ctx.roundRect(-16, 12 + bodyBob, 32, 16, 4);
    this.ctx.fill();
    this.ctx.stroke();

    // Shorts side stripe
    this.ctx.fillStyle = '#2563eb';
    this.ctx.fillRect(-16, 13 + bodyBob, 3, 14);
    this.ctx.fillRect(13, 13 + bodyBob, 3, 14);

    // Striker Arms (Pumping in run or balanced in kick)
    const armSwing = isRunning ? runCycle * 8 : (kickFrame >= 1 ? 14 : 0);
    this.ctx.strokeStyle = '#eab676';
    this.ctx.lineWidth = 7;
    this.ctx.lineCap = 'round';
    // Left arm
    this.ctx.beginPath();
    this.ctx.moveTo(-16, -12 + bodyBob);
    this.ctx.lineTo(-26 - armSwing * 0.5, 2 + bodyBob - armSwing);
    this.ctx.stroke();
    // Right arm
    this.ctx.beginPath();
    this.ctx.moveTo(16, -12 + bodyBob);
    this.ctx.lineTo(26 + armSwing * 0.5, 2 + bodyBob + armSwing * 0.5);
    this.ctx.stroke();

    // Striker Jersey (Royal Blue Gradient with Gold Trim & #9 Print)
    const kitGrad = this.ctx.createLinearGradient(-18, -22, 18, 16);
    kitGrad.addColorStop(0, '#3b82f6');
    kitGrad.addColorStop(0.5, '#2563eb');
    kitGrad.addColorStop(1, '#1d4ed8');
    this.ctx.fillStyle = kitGrad;
    this.ctx.strokeStyle = '#1e3a8a';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.roundRect(-17, -20 + bodyBob, 34, 35, 6);
    this.ctx.fill();
    this.ctx.stroke();

    // Gold Collar & Shoulder Stripes
    this.ctx.fillStyle = '#facc15';
    this.ctx.fillRect(-9, -20 + bodyBob, 18, 3.5);
    this.ctx.fillRect(-17, -18 + bodyBob, 6, 3);
    this.ctx.fillRect(11, -18 + bodyBob, 6, 3);

    // Back Nameplate & Squad Number "9"
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 6.5px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('STRIKER', 0, -11 + bodyBob);

    this.ctx.fillStyle = '#facc15';
    this.ctx.font = '900 17px "Impact", sans-serif';
    this.ctx.fillText('9', 0, 3 + bodyBob);

    // Head & Hair (3/4 Back View)
    this.ctx.fillStyle = '#eab676';
    this.ctx.beginPath();
    this.ctx.arc(0, -31 + bodyBob, 11, 0, Math.PI * 2);
    this.ctx.fill();

    // Stylized Fade Haircut
    this.ctx.fillStyle = '#1c1917';
    this.ctx.beginPath();
    this.ctx.arc(0, -33 + bodyBob, 11.2, Math.PI * 0.85, Math.PI * 2.15);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  // =========================================================================
  // AERODYNAMIC BALL FLIGHT RIBBON TRAIL & PRO MATCH BALL
  // =========================================================================
  updateAndDrawBallTrail(gameState) {
    const { phase, ball, targets, activeTargetIndex } = gameState;

    if (phase === 'BALL_FLIGHT' && ball) {
      const activeTarget = activeTargetIndex !== -1 && targets ? targets[activeTargetIndex] : null;
      const isCornerShot = activeTarget && activeTarget.zone && activeTarget.zone.isCorner;

      this.ballTrail.push({
        x: ball.x,
        y: ball.y,
        scale: ball.scale || 1.0,
        isCorner: isCornerShot,
        alpha: 1.0
      });

      // Spawn fire/energy sparks along flight path for corner shots
      if (isCornerShot && this.tick % 2 === 0) {
        this.particles.push({
          x: ball.x + (Math.random() - 0.5) * 10,
          y: ball.y + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          gravity: 0.05,
          drag: 0.92,
          color: Math.random() < 0.5 ? '#ff0055' : '#ffeb3b',
          size: 4 * (ball.scale || 1),
          rotation: 0,
          rotSpeed: 0,
          life: 0.8,
          decay: 0.06,
          shape: 'circle'
        });
      }
    }

    // Decay trail points
    for (let i = this.ballTrail.length - 1; i >= 0; i--) {
      this.ballTrail[i].alpha -= 0.065;
      if (this.ballTrail[i].alpha <= 0) {
        this.ballTrail.splice(i, 1);
      }
    }

    if (this.ballTrail.length < 2) return;

    this.ctx.save();
    for (let i = 1; i < this.ballTrail.length; i++) {
      const prev = this.ballTrail[i - 1];
      const curr = this.ballTrail[i];
      const width = 20 * curr.scale * curr.alpha;

      this.ctx.strokeStyle = curr.isCorner
        ? `rgba(255, 0, 85, ${curr.alpha * 0.55})`
        : `rgba(0, 240, 255, ${curr.alpha * 0.45})`;
      this.ctx.lineWidth = width;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(prev.x, prev.y);
      this.ctx.lineTo(curr.x, curr.y);
      this.ctx.stroke();

      // Inner bright core ribbon
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${curr.alpha * 0.7})`;
      this.ctx.lineWidth = width * 0.35;
      this.ctx.beginPath();
      this.ctx.moveTo(prev.x, prev.y);
      this.ctx.lineTo(curr.x, curr.y);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawBall(ball) {
    if (!ball) return;
    const { x, y, scale = 1.0, rotation = 0 } = ball;
    const radius = 16.5 * scale;

    this.ctx.save();
    this.ctx.translate(x, y);

    // Projected Ground Shadow
    const groundY = this.height * 0.78;
    const shadowDist = Math.max(0, (groundY - y) * 0.24);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    this.ctx.beginPath();
    this.ctx.ellipse(0, shadowDist + radius * 0.85, radius * 1.15, radius * 0.42, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Clip to sphere
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    this.ctx.clip();

    // Base leather sphere shading
    const ballGrad = this.ctx.createRadialGradient(-radius * 0.32, -radius * 0.32, radius * 0.08, 0, 0, radius);
    ballGrad.addColorStop(0, '#ffffff');
    ballGrad.addColorStop(0.68, '#f1f5f9');
    ballGrad.addColorStop(0.9, '#cbd5e1');
    ballGrad.addColorStop(1, '#64748b');

    this.ctx.fillStyle = ballGrad;
    this.ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

    // Rotate inner panels & seams for realistic 3D spin
    this.ctx.save();
    this.ctx.rotate(rotation);

    // Seam lines connecting center pentagon to outer pentagons
    this.ctx.strokeStyle = '#64748b';
    this.ctx.lineWidth = Math.max(0.8, 1.2 * scale);
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(Math.cos(a) * radius * 0.38, Math.sin(a) * radius * 0.38);
      this.ctx.lineTo(Math.cos(a) * radius * 0.85, Math.sin(a) * radius * 0.85);
      this.ctx.stroke();
    }

    // Classic Black & Gold Pro Match Ball Panels
    this.ctx.fillStyle = '#0f172a';
    this.drawPentagon(0, 0, radius * 0.42);

    // Gold accent ring inside center pentagon
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = Math.max(0.6, 1.0 * scale);
    this.ctx.stroke();

    // Surrounding outer pentagons
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const px = Math.cos(angle) * radius * 0.86;
      const py = Math.sin(angle) * radius * 0.86;
      this.drawPentagon(px, py, radius * 0.34);
    }

    this.ctx.restore(); // End rotation

    // Fixed Specular Gloss Highlight (top-left toward stadium lights)
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    this.ctx.beginPath();
    this.ctx.ellipse(-radius * 0.34, -radius * 0.34, radius * 0.25, radius * 0.14, -Math.PI / 4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore(); // End clip

    // Crisp outer rim
    this.ctx.strokeStyle = '#1e293b';
    this.ctx.lineWidth = Math.max(1, scale * 1.4);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawPentagon(x, y, r) {
    this.ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      if (i === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  // =========================================================================
  // BROADCAST TARGET RETICLES & KEYCAP WORD PLATES
  // =========================================================================
  drawTargets(targets, activeIndex, leadUpRatio) {
    if (!targets || !targets.length) return;
    const goalBounds = this.getGoalBounds();

    targets.forEach((t, idx) => {
      const zone = t.zone;
      const tx = goalBounds.left + zone.xPercent * goalBounds.width;
      const ty = goalBounds.top + zone.yPercent * goalBounds.height;

      const isCurrent = activeIndex === idx;
      const hasFocus = activeIndex !== -1 && !isCurrent;

      this.ctx.save();
      this.ctx.translate(tx, ty);

      if (hasFocus) {
        this.ctx.globalAlpha = 0.28;
      }

      // 1. Rotating Broadcast Target Reticle
      const pulse = Math.sin(this.tick * 0.12 + idx) * 2.5;
      const baseRadius = (zone.isCorner ? 27 : 23) + pulse;
      const primaryColor = isCurrent ? '#00f0ff' : zone.color;

      // Inner translucent target radar disk
      const radGrad = this.ctx.createRadialGradient(0, 0, 2, 0, 0, baseRadius);
      radGrad.addColorStop(0, isCurrent ? 'rgba(0, 240, 255, 0.35)' : 'rgba(255, 255, 255, 0.15)');
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.ctx.fillStyle = radGrad;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
      this.ctx.fill();

      // Rotating segmented outer ring
      this.ctx.save();
      this.ctx.rotate(this.tick * (isCurrent ? 0.05 : 0.02) * (idx % 2 === 0 ? 1 : -1));
      this.ctx.strokeStyle = primaryColor;
      this.ctx.lineWidth = isCurrent ? 3 : 2;
      this.ctx.setLineDash([10, 6]);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
      this.ctx.restore();

      // Inner solid precision ring & center bullseye dot
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, baseRadius * 0.45, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.fillStyle = isCurrent ? '#39ff14' : primaryColor;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Crosshair precision ticks
      const tickLen = 7;
      this.ctx.strokeStyle = primaryColor;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(-baseRadius - tickLen, 0);
      this.ctx.lineTo(-baseRadius + 5, 0);
      this.ctx.moveTo(baseRadius + tickLen, 0);
      this.ctx.lineTo(baseRadius - 5, 0);
      this.ctx.moveTo(0, -baseRadius - tickLen);
      this.ctx.lineTo(0, -baseRadius + 5);
      this.ctx.moveTo(0, baseRadius + tickLen);
      this.ctx.lineTo(0, baseRadius - 5);
      this.ctx.stroke();

      // 2. Corner Bonus Pill Tag above Reticle
      if (zone.isCorner) {
        const pillW = 86;
        const pillH = 16;
        const pillY = -baseRadius - 24;
        this.ctx.fillStyle = 'rgba(255, 0, 85, 0.9)';
        this.ctx.beginPath();
        this.ctx.roundRect(-pillW / 2, pillY, pillW, pillH, 8);
        this.ctx.fill();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 9.5px "Segoe UI", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`★ ${zone.badge.replace(' 🎯', '')} ★`, 0, pillY + pillH / 2);
      }

      // 3. Keycap-Styled Word HUD Plate
      const word = t.word;
      const typedLen = t.typedIndex || 0;
      const keyTileWidth = 20;
      const keyTileGap = 3;
      const totalTilesW = word.length * keyTileWidth + (word.length - 1) * keyTileGap;
      const boxWidth = Math.max(totalTilesW + 20, 96);
      const boxHeight = 38;
      const boxY = baseRadius + 9;

      // HUD Plate Backdrop with Neon Rim
      this.ctx.shadowColor = isCurrent ? '#00f0ff' : 'rgba(0,0,0,0.6)';
      this.ctx.shadowBlur = isCurrent ? 16 : 8;
      this.ctx.fillStyle = isCurrent ? 'rgba(6, 22, 46, 0.95)' : 'rgba(15, 23, 42, 0.90)';
      this.ctx.strokeStyle = isCurrent ? '#00f0ff' : (zone.isCorner ? '#ff3366' : '#38bdf8');
      this.ctx.lineWidth = isCurrent ? 2.5 : 1.5;

      this.ctx.beginPath();
      this.ctx.roundRect(-boxWidth / 2, boxY, boxWidth, boxHeight, 9);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;

      // 4. Individual Keycap Character Tiles
      let startX = -totalTilesW / 2;
      this.ctx.font = 'bold 17px "Consolas", "Segoe UI", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        const isTyped = i < typedLen;
        const isNextChar = isCurrent && i === typedLen;
        const kx = startX + i * (keyTileWidth + keyTileGap);
        const ky = boxY + 5 + (isTyped ? -1.5 : 0);
        const kh = boxHeight - 10;

        // Keycap slot background
        if (isTyped) {
          this.ctx.fillStyle = 'rgba(57, 255, 20, 0.22)';
          this.ctx.strokeStyle = '#39ff14';
          this.ctx.lineWidth = 1.5;
        } else if (isNextChar) {
          this.ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
          this.ctx.strokeStyle = '#00f0ff';
          this.ctx.lineWidth = 1.5;
        } else {
          this.ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
          this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
          this.ctx.lineWidth = 1;
        }

        this.ctx.beginPath();
        this.ctx.roundRect(kx, ky, keyTileWidth, kh, 4);
        this.ctx.fill();
        this.ctx.stroke();

        // Character glyph
        this.ctx.fillStyle = isTyped ? '#39ff14' : (isNextChar ? '#ffeb3b' : '#ffffff');
        this.ctx.fillText(char, kx + keyTileWidth / 2, ky + kh / 2 + 1);
      }

      // 5. Points Tag below HUD Plate
      this.ctx.font = 'bold 11px "Segoe UI", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#facc15';
      this.ctx.fillText(`+${t.points} PTS`, 0, boxY + boxHeight + 13);

      this.ctx.restore();
    });
  }

  getTargetScreenCoords(targetIndex, targets) {
    if (!targets || !targets[targetIndex]) return { x: 600, y: 300 };
    const goalBounds = this.getGoalBounds();
    const zone = targets[targetIndex].zone;
    return {
      x: goalBounds.left + zone.xPercent * goalBounds.width,
      y: goalBounds.top + zone.yPercent * goalBounds.height + 35
    };
  }

  // =========================================================================
  // DRIBBLING DRILL MODE RENDERING (Side-Scrolling 100m Field & Slalom Cones)
  // =========================================================================
  drawDribblingPitch(gameState) {
    const pitchTop = this.height * 0.22;
    const pitchHeight = this.height - pitchTop;
    const dState = gameState.dribbleState || {};
    const cameraX = dState.cameraX || 0; // Pixels scrolled along the 100m field
    const pixelsPerMeter = 28; // 100m = 2800px total pitch scroll length
    const startWorldX = 360;

    // 1. Vertical Mowed Turf Stripes scrolling horizontally with cameraX
    const stripeWidth = 140; // 5m per stripe
    const firstStripeIndex = Math.floor((cameraX - 200) / stripeWidth);
    const lastStripeIndex = Math.ceil((cameraX + this.width + 200) / stripeWidth);

    for (let i = firstStripeIndex; i <= lastStripeIndex; i++) {
      const sx = i * stripeWidth - cameraX;
      this.ctx.fillStyle = Math.abs(i) % 2 === 0 ? '#1e6b24' : '#17561c';
      this.ctx.fillRect(sx, pitchTop, stripeWidth + 1, pitchHeight);
    }

    // Horizontal subtle shading gradient for depth
    const depthGrad = this.ctx.createLinearGradient(0, pitchTop, 0, this.height);
    depthGrad.addColorStop(0, 'rgba(0, 15, 5, 0.42)');
    depthGrad.addColorStop(0.35, 'rgba(255, 255, 220, 0.06)');
    depthGrad.addColorStop(1, 'rgba(0, 12, 4, 0.35)');
    this.ctx.fillStyle = depthGrad;
    this.ctx.fillRect(0, pitchTop, this.width, pitchHeight);

    // Top & Bottom Touchlines (Sidelines)
    const topTouchY = pitchTop + 42;
    const botTouchY = this.height - 34;

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(0, topTouchY);
    this.ctx.lineTo(this.width, topTouchY);
    this.ctx.moveTo(0, botTouchY);
    this.ctx.lineTo(this.width, botTouchY);
    this.ctx.stroke();

    // Yardage / Meter Chalk Lines every 10m from 0m to 100m
    this.ctx.font = 'bold 13px "Impact", "Segoe UI", sans-serif';
    this.ctx.textAlign = 'center';

    for (let m = 0; m <= 100; m += 10) {
      const wx = startWorldX + m * pixelsPerMeter;
      const sx = wx - cameraX;
      if (sx < -120 || sx > this.width + 120) continue;

      const isMajor = m === 0 || m === 50 || m === 100;
      this.ctx.strokeStyle = isMajor ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.35)';
      this.ctx.lineWidth = isMajor ? 4 : 2;

      this.ctx.beginPath();
      this.ctx.moveTo(sx, topTouchY);
      this.ctx.lineTo(sx, botTouchY);
      this.ctx.stroke();

      // Center circle at 50m Midfield
      if (m === 50) {
        const midY = (topTouchY + botTouchY) / 2;
        this.ctx.beginPath();
        this.ctx.ellipse(sx, midY, 75, 110, 0, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(sx, midY, 5, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // Checkered Finish Line Banner at 100m
      if (m === 100) {
        const sqSize = 14;
        const rows = Math.floor((botTouchY - topTouchY) / sqSize);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < 2; c++) {
            this.ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(255,255,255,0.88)' : 'rgba(15,23,42,0.88)';
            this.ctx.fillRect(sx + c * sqSize, topTouchY + r * sqSize, sqSize, sqSize);
          }
        }
        // Finish Line Flag Posts
        this.drawCornerFlag(sx + 14, topTouchY, '#00ff66');
        this.drawCornerFlag(sx + 14, botTouchY, '#00ff66');
      }

      // Yardage Label on Sideline
      const label = m === 0 ? 'START 0m' : (m === 50 ? 'MIDFIELD 50m' : (m === 100 ? 'FINISH 100m' : `${m}m`));
      this.ctx.fillStyle = m === 100 ? '#00ff66' : (isMajor ? '#ffeb3b' : 'rgba(255,255,255,0.75)');
      this.ctx.fillText(label, sx, topTouchY - 12);
      this.ctx.fillText(label, sx, botTouchY + 20);
    }
  }

  drawDribblingCones(gameState) {
    const dState = gameState.dribbleState;
    if (!dState || !dState.cones) return;
    const cameraX = dState.cameraX || 0;

    // Dashed slalom path connecting cones
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.32)';
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([8, 6]);
    this.ctx.beginPath();
    dState.cones.forEach((cone, idx) => {
      const sx = cone.worldX - cameraX;
      const sy = cone.y;
      if (idx === 0) this.ctx.moveTo(sx, sy);
      else this.ctx.lineTo(sx, sy);
    });
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    this.ctx.restore();

    // Draw each cone along the field
    dState.cones.forEach((cone, idx) => {
      const sx = cone.worldX - cameraX;
      const sy = cone.y;
      if (sx < -60 || sx > this.width + 60) return;

      const isCompleted = idx <= dState.currentTouch;
      const isNextTarget = idx === dState.currentTouch + 1;

      this.ctx.save();
      this.ctx.translate(sx, sy);

      // Pulsing target ring under next target cone
      if (isNextTarget) {
        const pulse = 24 + Math.sin(this.tick * 0.16) * 4;
        this.ctx.strokeStyle = '#00f0ff';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 4, pulse, pulse * 0.45, 0, 0, Math.PI * 2);
        this.ctx.stroke();
      } else if (isCompleted) {
        this.ctx.fillStyle = 'rgba(0, 255, 102, 0.22)';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 4, 20, 9, 0, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // Cone Base Shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      this.ctx.beginPath();
      this.ctx.ellipse(0, 6, 15, 6, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Square plastic cone base
      this.ctx.fillStyle = isCompleted ? '#10b981' : '#ea580c';
      this.ctx.strokeStyle = '#0f172a';
      this.ctx.lineWidth = 1.2;
      this.ctx.beginPath();
      this.ctx.moveTo(-14, 4);
      this.ctx.lineTo(0, 9);
      this.ctx.lineTo(14, 4);
      this.ctx.lineTo(0, -1);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Cone body
      this.ctx.fillStyle = isCompleted ? '#22c55e' : '#f97316';
      this.ctx.beginPath();
      this.ctx.moveTo(-10, 4);
      this.ctx.lineTo(-2.5, -18);
      this.ctx.lineTo(2.5, -18);
      this.ctx.lineTo(10, 4);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // White reflective stripe on cone
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.moveTo(-6.5, -4);
      this.ctx.lineTo(-4.2, -11);
      this.ctx.lineTo(4.2, -11);
      this.ctx.lineTo(6.5, -4);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.restore();
    });
  }

  drawDribbleWordPlate(gameState) {
    const dState = gameState.dribbleState;
    if (!dState || !dState.word) return;

    const word = dState.word;
    const typedLen = dState.typedIndex || 0;
    const mistypeFlash = dState.mistypeFlash || 0;

    // Horizontal shake when mistyped
    const shakeX = mistypeFlash > 0 ? Math.sin(this.tick * 1.3) * 10 * mistypeFlash : 0;

    this.ctx.save();
    this.ctx.translate(this.width * 0.5 + shakeX, this.height * 0.41);

    // Top Instruction / Touch Counter Pill
    const pillW = 280;
    const pillH = 24;
    const pillY = -48;
    const isError = mistypeFlash > 0.05;

    this.ctx.fillStyle = isError ? 'rgba(255, 0, 85, 0.92)' : 'rgba(15, 23, 42, 0.9)';
    this.ctx.strokeStyle = isError ? '#ffeb3b' : '#00f0ff';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.roundRect(-pillW / 2, pillY, pillW, pillH, 12);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.font = 'bold 11.5px "Segoe UI", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = '#ffffff';
    if (isError) {
      this.ctx.fillText('⚠ MISTYPE! RETYPE WORD FROM START ⚠', 0, pillY + pillH / 2);
    } else {
      this.ctx.fillText(`⚽ DRIBBLE TOUCH ${dState.currentTouch + 1} OF ${dState.totalTouches} • TYPE TO KICK`, 0, pillY + pillH / 2);
    }

    // Keycap Word Plate
    const keyTileWidth = 28;
    const keyTileGap = 5;
    const totalTilesW = word.length * keyTileWidth + (word.length - 1) * keyTileGap;
    const boxWidth = Math.max(totalTilesW + 32, 160);
    const boxHeight = 52;
    const boxY = -16;

    this.ctx.shadowColor = isError ? '#ff0055' : '#00f0ff';
    this.ctx.shadowBlur = 18;
    this.ctx.fillStyle = isError ? 'rgba(55, 8, 22, 0.96)' : 'rgba(6, 22, 46, 0.95)';
    this.ctx.strokeStyle = isError ? '#ff0055' : '#00f0ff';
    this.ctx.lineWidth = 3;

    this.ctx.beginPath();
    this.ctx.roundRect(-boxWidth / 2, boxY, boxWidth, boxHeight, 12);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    // Individual Keycap Tiles
    let startX = -totalTilesW / 2;
    this.ctx.font = 'bold 22px "Consolas", "Segoe UI", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const isTyped = i < typedLen;
      const isNextChar = i === typedLen;
      const kx = startX + i * (keyTileWidth + keyTileGap);
      const ky = boxY + 7 + (isTyped ? -2 : 0);
      const kh = boxHeight - 14;

      if (isError) {
        this.ctx.fillStyle = 'rgba(255, 0, 85, 0.28)';
        this.ctx.strokeStyle = '#ff0055';
        this.ctx.lineWidth = 1.8;
      } else if (isTyped) {
        this.ctx.fillStyle = 'rgba(57, 255, 20, 0.25)';
        this.ctx.strokeStyle = '#39ff14';
        this.ctx.lineWidth = 2;
      } else if (isNextChar) {
        this.ctx.fillStyle = 'rgba(0, 240, 255, 0.28)';
        this.ctx.strokeStyle = '#00f0ff';
        this.ctx.lineWidth = 2;
      } else {
        this.ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
        this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        this.ctx.lineWidth = 1.2;
      }

      this.ctx.beginPath();
      this.ctx.roundRect(kx, ky, keyTileWidth, kh, 6);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = isError ? '#fecdd3' : (isTyped ? '#39ff14' : (isNextChar ? '#ffeb3b' : '#ffffff'));
      this.ctx.fillText(char, kx + keyTileWidth / 2, ky + kh / 2 + 1);
    }

  // =========================================================================
  // TOUCH PRACTICE ARENA & CHARACTER SPRITE
  // =========================================================================
  drawTouchPracticeArena(gameState) {
    const cx = 600;
    const cy = 565;

    this.ctx.save();

    // 1. Agility Ring on Pitch
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.lineWidth = 2.5;
    this.ctx.setLineDash([8, 8]);
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy, 85, 38, 0, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Inner subtle glow disc
    const ringGrad = this.ctx.createRadialGradient(cx, cy, 10, cx, cy, 85);
    ringGrad.addColorStop(0, 'rgba(0, 240, 255, 0.08)');
    ringGrad.addColorStop(1, 'rgba(0, 240, 255, 0.0)');
    this.ctx.fillStyle = ringGrad;
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy, 85, 38, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. Training cones marking out the agility box
    const cones = [
      { x: 480, y: 515, color: '#f97316' },
      { x: 720, y: 515, color: '#f97316' },
      { x: 460, y: 615, color: '#ea580c' },
      { x: 740, y: 615, color: '#ea580c' },
    ];

    cones.forEach(c => {
      this.ctx.save();
      this.ctx.translate(c.x, c.y);

      // Shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      this.ctx.beginPath();
      this.ctx.ellipse(0, 4, 12, 5, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Cone Base
      this.ctx.fillStyle = '#ea580c';
      this.ctx.beginPath();
      this.ctx.moveTo(-11, 3);
      this.ctx.lineTo(0, 7);
      this.ctx.lineTo(11, 3);
      this.ctx.lineTo(0, -1);
      this.ctx.closePath();
      this.ctx.fill();

      // Cone Body
      this.ctx.fillStyle = c.color;
      this.ctx.beginPath();
      this.ctx.moveTo(-8, 3);
      this.ctx.lineTo(-2, -14);
      this.ctx.lineTo(2, -14);
      this.ctx.lineTo(8, 3);
      this.ctx.closePath();
      this.ctx.fill();

      // White reflective collar
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.moveTo(-5, -3);
      this.ctx.lineTo(-3, -9);
      this.ctx.lineTo(3, -9);
      this.ctx.lineTo(5, -3);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.restore();
    });

    this.ctx.restore();
  }

  drawTouchStriker(striker, touchState) {
    const sx = striker ? striker.x : 600;
    const sy = striker ? striker.y : 530;
    const tState = touchState || { currentFoot: 'LEFT', kickAnim: 0 };
    const currentFoot = tState.currentFoot || 'LEFT';
    const lastKickedFoot = tState.lastKickedFoot || null;
    const kickAnim = tState.kickAnim || 0;

    this.ctx.save();
    this.ctx.translate(sx, sy);

    const idleBob = Math.sin(this.tick * 0.16) * 2;

    // Ground Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 46, 28, 8, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Helper for articulated leg + sock + cleat
    const drawStrikerLeg = (hipX, hipY, kneeX, kneeY, footX, footY) => {
      // Thigh
      this.ctx.strokeStyle = '#eab676';
      this.ctx.lineWidth = 10;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(hipX, hipY);
      this.ctx.lineTo(kneeX, kneeY);
      this.ctx.stroke();

      // Royal Blue & White Hooped Sock
      this.ctx.strokeStyle = '#1d4ed8';
      this.ctx.lineWidth = 9;
      this.ctx.beginPath();
      this.ctx.moveTo(kneeX, kneeY);
      this.ctx.lineTo(footX, footY);
      this.ctx.stroke();

      // White sock turnover cuff
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(kneeX - 3, kneeY + 3);
      this.ctx.lineTo(kneeX + 3, kneeY + 3);
      this.ctx.stroke();

      // Crimson & Gold Predator Cleat
      this.ctx.fillStyle = '#dc2626';
      this.ctx.strokeStyle = '#facc15';
      this.ctx.lineWidth = 1.2;
      this.ctx.beginPath();
      this.ctx.roundRect(footX - 6, footY - 3, 15, 7, 3);
      this.ctx.fill();
      this.ctx.stroke();
    };

    if (kickAnim > 0 && lastKickedFoot === 'LEFT') {
      // Left foot swinging across inward to tap ball to the right foot
      const p = kickAnim;
      drawStrikerLeg(8, 22, 10, 34, 12, 46); // Plant right leg
      drawStrikerLeg(-8, 22, -3 + (1 - p) * 6, 32 - Math.sin(p * Math.PI) * 5, 6 * (1 - p) - 10 * p, 44 - Math.sin(p * Math.PI) * 12); // Kicking left leg

      // Motion Arc
      this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.arc(-4, 30, 22, 0.4, 1.8);
      this.ctx.stroke();
    } else if (kickAnim > 0 && lastKickedFoot === 'RIGHT') {
      // Right foot swinging across inward to tap ball to the left foot
      const p = kickAnim;
      drawStrikerLeg(-8, 22, -10, 34, -12, 46); // Plant left leg
      drawStrikerLeg(8, 22, 3 - (1 - p) * 6, 32 - Math.sin(p * Math.PI) * 5, -6 * (1 - p) + 10 * p, 44 - Math.sin(p * Math.PI) * 12); // Kicking right leg

      // Motion Arc
      this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.arc(4, 30, 22, 1.3, 2.7);
      this.ctx.stroke();
    } else {
      // Idle Ready Stance (Alternating poised foot)
      if (currentFoot === 'LEFT') {
        drawStrikerLeg(8, 22, 10, 34, 12, 46); // Right plant
        drawStrikerLeg(-8, 22, -11, 33, -15, 43 + idleBob); // Left poised forward
      } else {
        drawStrikerLeg(-8, 22, -10, 34, -12, 46); // Left plant
        drawStrikerLeg(8, 22, 11, 33, 15, 43 + idleBob); // Right poised forward
      }
    }

    // Striker Shorts
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.strokeStyle = '#cbd5e1';
    this.ctx.lineWidth = 1.2;
    this.ctx.beginPath();
    this.ctx.roundRect(-16, 12, 32, 16, 4);
    this.ctx.fill();
    this.ctx.stroke();

    // Shorts side stripe
    this.ctx.fillStyle = '#2563eb';
    this.ctx.fillRect(-16, 13, 3, 14);
    this.ctx.fillRect(13, 13, 3, 14);

    // Striker Arms (balanced outward for rapid footwork)
    this.ctx.strokeStyle = '#eab676';
    this.ctx.lineWidth = 7;
    this.ctx.lineCap = 'round';
    // Left arm
    this.ctx.beginPath();
    this.ctx.moveTo(-16, -12);
    this.ctx.lineTo(-28, 4 + idleBob * 0.5);
    this.ctx.stroke();
    // Right arm
    this.ctx.beginPath();
    this.ctx.moveTo(16, -12);
    this.ctx.lineTo(28, 4 - idleBob * 0.5);
    this.ctx.stroke();

    // Striker Jersey (Royal Blue Gradient with Gold Trim & #9 Print)
    const kitGrad = this.ctx.createLinearGradient(-18, -22, 18, 16);
    kitGrad.addColorStop(0, '#3b82f6');
    kitGrad.addColorStop(0.5, '#2563eb');
    kitGrad.addColorStop(1, '#1d4ed8');
    this.ctx.fillStyle = kitGrad;
    this.ctx.strokeStyle = '#1e3a8a';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.roundRect(-17, -20, 34, 35, 6);
    this.ctx.fill();
    this.ctx.stroke();

    // Gold Collar & Shoulder Stripes
    this.ctx.fillStyle = '#facc15';
    this.ctx.fillRect(-9, -20, 18, 3.5);
    this.ctx.fillRect(-17, -18, 6, 3);
    this.ctx.fillRect(11, -18, 6, 3);

    // Back Nameplate & Squad Number "9"
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 6.5px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('STRIKER', 0, -11);

    this.ctx.fillStyle = '#facc15';
    this.ctx.font = '900 17px "Impact", sans-serif';
    this.ctx.fillText('9', 0, 3);

    // Head & Hair
    this.ctx.fillStyle = '#eab676';
    this.ctx.beginPath();
    this.ctx.arc(0, -31, 11, 0, Math.PI * 2);
    this.ctx.fill();

    // Stylized Fade Haircut
    this.ctx.fillStyle = '#1c1917';
    this.ctx.beginPath();
    this.ctx.arc(0, -33, 11.2, Math.PI * 0.85, Math.PI * 2.15);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  drawTouchPracticePlate(gameState) {
    const tState = gameState.touchState;
    if (!tState) return;

    const letter = (tState.targetLetter || 'A').toUpperCase();
    const currentFoot = tState.currentFoot || 'LEFT';
    const isError = tState.mistypeFlash > 0.05;
    const isSuddenDeath = !!tState.suddenDeath;
    const isFailed = !!tState.failed;

    // Horizontal shake when mistyped
    const shakeX = isError ? Math.sin(this.tick * 1.4) * 12 * tState.mistypeFlash : 0;

    this.ctx.save();
    this.ctx.translate(this.width * 0.5 + shakeX, this.height * 0.38);

    // Main HUD Container Box
    const boxW = 440;
    const boxH = 175;
    const boxY = -70;

    this.ctx.shadowColor = isError ? '#ff0055' : (isSuddenDeath ? '#f59e0b' : '#00f0ff');
    this.ctx.shadowBlur = isError ? 26 : 20;
    this.ctx.fillStyle = isError ? 'rgba(55, 8, 22, 0.96)' : 'rgba(6, 20, 42, 0.94)';
    this.ctx.strokeStyle = isError ? '#ff0055' : (isSuddenDeath ? '#f59e0b' : '#00f0ff');
    this.ctx.lineWidth = 2.8;

    this.ctx.beginPath();
    this.ctx.roundRect(-boxW / 2, boxY, boxW, boxH, 16);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    // Top Header Pill
    const pillW = 340;
    const pillH = 26;
    const pillY = boxY - 14;

    this.ctx.fillStyle = isError
      ? 'rgba(255, 0, 85, 0.95)'
      : (isSuddenDeath ? 'rgba(245, 158, 11, 0.95)' : 'rgba(0, 240, 255, 0.95)');
    this.ctx.beginPath();
    this.ctx.roundRect(-pillW / 2, pillY, pillW, pillH, 13);
    this.ctx.fill();

    this.ctx.font = 'bold 12px "Segoe UI", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = isError ? '#ffffff' : (isSuddenDeath ? '#0f172a' : '#041324');

    if (isFailed) {
      this.ctx.fillText('💀 SUDDEN DEATH: 1 MISS ELIMINATION! 💀', 0, pillY + pillH / 2);
    } else if (isError) {
      this.ctx.fillText('⚠ MISTYPE! TYPE SHOWN LETTER TO TOUCH ⚠', 0, pillY + pillH / 2);
    } else if (isSuddenDeath) {
      this.ctx.fillText('💀 WORLD CLASS • 1 MISS FAILS ROUND (SUDDEN DEATH)', 0, pillY + pillH / 2);
    } else {
      this.ctx.fillText('⚡ 60s TOUCH PRACTICE • ALTERNATING FEET', 0, pillY + pillH / 2);
    }

    // Left Column: Touches Count
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.font = 'bold 11px "Segoe UI", sans-serif';
    this.ctx.fillText('TOUCHES', -145, boxY + 44);

    this.ctx.fillStyle = '#facc15';
    this.ctx.font = '900 36px "Impact", "Segoe UI", sans-serif';
    this.ctx.fillText(`${tState.touches || 0}`, -145, boxY + 76);

    // Right Column: Consecutive Streak
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.font = 'bold 11px "Segoe UI", sans-serif';
    this.ctx.fillText('STREAK', 145, boxY + 44);

    this.ctx.fillStyle = '#00ff66';
    this.ctx.font = '900 36px "Impact", "Segoe UI", sans-serif';
    this.ctx.fillText(`${gameState.streak || 0}`, 145, boxY + 76);

    // Center Mechanical Keycap Tile
    const keyTileW = 86;
    const keyTileH = 80;
    const keyTileX = -keyTileW / 2;
    const keyTileY = boxY + 22;

    this.ctx.fillStyle = isError ? 'rgba(255, 0, 85, 0.28)' : 'rgba(15, 23, 42, 0.95)';
    this.ctx.strokeStyle = isError ? '#ff0055' : (isSuddenDeath ? '#facc15' : '#00f0ff');
    this.ctx.lineWidth = 2.5;

    this.ctx.beginPath();
    this.ctx.roundRect(keyTileX, keyTileY, keyTileW, keyTileH, 12);
    this.ctx.fill();
    this.ctx.stroke();

    // 3D Keycap bevel top highlight
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.roundRect(keyTileX + 3, keyTileY + 3, keyTileW - 6, keyTileH - 8, 8);
    this.ctx.stroke();

    // Keycap Target Letter
    this.ctx.font = '900 48px "Consolas", "Courier New", monospace';
    this.ctx.fillStyle = isError ? '#fecdd3' : '#ffffff';
    this.ctx.fillText(letter, 0, keyTileY + keyTileH / 2 + 1);

    // Row Category Hint
    const homeRow = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
    const topRow = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
    let rowHint = 'BOTTOM ROW REACH';
    if (homeRow.includes(letter)) rowHint = 'HOME ROW ANCHOR';
    else if (topRow.includes(letter)) rowHint = 'TOP ROW KEY';

    this.ctx.font = 'bold 9.5px "Segoe UI", sans-serif';
    this.ctx.fillStyle = isSuddenDeath ? '#facc15' : '#38bdf8';
    this.ctx.fillText(rowHint, 0, keyTileY + keyTileH + 11);

    // Bottom Active Foot Indicator Badges
    const footPillW = 150;
    const footPillH = 28;
    const footPillY = boxY + boxH - 36;

    // Left Foot Badge
    const isLeft = currentFoot === 'LEFT';
    this.ctx.save();
    this.ctx.translate(-100, footPillY);
    this.ctx.fillStyle = isLeft ? 'rgba(0, 255, 102, 0.25)' : 'rgba(30, 41, 59, 0.6)';
    this.ctx.strokeStyle = isLeft ? '#00ff66' : 'rgba(148, 163, 184, 0.3)';
    this.ctx.lineWidth = isLeft ? 2.2 : 1.2;
    this.ctx.beginPath();
    this.ctx.roundRect(-footPillW / 2, -footPillH / 2, footPillW, footPillH, 8);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.font = `bold ${isLeft ? '12px' : '11px'} "Segoe UI", sans-serif`;
    this.ctx.fillStyle = isLeft ? '#39ff14' : '#64748b';
    this.ctx.fillText(isLeft ? '👟 LEFT FOOT ◀' : '👟 LEFT FOOT', 0, 1);
    this.ctx.restore();

    // Right Foot Badge
    const isRight = currentFoot === 'RIGHT';
    this.ctx.save();
    this.ctx.translate(100, footPillY);
    this.ctx.fillStyle = isRight ? 'rgba(0, 255, 102, 0.25)' : 'rgba(30, 41, 59, 0.6)';
    this.ctx.strokeStyle = isRight ? '#00ff66' : 'rgba(148, 163, 184, 0.3)';
    this.ctx.lineWidth = isRight ? 2.2 : 1.2;
    this.ctx.beginPath();
    this.ctx.roundRect(-footPillW / 2, -footPillH / 2, footPillW, footPillH, 8);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.font = `bold ${isRight ? '12px' : '11px'} "Segoe UI", sans-serif`;
    this.ctx.fillStyle = isRight ? '#39ff14' : '#64748b';
    this.ctx.fillText(isRight ? '▶ RIGHT FOOT 👟' : 'RIGHT FOOT 👟', 0, 1);
    this.ctx.restore();

    this.ctx.restore();
  }

  drawBanner(banner) {
    const { title, subtitle, color = '#ffeb3b', bg = 'rgba(6, 12, 26, 0.92)' } = banner;

    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height * 0.40);

    const bannerWidth = 640;
    const bannerHeight = 116;

    // Broadcast Plaque with angled accent bars
    this.ctx.fillStyle = bg;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3.5;
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 28;

    this.ctx.beginPath();
    this.ctx.roundRect(-bannerWidth / 2, -bannerHeight / 2, bannerWidth, bannerHeight, 16);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    // Side accent stripes
    this.ctx.fillStyle = color;
    this.ctx.fillRect(-bannerWidth / 2 + 12, -bannerHeight / 2 + 14, 6, bannerHeight - 28);
    this.ctx.fillRect(bannerWidth / 2 - 18, -bannerHeight / 2 + 14, 6, bannerHeight - 28);

    // Title
    this.ctx.font = '900 46px "Impact", "Segoe UI", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = color;
    this.ctx.fillText(title, 0, -14);

    // Subtitle
    if (subtitle) {
      this.ctx.font = 'bold 18px "Segoe UI", sans-serif';
      this.ctx.fillStyle = '#f8fafc';
      this.ctx.fillText(subtitle, 0, 28);
    }

    this.ctx.restore();
  }

  updateAndDrawShockwaves() {
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * 0.16;
      sw.alpha -= 0.045;

      if (sw.alpha <= 0) {
        this.shockwaves.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.strokeStyle = sw.color;
      this.ctx.globalAlpha = Math.max(0, sw.alpha);
      this.ctx.lineWidth = 3 * sw.alpha;
      this.ctx.beginPath();
      this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  updateAndDrawParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.rotation += p.rotSpeed;
      p.life -= p.decay;

      if (p.life <= 0 || p.y > this.height) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === 'blade') {
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.size, p.size * 0.35, 0, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
      }

      this.ctx.restore();
    }
  }

  updateAndDrawFloatingTexts() {
    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life -= ft.decay;

      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }

      this.ctx.globalAlpha = Math.max(0, ft.life);
      this.ctx.font = `900 ${ft.size}px "Impact", "Segoe UI", sans-serif`;
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 4;
      this.ctx.strokeText(ft.text, ft.x, ft.y);
      this.ctx.fillStyle = ft.color;
      this.ctx.fillText(ft.text, ft.x, ft.y);
    }

    this.ctx.restore();
  }
}
