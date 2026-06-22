<template>
  <div class="flex flex-col items-center text-white p-5">
    <!-- Header -->
    <div class="flex justify-between items-center w-full max-w-[450px] mb-8">
      <div>
        <h1 class="text-[3rem] font-extrabold m-0 text-[#8c52ff] tracking-[-1px]">2048</h1>
        <p class="m-0 text-[#63667c] text-[0.9rem]">Rejoins les nombres pour obtenir la tuile <strong>2048</strong> !</p>
      </div>
      <div class="bg-[#232533] px-5 py-2.5 rounded-xl text-center shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
        <span class="block text-[0.75rem] text-[#8c52ff] font-bold">SCORE</span>
        <strong class="text-[1.5rem] font-bold">{{ score }}</strong>
      </div>
    </div>

    <!-- Game container -->
    <div class="relative bg-[#161722] p-[15px] rounded-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] w-[426px] h-[426px]">
      <!-- Overlay game over / win -->
      <div v-if="gameOver || gameWon" class="absolute inset-0 bg-[rgba(15,16,22,0.85)] flex flex-col justify-center items-center rounded-[15px] z-10 backdrop-blur-sm">
        <h2 class="text-[2.5rem] mb-5 text-white">{{ gameWon ? 'Victoire ! 🎉' : 'Game Over 💀' }}</h2>
        <button
          class="font-bold border-none rounded-full cursor-pointer bg-[#8c52ff] text-white px-8 py-3 text-[1.1rem] transition-transform duration-200 hover:scale-105"
          @click="resetGame"
        >
          Rejouer
        </button>
      </div>

      <!-- Grid background -->
      <div class="grid [grid-template-columns:repeat(4,90px)] [grid-template-rows:repeat(4,90px)] gap-3 absolute top-[15px] left-[15px]">
        <div v-for="i in 16" :key="'bg-'+i" class="bg-[#1e1e24] rounded-[10px]"></div>
      </div>

      <!-- Tiles -->
      <div class="absolute top-[15px] left-[15px] w-[396px] h-[396px] z-[1]">
        <div
          v-for="tile in tiles"
          :key="tile.id"
          class="absolute w-[90px] h-[90px] transition-transform duration-150 ease-in-out"
          :style="getTileStyle(tile)"
        >
          <div
            class="w-full h-full rounded-[10px] flex justify-center items-center text-[2rem] font-bold text-white bg-[#313346] origin-center"
            :class="[tile.isNew ? 'animate-appear' : '', tile.isMerged ? 'animate-pop' : '']"
            :style="getTileInnerStyle(tile)"
          >
            {{ tile.nextValue || tile.value }}
          </div>
        </div>
      </div>
    </div>

    <!-- Controls hint -->
    <div class="mt-8 text-center text-[#63667c] text-[0.9rem]">
      <p>🎮 Utilise les <strong>flèches directionnelles</strong> de ton clavier pour jouer.</p>
      <button
        class="font-bold border-none rounded-full cursor-pointer bg-[#232533] text-[#b0b3c6] px-5 py-2.5 mt-4 transition hover:bg-[#313346] hover:text-white"
        @click="resetGame"
      >
        Recommencer
      </button>
    </div>
  </div>
</template>

<script>
import { useScoresStore } from '../../stores/scores';

const TILE_STYLES = {
  2:    { backgroundColor: '#2a2c3f' },
  4:    { backgroundColor: '#313346' },
  8:    { backgroundColor: '#6a35ff', boxShadow: '0 0 10px rgba(106, 53, 255, 0.4)' },
  16:   { backgroundColor: '#8c52ff', boxShadow: '0 0 15px rgba(140, 82, 255, 0.5)' },
  32:   { backgroundColor: '#00b4d8', boxShadow: '0 0 15px rgba(0, 180, 216, 0.5)' },
  64:   { backgroundColor: '#0096b4' },
  128:  { backgroundColor: '#ff4d4d', boxShadow: '0 0 15px rgba(255, 77, 77, 0.5)', fontSize: '1.7rem' },
  256:  { backgroundColor: '#ff3333', fontSize: '1.7rem' },
  512:  { backgroundColor: '#f5c518', color: '#0f1016', boxShadow: '0 0 20px rgba(245, 197, 24, 0.6)', fontSize: '1.7rem' },
  1024: { backgroundColor: '#d4a810', color: '#0f1016', fontSize: '1.4rem' },
  2048: { backgroundColor: '#38ef7d', color: '#0f1016', boxShadow: '0 0 25px rgba(56, 239, 125, 0.8)', fontSize: '1.4rem' },
};

