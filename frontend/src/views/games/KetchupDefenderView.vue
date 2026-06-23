<template>
  <div class="flex flex-col items-center text-white p-5">
    <!-- Header -->
    <div class="flex justify-between items-center w-full max-w-[600px] mb-5 gap-5">
      <div class="flex-1">
        <h1 class="text-[2.5rem] font-extrabold m-0 text-[#8c52ff] tracking-[-1px]">Ketchup Defender</h1>
        <p class="m-0 text-[#63667c] text-[0.9rem] leading-[1.4]">← → pour bouger, Espace pour tirer !</p>
      </div>
      <div class="flex-shrink-0 flex items-center gap-3">
        <div class="bg-[#232533] px-3 py-2 rounded-xl text-center shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
          <span class="block text-[0.75rem] text-[#ff9500] font-bold">VAGUE</span>
          <strong class="text-[1.5rem] font-bold">{{ wave }}</strong>
        </div>
        <div class="bg-[#232533] px-3 py-2 rounded-xl text-center shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
          <span class="block text-[0.7rem] text-red-400 font-bold">VIES</span>
          <strong class="text-[1.3rem] font-bold leading-tight">{{ '❤️'.repeat(lives) }}</strong>
        </div>
        <div class="bg-[#232533] px-5 py-2.5 rounded-xl text-center shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
          <span class="block text-[0.75rem] text-[#8c52ff] font-bold">SCORE</span>
          <strong class="text-[1.5rem] font-bold">{{ score }}</strong>
        </div>
      </div>
    </div>

    <!-- Game container -->
    <div
      class="relative rounded-[15px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
      style="width: 600px; height: 400px;"
    >
      <canvas ref="canvas" width="600" height="400" class="block"></canvas>

      <!-- Idle overlay -->
      <div
        v-if="gameState === 'idle'"
        class="absolute inset-0 bg-[rgba(15,16,22,0.90)] flex flex-col justify-center items-center z-10 backdrop-blur-sm rounded-[15px]"
      >
        <h2 class="text-[2.5rem] mb-2 text-white text-center">Ketchup Defender 🍅</h2>
        <p class="text-[#b0b3c6] text-center mb-6 px-10 leading-relaxed">
          Détruis les vagues de <strong class="text-white">nuggets 🍗</strong> (+10 pts)<br>
          et de <strong class="text-yellow-300">frites 🍟</strong> (+20 pts, 2 HP) !<br>
          Toutes les 3 vagues, un <strong class="text-yellow-400">boss 👑</strong> débarque !
        </p>
        <button
          class="font-bold border-none rounded-full cursor-pointer bg-[#8c52ff] text-white px-8 py-3 text-[1.1rem] transition-transform duration-200 hover:scale-105"
          @click="startGame"
        >
          Jouer
        </button>
      </div>

      <!-- Wave clear overlay -->
      <div
        v-if="gameState === 'wave-clear'"
        class="absolute inset-0 bg-[rgba(15,16,22,0.70)] flex flex-col justify-center items-center z-10 rounded-[15px]"
      >
        <h2 class="text-[2.2rem] text-white mb-1">Vague {{ wave }} terminée ! 🎉</h2>
        <p class="text-[#8c52ff] text-[1.3rem] font-bold">+{{ wave * 50 }} pts de bonus</p>
        <p class="text-[#63667c] text-[0.9rem] mt-2">Vague {{ wave + 1 }} dans quelques secondes…</p>
      </div>

      <!-- Game over overlay -->
      <div
        v-if="gameState === 'over'"
        class="absolute inset-0 bg-[rgba(15,16,22,0.90)] flex flex-col justify-center items-center z-10 backdrop-blur-sm rounded-[15px]"
      >
        <h2 class="text-[2.5rem] mb-2 text-white text-center">Invasion réussie... 💀</h2>
        <p class="text-[1.2rem] text-[#8c52ff] mb-6 font-bold">Score final : {{ score }} pts</p>
        <button
          class="font-bold border-none rounded-full cursor-pointer bg-[#8c52ff] text-white px-8 py-3 text-[1.1rem] transition-transform duration-200 hover:scale-105"
          @click="startGame"
        >
          Rejouer
        </button>
      </div>
    </div>

    <!-- Controls hint -->
    <div class="mt-5 text-center text-[#63667c] text-[0.9rem]">
      <p>⬅ ➡ pour bouger &nbsp;|&nbsp; Espace pour tirer (max 3 balles) &nbsp;|&nbsp; 🍟 Frites = 2 HP / +20 pts &nbsp;|&nbsp; 👑 Boss = +150 pts</p>
    </div>
  </div>
