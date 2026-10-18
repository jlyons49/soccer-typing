// Word Dictionaries and Target Word Selector for Soccer Typing

export const DIFFICULTIES = {
  rookie: {
    id: 'rookie',
    name: 'Rookie',
    subtitle: 'Entry Level • Short words & generous time',
    icon: '🥉',
    timeLimit: 8.5, // seconds lead-up time
    targetCount: 4, // 4 targets (Top Left, Top Right, Bottom Left, Bottom Right)
    centerMinLen: 3,
    centerMaxLen: 3,
    cornerMinLen: 4,
    cornerMaxLen: 4,
    pointsMultiplier: 1.0,
    keeperReaction: 0.50, // Keeper has 50% max reach speed
  },
  semiPro: {
    id: 'semiPro',
    name: 'Semi-Pro',
    subtitle: 'Intermediate • Balanced words & medium pace',
    icon: '🥈',
    timeLimit: 6.0,
    targetCount: 5, // 5 targets (+ Center)
    centerMinLen: 4,
    centerMaxLen: 5,
    cornerMinLen: 6,
    cornerMaxLen: 7,
    pointsMultiplier: 1.5,
    keeperReaction: 0.65,
  },
  pro: {
    id: 'pro',
    name: 'Pro Striker',
    subtitle: 'Advanced • Fast pace & longer vocabulary',
    icon: '🥇',
    timeLimit: 4.5,
    targetCount: 5,
    centerMinLen: 6,
    centerMaxLen: 7,
    cornerMinLen: 8,
    cornerMaxLen: 9,
    pointsMultiplier: 2.2,
    keeperReaction: 0.80,
  },
  worldClass: {
    id: 'worldClass',
    name: 'World Class',
    subtitle: 'Legendary • Intense speed & master words',
    icon: '💎',
    timeLimit: 3.2,
    targetCount: 5,
    centerMinLen: 7,
    centerMaxLen: 9,
    cornerMinLen: 10,
    cornerMaxLen: 13,
    pointsMultiplier: 3.5,
    keeperReaction: 0.92,
  }
};

// Target zone configurations on the goal
export const GOAL_ZONES = [
  {
    id: 'topLeft',
    name: 'Top Left Corner',
    shortName: 'Top Left',
    xPercent: 0.16,
    yPercent: 0.22,
    isCorner: true,
    scoreMultiplier: 1.75,
    goalProbability: 0.94, // Corners are harder to save!
    badge: 'TOP BINS 🎯',
    color: '#ff3366',
  },
  {
    id: 'topRight',
    name: 'Top Right Corner',
    shortName: 'Top Right',
    xPercent: 0.84,
    yPercent: 0.22,
    isCorner: true,
    scoreMultiplier: 1.75,
    goalProbability: 0.94,
    badge: 'UPPER 90 🎯',
    color: '#ff3366',
  },
  {
    id: 'center',
    name: 'Center High',
    shortName: 'Center',
    xPercent: 0.50,
    yPercent: 0.38,
    isCorner: false,
    scoreMultiplier: 1.0,
    goalProbability: 0.65, // Goalie can reach easier if slow
    badge: 'POWER STRIKE ⚡',
    color: '#00e5ff',
  },
  {
    id: 'bottomLeft',
    name: 'Bottom Left',
    shortName: 'Low Left',
    xPercent: 0.18,
    yPercent: 0.74,
    isCorner: true,
    scoreMultiplier: 1.45,
    goalProbability: 0.88,
    badge: 'SIDE NETTING 🎯',
    color: '#ff9900',
  },
  {
    id: 'bottomRight',
    name: 'Bottom Right',
    shortName: 'Low Right',
    xPercent: 0.82,
    yPercent: 0.74,
    isCorner: true,
    scoreMultiplier: 1.45,
    goalProbability: 0.88,
    badge: 'SIDE NETTING 🎯',
    color: '#ff9900',
  }
];

