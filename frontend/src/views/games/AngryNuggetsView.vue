<script>
import { useScoresStore } from '../../stores/scores'

const W = 700, H = 400
const GROUND_Y = 350
const GRAVITY = 580
const SLING_X = 110, SLING_Y = 305
const NUGGET_R = 14
const MAX_DRAG = 95
const EXPLOSION_R = 72

const ALL_UPGRADES = [
  { id: 'extra',     icon: '🍗', label: 'Nugget supplémentaire', desc: '+1 nugget pour le niveau suivant' },
  { id: 'explosive', icon: '💥', label: 'Nugget explosif',       desc: "Explose à l'impact (rayon 72px)" },
  { id: 'power',     icon: '🔵', label: 'Super puissance',       desc: '+35% de vitesse initiale' },
  { id: 'bouncy',    icon: '🟢', label: 'Nugget rebondissant',   desc: 'Rebondit 4 fois sur le sol' },
]

function makeLevelBlocks(level) {
  if (level === 1) {
    return {
      blocks: [
        { x: 490, y: 310, w: 40, h: 40, hp: 1 }, { x: 490, y: 270, w: 40, h: 40, hp: 1 },
        { x: 490, y: 230, w: 40, h: 40, hp: 1 }, { x: 490, y: 190, w: 40, h: 40, hp: 1 },
      ],
      friteuses: [{ x: 555, y: 330, alive: true }],
      nuggets: 3
    }
  }
  if (level === 2) {
    return {
      blocks: [
        { x: 440, y: 310, w: 40, h: 40, hp: 1 }, { x: 440, y: 270, w: 40, h: 40, hp: 1 },
        { x: 440, y: 230, w: 40, h: 40, hp: 1 }, { x: 440, y: 190, w: 40, h: 40, hp: 1 },
        { x: 545, y: 310, w: 40, h: 40, hp: 2 }, { x: 545, y: 270, w: 40, h: 40, hp: 2 },
        { x: 545, y: 230, w: 40, h: 40, hp: 2 }, { x: 545, y: 190, w: 40, h: 40, hp: 2 },
        { x: 545, y: 150, w: 40, h: 40, hp: 1 }, { x: 545, y: 110, w: 40, h: 40, hp: 1 },
      ],
      friteuses: [{ x: 492, y: 330, alive: true }, { x: 605, y: 330, alive: true }],
      nuggets: 4
    }
  }
  return {
    blocks: [
      { x: 395, y: 310, w: 40, h: 40, hp: 1 }, { x: 395, y: 270, w: 40, h: 40, hp: 1 },
      { x: 395, y: 230, w: 40, h: 40, hp: 1 },
      { x: 438, y: 230, w: 40, h: 18, hp: 1 }, { x: 480, y: 230, w: 40, h: 18, hp: 1 },
      { x: 522, y: 310, w: 40, h: 40, hp: 2 }, { x: 522, y: 270, w: 40, h: 40, hp: 2 },
      { x: 522, y: 230, w: 40, h: 40, hp: 2 }, { x: 522, y: 190, w: 40, h: 40, hp: 2 },
      { x: 522, y: 150, w: 40, h: 40, hp: 2 },
      { x: 608, y: 310, w: 40, h: 40, hp: 2 }, { x: 608, y: 270, w: 40, h: 40, hp: 2 },
      { x: 608, y: 230, w: 40, h: 40, hp: 1 },
    ],
    friteuses: [
      { x: 428, y: 330, alive: true }, { x: 563, y: 330, alive: true }, { x: 648, y: 330, alive: true }
    ],
    nuggets: 4
  }
}

