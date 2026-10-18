// Main Game State Machine and Controller for Soccer Typing

import { sound } from './audio.js';
import { DIFFICULTIES, GOAL_ZONES, generateRoundTargets, generateDribbleWord } from './words.js';
import { scoreManager, TROPHIES } from './scores.js';
import { StadiumRenderer } from './renderer.js';
import { SVG_ASSETS } from './icons.js';

class SoccerTypingGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.renderer = new StadiumRenderer(this.canvas);

    // Game Config & State
    this.mode = 'shootingPractice'; // 'shootingPractice', 'dribblingDrill', or 'fullSoccerGame'
    this.difficultyKey = 'semiPro';
    this.difficulty = DIFFICULTIES.semiPro;

    this.state = 'MENU'; // 'MENU', 'PLAYING', 'ROUND_PAUSE', 'SUMMARY'
    this.matchTotalShots = 10;
    this.currentShot = 1;
    this.score = 0;
    this.goalsCount = 0;
    this.cornerGoals = 0;
    this.streak = 0;
    this.bestStreak = 0;

    // Typing & Round Simulation Data
    this.phase = 'IDLE'; // 'APPROACH', 'TYPING', 'KICKING', 'BALL_FLIGHT', 'CELEBRATION'
    this.targets = [];
    this.activeTargetIndex = -1;
    this.timeRemaining = 0;
    this.timeTotal = 6.0;

    // Dribbling Drill State
    this.dribbleState = null;

    // Keystroke Metrics (WPM & Accuracy)
    this.totalTypedChars = 0;
    this.correctChars = 0;
    this.errorChars = 0;
    this.matchStartTime = 0;

    // Actors Simulation (Ball, Keeper, Striker)
    this.ball = { x: 600, y: 580, scale: 1.0, rotation: 0 };
    this.striker = { x: 530, y: 580, kickFrame: 0 };
    this.keeper = { x: 600, y: 400, diveState: 'IDLE', diveAngle: 0 };
    this.banner = null;
    this.isGoalScored = false;
    this.netBulge = 0;

    // Flight animation state
    this.flightProgress = 0;
    this.flightDuration = 0.55; // seconds
    this.flightStart = { x: 600, y: 580 };
    this.flightTarget = { x: 600, y: 300 };
    this.willScore = true;

    // Timing
    this.lastTimestamp = performance.now();

    // DOM UI Elements
    this.dom = {
      // Screens
      menuScreen: document.getElementById('screen-menu'),
      modeScreen: document.getElementById('screen-mode'),
      diffScreen: document.getElementById('screen-difficulty'),
      gameHud: document.getElementById('game-hud'),
      summaryScreen: document.getElementById('screen-summary'),
      trophyModal: document.getElementById('modal-trophy'),
      rulesModal: document.getElementById('modal-rules'),
      constructionModal: document.getElementById('modal-construction'),

      // HUD Stats
      hudScoreLabel: document.getElementById('hud-score-label'),
      hudScore: document.getElementById('hud-score'),
      hudShotNumber: document.getElementById('hud-shot-number'),
      hudGoalsPill: document.getElementById('hud-goals-pill'),
      hudGoalsLabel: document.getElementById('hud-goals-label'),
      hudGoals: document.getElementById('hud-goals'),
      hudStreakPill: document.getElementById('hud-streak-pill'),
      hudStreak: document.getElementById('hud-streak'),
      hudWpm: document.getElementById('hud-wpm'),
      hudAccuracy: document.getElementById('hud-accuracy'),
      leadUpTimerTitle: document.getElementById('leadup-timer-title'),
      leadUpTimerBar: document.getElementById('leadup-timer-bar'),
      leadUpTimerText: document.getElementById('leadup-timer-text'),

      // Summary Stats
      sumTitle: document.getElementById('sum-title'),
      sumScoreLabel: document.getElementById('sum-score-label'),
      sumFinalScore: document.getElementById('sum-final-score'),
      sumGoalsLabel: document.getElementById('sum-goals-label'),
      sumGoals: document.getElementById('sum-goals'),
      sumWpm: document.getElementById('sum-wpm'),
      sumAccuracy: document.getElementById('sum-accuracy'),
      sumStreakLabel: document.getElementById('sum-streak-label'),
      sumStreak: document.getElementById('sum-streak'),
      sumRatingBadge: document.getElementById('sum-rating-badge'),
      sumHighScoreBadge: document.getElementById('sum-highscore-badge'),
      sumNewTrophiesList: document.getElementById('sum-new-trophies-list'),

      // High scores & specs on 5 difficulty select cards
      diffScreenSubtitle: document.getElementById('diff-screen-subtitle'),
      diffRookieSpecs: document.getElementById('diff-rookie-specs'),
      diffAmateurSpecs: document.getElementById('diff-amateur-specs'),
      diffSemiSpecs: document.getElementById('diff-semipro-specs'),
      diffProSpecs: document.getElementById('diff-pro-specs'),
      diffWorldSpecs: document.getElementById('diff-world-specs'),

      diffRookieScore: document.getElementById('diff-rookie-score'),
      diffAmateurScore: document.getElementById('diff-amateur-score'),
      diffSemiScore: document.getElementById('diff-semipro-score'),
      diffProScore: document.getElementById('diff-pro-score'),
      diffWorldScore: document.getElementById('diff-world-score'),

      // Trophy Grid & Records Table
      trophyRecordsTableWrap: document.getElementById('trophy-records-table-wrap'),
      trophyGrid: document.getElementById('trophy-grid'),
      trophyTotalGoals: document.getElementById('trophy-total-goals'),
      trophyTotalMatches: document.getElementById('trophy-total-matches'),

      // Sound button
      btnSound: document.getElementById('btn-sound-toggle'),
    };

    this.init();
  }

  init() {
    this.renderer.resize();
    window.addEventListener('resize', () => this.renderer.resize());

    this.injectCustomArtAssets();
    this.bindDOMEvents();
    this.bindKeyboardEvents();

    // Start main game loop
    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  injectCustomArtAssets() {
    const map = {
      'hero-crest-slot': SVG_ASSETS.heroCrest,
      'icon-mode-shooting': SVG_ASSETS.modeShooting,
      'icon-mode-dribbling': SVG_ASSETS.modeDribbling,
      'icon-mode-fullgame': SVG_ASSETS.modeFullGame,
      'icon-diff-rookie': SVG_ASSETS.diffRookie,
      'icon-diff-amateur': SVG_ASSETS.diffAmateur,
      'icon-diff-semipro': SVG_ASSETS.diffSemiPro,
      'icon-diff-pro': SVG_ASSETS.diffPro,
      'icon-diff-world': SVG_ASSETS.diffWorldClass,
      'tactical-pitch-diagram': SVG_ASSETS.tacticalChalkboardPitch
    };

    Object.entries(map).forEach(([id, svgHtml]) => {
      const el = document.getElementById(id);
      if (el && svgHtml) {
        el.innerHTML = svgHtml;
      }
    });
  }

  bindDOMEvents() {
    // Menu navigation
    document.getElementById('btn-start-game').addEventListener('click', () => {
      sound.init();
      sound.playWhistle(true);
      this.showScreen('screen-mode');
    });

    document.getElementById('btn-trophy-case').addEventListener('click', () => {
      sound.init();
      this.openTrophyCase();
    });

    document.getElementById('btn-how-to-play').addEventListener('click', () => {
      sound.init();
      this.dom.rulesModal.classList.remove('hidden');
    });

    document.getElementById('btn-close-rules').addEventListener('click', () => {
      this.dom.rulesModal.classList.add('hidden');
    });

    // Mode Selection Buttons
    document.getElementById('btn-mode-shooting').addEventListener('click', () => {
      sound.playKeypress(1.2);
      this.mode = 'shootingPractice';
      this.updateDifficultyHighScores();
      this.showScreen('screen-difficulty');
    });

    const btnDribbling = document.getElementById('btn-mode-dribbling');
    if (btnDribbling) {
      btnDribbling.addEventListener('click', () => {
        sound.playKeypress(1.25);
        this.mode = 'dribblingDrill';
        this.updateDifficultyHighScores();
        this.showScreen('screen-difficulty');
      });
    }

    document.getElementById('btn-mode-fullgame').addEventListener('click', () => {
      sound.playKeypress(0.9);
      this.dom.constructionModal.classList.remove('hidden');
    });

    document.getElementById('btn-close-construction').addEventListener('click', () => {
      this.dom.constructionModal.classList.add('hidden');
    });

    document.getElementById('btn-back-to-menu-from-mode').addEventListener('click', () => {
      this.showScreen('screen-menu');
    });

    document.getElementById('btn-back-to-mode').addEventListener('click', () => {
      this.showScreen('screen-mode');
    });

    // Difficulty Selection Buttons
    document.querySelectorAll('[data-difficulty]').forEach((card) => {
      card.addEventListener('click', () => {
        const diffKey = card.getAttribute('data-difficulty');
        if (DIFFICULTIES[diffKey]) {
          this.difficultyKey = diffKey;
          this.difficulty = DIFFICULTIES[diffKey];
          sound.playWhistle(false);
          this.startMatch();
        }
      });
    });

    // Sound toggle
    this.dom.btnSound.addEventListener('click', () => {
      const isEnabled = sound.toggleSound();
      this.dom.btnSound.innerHTML = isEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
      this.dom.btnSound.classList.toggle('muted', !isEnabled);
    });

    // Fullscreen toggle
    document.getElementById('btn-fullscreen-toggle').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // Trophy Modal Close & Reset
    document.getElementById('btn-close-trophy').addEventListener('click', () => {
      this.dom.trophyModal.classList.add('hidden');
    });
    document.getElementById('btn-reset-scores').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all high scores, best times, and trophies?')) {
        scoreManager.resetAll();
        this.openTrophyCase();
        this.updateDifficultyHighScores();
      }
    });

    // Summary Screen Actions
    document.getElementById('btn-play-again').addEventListener('click', () => {
      sound.playWhistle(true);
      this.startMatch();
    });

    document.getElementById('btn-change-diff').addEventListener('click', () => {
      this.updateDifficultyHighScores();
      this.showScreen('screen-difficulty');
    });

    document.getElementById('btn-summary-trophies').addEventListener('click', () => {
      this.openTrophyCase();
    });

    document.getElementById('btn-summary-menu').addEventListener('click', () => {
      this.showScreen('screen-menu');
    });

    // In-game Exit button
    document.getElementById('btn-hud-exit').addEventListener('click', () => {
      if (confirm('Exit current session?')) {
        this.endMatchEarly();
      }
    });
  }

  showScreen(screenId) {
    const screens = [
      this.dom.menuScreen,
      this.dom.modeScreen,
      this.dom.diffScreen,
      this.dom.summaryScreen,
    ];
    screens.forEach(s => s && s.classList.add('hidden'));

    if (screenId === 'playing') {
      this.dom.gameHud.classList.remove('hidden');
    } else {
      this.dom.gameHud.classList.add('hidden');
      const target = document.getElementById(screenId);
      if (target) target.classList.remove('hidden');
    }
  }

  updateDifficultyHighScores() {
    const isDribble = this.mode === 'dribblingDrill';
    if (this.dom.diffScreenSubtitle) {
      this.dom.diffScreenSubtitle.textContent = isDribble
        ? 'Dribbling Drill • Scales word length & total ball touches to cross the 100m field'
        : 'Shooting Practice • Scales word length, lead-up approach time, and score multiplier';
    }

    const tierConfigs = [
      { key: 'rookie', scoreEl: this.dom.diffRookieScore, specsEl: this.dom.diffRookieSpecs },
      { key: 'amateur', scoreEl: this.dom.diffAmateurScore, specsEl: this.dom.diffAmateurSpecs },
      { key: 'semiPro', scoreEl: this.dom.diffSemiScore, specsEl: this.dom.diffSemiSpecs },
      { key: 'pro', scoreEl: this.dom.diffProScore, specsEl: this.dom.diffProSpecs },
      { key: 'worldClass', scoreEl: this.dom.diffWorldScore, specsEl: this.dom.diffWorldSpecs },
    ];

    tierConfigs.forEach(({ key, scoreEl, specsEl }) => {
      const diff = DIFFICULTIES[key];
      const rec = scoreManager.getRecord(this.mode, key);

      if (specsEl && diff) {
        if (isDribble) {
          specsEl.innerHTML = `
            <b>${diff.dribbleMinLen} – ${diff.dribbleMaxLen} Letters</b><br>
            ${diff.dribbleTouches} Touches (100m)<br>
            No Word Time Limit
          `;
        } else {
          specsEl.innerHTML = `
            <b>${diff.centerMinLen} – ${diff.cornerMaxLen} Letters</b><br>
            ${diff.timeLimit.toFixed(1)}s Lead-Up Time<br>
            Multiplier: ${diff.pointsMultiplier.toFixed(1)}x
          `;
        }
      }

      if (scoreEl) {
        if (isDribble) {
          scoreEl.textContent = rec.bestTime ? `Best Time: ${rec.bestTime.toFixed(2)}s` : 'Best Time: --';
        } else {
          scoreEl.textContent = `Record: ${(rec.highScore || 0).toLocaleString()} pts`;
        }
      }
    });
  }

  openTrophyCase() {
    const records = scoreManager.data;
    const trophies = TROPHIES;

    this.dom.trophyTotalGoals.textContent = records.totalGoalsAllTime || 0;
    this.dom.trophyTotalMatches.textContent = records.matchesPlayed || 0;

    // Populate Personal Bests Table across all 5 Difficulties for both modes
    if (this.dom.trophyRecordsTableWrap) {
      const tiers = [
        { key: 'rookie', label: 'Rookie' },
        { key: 'amateur', label: 'Amateur' },
        { key: 'semiPro', label: 'Semi-Pro' },
        { key: 'pro', label: 'Pro Striker' },
        { key: 'worldClass', label: 'World Class' },
      ];

      let tableHtml = `
        <div class="records-table-title">📊 PERSONAL BEST RECORDS BY MODE & DIFFICULTY</div>
        <table class="records-table">
          <thead>
            <tr>
              <th>Mode</th>
              ${tiers.map(t => `<th>${t.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="color: #ffeb3b;">🎯 Shooting Practice</td>
              ${tiers.map(t => {
                const r = scoreManager.getRecord('shootingPractice', t.key);
                return `<td>${r.highScore > 0 ? `<b style="color:#fff;">${r.highScore.toLocaleString()} pts</b>` : '<span style="color:#64748b;">--</span>'}</td>`;
              }).join('')}
            </tr>
            <tr>
              <td style="color: #00ff66;">🏃 Dribbling Drill (100m)</td>
              ${tiers.map(t => {
                const r = scoreManager.getRecord('dribblingDrill', t.key);
                return `<td>${r.bestTime ? `<b style="color:#00ff66;">${r.bestTime.toFixed(2)}s</b>` : '<span style="color:#64748b;">--</span>'}</td>`;
              }).join('')}
            </tr>
          </tbody>
        </table>
      `;
      this.dom.trophyRecordsTableWrap.innerHTML = tableHtml;
    }

    let html = '';
    trophies.forEach(t => {
      const isUnlocked = scoreManager.isTrophyUnlocked(t.id);
      const unlockInfo = scoreManager.getTrophyUnlockInfo(t.id);
      const customSvg = (SVG_ASSETS.trophies && SVG_ASSETS.trophies[t.id]) ? SVG_ASSETS.trophies[t.id] : t.icon;

      html += `
        <div class="trophy-card ${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="trophy-icon">${customSvg}</div>
          <div class="trophy-info">
            <h4 class="trophy-title">${t.title}</h4>
            <p class="trophy-desc">${t.subtitle}</p>
            <div class="trophy-status">
              ${isUnlocked ? `✔ UNLOCKED (${unlockInfo?.unlockedAt || 'Achieved'})` : '🔒 LOCKED'}
            </div>
          </div>
        </div>
      `;
    });

    this.dom.trophyGrid.innerHTML = html;
    this.dom.trophyModal.classList.remove('hidden');
  }

  // =========================================================================
  // TYPING KEYBOARD INPUT HANDLER
  // =========================================================================
  bindKeyboardEvents() {
    window.addEventListener('keydown', (e) => {
      // Audio unlock on any keypress
      sound.init();

      if (this.state !== 'PLAYING') return;
      if (this.phase !== 'TYPING' && this.phase !== 'APPROACH') return;

      // Ignore modifier keys
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const key = e.key.toUpperCase();

      // Only accept A-Z characters
      if (key.length === 1 && key >= 'A' && key <= 'Z') {
        e.preventDefault();
        this.handleCharInput(key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        this.handleBackspace();
      }
    });
  }

  handleCharInput(char) {
    this.totalTypedChars++;

    // Branch for Dribbling Drill mode
    if (this.mode === 'dribblingDrill') {
      this.handleDribbleCharInput(char);
      this.updateHudMetrics();
      return;
    }

    // Shooting Practice Mode:
    // 1. If no target is locked onto yet: Find target whose word begins with this letter
    if (this.activeTargetIndex === -1) {
      const matchIndex = this.targets.findIndex(t => t.word[0] === char);
      if (matchIndex !== -1) {
        this.activeTargetIndex = matchIndex;
        const target = this.targets[matchIndex];
        target.typedIndex = 1;
        this.correctChars++;
        sound.playKeypress(1.0);

        const coords = this.renderer.getTargetScreenCoords(matchIndex, this.targets);
        this.renderer.spawnTargetKeySpark(coords.x, coords.y, '#00f0ff');

        // Check if 1-letter word (unlikely, but safe)
        if (target.typedIndex >= target.word.length) {
          this.executeShot(target);
        }
      } else {
        // Typo
        this.errorChars++;
        sound.playTypo();
      }
    } else {
      // 2. An active target is already locked
      const target = this.targets[this.activeTargetIndex];
      const expectedChar = target.word[target.typedIndex];

      if (char === expectedChar) {
        target.typedIndex++;
        this.correctChars++;
        const pitchMod = 1.0 + (target.typedIndex / target.word.length) * 0.4;
        sound.playKeypress(pitchMod);

        const coords = this.renderer.getTargetScreenCoords(this.activeTargetIndex, this.targets);
        this.renderer.spawnTargetKeySpark(coords.x, coords.y, '#39ff14');

        // Word completed!
        if (target.typedIndex >= target.word.length) {
          sound.playWordComplete();
          this.executeShot(target);
        }
      } else {
        // Typo on locked word
        this.errorChars++;
        sound.playTypo();
      }
    }

    this.updateHudMetrics();
  }

  handleDribbleCharInput(char) {
    const dState = this.dribbleState;
    if (!dState || !dState.word) return;

    const expectedChar = dState.word[dState.typedIndex];
    if (char === expectedChar) {
      dState.typedIndex++;
      dState.mistypeFlash = 0;
      this.correctChars++;
      const pitchMod = 1.0 + (dState.typedIndex / dState.word.length) * 0.4;
      sound.playKeypress(pitchMod);

      this.renderer.spawnTargetKeySpark(600, 315, '#39ff14');

      // Completed the current dribble word!
      if (dState.typedIndex >= dState.word.length) {
        this.completeDribbleTouch();
      }
    } else {
      // Mistyped letter! Resets the current word so the player must retype it from the beginning
      this.errorChars++;
      dState.mistypesCount++;
      dState.typedIndex = 0;
      dState.mistypeFlash = 1.0;
      this.streak = 0;

      sound.playTypo();
      this.renderer.triggerScreenShake(5);

      if (this.dom.hudGoals) this.dom.hudGoals.textContent = `${dState.mistypesCount}`;
      if (this.dom.hudStreak) this.dom.hudStreak.textContent = `0`;
    }
  }

  handleBackspace() {
    if (this.mode === 'dribblingDrill') {
      if (this.dribbleState && this.dribbleState.typedIndex > 0) {
        this.dribbleState.typedIndex--;
        sound.playKeypress(0.8);
      }
      return;
    }

    if (this.activeTargetIndex === -1) return;
    const target = this.targets[this.activeTargetIndex];
    if (target.typedIndex > 0) {
      target.typedIndex--;
      sound.playKeypress(0.8);
      if (target.typedIndex === 0) {
        // Unlock target so player can change target if desired
        this.activeTargetIndex = -1;
      }
    }
  }

  updateHudMetrics() {
    // Current WPM
    const elapsedMinutes = Math.max((performance.now() - this.matchStartTime) / 60000, 0.05);
    const wpm = Math.round((this.correctChars / 5) / elapsedMinutes);
    const accuracy = this.totalTypedChars > 0 ? Math.round((this.correctChars / this.totalTypedChars) * 100) : 100;

    this.dom.hudWpm.textContent = `${wpm} WPM`;
    this.dom.hudAccuracy.textContent = `${accuracy}% ACC`;
  }

  // =========================================================================
  // MATCH & ROUND FLOW
  // =========================================================================
  startMatch() {
    this.state = 'PLAYING';
    this.currentShot = 1;
    this.score = 0;
    this.goalsCount = 0;
    this.cornerGoals = 0;
    this.streak = 0;
    this.bestStreak = 0;

    this.totalTypedChars = 0;
    this.correctChars = 0;
    this.errorChars = 0;
    this.matchStartTime = performance.now();

    this.showScreen('playing');

    if (this.mode === 'dribblingDrill') {
      this.startDribblingDrill();
    } else {
      if (this.dom.hudScoreLabel) this.dom.hudScoreLabel.textContent = 'Score';
      if (this.dom.hudGoalsLabel) this.dom.hudGoalsLabel.textContent = 'Goals';
      if (this.dom.leadUpTimerTitle) this.dom.leadUpTimerTitle.textContent = '🏃 STRIKER APPROACH RUN';
      this.setupShotRound();
    }
  }

  // =========================================================================
  // DRIBBLING DRILL FLOW
  // =========================================================================
  startDribblingDrill() {
    const totalTouches = this.difficulty.dribbleTouches || 12;
    const startWorldX = 360;
    const totalFieldPixels = 2800; // 100m * 28px/m
    const stepPixels = totalFieldPixels / totalTouches;

    // Create slalom cones from 0m to 100m
    const cones = [];
    for (let i = 0; i <= totalTouches; i++) {
      const worldX = startWorldX + i * stepPixels;
      const yOffset = i === 0 || i === totalTouches ? 0 : (i % 2 === 1 ? -46 : 46);
      cones.push({
        worldX,
        y: 525 + yOffset
      });
    }

    this.dribbleState = {
      totalTouches,
      currentTouch: 0,
      word: generateDribbleWord(this.difficulty),
      typedIndex: 0,
      mistypesCount: 0,
      mistypeFlash: 0,
      elapsedTime: 0,
      cameraX: 0,
      targetCameraX: 0,
      cones,
      playerWorldX: cones[0].worldX - 48,
      playerY: cones[0].y,
      ballWorldX: cones[0].worldX,
      ballY: cones[0].y
    };

    this.phase = 'TYPING';
    this.banner = null;
    this.isGoalScored = false;

    // Position striker & ball on screen
    this.striker = { x: 312, y: cones[0].y, kickFrame: 0 };
    this.ball = { x: 360, y: cones[0].y, scale: 1.0, rotation: 0 };

    // Configure HUD for Dribbling Drill
    if (this.dom.hudScoreLabel) this.dom.hudScoreLabel.textContent = 'Time';
    this.dom.hudScore.textContent = '0.00s';
    this.dom.hudShotNumber.textContent = `TOUCH 1 / ${totalTouches}`;
    if (this.dom.hudGoalsLabel) this.dom.hudGoalsLabel.textContent = 'Resets';
    this.dom.hudGoals.textContent = '0';
    this.dom.hudStreak.textContent = '0';
    if (this.dom.leadUpTimerTitle) this.dom.leadUpTimerTitle.textContent = '⚽ FIELD CROSSING PROGRESS (0m → 100m)';
    this.dom.leadUpTimerBar.style.width = '0%';
    this.dom.leadUpTimerBar.style.backgroundColor = '#00ff66';
    this.dom.leadUpTimerText.textContent = '0m / 100m';

    this.updateHudMetrics();
    sound.playWhistle(true);
  }

  completeDribbleTouch() {
    const dState = this.dribbleState;
    if (!dState) return;

    dState.currentTouch++;
    this.streak++;
    if (this.streak > this.bestStreak) this.bestStreak = this.streak;

    // Trigger kick sound & grass burst
    this.striker.kickFrame = 2;
    setTimeout(() => {
      if (this.striker) this.striker.kickFrame = 0;
    }, 180);

    sound.playKick();
    sound.playWordComplete();
    this.renderer.spawnGrassKick(this.ball.x, this.ball.y, 14);

    // Advance target cone & camera scroll
    const nextCone = dState.cones[Math.min(dState.currentTouch, dState.totalTouches)];
    dState.targetCameraX = nextCone.worldX - 360;

    const metersCrossed = Math.round((dState.currentTouch / dState.totalTouches) * 100);
    this.renderer.addFloatingText(`${metersCrossed}m!`, this.ball.x, this.ball.y - 35, '#00ff66', 26);

    // Update HUD progress bar
    this.dom.leadUpTimerBar.style.width = `${metersCrossed}%`;
    this.dom.leadUpTimerText.textContent = `${metersCrossed}m / 100m`;
    this.dom.hudStreak.textContent = `${this.streak}`;

    if (dState.currentTouch >= dState.totalTouches) {
      // Crossed the 100m finish line!
      this.phase = 'CELEBRATION';
      this.isGoalScored = true;
      dState.word = '';
      sound.playGoal();
      this.renderer.spawnConfetti(90);
      this.renderer.triggerScreenShake(10);

      this.banner = {
        title: 'FINISH LINE! 🏁',
        subtitle: `100m Field Crossed in ${dState.elapsedTime.toFixed(2)}s!`,
        color: '#00ff66',
        bg: 'rgba(0, 35, 15, 0.92)'
      };

      setTimeout(() => {
        this.finishMatch();
      }, 1900);
    } else {
      // Immediately load next touch word
      dState.word = generateDribbleWord(this.difficulty, dState.word);
      dState.typedIndex = 0;
      this.dom.hudShotNumber.textContent = `TOUCH ${dState.currentTouch + 1} / ${dState.totalTouches}`;
    }
  }

  setupShotRound() {
    this.phase = 'TYPING';
    this.isTimeoutShot = false;
    this.timeTotal = this.difficulty.timeLimit;
    this.timeRemaining = this.timeTotal;
    this.activeTargetIndex = -1;
    this.banner = null;
    this.isGoalScored = false;
    this.netBulge = 0;

    // Reset ball & striker
    this.ball = { x: 600, y: 580, scale: 1.0, rotation: 0 };
    this.striker = { x: 530, y: 580, kickFrame: 0 };
    this.keeper = { x: 600, y: 400, diveState: 'IDLE', diveAngle: 0 };

    // Generate targets with distinct words
    this.targets = generateRoundTargets(this.difficulty, GOAL_ZONES);

    // Update HUD
    this.dom.hudScore.textContent = this.score.toLocaleString();
    this.dom.hudShotNumber.textContent = `SHOT ${this.currentShot} / ${this.matchTotalShots}`;
    this.dom.hudGoals.textContent = `${this.goalsCount}`;
    this.dom.hudStreak.textContent = `${this.streak}`;
    this.updateHudMetrics();

    // Whistle to start round
    sound.playWhistle(true);
  }

  executeShot(target) {
    this.phase = 'KICKING';

    // 1. Striker kick animation
    this.striker.kickFrame = 1; // Backswing
    setTimeout(() => {
      this.striker.kickFrame = 2; // Follow through
      sound.playKick();
      this.renderer.spawnGrassKick(this.ball.x, this.ball.y, 14);

      // 2. Launch ball towards target zone
      this.phase = 'BALL_FLIGHT';
      this.flightProgress = 0;
      this.flightStart = { x: this.ball.x, y: this.ball.y };

      const goalBounds = this.renderer.getGoalBounds();
      const targetZoneX = goalBounds.left + target.zone.xPercent * goalBounds.width;
      const targetZoneY = goalBounds.top + target.zone.yPercent * goalBounds.height;
      this.flightTarget = { x: targetZoneX, y: targetZoneY };

      // Determine outcome: corners have high goal probability (~94%).
      // Center has ~65% probability, influenced by time remaining.
      const timeBonusRatio = this.timeRemaining / this.timeTotal;
      const baseProb = target.zone.goalProbability;
      const effectiveProb = Math.min(0.98, baseProb + timeBonusRatio * 0.15);

      this.willScore = Math.random() < effectiveProb;

      // Trigger Goalkeeper Dive AI
      const diveLeft = targetZoneX < goalBounds.centerX;
      const diveAngle = diveLeft ? -0.45 : 0.45;
      this.keeper.diveAngle = diveAngle;

      if (this.willScore) {
        // Keeper dives but is too late / out of reach for corner
        this.keeper.diveState = diveLeft ? 'DIVING_LEFT' : 'DIVING_RIGHT';
        this.keeper.targetX = diveLeft ? goalBounds.centerX - 90 : goalBounds.centerX + 90;
        this.keeper.targetY = targetZoneY + (target.zone.isCorner ? 35 : 15);
      } else {
        // Keeper successfully dives into intercept position
        this.keeper.diveState = diveLeft ? 'DIVING_LEFT' : 'DIVING_RIGHT';
        this.keeper.targetX = targetZoneX + (diveLeft ? 20 : -20);
        this.keeper.targetY = targetZoneY;
      }
    }, 120);
  }

  handleShotTimeout() {
    this.isTimeoutShot = true;
    this.phase = 'KICKING';
    this.striker.kickFrame = 2;
    sound.playKick();

    this.phase = 'BALL_FLIGHT';
    this.flightProgress = 0;
    this.flightStart = { x: this.ball.x, y: this.ball.y };
    // Skied over the crossbar
    this.flightTarget = { x: 600 + (Math.random() - 0.5) * 120, y: 130 };
    this.willScore = false;

    this.streak = 0;
    this.dom.hudStreak.textContent = `${this.streak}`;
  }

  handleTimeoutResult() {
    this.phase = 'CELEBRATION';
    sound.playCrowdGroan(1.2);
    this.renderer.triggerScreenShake(5);
    this.banner = {
      title: "TIME'S UP! ⏱️",
      subtitle: 'Shot skied over the crossbar!',
      color: '#ff3366',
      bg: 'rgba(25, 0, 5, 0.90)'
    };
    this.scheduleNextShot(2200);
  }

  handleShotResult(target) {
    this.phase = 'CELEBRATION';

    if (this.willScore) {
      // === GOAL SCORED! ===
      this.isGoalScored = true;
      this.goalsCount++;
      if (target.zone.isCorner) this.cornerGoals++;
      this.streak++;
      if (this.streak > this.bestStreak) this.bestStreak = this.streak;

      // Calculate Points
      const timeRemainingBonus = Math.round(this.timeRemaining * 100 * this.difficulty.pointsMultiplier);
      const streakMultiplier = 1 + (this.streak - 1) * 0.2;
      const roundPoints = Math.round((target.points + timeRemainingBonus) * streakMultiplier);
      this.score += roundPoints;

      // Visual & Audio effects
      this.netBulge = 1.0;
      sound.playGoal();
      this.renderer.triggerNetRipple(1.35, this.ball.x, this.ball.y);
      this.renderer.triggerScreenShake(14);
      this.renderer.spawnConfetti(90);

      // Floating text popups
      this.renderer.addFloatingText(`+${roundPoints} PTS!`, this.ball.x, this.ball.y - 20, '#00ff66', 32);
      if (target.zone.isCorner) {
        this.renderer.addFloatingText('★ ' + target.zone.badge.replace(' 🎯', ''), this.ball.x, this.ball.y - 60, '#ff0055', 24);
      }
      if (this.streak >= 3) {
        this.renderer.addFloatingText(`🔥 ${this.streak}x STREAK BONUS!`, 600, 320, '#ff9900', 28);
      }

      this.banner = {
        title: 'GOOOAAAL!',
        subtitle: target.zone.isCorner ? `Unstoppable strike into the ${target.zone.shortName}!` : 'Power strike past the keeper!',
        color: '#00ff66',
        bg: 'rgba(0, 35, 15, 0.92)'
      };

      this.keeper.diveState = 'DEFEATED';
    } else {
      // === SAVED OR DEFLECTED ===
      this.streak = 0;
      sound.playSave();
      this.renderer.triggerScreenShake(6);
      this.renderer.spawnShockwave(this.ball.x, this.ball.y, '#facc15', 65);

      this.banner = {
        title: 'SAVED BY KEEPER!',
        subtitle: 'The goalkeeper made a brilliant diving stop!',
        color: '#facc15',
        bg: 'rgba(30, 20, 0, 0.92)'
      };
    }

    // Update HUD
    this.dom.hudScore.textContent = this.score.toLocaleString();
    this.dom.hudGoals.textContent = `${this.goalsCount}`;
    this.dom.hudStreak.textContent = `${this.streak}`;

    this.scheduleNextShot(2400);
  }

  scheduleNextShot(delayMs) {
    setTimeout(() => {
      if (this.currentShot < this.matchTotalShots) {
        this.currentShot++;
        this.setupShotRound();
      } else {
        this.finishMatch();
      }
    }, delayMs);
  }

  finishMatch() {
    this.state = 'SUMMARY';
    this.phase = 'IDLE';
    this.banner = null;

    sound.playWhistle(false);
    setTimeout(() => sound.playFanfare(), 400);

    // Compute metrics
    const elapsedMinutes = Math.max((performance.now() - this.matchStartTime) / 60000, 0.08);
    const finalWpm = Math.round((this.correctChars / 5) / elapsedMinutes);
    const finalAccuracy = this.totalTypedChars > 0 ? Math.round((this.correctChars / this.totalTypedChars) * 100) : 100;

    if (this.mode === 'dribblingDrill' && this.dribbleState) {
      const elapsedTime = Number(this.dribbleState.elapsedTime.toFixed(2));
      const matchStats = {
        elapsedTime,
        touches: this.dribbleState.totalTouches,
        mistypes: this.dribbleState.mistypesCount,
        wpm: finalWpm,
        accuracy: finalAccuracy,
        bestStreak: this.bestStreak
      };

      const result = scoreManager.recordMatch(this.mode, this.difficultyKey, matchStats);

      if (this.dom.sumTitle) this.dom.sumTitle.textContent = 'DRIBBLE DRILL COMPLETE!';
      if (this.dom.sumScoreLabel) this.dom.sumScoreLabel.textContent = 'Total Field Time';
      this.dom.sumFinalScore.textContent = `${elapsedTime.toFixed(2)}s`;
      if (this.dom.sumGoalsLabel) this.dom.sumGoalsLabel.textContent = 'Touches / Resets';
      this.dom.sumGoals.textContent = `${this.dribbleState.totalTouches} (${this.dribbleState.mistypesCount} resets)`;
      this.dom.sumWpm.textContent = `${finalWpm} WPM`;
      this.dom.sumAccuracy.textContent = `${finalAccuracy}%`;
      if (this.dom.sumStreakLabel) this.dom.sumStreakLabel.textContent = 'Clean Touch Streak:';
      this.dom.sumStreak.textContent = `${this.bestStreak} Touches`;

      // Rating badge for Dribbling Drill
      let rating = 'B';
      let ratingColor = '#38bdf8';
      const secPerTouch = elapsedTime / this.dribbleState.totalTouches;
      if (secPerTouch <= 1.8 && this.dribbleState.mistypesCount === 0) {
        rating = 'S+';
        ratingColor = '#ff0055';
      } else if (secPerTouch <= 2.5) {
        rating = 'A';
        ratingColor = '#00ff66';
      } else if (secPerTouch <= 3.8) {
        rating = 'B';
        ratingColor = '#ffb703';
      } else {
        rating = 'C';
        ratingColor = '#94a3b8';
      }
      this.dom.sumRatingBadge.textContent = rating;
      this.dom.sumRatingBadge.style.color = ratingColor;
      this.dom.sumRatingBadge.style.borderColor = ratingColor;

      if (result.isNewHighScore) {
        this.dom.sumHighScoreBadge.textContent = '★ NEW FASTEST FIELD TIME! ★';
        this.dom.sumHighScoreBadge.classList.remove('hidden');
      } else {
        this.dom.sumHighScoreBadge.classList.add('hidden');
      }

      this.renderNewlyUnlockedTrophies(result.newlyUnlocked);
      this.showScreen('screen-summary');
      return;
    }

    // Shooting Practice Summary
    const matchStats = {
      score: this.score,
      goals: this.goalsCount,
      shots: this.matchTotalShots,
      cornerGoals: this.cornerGoals,
      wpm: finalWpm,
      accuracy: finalAccuracy,
      bestStreak: this.bestStreak
    };

    const result = scoreManager.recordMatch(this.mode, this.difficultyKey, matchStats);

    if (this.dom.sumTitle) this.dom.sumTitle.textContent = 'SHOOTOUT FINISHED!';
    if (this.dom.sumScoreLabel) this.dom.sumScoreLabel.textContent = 'Final Score';
    this.dom.sumFinalScore.textContent = this.score.toLocaleString();
    if (this.dom.sumGoalsLabel) this.dom.sumGoalsLabel.textContent = 'Goals Scored';
    this.dom.sumGoals.textContent = `${this.goalsCount} / ${this.matchTotalShots} (${Math.round((this.goalsCount / this.matchTotalShots) * 100)}%)`;
    this.dom.sumWpm.textContent = `${finalWpm} WPM`;
    this.dom.sumAccuracy.textContent = `${finalAccuracy}%`;
    if (this.dom.sumStreakLabel) this.dom.sumStreakLabel.textContent = 'Best Consecutive Goal Streak:';
    this.dom.sumStreak.textContent = `${this.bestStreak} In a Row`;

    // Rating badge (S, A, B, C)
    let rating = 'B';
    let ratingColor = '#38bdf8';
    if (this.goalsCount >= 9 && finalAccuracy >= 90) {
      rating = 'S+';
      ratingColor = '#ff0055';
    } else if (this.goalsCount >= 7) {
      rating = 'A';
      ratingColor = '#00ff66';
    } else if (this.goalsCount >= 5) {
      rating = 'B';
      ratingColor = '#ffb703';
    } else {
      rating = 'C';
      ratingColor = '#94a3b8';
    }
    this.dom.sumRatingBadge.textContent = rating;
    this.dom.sumRatingBadge.style.color = ratingColor;
    this.dom.sumRatingBadge.style.borderColor = ratingColor;

    // High Score Badge
    if (result.isNewHighScore) {
      this.dom.sumHighScoreBadge.textContent = '★ NEW HIGH SCORE RECORD! ★';
      this.dom.sumHighScoreBadge.classList.remove('hidden');
    } else {
      this.dom.sumHighScoreBadge.classList.add('hidden');
    }

    this.renderNewlyUnlockedTrophies(result.newlyUnlocked);
    this.showScreen('screen-summary');
  }

  renderNewlyUnlockedTrophies(newlyUnlocked) {
    if (newlyUnlocked && newlyUnlocked.length > 0) {
      let trophyHtml = '<h4 style="color: #ffeb3b; margin-bottom: 8px;">★ NEW TROPHIES UNLOCKED! ★</h4><div class="new-trophies-row">';
      newlyUnlocked.forEach(t => {
        const customSvg = (SVG_ASSETS.trophies && SVG_ASSETS.trophies[t.id]) ? SVG_ASSETS.trophies[t.id] : t.icon;
        trophyHtml += `
          <div class="new-trophy-pill">
            <span class="pill-icon">${customSvg}</span>
            <span class="pill-title">${t.title}</span>
          </div>
        `;
      });
      trophyHtml += '</div>';
      this.dom.sumNewTrophiesList.innerHTML = trophyHtml;
      this.dom.sumNewTrophiesList.classList.remove('hidden');
    } else {
      this.dom.sumNewTrophiesList.innerHTML = '';
      this.dom.sumNewTrophiesList.classList.add('hidden');
    }
  }

  endMatchEarly() {
    this.state = 'MENU';
    this.phase = 'IDLE';
    this.showScreen('screen-menu');
  }

  // =========================================================================
  // MAIN ANIMATION LOOP
  // =========================================================================
  gameLoop(timestamp) {
    const deltaTime = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
    this.lastTimestamp = timestamp;

    this.update(deltaTime);

    // Render Canvas
    this.renderer.render({
      mode: this.mode,
      state: this.state,
      phase: this.phase,
      targets: this.targets,
      activeTargetIndex: this.activeTargetIndex,
      leadUpRatio: this.timeRemaining / this.timeTotal,
      striker: this.striker,
      keeper: this.keeper,
      ball: this.ball,
      dribbleState: this.dribbleState,
      isGoalScored: this.isGoalScored,
      netBulge: this.netBulge,
      banner: this.banner
    }, deltaTime);

    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  update(dt) {
    if (this.state !== 'PLAYING') return;

    // Branch for Dribbling Drill update loop
    if (this.mode === 'dribblingDrill') {
      this.updateDribblingDrill(dt);
      return;
    }

    // 1. Lead-up Approach & Typing Timer Countdown
    if (this.phase === 'TYPING' || this.phase === 'APPROACH') {
      this.timeRemaining -= dt;

      // Approach animation: striker runs toward ball
      const progress = 1.0 - (this.timeRemaining / this.timeTotal);
      this.striker.x = 480 + progress * 50;

      // Update timer bar HUD
      const pct = Math.max(0, (this.timeRemaining / this.timeTotal) * 100);
      this.dom.leadUpTimerBar.style.width = `${pct}%`;
      this.dom.leadUpTimerText.textContent = `${Math.max(0, this.timeRemaining).toFixed(1)}s`;

      // Warning color shift when under 2 seconds
      if (this.timeRemaining < 2.0) {
        this.dom.leadUpTimerBar.style.backgroundColor = '#ff0055';
      } else {
        this.dom.leadUpTimerBar.style.backgroundColor = '#00ff66';
      }

      // Timeout check
      if (this.timeRemaining <= 0) {
        this.handleShotTimeout();
      }
    }

    // 2. Ball Flight Trajectory Physics
    if (this.phase === 'BALL_FLIGHT') {
      this.flightProgress += dt / this.flightDuration;
      const t = Math.min(1.0, this.flightProgress);

      // Quadratic bezier curve arc
      const p0 = this.flightStart;
      const p2 = this.flightTarget;
      // Arc apex point (higher in the air)
      const p1 = {
        x: (p0.x + p2.x) / 2,
        y: Math.min(p0.y, p2.y) - 90
      };

      const invT = 1 - t;
      this.ball.x = invT * invT * p0.x + 2 * invT * t * p1.x + t * t * p2.x;
      this.ball.y = invT * invT * p0.y + 2 * invT * t * p1.y + t * t * p2.y;

      // Perspective scaling: shrinks from 1.0 down to 0.38 as it flies into the net
      this.ball.scale = 1.0 - t * 0.62;

      // Ball spin rotation
      this.ball.rotation += 14 * dt;

      // Goalkeeper movement interpolation during dive
      if (this.keeper.targetX !== undefined) {
        this.keeper.x += (this.keeper.targetX - this.keeper.x) * (dt * 7.5);
        this.keeper.y += (this.keeper.targetY - this.keeper.y) * (dt * 7.5);
      }

      // When flight reaches target:
      if (t >= 1.0) {
        if (this.isTimeoutShot) {
          this.handleTimeoutResult();
        } else {
          const lockedTarget = (this.activeTargetIndex !== -1 && this.targets[this.activeTargetIndex])
            ? this.targets[this.activeTargetIndex]
            : (this.targets[0] || { zone: GOAL_ZONES[0], points: 100 });
          this.handleShotResult(lockedTarget);
        }
      }
    }

    // Net bulge decay
    if (this.netBulge > 0) {
      this.netBulge *= 0.92;
    }
  }

  updateDribblingDrill(dt) {
    const dState = this.dribbleState;
    if (!dState) return;

    // 1. Increment total elapsed time while actively dribbling
    if (this.phase === 'TYPING' || this.phase === 'KICKING') {
      dState.elapsedTime += dt;
      this.dom.hudScore.textContent = `${dState.elapsedTime.toFixed(2)}s`;
    }

    // 2. Decay mistype red flash
    if (dState.mistypeFlash > 0) {
      dState.mistypeFlash = Math.max(0, dState.mistypeFlash - dt * 2.8);
    }

    // 3. Smoothly interpolate cameraX, ball, and striker toward current cone
    const coneIdx = Math.min(dState.currentTouch, dState.totalTouches);
    const targetCone = dState.cones[coneIdx];

    const prevCameraX = dState.cameraX;
    dState.cameraX += (dState.targetCameraX - dState.cameraX) * Math.min(1, dt * 8.5);
    const cameraDelta = dState.cameraX - prevCameraX;

    // Smoothly move ball & striker vertically along slalom cone path
    this.ball.x = targetCone.worldX - dState.cameraX;
    this.ball.y += (targetCone.y - this.ball.y) * Math.min(1, dt * 10);
    this.ball.rotation += cameraDelta * 0.08;

    this.striker.x = this.ball.x - 48;
    this.striker.y += (targetCone.y - this.striker.y) * Math.min(1, dt * 8.5);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.__SOCCER_TYPING__ = new SoccerTypingGame();
});