export default {
  setup() {
    const scoresStore = useScoresStore();
    return { scoresStore };
  },
  data() {
    return {
      tiles: [],
      score: 0,
      gameOver: false,
      gameWon: false,
      nextId: 1,
      isAnimating: false,
    };
  },
  methods: {
    getTileStyle(tile) {
      const row = Math.floor(tile.position / 4);
      const col = tile.position % 4;
      return {
        transform: `translate(${col * 102}px, ${row * 102}px)`,
        zIndex: tile.toDelete ? 1 : 2,
      };
    },
    getTileInnerStyle(tile) {
      const value = tile.nextValue || tile.value;
      return TILE_STYLES[value] ?? { backgroundColor: '#313346' };
    },
    resetGame() {
      this.tiles = [];
      this.score = 0;
      this.gameOver = false;
      this.gameWon = false;
      this.nextId = 1;
      this.addRandomTile();
      this.addRandomTile();
    },
    addRandomTile() {
      const occupied = this.tiles.map(t => t.position);
      const empty = Array.from({ length: 16 }, (_, i) => i).filter(p => !occupied.includes(p));
      if (empty.length > 0) {
        const pos = empty[Math.floor(Math.random() * empty.length)];
        this.tiles.push({
          id: this.nextId++,
          value: Math.random() < 0.9 ? 2 : 4,
          position: pos,
          isNew: true,
          isMerged: false,
          toDelete: false,
          nextValue: null,
        });
      }
    },
    clearTileStates() {
      this.tiles.forEach(t => { t.isNew = false; t.isMerged = false; });
    },
    handleKeydown(e) {
      if (this.gameOver || this.gameWon || this.isAnimating) return;
      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      this.clearTileStates();
      let moved = false;
      if (e.key === 'ArrowLeft')  moved = this.move(-1,  0);
      if (e.key === 'ArrowRight') moved = this.move( 1,  0);
      if (e.key === 'ArrowUp')    moved = this.move( 0, -1);
      if (e.key === 'ArrowDown')  moved = this.move( 0,  1);
      if (moved) {
        this.isAnimating = true;
        setTimeout(() => {
          this.cleanupAndMerge();
          this.addRandomTile();
          this.checkGameState();
          this.isAnimating = false;
        }, 150);
      }
    },
    move(dirX, dirY) {
      let moved = false;
      let mergedThisTurn = [];
      this.tiles.sort((a, b) => {
        const [rA, cA] = [Math.floor(a.position / 4), a.position % 4];
        const [rB, cB] = [Math.floor(b.position / 4), b.position % 4];
        if (dirX === -1) return cA - cB;
        if (dirX ===  1) return cB - cA;
        if (dirY === -1) return rA - rB;
        if (dirY ===  1) return rB - rA;
        return 0;
      });
      this.tiles.forEach(tile => {
        let [tr, tc] = [Math.floor(tile.position / 4), tile.position % 4];
        while (true) {
          const [nr, nc] = [tr + dirY, tc + dirX];
          if (nr < 0 || nr > 3 || nc < 0 || nc > 3) break;
          const at = this.tiles.find(t => t.position === nr * 4 + nc && !t.toDelete);
          if (!at) { tr = nr; tc = nc; }
          else {
            if (at.value === tile.value && !mergedThisTurn.includes(at.id)) {
              tr = nr; tc = nc;
              tile.toDelete = true;
              at.nextValue = at.value * 2;
              mergedThisTurn.push(at.id);
            }
            break;
          }
        }
        const finalPos = tr * 4 + tc;
        if (tile.position !== finalPos) { tile.position = finalPos; moved = true; }
      });
      return moved;
    },
    cleanupAndMerge() {
      this.tiles.forEach(t => {
        if (t.nextValue) {
          t.value = t.nextValue;
          this.score += t.value;
          t.nextValue = null;
          t.isMerged = true;
        }
      });
      this.tiles = this.tiles.filter(t => !t.toDelete);
    },
    async checkGameState() {
      if (this.tiles.some(t => t.value >= 2048)) { this.gameWon = true; return; }
      if (this.tiles.length === 16) {
        const grid = Array(16).fill(0);
        this.tiles.forEach(t => grid[t.position] = t.value);
        let canMove = false;
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            const v = grid[r * 4 + c];
            if (c < 3 && v === grid[r * 4 + c + 1]) canMove = true;
            if (r < 3 && v === grid[(r + 1) * 4 + c]) canMove = true;
          }
        }
        if (!canMove) {
          this.gameOver = true;
          const finalScore = Math.floor(this.score);
          if (finalScore > 0) {
            try {
              await this.scoresStore.saveScore('2048', finalScore);
              console.log('Score sauvegardé avec succès !');
            } catch {
              console.log("Le score n'a pas été sauvegardé (non connecté ou erreur).");
            }
          }
        }
      }
    },
  },
  mounted() {
    this.resetGame();
    window.addEventListener('keydown', this.handleKeydown);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown);
  },
};
</script>