</template>

<script>
import { useScoresStore } from '../../stores/scores'

const W = 600
const H = 400
const PLAYER_Y = 358
const PLAYER_SPEED = 280
const BULLET_SPEED = 520
const EBULLET_SPEED = 200
const DROP_AMOUNT = 22
const MAX_PBULLETS = 3

export default {
  setup() {
    return { scoresStore: useScoresStore() }
  },

  data() {
    return {
      gameState: 'idle',
      score: 0,
      lives: 3,
      wave: 1,
    }
  },

  methods: {
    startGame() {
      this._keysDown = new Set()
      this._bulletId = 0
      this.score = 0
      this.lives = 3
      this.wave = 1
      this._game = this._buildWave()
      this._game.lastTime = performance.now()
      this.gameState = 'playing'
      if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null }
      this._raf = requestAnimationFrame(this.gameLoop)
    },

    _buildWave() {
      const w = this.wave
      const isBoss = w % 3 === 0
      const rows = Math.min(w + 1, 5)
      const cols = Math.min(w + 5, 11)
      const enemies = []

      if (!isBoss) {
        const spacingX = cols > 1 ? Math.floor((W - 120) / (cols - 1)) : 0
        let id = 0
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            enemies.push({
              id: id++,
              row: r, col: c,
              x: 60 + c * spacingX,
              y: 38 + r * 46,
              type: r === 0 ? 'frite' : 'nugget',
              hp: r === 0 ? 2 : 1,
              alive: true,
            })
          }
        }
      }

      const boss = isBoss
        ? { x: W / 2, y: 72, hp: 10 + w * 2, maxHp: 10 + w * 2, dir: 1, speed: 75 + w * 5 }
        : null

      return {
        player: { x: W / 2, invulnerable: false, invulTimer: 0, blinkOn: true, lastBlink: 0 },
        enemies,
        totalEnemies: enemies.length,
        boss,
        pBullets: [],
        eBullets: [],
        enemyDir: 1,
        baseSpeed: 38 * Math.pow(1.12, w - 1),
        shootInterval: Math.max(380, 1500 - w * 90),
        shootTimer: 800,
        lastTime: 0,
      }
    },

    gameLoop(time) {
      const g = this._game
      const raw = time - g.lastTime
      g.lastTime = time
      const delta = Math.min(raw / 1000, 0.05)

      if (this.gameState === 'playing') this.update(delta, time)
      this.draw(time)

      this._raf = requestAnimationFrame(this.gameLoop)
    },

    update(delta, time) {
      const g = this._game
      const p = g.player

      // Player movement
      if (this._keysDown.has('ArrowLeft'))  p.x = Math.max(28, p.x - PLAYER_SPEED * delta)
      if (this._keysDown.has('ArrowRight')) p.x = Math.min(W - 28, p.x + PLAYER_SPEED * delta)

      // Invulnerability blink
      if (p.invulnerable) {
        p.invulTimer -= delta
        if (time - p.lastBlink > 140) { p.blinkOn = !p.blinkOn; p.lastBlink = time }
        if (p.invulTimer <= 0) { p.invulnerable = false; p.blinkOn = true }
      }

      // Player bullets
      for (let i = g.pBullets.length - 1; i >= 0; i--) {
        g.pBullets[i].y -= BULLET_SPEED * delta
        if (g.pBullets[i].y < -12) g.pBullets.splice(i, 1)
      }

      // Enemy bullets
      for (let i = g.eBullets.length - 1; i >= 0; i--) {
        g.eBullets[i].y += EBULLET_SPEED * delta
        if (g.eBullets[i].y > H + 12) g.eBullets.splice(i, 1)
      }

      // Enemy formation movement
      const alive = g.enemies.filter(e => e.alive)
      if (alive.length > 0) {
        const speedMult = 1 + ((g.totalEnemies - alive.length) / Math.max(g.totalEnemies, 1)) * 2.2
        const speed = g.baseSpeed * speedMult
        const dx = speed * g.enemyDir * delta

        let hitWall = false
        for (const e of alive) {
          if (g.enemyDir > 0 && e.x + dx > W - 26) { hitWall = true; break }
          if (g.enemyDir < 0 && e.x + dx < 26)     { hitWall = true; break }
        }

        if (hitWall) {
          for (const e of alive) e.y += DROP_AMOUNT
          g.enemyDir *= -1
        } else {
          for (const e of alive) e.x += dx
        }

        // Enemy shoot timer
        g.shootTimer -= delta * 1000
        if (g.shootTimer <= 0) {
          const shooter = alive[Math.floor(Math.random() * alive.length)]
          g.eBullets.push({ id: this._bulletId++, x: shooter.x, y: shooter.y + 20 })
          g.shootTimer = g.shootInterval + Math.random() * 350
        }

        // Enemies reach kill zone → game over
        if (alive.some(e => e.y + 22 > H - 44)) {
          this.endGame(); return
        }
      }

      // Boss movement & shooting
      if (g.boss) {
        g.boss.x += g.boss.speed * g.boss.dir * delta
        if (g.boss.x > W - 48) { g.boss.x = W - 48; g.boss.dir = -1 }
        if (g.boss.x < 48)     { g.boss.x = 48;     g.boss.dir =  1 }

        g.shootTimer -= delta * 1000
        if (g.shootTimer <= 0) {
          g.eBullets.push({ id: this._bulletId++, x: g.boss.x - 18, y: g.boss.y + 38 })
          g.eBullets.push({ id: this._bulletId++, x: g.boss.x + 18, y: g.boss.y + 38 })
          g.shootTimer = Math.max(280, g.shootInterval * 0.55) + Math.random() * 250
        }
      }

      // Collisions: player bullets vs enemies / boss
      for (let bi = g.pBullets.length - 1; bi >= 0; bi--) {
        const b = g.pBullets[bi]
        let hit = false

        for (const e of g.enemies) {
          if (!e.alive) continue
          if (Math.abs(b.x - e.x) < 20 && Math.abs(b.y - e.y) < 20) {
            e.hp--
            if (e.hp <= 0) { e.alive = false; this.score += e.type === 'frite' ? 20 : 10 }
            hit = true; break
          }
        }

        if (!hit && g.boss) {
          if (Math.abs(b.x - g.boss.x) < 36 && Math.abs(b.y - g.boss.y) < 38) {
            g.boss.hp--
            this.score += 15
            if (g.boss.hp <= 0) { this.score += 150 - 15; g.boss = null }
            hit = true
          }
        }

        if (hit) g.pBullets.splice(bi, 1)
      }

      // Collisions: enemy bullets vs player
      if (!p.invulnerable) {
        for (let bi = g.eBullets.length - 1; bi >= 0; bi--) {
          const b = g.eBullets[bi]
          if (Math.abs(b.x - p.x) < 22 && Math.abs(b.y - PLAYER_Y) < 22) {
            g.eBullets.splice(bi, 1)
            this.lives--
            if (this.lives <= 0) { this.endGame(); return }
            p.invulnerable = true
            p.invulTimer = 2
            p.blinkOn = false
            p.lastBlink = time
            break
          }
        }
      }

      // Wave clear check
      const isBoss = this.wave % 3 === 0
      const allDead = g.enemies.every(e => !e.alive)
      const waveDone = isBoss ? g.boss === null : allDead
      const hadEnemies = g.totalEnemies + (isBoss && g.boss === null ? 1 : (isBoss ? 1 : 0)) > 0
      if (waveDone && hadEnemies) this.waveClear()
    },

    draw(time) {
      const canvas = this.$refs.canvas
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const g = this._game

      // Background
      ctx.fillStyle = '#12131f'
      ctx.fillRect(0, 0, W, H)

      // Subtle grid
      ctx.strokeStyle = 'rgba(140,82,255,0.05)'
      ctx.lineWidth = 1
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }

      // Ground line
      ctx.strokeStyle = '#313346'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(0, H - 36); ctx.lineTo(W, H - 36); ctx.stroke()

      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Enemies
      for (const e of g.enemies) {
        if (!e.alive) continue
        ctx.globalAlpha = 1.0
        ctx.font = e.type === 'frite' ? '32px serif' : '28px serif'
        ctx.fillText(e.type === 'frite' ? '🍟' : '🍗', e.x, e.y)
        // Second HP indicator for frites
        if (e.type === 'frite' && e.hp === 2) {
          ctx.globalAlpha = 0.7
          ctx.font = '10px sans-serif'
          ctx.fillStyle = '#fbbf24'
          ctx.fillText('●●', e.x, e.y + 22)
          ctx.fillStyle = ''
        } else if (e.type === 'frite' && e.hp === 1) {
          ctx.globalAlpha = 0.5
          ctx.font = '10px sans-serif'
          ctx.fillStyle = '#fbbf24'
          ctx.fillText('●', e.x, e.y + 22)
          ctx.fillStyle = ''
        }
      }
      ctx.globalAlpha = 1.0

      // Boss
      if (g.boss) {
        ctx.font = '56px serif'
        ctx.globalAlpha = 1.0
        ctx.fillText('👑', g.boss.x, g.boss.y)

        // HP bar
        const bw = 90, bh = 8
        const bx = g.boss.x - bw / 2
        const by = g.boss.y + 38
        ctx.globalAlpha = 0.9
        ctx.fillStyle = '#1e1e2e'
        ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2)
        const ratio = g.boss.hp / g.boss.maxHp
        ctx.fillStyle = ratio > 0.6 ? '#22c55e' : ratio > 0.3 ? '#f59e0b' : '#ef4444'
        ctx.fillRect(bx, by, bw * ratio, bh)
        ctx.globalAlpha = 1.0
      }

      // Player bullets (ketchup drops)
      ctx.fillStyle = '#e63946'
      for (const b of g.pBullets) {
        ctx.globalAlpha = 0.95
        ctx.beginPath()
        ctx.ellipse(b.x, b.y, 3, 9, 0, 0, Math.PI * 2)
        ctx.fill()
      }

      // Enemy bullets (sauce drops)
      ctx.fillStyle = '#84cc16'
      for (const b of g.eBullets) {
        ctx.globalAlpha = 0.9
        ctx.beginPath()
        ctx.ellipse(b.x, b.y, 3, 9, 0, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1.0

      // Player
      if (g.player.blinkOn) {
        ctx.font = '42px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🍗', g.player.x, PLAYER_Y)
      }
    },

    shoot() {
      const g = this._game
      if (!g || g.pBullets.length >= MAX_PBULLETS) return
      g.pBullets.push({ id: this._bulletId++, x: g.player.x, y: PLAYER_Y - 30 })
    },

    waveClear() {
      this.gameState = 'wave-clear'
      this.score += this.wave * 50
      setTimeout(() => {
        if (this.gameState !== 'wave-clear') return
        this.wave++
        this._game = this._buildWave()
        this._game.lastTime = performance.now()
        this.gameState = 'playing'
      }, 2200)
    },

    async endGame() {
      this.gameState = 'over'
      if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null }
      if (this.score > 0) {
        try { await this.scoresStore.saveScore('ketchup-defender', this.score) } catch { /* not logged in */ }
      }
    },

    onKeyDown(e) {
      if (['ArrowLeft', 'ArrowRight', ' ', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault()
      this._keysDown.add(e.key)
      if (e.key === ' ') {
        if (this.gameState === 'idle' || this.gameState === 'over') this.startGame()
        else if (this.gameState === 'playing') this.shoot()
      }
    },
    onKeyUp(e) { this._keysDown.delete(e.key) },
  },

  mounted() {
    this._keysDown = new Set()
    this._raf = null
    this._bulletId = 0
    this._game = { player: { x: W / 2, blinkOn: true, invulnerable: false, invulTimer: 0, lastBlink: 0 }, enemies: [], boss: null, pBullets: [], eBullets: [], lastTime: 0, totalEnemies: 0 }
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    // Initial canvas fill
    const canvas = this.$refs.canvas
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#12131f'
      ctx.fillRect(0, 0, W, H)
    }
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    if (this._raf) cancelAnimationFrame(this._raf)
  },
}
</script>
