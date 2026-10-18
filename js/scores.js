// High Score and Trophy Cabinet Management for Soccer Typing

const STORAGE_KEY = 'soccer_typing_scores_v1';

export const TROPHIES = [
  {
    id: 'rookie_cup',
    title: 'Rookie Trophy',
    subtitle: 'Score 1,000+ pts in Rookie Practice',
    icon: '🥉',
    category: 'difficulty',
    check: (scores) => (scores.shootingPractice?.rookie?.highScore || 0) >= 1000,
  },
  {
    id: 'silver_boot',
    title: 'Silver Striker Boot',
    subtitle: 'Score 2,500+ pts in Semi-Pro Practice',
    icon: '🥈',
    category: 'difficulty',
    check: (scores) => (scores.shootingPractice?.semiPro?.highScore || 0) >= 2500,
  },
  {
    id: 'golden_boot',
    title: 'Golden Boot Award',
    subtitle: 'Score 5,000+ pts in Pro Striker Practice',
    icon: '🥇',
    category: 'difficulty',
    check: (scores) => (scores.shootingPractice?.pro?.highScore || 0) >= 5000,
  },
  {
    id: 'diamond_cup',
    title: 'World Class Legend',
    subtitle: 'Score 8,000+ pts in World Class Practice',
    icon: '💎',
    category: 'difficulty',
    check: (scores) => (scores.shootingPractice?.worldClass?.highScore || 0) >= 8000,
  },
  {
    id: 'corner_specialist',
    title: 'Top Bins Sniper',
    subtitle: 'Score 5+ corner goals in one match',
    icon: '🎯',
    category: 'skill',
    check: (_, lastMatch) => (lastMatch?.cornerGoals || 0) >= 5,
  },
  {
    id: 'goalkeeper_nightmare',
    title: 'Goalkeeper Nightmare',
    subtitle: 'Score 8+ goals out of 10 attempts',
    icon: '⚽',
    category: 'skill',
    check: (_, lastMatch) => (lastMatch?.goals || 0) >= 8,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon Cleats',
    subtitle: 'Exceed 55 WPM in a match',
    icon: '⚡',
    category: 'speed',
    check: (_, lastMatch) => (lastMatch?.wpm || 0) >= 55,
  },
  {
    id: 'perfect_accuracy',
    title: 'Flawless Touch',
    subtitle: 'Finish a match with 100% typing accuracy',
    icon: '💯',
    category: 'accuracy',
    check: (_, lastMatch) => (lastMatch?.accuracy || 0) >= 100 && (lastMatch?.shots || 0) >= 5,
  },
  {
    id: 'streak_master',
    title: 'Hat-Trick & Beyond',
    subtitle: 'Score 5 consecutive goals in a row',
    icon: '🔥',
    category: 'skill',
    check: (_, lastMatch) => (lastMatch?.bestStreak || 0) >= 5,
  },
  {
    id: 'grand_slam',
    title: 'Grand Slam Champion',
    subtitle: 'Set a high score across all 4 practice tiers',
    icon: '👑',
    category: 'mastery',
    check: (scores) => {
      const sp = scores.shootingPractice || {};
      return (sp.rookie?.highScore > 0) &&
             (sp.semiPro?.highScore > 0) &&
             (sp.pro?.highScore > 0) &&
             (sp.worldClass?.highScore > 0);
    }
  }
];

class ScoreManager {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to parse saved scores:', e);
    }

    return {
      version: 1,
      shootingPractice: {
        rookie: { highScore: 0, highWpm: 0, bestAccuracy: 0, bestStreak: 0, goals: 0, shots: 0, date: null },
        semiPro: { highScore: 0, highWpm: 0, bestAccuracy: 0, bestStreak: 0, goals: 0, shots: 0, date: null },
        pro: { highScore: 0, highWpm: 0, bestAccuracy: 0, bestStreak: 0, goals: 0, shots: 0, date: null },
        worldClass: { highScore: 0, highWpm: 0, bestAccuracy: 0, bestStreak: 0, goals: 0, shots: 0, date: null },
      },
      fullSoccerGame: {
        rookie: { highScore: 0, highWpm: 0, bestAccuracy: 0, bestStreak: 0, date: null },
        semiPro: { highScore: 0, highWpm: 0, bestAccuracy: 0, bestStreak: 0, date: null },
        pro: { highScore: 0, highWpm: 0, bestAccuracy: 0, bestStreak: 0, date: null },
        worldClass: { highScore: 0, highWpm: 0, bestAccuracy: 0, bestStreak: 0, date: null },
      },
      unlockedTrophies: {},
      totalGoalsAllTime: 0,
      matchesPlayed: 0
    };
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save scores to localStorage:', e);
    }
  }

  getRecord(mode, difficulty) {
    if (!this.data[mode]) this.data[mode] = {};
    if (!this.data[mode][difficulty]) {
      this.data[mode][difficulty] = {
        highScore: 0,
        highWpm: 0,
        bestAccuracy: 0,
        bestStreak: 0,
        goals: 0,
        shots: 0,
        date: null
      };
    }
    return this.data[mode][difficulty];
  }

  recordMatch(mode, difficulty, matchStats) {
    const record = this.getRecord(mode, difficulty);
    const isNewHighScore = matchStats.score > record.highScore;
    
    if (isNewHighScore) {
      record.highScore = matchStats.score;
      record.date = new Date().toLocaleDateString();
    }
    if (matchStats.wpm > (record.highWpm || 0)) {
      record.highWpm = matchStats.wpm;
    }
    if (matchStats.accuracy > (record.bestAccuracy || 0)) {
      record.bestAccuracy = matchStats.accuracy;
    }
    if (matchStats.bestStreak > (record.bestStreak || 0)) {
      record.bestStreak = matchStats.bestStreak;
    }
    record.goals = (record.goals || 0) + (matchStats.goals || 0);
    record.shots = (record.shots || 0) + (matchStats.shots || 0);

    this.data.matchesPlayed = (this.data.matchesPlayed || 0) + 1;
    this.data.totalGoalsAllTime = (this.data.totalGoalsAllTime || 0) + (matchStats.goals || 0);

    // Check newly unlocked trophies
    const newlyUnlocked = [];
    TROPHIES.forEach(t => {
      if (!this.data.unlockedTrophies[t.id]) {
        try {
          if (t.check(this.data, matchStats)) {
            this.data.unlockedTrophies[t.id] = {
              unlockedAt: new Date().toLocaleDateString(),
              mode,
              difficulty
            };
            newlyUnlocked.push(t);
          }
        } catch (err) {
          console.error('Error evaluating trophy check for', t.id, err);
        }
      }
    });

    this.save();

    return {
      isNewHighScore,
      previousHighScore: record.highScore,
      newlyUnlocked
    };
  }

  isTrophyUnlocked(trophyId) {
    return Boolean(this.data.unlockedTrophies && this.data.unlockedTrophies[trophyId]);
  }

  getTrophyUnlockInfo(trophyId) {
    return this.data.unlockedTrophies ? this.data.unlockedTrophies[trophyId] : null;
  }

  resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = this.load();
  }
}

export const scoreManager = new ScoreManager();
