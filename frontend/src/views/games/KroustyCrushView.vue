<script>
import { useScoresStore } from '../../stores/scores'

const CANDIES = ['🍬', '🍭', '🍡', '🧁', '🍩', '🍪']
const SIZE = 8

function makeGrid() {
  let grid
  let attempts = 0
  do {
    grid = Array.from({ length: SIZE * SIZE }, (_, i) => ({
      type: Math.floor(Math.random() * CANDIES.length),
      id: i + Math.random()
    }))
    attempts++
  } while (hasMatch(grid) && attempts < 200)
  return grid
}

function idx(r, c) { return r * SIZE + c }

function hasMatch(g) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE - 2; c++) {
      const i = idx(r, c)
      if (g[i].type === g[i+1].type && g[i].type === g[i+2].type) return true
    }
  }
  for (let c = 0; c < SIZE; c++) {
    for (let r = 0; r < SIZE - 2; r++) {
      const i = idx(r, c)
      if (g[i].type === g[idx(r+1,c)].type && g[i].type === g[idx(r+2,c)].type) return true
    }
  }
  return false
}

function findAllMatches(g) {
  const matched = new Set()
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE - 2; c++) {
      const i = idx(r, c)
      if (g[i].type === g[i+1].type && g[i].type === g[i+2].type) {
        let len = 3
        while (c + len < SIZE && g[idx(r, c+len)].type === g[i].type) len++
        for (let k = 0; k < len; k++) matched.add(idx(r, c+k))
      }
    }
  }
  for (let c = 0; c < SIZE; c++) {
    for (let r = 0; r < SIZE - 2; r++) {
      const i = idx(r, c)
      const i1 = idx(r+1, c), i2 = idx(r+2, c)
      if (g[i].type === g[i1].type && g[i].type === g[i2].type) {
        let len = 3
        while (r + len < SIZE && g[idx(r+len, c)].type === g[i].type) len++
        for (let k = 0; k < len; k++) matched.add(idx(r+k, c))
      }
    }
  }
  return [...matched]
}

let nextId = 0
function newCell(type) {
  return { type: type ?? Math.floor(Math.random() * CANDIES.length), id: nextId++ }
}