export default {
  name: 'AngryNuggetsView',
  setup() { return { scoresStore: useScoresStore() } },
  data() {
    return {
      gameState: 'start',
      level: 1, nuggets: 3, blocks: [], friteuses: [],
      projectile: null, totalScore: 0, levelScore: 0,
      upgrades: [], pendingUpgrades: [],
      dragStart: null, dragCurrent: null,
      rafId: null, lastTime: null, bounceCount: 0,
      resultMsg: '', resultWin: false,
      isFullscreen: false
    }
  },
  mounted() {
    const c = this.$refs.canvas
    c.addEventListener('mousedown', this.onMouseDown)
    c.addEventListener('mousemove', this.onMouseMove)
    c.addEventListener('mouseup', this.onMouseUp)
    c.addEventListener('touchstart', this.onTouchStart, { passive: false })
    c.addEventListener('touchmove', this.onTouchMove, { passive: false })
    c.addEventListener('touchend', this.onTouchEnd)
    document.addEventListener('fullscreenchange', this.onFSChange)
  },
  beforeUnmount() {
    cancelAnimationFrame(this.rafId)
    const c = this.$refs.canvas
    if (c) {
      c.removeEventListener('mousedown', this.onMouseDown)
      c.removeEventListener('mousemove', this.onMouseMove)
      c.removeEventListener('mouseup', this.onMouseUp)
      c.removeEventListener('touchstart', this.onTouchStart)
      c.removeEventListener('touchmove', this.onTouchMove)
      c.removeEventListener('touchend', this.onTouchEnd)
    }
    document.removeEventListener('fullscreenchange', this.onFSChange)
  },
  methods: {
    onFSChange() { this.isFullscreen = !!document.fullscreenElement },
    async toggleFullscreen() {
      try {
        if (!document.fullscreenElement) await this.$refs.gameWrapper.requestFullscreen()
        else await document.exitFullscreen()
      } catch (_) {}
    },

    startGame() {
      this.level = 1; this.totalScore = 0; this.upgrades = []
      this.loadLevel(); this.gameState = 'idle'; this.startLoop()
    },
    loadLevel() {
      const data = makeLevelBlocks(this.level)
      this.blocks = data.blocks; this.friteuses = data.friteuses
      this.nuggets = data.nuggets + (this.upgrades.includes('extra') ? 1 : 0)
      this.projectile = null; this.levelScore = 0
      this.dragStart = null; this.dragCurrent = null
    },
    startLoop() {
      cancelAnimationFrame(this.rafId); this.lastTime = null
      this.rafId = requestAnimationFrame(this.loop)
    },
    loop(ts) {
      if (!this.lastTime) this.lastTime = ts
      const delta = Math.min((ts - this.lastTime) / 1000, 0.05)
      this.lastTime = ts
      if (this.gameState === 'flying') this.updateProjectile(delta)
      this.draw()
      this.rafId = requestAnimationFrame(this.loop)
    },

    // Canvas coords (handles fullscreen scaling)
    cpos(cx, cy) {
      const rect = this.$refs.canvas.getBoundingClientRect()
      return { x: (cx - rect.left) * (W / rect.width), y: (cy - rect.top) * (H / rect.height) }
    },
    onMouseDown(e) { this.startDrag(this.cpos(e.clientX, e.clientY)) },
    onMouseMove(e) { this.moveDrag(this.cpos(e.clientX, e.clientY)) },
    onMouseUp()    { this.endDrag() },
    onTouchStart(e) { e.preventDefault(); const t = e.touches[0]; this.startDrag(this.cpos(t.clientX, t.clientY)) },
    onTouchMove(e)  { e.preventDefault(); const t = e.touches[0]; this.moveDrag(this.cpos(t.clientX, t.clientY)) },
    onTouchEnd(e)   { e.preventDefault(); this.endDrag() },

    startDrag(pos) {
      if (this.gameState !== 'idle') return
      if (Math.hypot(pos.x - SLING_X, pos.y - SLING_Y) < 55) {
        this.dragCurrent = { x: pos.x, y: pos.y }
        this.gameState = 'aiming'
      }
    },
    moveDrag(pos) {
      if (this.gameState !== 'aiming') return
      const dx = pos.x - SLING_X, dy = pos.y - SLING_Y
      const dist = Math.min(Math.hypot(dx, dy), MAX_DRAG)
      const angle = Math.atan2(dy, dx)
      this.dragCurrent = { x: SLING_X + Math.cos(angle)*dist, y: SLING_Y + Math.sin(angle)*dist }
    },
    endDrag() {
      if (this.gameState !== 'aiming') return
      const dx = SLING_X - this.dragCurrent.x
      const dy = SLING_Y - this.dragCurrent.y
      const dist = Math.hypot(dx, dy)
      if (dist < 8) { this.gameState = 'idle'; return }

      const power = dist / MAX_DRAG
      const speedMult = this.upgrades.includes('power') ? 1.35 : 1.0
      const speed = power * 720 * speedMult

      const type = this.upgrades.includes('explosive') ? 'explosive'
                 : this.upgrades.includes('bouncy')    ? 'bouncy'
                 : 'normal'

      if (type === 'explosive') this.upgrades.splice(this.upgrades.indexOf('explosive'), 1)
      if (type === 'bouncy')    this.upgrades.splice(this.upgrades.indexOf('bouncy'), 1)

      // Projectile starts at sling position
      this.projectile = {
        x: SLING_X, y: SLING_Y,
        vx: (dx/dist)*speed, vy: (dy/dist)*speed,
        type, trail: []
      }
      this.bounceCount = 0
      this.nuggets--
      this.dragCurrent = null
      this.gameState = 'flying'
    },

    updateProjectile(delta) {
      const p = this.projectile
      p.vy += GRAVITY * delta
      p.x += p.vx * delta; p.y += p.vy * delta
      p.trail.push({ x: p.x, y: p.y })
      if (p.trail.length > 22) p.trail.shift()

      if (p.y + NUGGET_R >= GROUND_Y) {
        p.y = GROUND_Y - NUGGET_R
        const coeff = p.type === 'bouncy' ? 0.62 : 0.28
        p.vy = -Math.abs(p.vy) * coeff; p.vx *= 0.8; this.bounceCount++
        const max = p.type === 'bouncy' ? 4 : 1
        if (Math.abs(p.vy) < 25 || this.bounceCount >= max) { this.onStopped(); return }
      }
      if (p.x > W + 60 || p.y < -250) { this.onStopped(); return }

      for (let i = this.blocks.length - 1; i >= 0; i--) {
        const b = this.blocks[i]
        if (p.x+NUGGET_R > b.x && p.x-NUGGET_R < b.x+b.w && p.y+NUGGET_R > b.y && p.y-NUGGET_R < b.y+b.h) {
          if (p.type === 'explosive') { this.explode(p.x, p.y); return }
          b.hp--; if (b.hp <= 0) { this.blocks.splice(i, 1); this.levelScore += 50 }
          p.vx *= -0.5; p.vy *= -0.4; break
        }
      }
      for (const f of this.friteuses) {
        if (!f.alive) continue
        if (Math.hypot(p.x - f.x, p.y - f.y) < NUGGET_R + 20) {
          if (p.type === 'explosive') { this.explode(p.x, p.y); return }
          f.alive = false; this.levelScore += 100; p.vx *= -0.3; p.vy *= -0.3
        }
      }
    },

    explode(cx, cy) {
      for (let i = this.blocks.length - 1; i >= 0; i--) {
        const b = this.blocks[i]
        if (Math.hypot(cx-(b.x+b.w/2), cy-(b.y+b.h/2)) < EXPLOSION_R+b.w/2) {
          this.blocks.splice(i, 1); this.levelScore += 50
        }
      }
      for (const f of this.friteuses) {
        if (f.alive && Math.hypot(cx-f.x, cy-f.y) < EXPLOSION_R+20) {
          f.alive = false; this.levelScore += 100
        }
      }
      this.onStopped()
    },

    onStopped() {
      this.projectile = null
      const aliveF = this.friteuses.filter(f => f.alive)
      if (aliveF.length === 0) {
        this.levelScore += this.nuggets * 30; this.totalScore += this.levelScore
        this.resultWin = true; this.resultMsg = `Niveau ${this.level} terminé ! +${this.levelScore} pts`
        this.gameState = 'result'
      } else if (this.nuggets <= 0) {
        this.totalScore += this.levelScore; this.resultWin = false
        this.resultMsg = `Plus de nuggets — ${aliveF.length} friteuse(s) encore en vie !`
        this.gameState = 'result'
      } else {
        this.gameState = 'idle'
      }
    },

    nextLevel() {
      if (this.level >= 3) { this.gameState = 'complete'; this.saveScore(); return }
      const shuffled = [...ALL_UPGRADES].sort(() => Math.random() - 0.5)
      this.pendingUpgrades = shuffled.slice(0, 2); this.gameState = 'upgrade'
    },
    chooseUpgrade(upg) {
      this.upgrades.push(upg.id); this.level++; this.loadLevel(); this.gameState = 'idle'
    },
    restartGame() { this.startGame() },
    async saveScore() {
      if (this.totalScore > 0) {
        try { await this.scoresStore.saveScore('angry-nuggets', this.totalScore) } catch (_) {}
      }
    },

    draw() {
      const canvas = this.$refs.canvas
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, W, H)

      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, '#1a1f3a'); grad.addColorStop(1, '#0f1016')
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H)

      ctx.fillStyle = '#2d5a1b'; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y)
      ctx.fillStyle = '#3a7a22'; ctx.fillRect(0, GROUND_Y, W, 8)

      // Catapult
      ctx.lineCap = 'round'
      ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 9
      ctx.beginPath(); ctx.moveTo(SLING_X-18, GROUND_Y); ctx.lineTo(SLING_X, SLING_Y+12); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(SLING_X+18, GROUND_Y); ctx.lineTo(SLING_X, SLING_Y+12); ctx.stroke()
      ctx.lineWidth = 5
      ctx.beginPath(); ctx.moveTo(SLING_X, SLING_Y+12); ctx.lineTo(SLING_X-16, SLING_Y-16); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(SLING_X, SLING_Y+12); ctx.lineTo(SLING_X+16, SLING_Y-16); ctx.stroke()

      if (this.gameState === 'idle' && this.nuggets > 0) {
        ctx.font = '24px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('🍗', SLING_X, SLING_Y)
      }

      if (this.gameState === 'aiming' && this.dragCurrent) {
        const dx = SLING_X - this.dragCurrent.x
        const dy = SLING_Y - this.dragCurrent.y
        const dist = Math.hypot(dx, dy) || 1
        const power = dist / MAX_DRAG
        const speedMult = this.upgrades.includes('power') ? 1.35 : 1.0
        const speed = power * 720 * speedMult

        // Trajectory preview: start from SLING (same as actual launch)
        let tx = SLING_X, ty = SLING_Y
        let tvx = (dx/dist)*speed, tvy = (dy/dist)*speed
        const STEP = 0.011
        ctx.fillStyle = 'rgba(255,255,255,0.58)'
        for (let i = 0; i < 140; i++) {
          tvy += GRAVITY * STEP; tx += tvx * STEP; ty += tvy * STEP
          if (tx > W || ty > GROUND_Y || tx < 0) break
          if (i % 4 === 0) { ctx.beginPath(); ctx.arc(tx, ty, 3.5, 0, Math.PI*2); ctx.fill() }
        }

        // Rubber bands
        ctx.strokeStyle = '#d4a017'; ctx.lineWidth = 2.5
        ctx.beginPath(); ctx.moveTo(SLING_X-16, SLING_Y-16); ctx.lineTo(this.dragCurrent.x, this.dragCurrent.y); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(SLING_X+16, SLING_Y-16); ctx.lineTo(this.dragCurrent.x, this.dragCurrent.y); ctx.stroke()

        ctx.font = '24px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('🍗', this.dragCurrent.x, this.dragCurrent.y)
      }

      // Blocks
      for (const b of this.blocks) {
        ctx.fillStyle = b.hp >= 2 ? '#7a4f2e' : '#b07040'
        ctx.fillRect(b.x, b.y, b.w, b.h)
        ctx.strokeStyle = '#3a2010'; ctx.lineWidth = 2; ctx.strokeRect(b.x, b.y, b.w, b.h)
        if (b.hp >= 2) {
          ctx.fillStyle = '#5a3010'; ctx.font = 'bold 9px sans-serif'
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText('HP2', b.x+b.w/2, b.y+b.h/2)
        }
      }

      // Friteuses
      for (const f of this.friteuses) {
        if (!f.alive) continue
        ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(f.x, f.y, 20, 0, Math.PI*2); ctx.fill()
        ctx.strokeStyle = '#922b21'; ctx.lineWidth = 2; ctx.stroke()
        ctx.font = '22px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('🍟', f.x, f.y+1)
      }

      // Projectile
      if (this.projectile) {
        const p = this.projectile
        if (p.trail.length > 1) {
          ctx.strokeStyle = 'rgba(244,162,97,0.35)'; ctx.lineWidth = 2
          ctx.beginPath(); ctx.moveTo(p.trail[0].x, p.trail[0].y)
          for (const pt of p.trail) ctx.lineTo(pt.x, pt.y)
          ctx.stroke()
        }
        const emoji = p.type === 'explosive' ? '💥' : p.type === 'bouncy' ? '🟢' : '🍗'
        ctx.font = '24px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(emoji, p.x, p.y)
      }

      // HUD
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, 36)
      ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Poppins,sans-serif'
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
      ctx.fillText(`Niv. ${this.level}/3`, 12, 18)
      ctx.textAlign = 'center'
      ctx.fillText(`Score: ${this.totalScore + this.levelScore}`, W/2, 18)
      ctx.textAlign = 'right'
      ctx.fillText('🍗'.repeat(Math.max(0, this.nuggets)), W - 10, 18)

      if (this.upgrades.length) {
        ctx.textAlign = 'left'; ctx.font = '14px serif'; ctx.fillStyle = '#f4a261'
        const icons = this.upgrades.map(u => ALL_UPGRADES.find(x => x.id === u)?.icon ?? '').join(' ')
        ctx.fillText(icons, 10, H - 10)
      }

      if (this.gameState === 'idle' && this.nuggets > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = '13px Poppins,sans-serif'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('Maintiens & glisse sur la catapulte pour viser', W/2, H - 16)
      }
    }
  }
}
</script>

