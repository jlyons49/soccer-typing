// High-Performance 2.5D Canvas Stadium & Match Renderer for Soccer Typing

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

    // Crowd simulation data
    this.crowd = [];
    this.initCrowd();

    // Net wobble animation state
    this.netWobble = 0;
    this.netWobbleDecay = 0.94;

    // Particle system (confetti, grass kick, ball sparks)
    this.particles = [];

    // Floating text popups (+1000, "TOP BINS!", etc.)
    this.floatingTexts = [];

    // Screen shake
    this.shakeIntensity = 0;

    // Animation frame tick
    this.tick = 0;
  }

  initCrowd() {
    this.crowd = [];
    const colors = ['#e63946', '#1d3557', '#f1faee', '#a8dadc', '#457b9d', '#ffb703', '#fb8500', '#2a9d8f'];
    for (let row = 0; row < 4; row++) {
      const count = 38;
      for (let i = 0; i < count; i++) {
        this.crowd.push({
          x: (i / count) + (Math.random() * 0.02 - 0.01),
          row,
          color: colors[Math.floor(Math.random() * colors.length)],
          phase: Math.random() * Math.PI * 2,
          isWavingFlag: Math.random() < 0.15,
          flagColor: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
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

  triggerNetRipple(intensity = 1.0) {
    this.netWobble = intensity;
  }

  spawnConfetti(count = 70) {
    const colors = ['#ff0055', '#00e5ff', '#ffeb3b', '#00ff66', '#ffffff', '#ff9900', '#c77dff'];
    for (let i = 0; i < count; i++) {
      const fromLeft = Math.random() < 0.5;
      this.particles.push({
        x: fromLeft ? 40 + Math.random() * 100 : this.width - 40 - Math.random() * 100,
        y: this.height * 0.45 + Math.random() * 80,
        vx: (fromLeft ? 1 : -1) * (4 + Math.random() * 12) + (Math.random() * 4 - 2),
        vy: -(8 + Math.random() * 12),
        gravity: 0.35,
        drag: 0.98,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        life: 1.0,
        decay: 0.008 + Math.random() * 0.008
      });
    }
  }

  spawnGrassKick(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: -(2 + Math.random() * 5),
        gravity: 0.3,
        drag: 0.95,
        color: Math.random() < 0.5 ? '#38b000' : '#70e000',
        size: 3 + Math.random() * 3,
        rotation: 0,
        rotSpeed: 0,
        life: 1.0,
        decay: 0.03
      });
    }
  }

  addFloatingText(text, x, y, color = '#ffeb3b', size = 26) {
    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -2.2,
      color,
      size,
      life: 1.0,
      decay: 0.015
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

    // 1. Draw Sky & Stadium Floodlights
    this.drawSkyAndStadium();

    // 2. Draw Crowd in Stands
    this.drawCrowd(gameState.isGoalScored);

    // 3. Draw Pitch (Grass, lines, penalty box)
    this.drawPitch();

    // 4. Draw Goal Structure & Netting
    const goalBounds = this.getGoalBounds();
    this.drawGoalNet(goalBounds, gameState.netBulge);
    this.drawGoalFrame(goalBounds);

    // 5. Draw Goalkeeper
    this.drawGoalkeeper(goalBounds, gameState.keeper);

    // 6. Draw Targets & Words on Goal (if active)
    if (gameState.phase === 'TYPING' || gameState.phase === 'APPROACH') {
      this.drawTargets(gameState.targets, gameState.activeTargetIndex, gameState.leadUpRatio);
    }

    // 7. Draw Striker (Player kicking character)
    this.drawStriker(gameState.striker);

    // 8. Draw Ball
    this.drawBall(gameState.ball);

    // 9. Update & Draw Particles (Confetti, Grass)
    this.updateAndDrawParticles();

    // 10. Update & Draw Floating Text Popups
    this.updateAndDrawFloatingTexts();

    // 11. Big Banner Overlay (GOAL / SAVED / TIME UP)
    if (gameState.banner) {
      this.drawBanner(gameState.banner);
    }

    this.ctx.restore();
  }

  getGoalBounds() {
    const left = this.width * 0.22;
    const right = this.width * 0.78;
    const top = this.height * 0.20;
    const bottom = this.height * 0.60;
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

  drawSkyAndStadium() {
    // Deep stadium evening sky
    const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.height * 0.35);
    skyGrad.addColorStop(0, '#0a1128');
    skyGrad.addColorStop(0.6, '#1c2541');
    skyGrad.addColorStop(1, '#2e3856');
    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, this.width, this.height * 0.35);

    // Stadium upper roof / arches
    this.ctx.fillStyle = '#141b2d';
    this.ctx.fillRect(0, 0, this.width, 24);

    // Floodlight towers on Left & Right
    this.drawFloodlight(90, 45, 1);
    this.drawFloodlight(this.width - 90, 45, -1);
  }

  drawFloodlight(x, y, dir) {
    // Metal rig
    this.ctx.fillStyle = '#33415c';
    this.ctx.fillRect(x - 14, y, 28, 55);

    // Lights
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const lx = x - 10 + c * 10;
        const ly = y + 8 + r * 16;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(lx, ly, 4, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // Volumetric light beam cone
    const beamGrad = this.ctx.createRadialGradient(x, y + 15, 5, x + dir * 250, y + 300, 350);
    beamGrad.addColorStop(0, 'rgba(255, 255, 220, 0.22)');
    beamGrad.addColorStop(0.4, 'rgba(255, 255, 200, 0.08)');
    beamGrad.addColorStop(1, 'rgba(255, 255, 200, 0)');

    this.ctx.fillStyle = beamGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + 15);
    this.ctx.lineTo(x + dir * 420, this.height * 0.7);
    this.ctx.lineTo(x - dir * 100, this.height * 0.7);
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawCrowd(isGoalCelebration) {
    const standsTop = 32;
    const standsBottom = this.height * 0.22;
    const standsHeight = standsBottom - standsTop;

    // Stands seating tier backgrounds
    this.ctx.fillStyle = '#1f293d';
    this.ctx.fillRect(0, standsTop, this.width, standsHeight);

    // Stadium Advertising Electronic Board at base of stands
    this.drawAdBoard(standsBottom - 16);

    // Render crowd dots / animated fans
    const bounceOffset = isGoalCelebration ? Math.sin(this.tick * 0.3) * 6 : Math.sin(this.tick * 0.05) * 1.5;

    this.crowd.forEach((fan) => {
      const fx = fan.x * this.width;
      const rowY = standsTop + 14 + fan.row * 15;
      const wave = isGoalCelebration ? Math.sin(this.tick * 0.25 + fan.phase) * 5 : 0;
      const fy = rowY + wave + (fan.row === 0 ? bounceOffset : 0);

      // Fan head
      this.ctx.fillStyle = '#f5cac3';
      this.ctx.beginPath();
      this.ctx.arc(fx, fy - 4, 3, 0, Math.PI * 2);
      this.ctx.fill();

      // Fan torso / jersey
      this.ctx.fillStyle = fan.color;
      this.ctx.fillRect(fx - 4, fy - 1, 8, 6);

      // Cheering waving arms/flags
      if (fan.isWavingFlag && isGoalCelebration) {
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(fx + 2, fy - 2);
        this.ctx.lineTo(fx + 6, fy - 14);
        this.ctx.stroke();

        this.ctx.fillStyle = fan.flagColor;
        this.ctx.fillRect(fx + 6, fy - 14, 10, 6);
      }
    });
  }

  drawAdBoard(y) {
    // LED Ribbon Board
    this.ctx.fillStyle = '#0b0f19';
    this.ctx.fillRect(0, y, this.width, 18);
    this.ctx.strokeStyle = '#00f0ff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(0, y, this.width, 18);

    // Dynamic Scrolling Text
    this.ctx.font = 'bold 11px monospace';
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';

    const text = '★ SOCCER TYPING 2026 ★ HEFTY RACCOON ARCADE ★ TOP BINS ONLY ★ PRACTICE MAKES PERFECT ★';
    const scrollX = -(this.tick * 1.2) % 600;
    for (let i = 0; i < 3; i++) {
      this.ctx.fillText(text, scrollX + i * 600, y + 9);
    }
  }

  drawPitch() {
    const pitchTop = this.height * 0.22;
    const pitchHeight = this.height - pitchTop;

    // Grass Base with 2.5D perspective mowed stripes
    const stripes = 9;
    const stripeColors = ['#236b25', '#1d5a1f'];

    for (let i = 0; i < stripes; i++) {
      const y1 = pitchTop + (i / stripes) * pitchHeight;
      const y2 = pitchTop + ((i + 1) / stripes) * pitchHeight;
      this.ctx.fillStyle = stripeColors[i % 2];
      this.ctx.fillRect(0, y1, this.width, y2 - y1);
    }

    // Grass texture shading gradient (darker near goal, lighter near viewer)
    const pitchGrad = this.ctx.createLinearGradient(0, pitchTop, 0, this.height);
    pitchGrad.addColorStop(0, 'rgba(0,0,0,0.3)');
    pitchGrad.addColorStop(0.5, 'rgba(0,0,0,0.05)');
    pitchGrad.addColorStop(1, 'rgba(255,255,255,0.08)');
    this.ctx.fillStyle = pitchGrad;
    this.ctx.fillRect(0, pitchTop, this.width, pitchHeight);

    // Pitch Field Markings (Crisp white chalk lines with perspective)
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    this.ctx.lineWidth = 3.5;

    // Goal line (horizontal)
    const goalLineY = this.height * 0.58;
    this.ctx.beginPath();
    this.ctx.moveTo(this.width * 0.08, goalLineY);
    this.ctx.lineTo(this.width * 0.92, goalLineY);
    this.ctx.stroke();

    // 6-Yard Box
    this.ctx.beginPath();
    this.ctx.moveTo(this.width * 0.28, goalLineY);
    this.ctx.lineTo(this.width * 0.24, goalLineY + 35);
    this.ctx.lineTo(this.width * 0.76, goalLineY + 35);
    this.ctx.lineTo(this.width * 0.72, goalLineY);
    this.ctx.stroke();

    // 18-Yard Penalty Box
    this.ctx.beginPath();
    this.ctx.moveTo(this.width * 0.18, goalLineY);
    this.ctx.lineTo(this.width * 0.10, this.height * 0.88);
    this.ctx.lineTo(this.width * 0.90, this.height * 0.88);
    this.ctx.lineTo(this.width * 0.82, goalLineY);
    this.ctx.stroke();

    // Penalty Arc (D-Box curve outside penalty box)
    this.ctx.beginPath();
    this.ctx.arc(this.width * 0.5, this.height * 0.88, 75, Math.PI * 0.15, Math.PI * 0.85);
    this.ctx.stroke();

    // Penalty Spot (12 yards from goal line)
    const penSpotX = this.width * 0.5;
    const penSpotY = this.height * 0.78;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(penSpotX, penSpotY, 4.5, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawGoalNet(bounds, netBulge = 0) {
    const { left, right, top, bottom, width, height } = bounds;

    // Net depth rear posts (3D box shape behind the goal line)
    const rearDepth = 48;
    const rearScale = 0.92;
    const rearLeft = left + (width * (1 - rearScale)) / 2;
    const rearRight = right - (width * (1 - rearScale)) / 2;
    const rearTop = top - rearDepth * 0.5;
    const rearBottom = bottom - rearDepth * 0.4;

    // Net interior shadow
    this.ctx.fillStyle = 'rgba(10, 30, 15, 0.45)';
    this.ctx.beginPath();
    this.ctx.moveTo(left, top);
    this.ctx.lineTo(right, top);
    this.ctx.lineTo(rearRight, rearTop);
    this.ctx.lineTo(rearLeft, rearTop);
    this.ctx.closePath();
    this.ctx.fill();

    // Net mesh grid with wobble when ball hits
    const wobbleOffset = Math.sin(this.tick * 0.4) * (this.netWobble * 18);
    this.netWobble *= this.netWobbleDecay;

    this.ctx.strokeStyle = 'rgba(235, 245, 255, 0.48)';
    this.ctx.lineWidth = 1.0;

    // Vertical net cords
    const vSteps = 24;
    for (let i = 0; i <= vSteps; i++) {
      const u = i / vSteps;
      const frontX = left + u * width;
      const backX = rearLeft + u * (rearRight - rearLeft) + (u > 0.3 && u < 0.7 ? wobbleOffset * 0.5 : 0);

      this.ctx.beginPath();
      // Roof cord
      this.ctx.moveTo(frontX, top);
      this.ctx.lineTo(backX, rearTop);
      // Back wall cord
      this.ctx.lineTo(backX, rearBottom + (netBulge * 14));
      this.ctx.stroke();
    }

    // Horizontal net cords
    const hSteps = 12;
    for (let j = 0; j <= hSteps; j++) {
      const v = j / hSteps;
      const backY = rearTop + v * (rearBottom - rearTop) + (v > 0.2 && v < 0.8 ? wobbleOffset : 0);

      this.ctx.beginPath();
      this.ctx.moveTo(rearLeft, backY);
      this.ctx.lineTo(rearRight, backY);
      this.ctx.stroke();
    }

    // Diagonal net mesh cross-hatching
    const diagSteps = 16;
    for (let k = -diagSteps; k <= diagSteps; k++) {
      this.ctx.beginPath();
      this.ctx.moveTo(rearLeft + (k / diagSteps) * (rearRight - rearLeft), rearTop);
      this.ctx.lineTo(rearLeft + ((k + diagSteps) / diagSteps) * (rearRight - rearLeft), rearBottom);
      this.ctx.stroke();
    }
  }

  drawGoalFrame(bounds) {
    const { left, right, top, bottom } = bounds;
    const postWidth = 12;

    // Post shadow on ground
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    this.ctx.beginPath();
    this.ctx.ellipse(left, bottom, 18, 6, 0, 0, Math.PI * 2);
    this.ctx.ellipse(right, bottom, 18, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // 3D White Posts & Crossbar with realistic cylindrical lighting
    const drawCylinder = (x1, y1, x2, y2, thickness) => {
      const isVertical = x1 === x2;
      const grad = isVertical
        ? this.ctx.createLinearGradient(x1 - thickness/2, y1, x1 + thickness/2, y1)
        : this.ctx.createLinearGradient(x1, y1 - thickness/2, x1, y1 + thickness/2);

      grad.addColorStop(0, '#a0aab8');
      grad.addColorStop(0.2, '#f0f4f8');
      grad.addColorStop(0.5, '#ffffff');
      grad.addColorStop(0.85, '#e2e8f0');
      grad.addColorStop(1, '#64748b');

      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = thickness;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    };

    // Left Post
    drawCylinder(left, top, left, bottom, postWidth);
    // Right Post
    drawCylinder(right, top, right, bottom, postWidth);
    // Crossbar
    drawCylinder(left - 2, top, right + 2, top, postWidth);

    // Goal Post Joints / Corners
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(left, top, postWidth * 0.65, 0, Math.PI * 2);
    this.ctx.arc(right, top, postWidth * 0.65, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawGoalkeeper(bounds, keeper) {
    const { left, right, top, bottom, centerX } = bounds;
    
    // Keeper position calculation
    const currentX = keeper ? keeper.x : centerX;
    const currentY = keeper ? keeper.y : bottom - 55;
    const diveState = keeper ? keeper.diveState : 'IDLE'; // 'IDLE', 'DIVING_LEFT', 'DIVING_RIGHT', 'SAVED', 'DEFEATED'
    const diveAngle = keeper ? keeper.diveAngle || 0 : 0;

    this.ctx.save();
    this.ctx.translate(currentX, currentY);
    this.ctx.rotate(diveAngle);

    // Shadow under keeper
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 48, 26, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Idle bounce
    const bounce = diveState === 'IDLE' ? Math.sin(this.tick * 0.15) * 3 : 0;

    // Body parts
    // Legs
    this.ctx.strokeStyle = '#1e293b';
    this.ctx.lineWidth = 8;
    this.ctx.lineCap = 'round';

    if (diveState === 'IDLE') {
      // Left leg
      this.ctx.beginPath();
      this.ctx.moveTo(-9, 12);
      this.ctx.lineTo(-14, 46);
      this.ctx.stroke();
      // Right leg
      this.ctx.beginPath();
      this.ctx.moveTo(9, 12);
      this.ctx.lineTo(14, 46);
      this.ctx.stroke();
    } else {
      // Extended legs in dive
      this.ctx.beginPath();
      this.ctx.moveTo(-6, 10);
      this.ctx.lineTo(-24, 48);
      this.ctx.moveTo(6, 10);
      this.ctx.lineTo(2, 48);
      this.ctx.stroke();
    }

    // Cleats / boots
    this.ctx.fillStyle = '#f59e0b';
    if (diveState === 'IDLE') {
      this.ctx.fillRect(-18, 44, 9, 5);
      this.ctx.fillRect(10, 44, 9, 5);
    } else {
      this.ctx.fillRect(-28, 46, 8, 5);
      this.ctx.fillRect(-2, 46, 8, 5);
    }

    // Goalkeeper Jersey (Fluorescent Yellow/Neon Green)
    this.ctx.fillStyle = '#ccff00';
    this.ctx.beginPath();
    this.ctx.roundRect(-16, -18 + bounce, 32, 34, 5);
    this.ctx.fill();

    // Jersey detail / squad number "1"
    this.ctx.fillStyle = '#0f172a';
    this.ctx.font = 'bold 16px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('1', 0, 0 + bounce);

    // Head / Face
    this.ctx.fillStyle = '#ffcca5';
    this.ctx.beginPath();
    this.ctx.arc(0, -28 + bounce, 11, 0, Math.PI * 2);
    this.ctx.fill();

    // Hair
    this.ctx.fillStyle = '#4a2810';
    this.ctx.beginPath();
    this.ctx.arc(0, -32 + bounce, 11, Math.PI, Math.PI * 2);
    this.ctx.fill();

    // Eyes / Expression
    this.ctx.fillStyle = '#000000';
    if (diveState === 'DEFEATED') {
      // Surprised eyes > <
      this.ctx.font = 'bold 9px sans-serif';
      this.ctx.fillText('x x', 0, -28 + bounce);
    } else {
      this.ctx.beginPath();
      this.ctx.arc(-4, -28 + bounce, 1.5, 0, Math.PI * 2);
      this.ctx.arc(4, -28 + bounce, 1.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Arms & Gloves
    this.ctx.strokeStyle = '#ccff00';
    this.ctx.lineWidth = 7;
    this.ctx.lineCap = 'round';

    if (diveState === 'IDLE') {
      // Ready stance (arms bent out with open gloves)
      this.ctx.beginPath();
      this.ctx.moveTo(-16, -10 + bounce);
      this.ctx.lineTo(-28, -6 + bounce);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(16, -10 + bounce);
      this.ctx.lineTo(28, -6 + bounce);
      this.ctx.stroke();

      // Goalkeeper Gloves (Large Red Gloves)
      this.ctx.fillStyle = '#ef4444';
      this.ctx.beginPath();
      this.ctx.arc(-30, -6 + bounce, 7, 0, Math.PI * 2);
      this.ctx.arc(30, -6 + bounce, 7, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      // Outstretched diving reach
      this.ctx.beginPath();
      this.ctx.moveTo(-12, -12 + bounce);
      this.ctx.lineTo(-38, -38 + bounce);
      this.ctx.moveTo(12, -12 + bounce);
      this.ctx.lineTo(-24, -42 + bounce);
      this.ctx.stroke();

      // Gloves reaching for ball
      this.ctx.fillStyle = '#ef4444';
      this.ctx.beginPath();
      this.ctx.arc(-40, -42 + bounce, 8, 0, Math.PI * 2);
      this.ctx.arc(-26, -46 + bounce, 8, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  drawStriker(striker) {
    // Striker approach / kicking animation
    const sx = striker ? striker.x : this.width * 0.44;
    const sy = striker ? striker.y : this.height * 0.77;
    const kickFrame = striker ? striker.kickFrame : 0; // 0 = ready/approach, 1 = swing, 2 = strike, 3 = follow through

    this.ctx.save();
    this.ctx.translate(sx, sy);

    // Striker Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 40, 22, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Striker Jersey (Royal Blue / Gold)
    this.ctx.fillStyle = '#2563eb';
    this.ctx.beginPath();
    this.ctx.roundRect(-14, -14, 28, 32, 4);
    this.ctx.fill();

    // Striker Shorts (White)
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(-12, 16, 24, 14);

    // Striker Head
    this.ctx.fillStyle = '#fed7aa';
    this.ctx.beginPath();
    this.ctx.arc(0, -24, 10, 0, Math.PI * 2);
    this.ctx.fill();

    // Hair
    this.ctx.fillStyle = '#1c1917';
    this.ctx.beginPath();
    this.ctx.arc(0, -28, 10, Math.PI, Math.PI * 2);
    this.ctx.fill();

    // Legs & Kicking Motion
    this.ctx.strokeStyle = '#fed7aa';
    this.ctx.lineWidth = 7;
    this.ctx.lineCap = 'round';

    if (kickFrame === 0) {
      // Approach run stance
      this.ctx.beginPath();
      this.ctx.moveTo(-6, 28);
      this.ctx.lineTo(-10, 42);
      this.ctx.moveTo(6, 28);
      this.ctx.lineTo(12, 42);
      this.ctx.stroke();

      // Red cleats
      this.ctx.fillStyle = '#dc2626';
      this.ctx.fillRect(-14, 40, 8, 5);
      this.ctx.fillRect(10, 40, 8, 5);
    } else if (kickFrame === 1) {
      // Backswing
      this.ctx.beginPath();
      this.ctx.moveTo(-6, 28);
      this.ctx.lineTo(-4, 42); // Plant foot
      this.ctx.moveTo(6, 28);
      this.ctx.lineTo(24, 30); // Kicking leg cocked back
      this.ctx.stroke();

      this.ctx.fillStyle = '#dc2626';
      this.ctx.fillRect(-8, 40, 8, 5);
      this.ctx.fillRect(24, 28, 8, 5);
    } else {
      // Follow through strike
      this.ctx.beginPath();
      this.ctx.moveTo(-6, 28);
      this.ctx.lineTo(-10, 42);
      this.ctx.moveTo(6, 28);
      this.ctx.lineTo(26, 16); // High kick follow-through
      this.ctx.stroke();

      this.ctx.fillStyle = '#dc2626';
      this.ctx.fillRect(-14, 40, 8, 5);
      this.ctx.fillRect(26, 12, 8, 5);
    }

    this.ctx.restore();
  }

  drawBall(ball) {
    if (!ball) return;
    const { x, y, scale = 1.0, rotation = 0 } = ball;
    const radius = 16 * scale;

    this.ctx.save();
    this.ctx.translate(x, y);

    // Ball shadow (projected to pitch level)
    const groundY = this.height * 0.78;
    const shadowDist = (groundY - y) * 0.25;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    this.ctx.beginPath();
    this.ctx.ellipse(0, shadowDist + radius * 0.8, radius * 1.1, radius * 0.45, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Rotate ball for spin
    this.ctx.rotate(rotation);

    // Ball base sphere
    const ballGrad = this.ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius);
    ballGrad.addColorStop(0, '#ffffff');
    ballGrad.addColorStop(0.75, '#e2e8f0');
    ballGrad.addColorStop(1, '#94a3b8');

    this.ctx.fillStyle = ballGrad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Classic black pentagon soccer ball patches
    this.ctx.fillStyle = '#0f172a';

    // Center pentagon
    this.drawPentagon(0, 0, radius * 0.42);

    // Surrounding partial pentagons
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const px = Math.cos(angle) * radius * 0.82;
      const py = Math.sin(angle) * radius * 0.82;
      this.drawPentagon(px, py, radius * 0.32);
    }

    // Outer rim stroke
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = Math.max(1, scale * 1.5);
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

  // Draw floating target crosshairs and words on the goal
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

      // Fade out non-locked targets if player has started typing another word
      if (hasFocus) {
        this.ctx.globalAlpha = 0.32;
      }

      // 1. Target Crosshair Ring
      const pulse = Math.sin(this.tick * 0.12 + idx) * 3;
      const baseRadius = (zone.isCorner ? 26 : 22) + pulse;

      // Glow behind target
      this.ctx.shadowColor = isCurrent ? '#00f0ff' : zone.color;
      this.ctx.shadowBlur = isCurrent ? 20 : 10;

      // Crosshair outer circle
      this.ctx.strokeStyle = isCurrent ? '#00f0ff' : zone.color;
      this.ctx.lineWidth = isCurrent ? 3 : 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
      this.ctx.stroke();

      // Crosshair ticks
      const tickLen = 6;
      this.ctx.beginPath();
      this.ctx.moveTo(-baseRadius - tickLen, 0);
      this.ctx.lineTo(-baseRadius + 4, 0);
      this.ctx.moveTo(baseRadius + tickLen, 0);
      this.ctx.lineTo(baseRadius - 4, 0);
      this.ctx.moveTo(0, -baseRadius - tickLen);
      this.ctx.lineTo(0, -baseRadius + 4);
      this.ctx.moveTo(0, baseRadius + tickLen);
      this.ctx.lineTo(0, baseRadius - 4);
      this.ctx.stroke();

      this.ctx.shadowBlur = 0;

      // 2. Corner badge indicator
      if (zone.isCorner) {
        this.ctx.fillStyle = '#ff0055';
        this.ctx.font = 'bold 10px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('★ CORNER ★', 0, -baseRadius - 12);
      }

      // 3. Word Banner Box
      this.ctx.font = 'bold 22px "Segoe UI", Roboto, monospace';
      const word = t.word;
      const typedLen = t.typedIndex || 0;
      const textWidth = this.ctx.measureText(word).width;
      const boxWidth = Math.max(textWidth + 28, 90);
      const boxHeight = 36;
      const boxY = baseRadius + 10;

      // Box backdrop
      this.ctx.fillStyle = isCurrent ? 'rgba(0, 20, 45, 0.92)' : 'rgba(15, 23, 42, 0.88)';
      this.ctx.strokeStyle = isCurrent ? '#00f0ff' : (zone.isCorner ? '#ff3366' : '#38bdf8');
      this.ctx.lineWidth = isCurrent ? 2.5 : 1.5;

      this.ctx.beginPath();
      this.ctx.roundRect(-boxWidth / 2, boxY, boxWidth, boxHeight, 8);
      this.ctx.fill();
      this.ctx.stroke();

      // 4. Render Word Letters (Typed in bright Neon Green / Gold, Untyped in Crisp White)
      let curX = -textWidth / 2;
      this.ctx.textBaseline = 'middle';
      this.ctx.textAlign = 'left';

      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        const isTyped = i < typedLen;
        const charWidth = this.ctx.measureText(char).width;

        if (isTyped) {
          // Typed glowing character
          this.ctx.fillStyle = '#39ff14';
          this.ctx.shadowColor = '#39ff14';
          this.ctx.shadowBlur = 10;
        } else {
          // Untyped character
          this.ctx.fillStyle = isCurrent ? '#ffffff' : '#e2e8f0';
          this.ctx.shadowBlur = 0;
        }

        this.ctx.fillText(char, curX, boxY + boxHeight / 2);
        curX += charWidth;
      }
      this.ctx.shadowBlur = 0;

      // 5. Points badge below word
      this.ctx.font = 'bold 11px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#facc15';
      this.ctx.fillText(`+${t.points} PTS`, 0, boxY + boxHeight + 14);

      this.ctx.restore();
    });
  }

  drawBanner(banner) {
    const { title, subtitle, color = '#ffeb3b', bg = 'rgba(0, 0, 0, 0.82)' } = banner;

    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height * 0.40);

    const bannerWidth = 620;
    const bannerHeight = 110;

    // Background plaque
    this.ctx.fillStyle = bg;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 4;
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 25;

    this.ctx.beginPath();
    this.ctx.roundRect(-bannerWidth / 2, -bannerHeight / 2, bannerWidth, bannerHeight, 16);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.shadowBlur = 0;

    // Title
    this.ctx.font = '900 48px "Segoe UI", Impact, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = color;
    this.ctx.fillText(title, 0, -12);

    // Subtitle
    if (subtitle) {
      this.ctx.font = 'bold 18px "Segoe UI", sans-serif';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(subtitle, 0, 28);
    }

    this.ctx.restore();
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
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
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
      this.ctx.font = `900 ${ft.size}px "Segoe UI", Impact, sans-serif`;
      this.ctx.fillStyle = ft.color;
      this.ctx.shadowColor = '#000000';
      this.ctx.shadowBlur = 8;
      this.ctx.fillText(ft.text, ft.x, ft.y);
    }

    this.ctx.restore();
  }
}