export default {
  name: 'KroustyCrushView',
  setup() { return { scoresStore: useScoresStore(), CANDIES, SIZE } },
  data() {
    return {
      screen: 'start', // 'start' | 'playing' | 'over'
      grid: [],
      selected: null,
      score: 0,
      combo: 0,
      busy: false,
      flashing: []
    }
  },
  methods: {
    startGame() {
      this.grid = makeGrid()
      this.selected = null
      this.score = 0
      this.combo = 0
      this.busy = false
      this.flashing = []
      this.screen = 'playing'
    },

    async onCell(i) {
      if (this.screen !== 'playing' || this.busy) return
      if (this.selected === null) { this.selected = i; return }
      if (this.selected === i) { this.selected = null; return }

      const r1 = Math.floor(this.selected / SIZE), c1 = this.selected % SIZE
      const r2 = Math.floor(i / SIZE), c2 = i % SIZE
      if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) { this.selected = i; return }

      const a = this.selected
      this.selected = null
      await this.swap(a, i)
    },

    async swap(a, b) {
      this.busy = true
      const g = [...this.grid]
      ;[g[a], g[b]] = [g[b], g[a]]
      const m = findAllMatches(g)
      if (!m.length) { await this.wait(100); this.busy = false; return }
      this.grid = g
      this.combo = 0
      await this.cascade()
      this.busy = false
    },

    async cascade() {
      let g = [...this.grid]
      let m = findAllMatches(g)
      while (m.length) {
        this.combo++
        const mult = Math.min(this.combo, 5)
        this.score += m.length * 10 * mult
        this.flashing = m
        await this.wait(220)
        this.flashing = []
        m.forEach(i => { g[i] = null })
        for (let c = 0; c < SIZE; c++) {
          let bottom = SIZE - 1
          for (let r = SIZE - 1; r >= 0; r--) {
            if (g[idx(r,c)] !== null) { g[idx(bottom,c)] = g[idx(r,c)]; if (bottom !== r) g[idx(r,c)] = null; bottom-- }
          }
          for (let r = bottom; r >= 0; r--) g[idx(r,c)] = newCell()
        }
        this.grid = [...g]
        await this.wait(180)
        m = findAllMatches(g)
      }
      this.combo = 0
    },

    async endGame() {
      this.screen = 'over'
      if (this.score > 0) {
        try { await this.scoresStore.saveScore('krousty-crush', this.score) } catch (_) {}
      }
    },

    wait(ms) { return new Promise(r => setTimeout(r, ms)) }
  }
}
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <h1 class="text-3xl font-extrabold text-white">🍬 Krousty Crush</h1>

    <!-- Start -->
    <div v-if="screen === 'start'" class="flex flex-col items-center gap-4">
      <p class="text-[#b0b3c6] text-center max-w-sm">
        Clique sur deux bonbons adjacents pour les échanger.<br>
        Aligne 3 bonbons ou plus pour marquer des points !
      </p>
      <p class="text-[#b0b3c6] text-sm">Combos = multiplicateur de score ×1 à ×5</p>
      <button
        @click="startGame"
        class="bg-[#f97316] text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-[#ea580c] transition"
      >
        Jouer !
      </button>
    </div>

    <!-- Game over -->
    <div v-if="screen === 'over'" class="flex flex-col items-center gap-4">
      <p class="text-2xl font-bold text-white">Partie terminée !</p>
      <p class="text-[#f97316] text-3xl font-extrabold">{{ score.toLocaleString('fr-FR') }} pts</p>
      <button @click="startGame" class="bg-[#f97316] text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-[#ea580c] transition">
        Rejouer
      </button>
    </div>

    <!-- HUD -->
    <div v-if="screen === 'playing'" class="flex items-center gap-8">
      <div class="text-center">
        <div class="text-[#b0b3c6] text-xs uppercase tracking-wide">Score</div>
        <div class="text-white text-2xl font-extrabold">{{ score.toLocaleString('fr-FR') }}</div>
      </div>
      <div v-if="combo > 1" class="text-center">
        <div class="text-yellow-400 text-xs uppercase tracking-wide">Combo</div>
        <div class="text-yellow-400 text-2xl font-extrabold">×{{ Math.min(combo, 5) }}</div>
      </div>
      <button @click="endGame" class="bg-[#e63946] text-white px-5 py-2 rounded-full font-bold hover:bg-[#d62828] transition text-sm">
        Terminer
      </button>
    </div>

    <!-- Grid -->
    <div
      v-if="screen === 'playing' || screen === 'over'"
      class="grid gap-1.5 p-3 bg-[#161722] rounded-2xl border border-[#232533]"
      :style="{ gridTemplateColumns: `repeat(${SIZE}, minmax(0,1fr))` }"
    >
      <button
        v-for="(cell, i) in grid"
        :key="cell ? cell.id : i"
        @click="onCell(i)"
        :disabled="busy || screen === 'over'"
        class="w-11 h-11 rounded-xl text-2xl flex items-center justify-center transition-all duration-100 select-none"
        :class="[
          selected === i
            ? 'bg-[#f97316] scale-110 shadow-[0_0_12px_rgba(249,115,22,0.7)]'
            : flashing.includes(i)
              ? 'bg-yellow-400 scale-125'
              : 'bg-[#232533] hover:bg-[#2e3048] hover:scale-105'
        ]"
      >
        {{ cell ? CANDIES[cell.type] : '' }}
      </button>
    </div>

    <p v-if="screen === 'playing'" class="text-[#63667c] text-xs">
      Clique une case → clique une case adjacente pour échanger
    </p>
  </div>
</template>