// Rich word banks categorized by length and theme
const WORD_POOLS = {
  3: [
    'ACE', 'AIM', 'BOX', 'CUP', 'FAN', 'FIT', 'FLY', 'FOG', 'FOX', 'GET',
    'HAT', 'HIT', 'HOP', 'HOT', 'ICE', 'JAM', 'JOG', 'JOY', 'KEY', 'KID',
    'LEG', 'MAP', 'MUD', 'NET', 'NUT', 'OAK', 'PAD', 'PEN', 'PIN', 'POP',
    'RAP', 'RED', 'RIB', 'ROD', 'ROW', 'RUG', 'RUN', 'SET', 'SKY', 'SUN',
    'TAP', 'TEA', 'TIE', 'TIP', 'TOP', 'TOY', 'VAN', 'VET', 'WAR', 'WEB',
    'WET', 'WIN', 'YAK', 'YES', 'ZIP'
  ],
  4: [
    'BALL', 'BOOT', 'CAMP', 'CHIP', 'CLUB', 'CROW', 'DASH', 'DIVE', 'DRAW', 'DROP',
    'FAST', 'FIRE', 'FLAG', 'FOUL', 'GAME', 'GLOW', 'GOAL', 'GRIP', 'HALT', 'HEAD',
    'HERO', 'HIGH', 'HOOP', 'JUMP', 'KICK', 'LEAP', 'LINE', 'LION', 'LUCK', 'MARK',
    'MATE', 'MOVE', 'PACE', 'PASS', 'PEAK', 'PLAY', 'POST', 'PUSH', 'RACE', 'RUSH',
    'SAVE', 'SHOT', 'SLAM', 'SOAR', 'SPIN', 'SPOT', 'STAR', 'TEAM', 'TRIP', 'TURF',
    'WAVE', 'WIND', 'WING', 'YARD', 'ZOOM'
  ],
  5: [
    'ARENA', 'BENCH', 'BLAST', 'BLOCK', 'BOOTS', 'CHAMP', 'CHEST', 'CLEAT', 'COACH',
    'CURVE', 'DODGE', 'DRIFT', 'DRIVE', 'FIELD', 'FINAL', 'FIRST', 'FLICK', 'FORCE',
    'GLORY', 'GRASS', 'GUARD', 'HONOR', 'MATCH', 'POWER', 'PITCH', 'RADAR', 'REPLY',
    'ROAR', 'ROUND', 'SCORE', 'SERVE', 'SHINE', 'SHOOT', 'SMART', 'SPEED', 'SQUAD',
    'STAND', 'SWEEP', 'SWIFT', 'TITLE', 'TOUCH', 'TRACK', 'VALOR', 'VAULT', 'WHITE',
    'WORLD', 'YOUTH'
  ],
  6: [
    'ACTION', 'AGILITY', 'ATTACK', 'BANNER', 'CENTER', 'CHANCE', 'CHARGE', 'CLEATS',
    'CORNER', 'DEFEND', 'DIRECT', 'ENERGY', 'FLIGHT', 'FLYING', 'GOALIE', 'HEADER',
    'IMPACT', 'JERSEY', 'KICKER', 'LEAGUE', 'LEGEND', 'MASTER', 'MOTION', 'OFFSIDE',
    'PRACTICE', 'RECORD', 'REFLEX', 'SEASON', 'SECURE', 'SHIELD', 'SOCCER', 'SPIRIT',
    'STRIKE', 'TACKLE', 'TARGET', 'VICTOR', 'VOLLEY', 'WHISTLE'
  ],
  7: [
    'ATHLETE', 'CAPTAIN', 'DEFENSE', 'DRIBBLE', 'DYNAMIC', 'FORWARD', 'HANDBALL',
    'HEROICS', 'KICKOFF', 'MIDFIELD', 'OUTSIDE', 'PASSING', 'PLAYOFF', 'PUNALTY',
    'REFLECS', 'REFEREE', 'RUNNING', 'SCORING', 'SHOOTER', 'SPECIAL', 'STADIUM',
    'STRIKER', 'SURGING', 'TACTICS', 'THROUGH', 'TRAINER', 'TRIUMPH', 'UPRIGHT',
    'VICTORY', 'WARMUP', 'WINNERS'
  ],
  8: [
    'CHAMPION', 'CROSSBAR', 'DECISIVE', 'DEFENDER', 'DOMINANT', 'DRIBBLER', 'ENDURANCE',
    'EQUALIZER', 'FASTBREAK', 'FIREBALL', 'FOOTWORK', 'HALFBACK', 'HATTRICK', 'MAGICIAN',
    'OVERHEAD', 'OVERTIME', 'PATIENCE', 'PENALTY', 'POWERFUL', 'REACTION', 'SHOOTOUT',
    'SHOWCASE', 'SKILLFUL', 'TEAMMATE', 'UPPERCUT', 'VELOCITY', 'VOLLEYING'
  ],
  9: [
    'BACKHEEL', 'BRILLIANT', 'CROSSOVER', 'DEFENDING', 'EXCELLENCE', 'HIGHLIGHT',
    'LINEUP', 'MIDFIELDER', 'OFFENSIVE', 'OPPONENT', 'PLAYMAKER', 'PRECISION',
    'REBOUNDER', 'SCISSORS', 'SHOOTINGS', 'SPECTATOR', 'STRATEGIC', 'SUBSTITUTE',
    'SWERVED', 'TECHNIQUE', 'WORLDWIDE'
  ],
  10: [
    'AGGRESSIVE', 'BICYCLEKICK', 'CHALLENGING', 'CHAMPIONSHIP', 'CLEANSHEET',
    'CONFIDENCE', 'GOALSCORER', 'HEADTOHEAD', 'LEADERSHIP', 'LEGENDARY',
    'NUTMEGGING', 'PENALTYBOX', 'PERFECTION', 'PLAYGROUND', 'POSSESSION',
    'QUICKTHINK', 'RELENTLESS', 'SPECTACULAR', 'TEAMSPIRIT', 'TOURNAMENT'
  ],
  11: [
    'ACCELERATION', 'CORNERKICKS', 'COUNTERATTACK', 'EXTRAORDINARY', 'GOLDENBOOT',
    'GOALKEEPING', 'INSPIRATION', 'MASTERPIECE', 'OUTSTANDING', 'PERFORMANCE',
    'SPORTSMANSHIP', 'SUPERSTRIKER', 'TACTICALPLAY', 'UNSTOPPABLE'
  ],
  12: [
    'CHAMPIONSHIPS', 'DETERMINATION', 'INTERNATIONAL', 'PROFESSIONAL', 'REPRESENTATIVE',
    'SPECTACULARLY', 'SUBSTITUTION', 'UNBEATABLE', 'WORLDCLASS'
  ]
};

