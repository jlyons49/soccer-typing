// Custom Vector SVG Art Asset Library for Soccer Typing: Striker Challenge
// Replaces generic emojis with bespoke multi-layered vector illustrations, crests, and trophies

export const SVG_ASSETS = {
  // Main Menu Hero Crest
  heroCrest: `
    <svg class="hero-crest-svg" viewBox="0 0 160 160" width="110" height="110" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shieldGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fffbeb"/>
          <stop offset="30%" stop-color="#facc15"/>
          <stop offset="70%" stop-color="#ca8a04"/>
          <stop offset="100%" stop-color="#854d0e"/>
        </linearGradient>
        <linearGradient id="shieldInner" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="50%" stop-color="#1e3a8a"/>
          <stop offset="100%" stop-color="#090d16"/>
        </linearGradient>
        <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00f0ff"/>
          <stop offset="100%" stop-color="#3b82f6"/>
        </linearGradient>
        <radialGradient id="ballGradHero" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="65%" stop-color="#e2e8f0"/>
          <stop offset="100%" stop-color="#64748b"/>
        </radialGradient>
        <filter id="crestGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#00f0ff" flood-opacity="0.45"/>
        </filter>
      </defs>

      <!-- Outer Wings -->
      <g filter="url(#crestGlow)">
        <path d="M 32 55 L 4 38 L 16 62 L 6 70 L 24 82 L 14 92 L 38 98 Z" fill="url(#wingGrad)" opacity="0.9"/>
        <path d="M 128 55 L 156 38 L 144 62 L 154 70 L 136 82 L 146 92 L 122 98 Z" fill="url(#wingGrad)" opacity="0.9"/>

        <!-- Shield Outer Frame -->
        <path d="M 80 14 L 132 32 C 132 82 118 122 80 148 C 42 122 28 82 28 32 Z" fill="url(#shieldGold)" stroke="#fef08a" stroke-width="2"/>
        <!-- Shield Inner Field -->
        <path d="M 80 22 L 124 37 C 124 80 112 114 80 138 C 48 114 36 80 36 37 Z" fill="url(#shieldInner)" stroke="#eab308" stroke-width="1.5"/>

        <!-- Pitch Stripes inside Shield -->
        <path d="M 46 85 L 114 85 L 104 112 L 56 112 Z" fill="#15803d" opacity="0.5"/>
        <path d="M 56 112 L 104 112 L 80 135 Z" fill="#166534" opacity="0.6"/>

        <!-- Target Crosshair Ring Behind Ball -->
        <circle cx="80" cy="78" r="32" fill="none" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.75"/>
        <line x1="42" y1="78" x2="118" y2="78" stroke="#00f0ff" stroke-width="1.2" opacity="0.5"/>
        <line x1="80" y1="40" x2="80" y2="116" stroke="#00f0ff" stroke-width="1.2" opacity="0.5"/>

        <!-- 3D Soccer Ball -->
        <circle cx="80" cy="78" r="24" fill="url(#ballGradHero)" stroke="#1e293b" stroke-width="1.8"/>
        <polygon points="80,66 91,74 87,87 73,87 69,74" fill="#0f172a"/>
        <polygon points="80,54 86,60 74,60" fill="#0f172a"/>
        <polygon points="103,70 97,76 101,84" fill="#0f172a"/>
        <polygon points="94,98 91,90 99,88" fill="#0f172a"/>
        <polygon points="66,98 69,90 61,88" fill="#0f172a"/>
        <polygon points="57,70 63,76 59,84" fill="#0f172a"/>
        <!-- Seam connections -->
        <line x1="80" y1="66" x2="80" y2="58" stroke="#334155" stroke-width="1.2"/>
        <line x1="91" y1="74" x2="98" y2="74" stroke="#334155" stroke-width="1.2"/>
        <line x1="87" y1="87" x2="92" y2="94" stroke="#334155" stroke-width="1.2"/>
        <line x1="73" y1="87" x2="68" y2="94" stroke="#334155" stroke-width="1.2"/>
        <line x1="69" y1="74" x2="62" y2="74" stroke="#334155" stroke-width="1.2"/>

        <!-- Championship Top Stars -->
        <polygon points="80,26 83,32 90,33 85,38 86,44 80,41 74,44 75,38 70,33 77,32" fill="#facc15"/>
        <polygon points="58,34 60,38 65,39 61,42 62,47 58,44 54,47 55,42 51,39 56,38" fill="#facc15"/>
        <polygon points="102,34 104,38 109,39 105,42 106,47 102,44 98,47 99,42 95,39 100,38" fill="#facc15"/>

        <!-- Bottom Ribbon Banner -->
        <path d="M 34 118 Q 80 132 126 118 L 132 132 Q 80 146 28 132 Z" fill="url(#shieldGold)" stroke="#713f12" stroke-width="1.5"/>
        <text x="80" y="131" font-family="Impact, sans-serif" font-size="11" fill="#0f172a" text-anchor="middle" letter-spacing="1.5">STRIKER FC</text>
      </g>
    </svg>
  `,

  // Mode Icons
  modeShooting: `
    <svg viewBox="0 0 80 80" width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="netFrame" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f8fafc"/>
          <stop offset="100%" stop-color="#94a3b8"/>
        </linearGradient>
      </defs>
      <!-- Goal Frame -->
      <path d="M 10 58 L 10 18 L 70 18 L 70 58" fill="none" stroke="url(#netFrame)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Net Grid -->
      <path d="M 14 22 L 66 22 M 14 32 L 66 32 M 14 42 L 66 42 M 14 52 L 66 52 M 24 20 L 24 56 M 36 20 L 36 56 M 48 20 L 48 56 M 60 20 L 60 56" stroke="#38bdf8" stroke-width="1" opacity="0.4"/>
      <!-- Top Right Target Bullseye -->
      <circle cx="56" cy="28" r="12" fill="rgba(255,0,85,0.2)" stroke="#ff0055" stroke-width="2.5"/>
      <circle cx="56" cy="28" r="6" fill="none" stroke="#ffeb3b" stroke-width="2"/>
      <circle cx="56" cy="28" r="2.5" fill="#00ff66"/>
      <!-- Flaming Soccer Ball Trail -->
      <path d="M 18 68 Q 34 45 53 31" fill="none" stroke="#00f0ff" stroke-width="3" stroke-dasharray="4,2"/>
      <circle cx="22" cy="64" r="10" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
      <polygon points="22,59 26,62 24,67 20,67 18,62" fill="#0f172a"/>
    </svg>
  `,

  modeFullGame: `
    <svg viewBox="0 0 80 80" width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <!-- Pitch -->
      <rect x="8" y="14" width="64" height="52" rx="5" fill="#15803d" stroke="#bbf7d0" stroke-width="2.5"/>
      <line x1="40" y1="14" x2="40" y2="66" stroke="#bbf7d0" stroke-width="2"/>
      <circle cx="40" cy="40" r="10" fill="none" stroke="#bbf7d0" stroke-width="2"/>
      <rect x="8" y="27" width="10" height="26" fill="none" stroke="#bbf7d0" stroke-width="2"/>
      <rect x="62" y="27" width="10" height="26" fill="none" stroke="#bbf7d0" stroke-width="2"/>
      <!-- Tactical Nodes & Arrows -->
      <path d="M 22 50 L 38 30 L 58 38" fill="none" stroke="#ffeb3b" stroke-width="2.5" stroke-dasharray="3,2"/>
      <circle cx="22" cy="50" r="4.5" fill="#38bdf8" stroke="#fff" stroke-width="1.5"/>
      <circle cx="38" cy="30" r="4.5" fill="#38bdf8" stroke="#fff" stroke-width="1.5"/>
      <circle cx="58" cy="38" r="5" fill="#ff0055" stroke="#fff" stroke-width="1.5"/>
    </svg>
  `,

  // Difficulty Tier Badges
  diffRookie: `
    <svg viewBox="0 0 64 64" width="54" height="54" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bronzeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fdba74"/>
          <stop offset="50%" stop-color="#d97706"/>
          <stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
      </defs>
      <path d="M 32 6 L 54 16 C 54 38 46 50 32 58 C 18 50 10 38 10 16 Z" fill="url(#bronzeGrad)" stroke="#fed7aa" stroke-width="2"/>
      <path d="M 32 12 L 48 20 C 48 36 42 45 32 52 C 22 45 16 36 16 20 Z" fill="#451a03" opacity="0.4"/>
      <polygon points="32,18 36,27 46,28 38,35 40,45 32,40 24,45 26,35 18,28 28,27" fill="#fed7aa"/>
    </svg>
  `,

  diffSemiPro: `
    <svg viewBox="0 0 64 64" width="54" height="54" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="silverGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="#94a3b8"/>
          <stop offset="100%" stop-color="#334155"/>
        </linearGradient>
      </defs>
      <path d="M 32 6 L 54 16 C 54 38 46 50 32 58 C 18 50 10 38 10 16 Z" fill="url(#silverGrad)" stroke="#f8fafc" stroke-width="2"/>
      <path d="M 32 12 L 48 20 C 48 36 42 45 32 52 C 22 45 16 36 16 20 Z" fill="#0f172a" opacity="0.45"/>
      <polygon points="32,15 35,23 44,24 37,30 39,39 32,34 25,39 27,30 20,24 29,23" fill="#e2e8f0"/>
      <polygon points="22,38 24,42 28,42 25,45 26,49 22,46 18,49 19,45 16,42 20,42" fill="#38bdf8"/>
      <polygon points="42,38 44,42 48,42 45,45 46,49 42,46 38,49 39,45 36,42 40,42" fill="#38bdf8"/>
    </svg>
  `,

  diffPro: `
    <svg viewBox="0 0 64 64" width="54" height="54" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="50%" stop-color="#eab308"/>
          <stop offset="100%" stop-color="#854d0e"/>
        </linearGradient>
      </defs>
      <!-- Wings -->
      <path d="M 12 22 L 2 14 L 6 28 L 2 34 L 14 38 Z" fill="#facc15"/>
      <path d="M 52 22 L 62 14 L 58 28 L 62 34 L 50 38 Z" fill="#facc15"/>
      <path d="M 32 6 L 54 16 C 54 38 46 50 32 58 C 18 50 10 38 10 16 Z" fill="url(#goldGrad)" stroke="#fef9c3" stroke-width="2"/>
      <path d="M 32 12 L 48 20 C 48 36 42 45 32 52 C 22 45 16 36 16 20 Z" fill="#713f12" opacity="0.45"/>
      <polygon points="32,14 36,24 47,25 39,32 41,43 32,37 23,43 25,32 17,25 28,24" fill="#ffffff"/>
    </svg>
  `,

  diffWorldClass: `
    <svg viewBox="0 0 64 64" width="54" height="54" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="diamondGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e0f2fe"/>
          <stop offset="35%" stop-color="#38bdf8"/>
          <stop offset="70%" stop-color="#818cf8"/>
          <stop offset="100%" stop-color="#c084fc"/>
        </linearGradient>
      </defs>
      <!-- Halo Rays -->
      <circle cx="32" cy="32" r="28" fill="none" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="4,3"/>
      <!-- Diamond Octagon -->
      <polygon points="32,4 54,18 58,36 32,60 6,36 10,18" fill="url(#diamondGrad)" stroke="#ffffff" stroke-width="2"/>
      <!-- Facets -->
      <polygon points="32,10 46,20 32,32 18,20" fill="#ffffff" opacity="0.5"/>
      <polygon points="18,20 32,32 32,54 12,34" fill="#0284c7" opacity="0.35"/>
      <polygon points="46,20 52,34 32,54 32,32" fill="#7e22ce" opacity="0.35"/>
      <polygon points="32,16 35,25 44,26 37,32 39,41 32,36 25,41 27,32 20,26 29,25" fill="#ffffff"/>
    </svg>
  `,

  // =========================================================================
  // 10 BESPOKE TROPHY ILLUSTRATIONS
  // =========================================================================
  trophies: {
    rookie_cup: `
      <svg viewBox="0 0 64 64" width="52" height="52" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tBronze" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fed7aa"/>
            <stop offset="50%" stop-color="#ea580c"/>
            <stop offset="100%" stop-color="#7c2d12"/>
          </linearGradient>
        </defs>
        <!-- Handles -->
        <path d="M 18 18 C 8 18 8 32 20 34" fill="none" stroke="url(#tBronze)" stroke-width="3.5"/>
        <path d="M 46 18 C 56 18 56 32 44 34" fill="none" stroke="url(#tBronze)" stroke-width="3.5"/>
        <!-- Cup Bowl -->
        <path d="M 16 12 L 48 12 C 48 32 40 40 32 40 C 24 40 16 32 16 12 Z" fill="url(#tBronze)" stroke="#ffedd5" stroke-width="1.5"/>
        <!-- Stem & Base -->
        <rect x="29" y="40" width="6" height="10" fill="url(#tBronze)"/>
        <rect x="20" y="50" width="24" height="6" rx="2" fill="#431407" stroke="#ea580c" stroke-width="1.5"/>
        <polygon points="32,18 34,23 40,24 36,28 37,33 32,30 27,33 28,28 24,24 30,23" fill="#ffedd5"/>
      </svg>
    `,
    silver_boot: `
      <svg viewBox="0 0 64 64" width="52" height="52" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tSilver" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="55%" stop-color="#94a3b8"/>
            <stop offset="100%" stop-color="#475569"/>
          </linearGradient>
        </defs>
        <!-- Pedestal -->
        <rect x="12" y="48" width="40" height="8" rx="2" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>
        <!-- Cleat Boot -->
        <path d="M 18 16 L 32 16 L 34 30 L 52 36 C 55 37 56 42 52 43 L 16 43 C 14 43 14 36 15 30 Z" fill="url(#tSilver)" stroke="#f8fafc" stroke-width="1.5"/>
        <!-- Stripes -->
        <path d="M 26 22 L 32 38 M 32 22 L 38 38" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Studs -->
        <rect x="18" y="43" width="4" height="4" fill="#cbd5e1"/>
        <rect x="25" y="43" width="4" height="4" fill="#cbd5e1"/>
        <rect x="40" y="43" width="4" height="4" fill="#cbd5e1"/>
        <rect x="47" y="43" width="4" height="4" fill="#cbd5e1"/>
      </svg>
    `,
    golden_boot: `
      <svg viewBox="0 0 64 64" width="52" height="52" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tGoldBoot" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fef9c3"/>
            <stop offset="45%" stop-color="#facc15"/>
            <stop offset="100%" stop-color="#a16207"/>
          </linearGradient>
        </defs>
        <!-- Glow -->
        <circle cx="32" cy="30" r="24" fill="rgba(250,204,21,0.18)"/>
        <!-- Pedestal -->
        <rect x="10" y="49" width="44" height="8" rx="2" fill="#422006" stroke="#facc15" stroke-width="1.5"/>
        <!-- Winged Golden Boot -->
        <path d="M 16 16 L 30 16 L 33 29 L 52 35 C 56 36 56 42 52 43 L 15 43 C 13 43 13 35 14 28 Z" fill="url(#tGoldBoot)" stroke="#fef08a" stroke-width="1.5"/>
        <!-- Wing on Ankle -->
        <path d="M 14 22 L 4 16 L 8 24 L 4 28 L 14 30 Z" fill="#fef08a"/>
        <!-- Studs -->
        <rect x="17" y="43" width="4" height="5" fill="#eab308"/>
        <rect x="24" y="43" width="4" height="5" fill="#eab308"/>
        <rect x="40" y="43" width="4" height="5" fill="#eab308"/>
        <rect x="47" y="43" width="4" height="5" fill="#eab308"/>
        <!-- Star -->
        <polygon points="26,24 28,28 32,28 29,31 30,35 26,32 22,35 23,31 20,28 24,28" fill="#ffffff"/>
      </svg>
    `,
    diamond_cup: `
      <svg viewBox="0 0 64 64" width="52" height="52" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tDiamond" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="35%" stop-color="#38bdf8"/>
            <stop offset="70%" stop-color="#a855f7"/>
            <stop offset="100%" stop-color="#ec4899"/>
          </linearGradient>
        </defs>
        <circle cx="32" cy="28" r="22" fill="none" stroke="#00f0ff" stroke-width="1.2" stroke-dasharray="3,3"/>
        <path d="M 18 10 L 46 10 L 52 22 L 32 42 L 12 22 Z" fill="url(#tDiamond)" stroke="#ffffff" stroke-width="1.5"/>
        <polygon points="32,10 42,22 32,42 22,22" fill="#ffffff" opacity="0.35"/>
        <rect x="28" y="41" width="8" height="9" fill="url(#tDiamond)"/>
        <rect x="18" y="50" width="28" height="7" rx="3" fill="#0f172a" stroke="#00f0ff" stroke-width="1.5"/>
      </svg>
    `,
    corner_specialist: `
      <svg viewBox="0 0 64 64" width="52" height="52" xmlns="http://www.w3.org/2000/svg">
        <!-- Goal Corner Angle -->
        <path d="M 12 52 L 12 12 L 52 12" fill="none" stroke="#f8fafc" stroke-width="5" stroke-linecap="round"/>
        <!-- Bullseye Rings -->
        <circle cx="36" cy="34" r="18" fill="rgba(255,0,85,0.2)" stroke="#ff0055" stroke-width="2.5"/>
        <circle cx="36" cy="34" r="11" fill="none" stroke="#ffeb3b" stroke-width="2.5"/>
        <circle cx="36" cy="34" r="5" fill="#00ff66"/>
        <!-- Crosshair Lines -->
        <line x1="14" y1="34" x2="58" y2="34" stroke="#00f0ff" stroke-width="1.5"/>
        <line x1="36" y1="12" x2="36" y2="56" stroke="#00f0ff" stroke-width="1.5"/>
      </svg>
    `,
    goalkeeper_nightmare: `
      <svg viewBox="0 0 64 64" width="52" height="52" xmlns="http://www.w3.org/2000/svg">
        <!-- Fiery Aura -->
        <path d="M 32 6 C 48 14 56 30 48 48 C 40 58 24 58 16 48 C 8 30 16 14 32 6 Z" fill="rgba(239,68,68,0.2)" stroke="#ef4444" stroke-width="1.5"/>
        <!-- Soccer Ball -->
        <circle cx="32" cy="34" r="17" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
        <polygon points="32,25 40,31 37,40 27,40 24,31" fill="#0f172a"/>
        <!-- Lightning Cracks -->
        <path d="M 14 14 L 26 26 M 50 14 L 38 26 M 14 52 L 25 42 M 50 52 L 39 42" stroke="#facc15" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    `,
    speed_demon: `
      <svg viewBox="0 0 64 64" width="52" height="52" xmlns="http://www.w3.org/2000/svg">
        <!-- Speed Lines -->
        <line x1="4" y1="22" x2="22" y2="22" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="2" y1="32" x2="18" y2="32" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="6" y1="42" x2="24" y2="42" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
        <!-- High Voltage Lightning Bolt -->
        <polygon points="38,6 18,34 32,34 24,58 50,28 35,28" fill="#facc15" stroke="#ffffff" stroke-width="1.5"/>
      </svg>
    `,
    perfect_accuracy: `
      <svg viewBox="0 0 64 64" width="52" height="52" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="24" fill="rgba(0,255,102,0.15)" stroke="#00ff66" stroke-width="2.5"/>
        <circle cx="32" cy="32" r="18" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4,2"/>
        <text x="32" y="37" font-family="Impact, sans-serif" font-size="16" fill="#ffffff" text-anchor="middle">100%</text>
        <polygon points="32,8 34,13 39,13 35,16 36,21 32,18 28,21 29,16 25,13 30,13" fill="#facc15"/>
      </svg>
    `,
    streak_master: `
      <svg viewBox="0 0 64 64" width="52" height="52" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="flameGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stop-color="#dc2626"/>
            <stop offset="55%" stop-color="#f97316"/>
            <stop offset="100%" stop-color="#fef08a"/>
          </linearGradient>
        </defs>
        <!-- Outer Flame -->
        <path d="M 32 6 C 42 18 54 26 50 42 C 48 52 40 58 32 58 C 24 58 16 52 14 42 C 10 26 22 22 24 14 C 26 20 28 14 32 6 Z" fill="url(#flameGrad)"/>
        <!-- Inner Mini Ball -->
        <circle cx="32" cy="41" r="12" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/>
        <polygon points="32,35 37,39 35,45 29,45 27,39" fill="#0f172a"/>
      </svg>
    `,
    grand_slam: `
      <svg viewBox="0 0 64 64" width="52" height="52" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="crownGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="50%" stop-color="#eab308"/>
            <stop offset="100%" stop-color="#a16207"/>
          </linearGradient>
        </defs>
        <!-- Royal Crown -->
        <path d="M 8 46 L 12 20 L 24 32 L 32 14 L 40 32 L 52 20 L 56 46 Z" fill="url(#crownGrad)" stroke="#fef9c3" stroke-width="2" stroke-linejoin="round"/>
        <rect x="8" y="46" width="48" height="7" rx="2" fill="#854d0e" stroke="#facc15" stroke-width="1.5"/>
        <!-- Crown Jewels -->
        <circle cx="12" cy="18" r="3" fill="#00f0ff"/>
        <circle cx="32" cy="12" r="3.5" fill="#ff0055"/>
        <circle cx="52" cy="18" r="3" fill="#00f0ff"/>
        <circle cx="22" cy="49.5" r="2" fill="#00ff66"/>
        <circle cx="32" cy="49.5" r="2.5" fill="#ff0055"/>
        <circle cx="42" cy="49.5" r="2" fill="#00ff66"/>
      </svg>
    `
  },

  // Full 11v11 Tactical Pitch Chalkboard SVG Diagram
  tacticalChalkboardPitch: `
    <svg viewBox="0 0 600 220" width="100%" height="195" xmlns="http://www.w3.org/2000/svg" style="display:block; border-radius:8px;">
      <!-- Turf Striping -->
      <rect x="0" y="0" width="600" height="220" fill="#0d3b1e"/>
      <g fill="#124726">
        <rect x="60" y="0" width="60" height="220"/>
        <rect x="180" y="0" width="60" height="220"/>
        <rect x="300" y="0" width="60" height="220"/>
        <rect x="420" y="0" width="60" height="220"/>
        <rect x="540" y="0" width="60" height="220"/>
      </g>

      <!-- Chalk Field Lines -->
      <g fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="2">
        <rect x="15" y="12" width="570" height="196" rx="3"/>
        <line x1="300" y1="12" x2="300" y2="208"/>
        <circle cx="300" cy="110" r="36"/>
        <circle cx="300" cy="110" r="3" fill="#fff"/>
        <!-- Left Penalty Box -->
        <rect x="15" y="50" width="75" height="120"/>
        <rect x="15" y="78" width="28" height="64"/>
        <!-- Right Penalty Box -->
        <rect x="510" y="50" width="75" height="120"/>
        <rect x="557" y="78" width="28" height="64"/>
      </g>

      <!-- Passing Combination Dashed Arrows -->
      <defs>
        <marker id="arrowGold" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#facc15"/>
        </marker>
        <marker id="arrowPink" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#ff0055"/>
        </marker>
      </defs>

      <!-- Pass 1: Midfield to Wing -->
      <path d="M 225 140 Q 290 175 365 162" fill="none" stroke="#facc15" stroke-width="2.5" stroke-dasharray="6,4" marker-end="url(#arrowGold)"/>
      <!-- Pass 2: Wing Cross to Striker -->
      <path d="M 380 155 Q 435 125 468 98" fill="none" stroke="#facc15" stroke-width="2.5" stroke-dasharray="6,4" marker-end="url(#arrowGold)"/>
      <!-- Shot: Striker to Top Corner -->
      <path d="M 485 92 L 575 62" fill="none" stroke="#ff0055" stroke-width="3" marker-end="url(#arrowPink)"/>

      <!-- Player Nodes (Blue Team) -->
      <g>
        <!-- Midfielder -->
        <circle cx="215" cy="135" r="10" fill="#0284c7" stroke="#ffffff" stroke-width="2"/>
        <text x="215" y="139" font-family="sans-serif" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">8</text>
        <rect x="175" y="106" width="80" height="18" rx="4" fill="rgba(15,23,42,0.9)" stroke="#38bdf8" stroke-width="1"/>
        <text x="215" y="118" font-family="monospace" font-size="10" font-weight="bold" fill="#39ff14" text-anchor="middle">PASS</text>

        <!-- Winger -->
        <circle cx="378" cy="160" r="10" fill="#0284c7" stroke="#ffffff" stroke-width="2"/>
        <text x="378" y="164" font-family="sans-serif" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">7</text>
        <rect x="333" y="176" width="90" height="18" rx="4" fill="rgba(15,23,42,0.9)" stroke="#38bdf8" stroke-width="1"/>
        <text x="378" y="188" font-family="monospace" font-size="10" font-weight="bold" fill="#39ff14" text-anchor="middle">CROSS</text>

        <!-- Striker -->
        <circle cx="478" cy="92" r="11" fill="#2563eb" stroke="#facc15" stroke-width="2.5"/>
        <text x="478" y="96" font-family="sans-serif" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">9</text>
        <rect x="433" y="60" width="90" height="18" rx="4" fill="rgba(15,23,42,0.9)" stroke="#ff0055" stroke-width="1.5"/>
        <text x="478" y="72" font-family="monospace" font-size="10" font-weight="bold" fill="#ffeb3b" text-anchor="middle">VOLLEY</text>
      </g>

      <!-- Opponent Defenders (Red X / Nodes) -->
      <g>
        <circle cx="320" cy="95" r="9" fill="#dc2626" stroke="#ffffff" stroke-width="1.5"/>
        <text x="320" y="99" font-family="sans-serif" font-size="9" font-weight="bold" fill="#fff" text-anchor="middle">4</text>
        <rect x="275" y="68" width="90" height="17" rx="4" fill="rgba(45,10,15,0.9)" stroke="#ef4444" stroke-width="1"/>
        <text x="320" y="80" font-family="monospace" font-size="9" font-weight="bold" fill="#fca5a5" text-anchor="middle">TACKLE</text>

        <!-- Opponent Keeper -->
        <circle cx="572" cy="110" r="9" fill="#eab308" stroke="#000" stroke-width="1.5"/>
        <text x="572" y="114" font-family="sans-serif" font-size="9" font-weight="bold" fill="#000" text-anchor="middle">1</text>
      </g>
    </svg>
  `
};
