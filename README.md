# ⚽ Soccer Typing: Striker Challenge

An arcade soccer computer game designed to teach touch typing and speed, inspired by classic typing games like *Slam Dunk Typing*.

Playable directly in the web browser with zero install and zero external dependencies, integrated into the [Hefty Raccoon Game Portal](https://game.heftyracoon.com).

---

## 🎮 Game Modes

### 1. 🎯 Shooting Practice (Active)
- **10-Shot Shootout Match**: Dribble up to the penalty spot with a dynamic lead-up countdown timer.
- **Corner Targeting**: 
  - **Top Bins / Upper 90** & **Side Netting** feature longer, more challenging words with a **1.45x - 1.75x score multiplier** and **~94% goal chance** because the goalkeeper cannot easily reach them!
  - **Center Power Strikes** feature shorter words, but the goalkeeper has an easier time making a save unless you type fast!
- **Dynamic Physics & Effects**: 3D perspective ball flight, net rippling, confetti cannons, screen shake, and synthesized Web Audio sound effects (kicks, whistles, crowd roar, net rustle).

### 2. 🚧 Full Soccer Match (Under Construction)
- Full 11v11 pitch gameplay currently in active development.
- Passing combinations, through balls, sliding defensive tackles, and tournament matches.
- Interactive tactical chalkboard and roadmap available to view in-game.

---

## ⚡ Scalable Difficulty Tiers

| Difficulty | Word Length | Lead-Up Time | Points Multiplier | Goalkeeper Reaction |
|---|---|---|---|---|
| 🥉 **Rookie** | 3 – 4 letters | 8.5 seconds | 1.0x | Relaxed |
| 🥈 **Semi-Pro** | 4 – 7 letters | 6.0 seconds | 1.5x | Moderate |
| 🥇 **Pro Striker** | 6 – 9 letters | 4.5 seconds | 2.2x | Fast |
| 💎 **World Class** | 7 – 13 letters | 3.2 seconds | 3.5x | Lightning |

---

## 🏆 Trophy Case & Career Stats

- Persistent high score and career statistics saved in `localStorage`.
- Tracks:
  - High score per mode and difficulty
  - Words Per Minute (WPM) & Typing Accuracy %
  - Longest consecutive goal streak
  - Career goals scored & matches played
- **10 Unlockable Achievements & Trophies**:
  - 🥉 *Rookie Trophy* (1,000+ pts)
  - 🥈 *Silver Striker Boot* (2,500+ pts)
  - 🥇 *Golden Boot Award* (5,000+ pts)
  - 💎 *World Class Legend* (8,000+ pts)
  - 🎯 *Top Bins Sniper* (5+ corner goals in a match)
  - ⚽ *Goalkeeper Nightmare* (8+ goals out of 10)
  - ⚡ *Speed Demon Cleats* (55+ WPM)
  - 💯 *Flawless Touch* (100% typing accuracy)
  - 🔥 *Hat-Trick & Beyond* (5-goal streak)
  - 👑 *Grand Slam Champion* (High score on all 4 difficulties)

---

## 🛠 Tech Stack

- **Pure ES6+ JavaScript Modules** (`js/game.js`, `js/renderer.js`, `js/words.js`, `js/scores.js`, `js/audio.js`)
- **HTML5 2.5D Canvas**: Perspective grass pitch, 3D goal frame, dynamic net simulation, goalkeeper dive animations, ball rotation and scaling.
- **Web Audio API**: 100% synthesized procedural sound effects (referee whistle, ball kick, net swish, crowd cheer, goalkeeper saves, and keyboard clicks) with zero external audio assets.
- **CSS3 Responsive Stadium Layout**: Retro-arcade scoreboard typography and responsive canvas container.

---

## 🚀 Deployment

The repository includes a GitHub Actions deploy workflow (`.github/workflows/deploy.yml`) that syncs production files via `rsync` over SSH into `/var/www/html/games/soccer-typing` on the `server-game-manager` server.