// Fallback generator for lengths
function getWordsOfLength(len) {
  if (WORD_POOLS[len]) return WORD_POOLS[len];
  // Find nearest pool
  const keys = Object.keys(WORD_POOLS).map(Number).sort((a,b) => a-b);
  if (len < keys[0]) return WORD_POOLS[keys[0]];
  return WORD_POOLS[keys[keys.length - 1]];
}

// Generate distinct target words for a shot round
export function generateRoundTargets(difficultyConfig, zonesList = GOAL_ZONES) {
  const diff = difficultyConfig;
  const targetCount = diff.targetCount || 4;
  const activeZones = zonesList.slice(0, targetCount);

  const chosenTargets = [];
  const usedFirstLetters = new Set();
  const usedWords = new Set();

  activeZones.forEach(zone => {
    let minLen = zone.isCorner ? diff.cornerMinLen : diff.centerMinLen;
    let maxLen = zone.isCorner ? diff.cornerMaxLen : diff.centerMaxLen;
    
    // Pick length
    const targetLen = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen;
    const pool = getWordsOfLength(targetLen);

    // Shuffle pool
    const candidates = [...pool].sort(() => Math.random() - 0.5);

    let selectedWord = null;
    // Prefer word whose first letter is not already used
    for (const w of candidates) {
      const firstChar = w[0].toUpperCase();
      if (!usedFirstLetters.has(firstChar) && !usedWords.has(w)) {
        selectedWord = w;
        break;
      }
    }

    // Fallback if all initial letters collided
    if (!selectedWord) {
      for (const w of candidates) {
        if (!usedWords.has(w)) {
          selectedWord = w;
          break;
        }
      }
    }

    if (!selectedWord) {
      selectedWord = candidates[0] || 'GOAL';
    }

    usedFirstLetters.add(selectedWord[0].toUpperCase());
    usedWords.add(selectedWord);

    // Base point calculation: 100 points per letter * zone multiplier * difficulty multiplier
    const basePoints = Math.round(selectedWord.length * 100 * zone.scoreMultiplier * diff.pointsMultiplier);

    chosenTargets.push({
      zone,
      word: selectedWord.toUpperCase(),
      typedIndex: 0,
      points: basePoints,
      isCompleted: false,
      isLocked: false
    });
  });

  return chosenTargets;
}