<template>
  <div class="flex flex-col items-center gap-5">
    <h1 class="text-3xl font-extrabold text-white">🐔 Angry Nuggets</h1>

    <!-- Start -->
    <div v-if="gameState === 'start'" class="flex flex-col items-center gap-4">
      <p class="text-[#b0b3c6] text-center max-w-sm">
        Lance des nuggets avec ta catapulte pour détruire les structures !<br>
        Élimine toutes les friteuses pour passer au niveau suivant.
      </p>
      <p class="text-[#b0b3c6] text-sm">🖱️ Clique-glisse sur la catapulte et relâche pour tirer</p>
      <button @click="startGame"
        class="bg-[#f4a261] text-black px-8 py-3 rounded-full font-bold text-lg hover:bg-[#e8935a] transition">
        Lancer !
      </button>
    </div>

    <!-- Result -->
    <div v-if="gameState === 'result'" class="flex flex-col items-center gap-3">
      <p class="text-lg font-bold" :class="resultWin ? 'text-green-400' : 'text-red-400'">{{ resultMsg }}</p>
      <template v-if="resultWin">
        <button v-if="level < 3" @click="nextLevel"
          class="bg-[#f97316] text-white px-6 py-2 rounded-full font-bold hover:bg-[#ea580c] transition">
          Niveau suivant →
        </button>
        <button v-else @click="nextLevel"
          class="bg-green-500 text-white px-6 py-2 rounded-full font-bold hover:bg-green-600 transition">
          Terminer 🏆
        </button>
      </template>
      <button v-if="!resultWin" @click="restartGame"
        class="bg-[#e63946] text-white px-6 py-2 rounded-full font-bold hover:bg-[#d62828] transition">
        Rejouer
      </button>
    </div>

    <!-- Upgrade -->
    <div v-if="gameState === 'upgrade'" class="flex flex-col items-center gap-4">
      <p class="text-white font-bold text-lg">⬆️ Choisis ton amélioration !</p>
      <div class="flex gap-4 flex-wrap justify-center">
        <button v-for="upg in pendingUpgrades" :key="upg.id" @click="chooseUpgrade(upg)"
          class="bg-[#1e2030] border border-[#f97316] rounded-xl p-5 flex flex-col items-center gap-2 hover:bg-[#2a2c3f] transition cursor-pointer w-44">
          <span class="text-4xl">{{ upg.icon }}</span>
          <span class="text-white font-bold text-sm text-center">{{ upg.label }}</span>
          <span class="text-[#b0b3c6] text-xs text-center">{{ upg.desc }}</span>
        </button>
      </div>
    </div>

    <!-- Complete -->
    <div v-if="gameState === 'complete'" class="flex flex-col items-center gap-3">
      <p class="text-2xl font-bold text-yellow-400">🏆 Victoire totale !</p>
      <p class="text-white text-3xl font-extrabold">{{ totalScore }} pts</p>
      <button @click="restartGame"
        class="bg-[#f4a261] text-black px-8 py-3 rounded-full font-bold text-lg hover:bg-[#e8935a] transition">
        Rejouer
      </button>
    </div>

    <!-- Game wrapper (fullscreen target) -->
    <div ref="gameWrapper"
      class="relative"
      :class="isFullscreen ? 'fixed inset-0 z-50 flex items-center justify-center bg-[#0f1016]' : ''"
    >
      <canvas
        ref="canvas"
        :width="700" :height="400"
        class="rounded-xl border border-[#232533]"
        :class="[
          gameState === 'start' ? 'hidden' : '',
          isFullscreen ? 'w-full h-full object-contain rounded-none border-0 max-w-none' : ''
        ]"
      />

      <!-- Fullscreen button -->
      <button
        v-if="gameState !== 'start'"
        @click="toggleFullscreen"
        class="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-lg px-2.5 py-1 text-xs font-medium transition z-10 select-none"
      >
        {{ isFullscreen ? '✕ Quitter' : '⛶ Plein écran' }}
      </button>
    </div>

    <p v-if="gameState === 'idle'" class="text-[#63667c] text-xs">
      Glisse depuis la catapulte pour viser • Relâche pour tirer
    </p>
  </div>
</template>
