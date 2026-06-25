<template>
  <div class="flex flex-col items-center text-white p-5">
    <!-- Header -->
    <div class="flex justify-between items-center w-full max-w-[600px] mb-5 gap-5">
      <div class="flex-1">
        <h1 class="text-[2.5rem] font-extrabold m-0 text-[#f97316] tracking-[-1px]">Frite Fighter</h1>
        <p class="m-0 text-[#63667c] text-[0.9rem] leading-[1.4]">Écrase les nuggets avant qu'ils s'échappent ! Évite les frites pièges !</p>
      </div>
      <div class="flex-shrink-0 flex items-center gap-3">
        <div class="bg-[#232533] px-4 py-2 rounded-xl text-center shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
          <span class="block text-[0.75rem] text-[#ff9500] font-bold">TEMPS</span>
          <strong class="text-[1.5rem] font-bold">{{ timeLeft }}s</strong>
        </div>
        <div class="bg-[#232533] px-5 py-2.5 rounded-xl text-center shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
          <span class="block text-[0.75rem] text-[#f97316] font-bold">SCORE</span>
          <strong class="text-[1.5rem] font-bold">{{ score }}</strong>
        </div>
      </div>
    </div>

    <!-- Game container -->
    <div
      class="relative bg-[#161722] rounded-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] overflow-hidden"
      style="width: 600px; height: 350px;"
    >
      <!-- Kitchen background -->
      <div
        class="absolute inset-0"
        :style="{
          backgroundImage: `url(${kitchenBg})`,
          backgroundSize: '400px auto',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'bottom',
          opacity: 0.35,
        }"
      ></div>

      <!-- Counter surface -->
      <div class="absolute bottom-0 left-0 w-full h-[40px] bg-[#2a2226] border-t-4 border-[#3a2a2e]"></div>

      <!-- Idle overlay -->
      <div
        v-if="gameState === 'idle'"
        class="absolute inset-0 bg-[rgba(15,16,22,0.88)] flex flex-col justify-center items-center rounded-[15px] z-10 backdrop-blur-sm"
      >
        <h2 class="text-[2.5rem] mb-2 text-white text-center">Frite Fighter 🍗</h2>
        <p class="text-[#b0b3c6] text-center mb-6 px-8 leading-relaxed">
          Clique sur les <strong class="text-white">nuggets 🍗</strong> (+1 pt)<br>
          Évite les <strong class="text-red-400">frites 🍟</strong> (−1 pt) — et guette les <strong class="text-yellow-300">étoiles 🌟</strong> (+3 pts) !
        </p>
        <button
          class="font-bold border-none rounded-full cursor-pointer bg-[#f97316] text-white px-8 py-3 text-[1.1rem] transition-transform duration-200 hover:scale-105"
          @click="startGame"
        >
          Jouer
        </button>
      </div>

      <!-- Game over overlay -->
      <div
        v-if="gameState === 'over'"
        class="absolute inset-0 bg-[rgba(15,16,22,0.88)] flex flex-col justify-center items-center rounded-[15px] z-10 backdrop-blur-sm"
      >
        <h2 class="text-[2.5rem] mb-2 text-white text-center">Temps écoulé ! ⏰</h2>
        <p class="text-[1.4rem] text-[#f97316] mb-6 font-bold">Score final : {{ score }} pts</p>
        <button
          class="font-bold border-none rounded-full cursor-pointer bg-[#f97316] text-white px-8 py-3 text-[1.1rem] transition-transform duration-200 hover:scale-105"
          @click="startGame"
        >
          Rejouer
        </button>
      </div>

      <!-- Targets -->
      <div
        v-for="target in targets"
        :key="target.id"
        class="absolute select-none cursor-pointer"
        :style="{ left: target.x + '%', top: target.y + '%' }"
        @click.stop="hitTarget(target)"
      >
        <div
          class="target-icon flex items-center justify-center rounded-full"
          :class="[
            target.type === 'golden' ? 'text-5xl' : 'text-4xl',
            target.type === 'frite'  ? 'frite-glow'  : '',
            target.type === 'golden' ? 'golden-glow' : '',
          ]"
          style="transform: translate(-50%, -50%); width: 60px; height: 60px;"
        >
          {{ target.type === 'nugget' ? '🍗' : target.type === 'frite' ? '🍟' : '🌟' }}
        </div>
        <!-- Lifespan progress bar -->
        <div
          class="absolute h-[4px] rounded-full bg-[#232533] overflow-hidden"
          style="width: 48px; bottom: -22px; left: 50%; transform: translateX(-50%);"
        >
          <div
            class="h-full rounded-full transition-none"
            :class="target.type === 'frite' ? 'bg-red-500' : target.type === 'golden' ? 'bg-yellow-400' : 'bg-[#f97316]'"
            :style="{ width: target.remainingPct + '%' }"
          ></div>
        </div>
      </div>

      <!-- Phase badge -->
      <div
        v-if="gameState === 'playing'"
        class="absolute bottom-[48px] right-3 text-[0.7rem] font-bold px-2 py-0.5 rounded-full"
        :class="phase === 3 ? 'bg-red-900 text-red-300' : phase === 2 ? 'bg-orange-900 text-orange-300' : 'bg-[#232533] text-[#63667c]'"
      >
        {{ phaseLabel }}
      </div>
    </div>

    <!-- Controls hint -->
    <div class="mt-5 text-center text-[#63667c] text-[0.9rem]">
      <p>🍗 Nugget = +1pt &nbsp;|&nbsp; 🌟 Étoile = +3pts &nbsp;|&nbsp; 🍟 Frite = −1pt</p>
    </div>
  </div>
</template>

<script>
import { useScoresStore } from '../../stores/scores';
import kitchenBg from '../../assets/img/background_kitchen.png';

const GAME_DURATION = 60;
const PHASE_DURATION = 20;

const PHASES = [
  { spawnInterval: 1400, fritePct: 0.00, goldenPct: 0.00, lifespan: 2200 },
  { spawnInterval:  900, fritePct: 0.20, goldenPct: 0.00, lifespan: 1800 },
  { spawnInterval:  550, fritePct: 0.30, goldenPct: 0.05, lifespan: 1400 },
];

export default {
  setup() {
    return { scoresStore: useScoresStore() };
  },
  data() {
    return {
      kitchenBg,
      gameState: 'idle',
      score: 0,
      timeLeft: GAME_DURATION,
      targets: [],
      targetId: 0,
      spawnTimer: null,
      countdownTimer: null,
      activeTimers: [],
    };
  },
  computed: {
    phase() {
      const elapsed = GAME_DURATION - this.timeLeft;
      return Math.min(3, Math.floor(elapsed / PHASE_DURATION) + 1);
    },
    phaseLabel() {
      return this.phase === 3 ? 'INFERNO 🔥' : this.phase === 2 ? 'RUSH ⚡' : 'WARM-UP';
    },
    currentPhase() {
      return PHASES[this.phase - 1];
    },
  },
  methods: {
    startGame() {
      this.clearAllTimers();
      this.score = 0;
      this.timeLeft = GAME_DURATION;
      this.targets = [];
      this.targetId = 0;
      this.activeTimers = [];
      this.gameState = 'playing';
      this.scheduleNextSpawn();
      this.countdownTimer = setInterval(this.tick, 1000);
    },

    scheduleNextSpawn() {
      if (this.gameState !== 'playing') return;
      const delay = this.currentPhase.spawnInterval + Math.random() * 300;
      this.spawnTimer = setTimeout(() => {
        this.spawnTarget();
        this.scheduleNextSpawn();
      }, delay);
    },

    spawnTarget() {
      if (this.gameState !== 'playing') return;

      const roll = Math.random();
      const cfg = this.currentPhase;
      let type;
      if (roll < cfg.goldenPct) type = 'golden';
      else if (roll < cfg.goldenPct + cfg.fritePct) type = 'frite';
      else type = 'nugget';

      // Avoid overlapping with existing targets
      let x, y, attempts = 0;
      do {
        x = 12 + Math.random() * 76;
        y = 8  + Math.random() * 68;
        attempts++;
      } while (
        attempts < 10 &&
        this.targets.some(t => Math.abs(t.x - x) < 14 && Math.abs(t.y - y) < 20)
      );

      const id = this.targetId++;
      const lifespan = cfg.lifespan;
      this.targets.push({ id, type, x, y, remainingPct: 100 });

      const startTime = Date.now();
      const barTimer = setInterval(() => {
        const t = this.targets.find(t => t.id === id);
        if (!t) { clearInterval(barTimer); return; }
        t.remainingPct = Math.max(0, 100 - ((Date.now() - startTime) / lifespan) * 100);
      }, 50);

      const expireTimer = setTimeout(() => {
        clearTimeout(barTimer);
        this.removeTarget(id);
      }, lifespan);

      this.activeTimers.push(barTimer, expireTimer);
    },

    hitTarget(target) {
      if (this.gameState !== 'playing') return;
      if (target.type === 'nugget') this.score += 1;
      else if (target.type === 'golden') this.score += 3;
      else if (target.type === 'frite') this.score = Math.max(0, this.score - 1);
      this.removeTarget(target.id);
    },

    removeTarget(id) {
      const idx = this.targets.findIndex(t => t.id === id);
      if (idx !== -1) this.targets.splice(idx, 1);
    },

    tick() {
      this.timeLeft--;
      if (this.timeLeft <= 0) this.endGame();
    },

    async endGame() {
      this.gameState = 'over';
      this.clearAllTimers();
      this.targets = [];
      if (this.score > 0) {
        try {
          await this.scoresStore.saveScore('frite-fighter', this.score);
        } catch {
          // Score not saved (not logged in)
        }
      }
    },

    clearAllTimers() {
      if (this.spawnTimer)    { clearTimeout(this.spawnTimer);   this.spawnTimer = null; }
      if (this.countdownTimer){ clearInterval(this.countdownTimer); this.countdownTimer = null; }
      for (const t of this.activeTimers) clearTimeout(t);
      this.activeTimers = [];
    },
  },
  beforeUnmount() {
    this.clearAllTimers();
  },
};
</script>

<style scoped>
.target-icon {
  animation: pop-in 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes pop-in {
  from { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  to   { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.frite-glow {
  filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.8));
}

.golden-glow {
  filter: drop-shadow(0 0 10px rgba(250, 204, 21, 0.9));
  animation: pop-in 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), golden-pulse 1s ease-in-out infinite alternate;
}

@keyframes golden-pulse {
  from { filter: drop-shadow(0 0 6px rgba(250, 204, 21, 0.6)); }
  to   { filter: drop-shadow(0 0 14px rgba(250, 204, 21, 1)); }
}
</style>
