<script>
import { useScoresStore } from '../../stores/scores'

const W = 600, H = 500
const PLAYER_R = 16, ENEMY_R = 14, BULLET_R = 5
const BASE_PLAYER_SPEED = 200
const BASE_SHOOT = 0.8
const INVINCIBLE_DUR = 1.5

const UPGRADE_POOL = [
  { id: 'life',       icon: '❤️',  label: '+1 Vie',           desc: 'Récupère un point de vie' },
  { id: 'fastshoot',  icon: '⚡',  label: 'Tir rapide',       desc: "Intervalle de tir réduit de 30%" },
  { id: 'speed',      icon: '🏃',  label: 'Accélération',     desc: 'Vitesse de déplacement +40%' },
  { id: 'pierce',     icon: '🎯',  label: 'Balle perçante',   desc: 'Les balles traversent les ennemis' },
  { id: 'triple',     icon: '💫',  label: 'Triple tir',       desc: 'Tire vers 3 ennemis simultanément' },
  { id: 'shield',     icon: '🛡️', label: 'Bouclier+',        desc: "Durée d'invincibilité doublée" },
]

function pickUpgrades(activeIds) {
  const pool = UPGRADE_POOL.filter(u => {
    if (u.id === 'life') return true
    if (u.id === 'pierce' && activeIds.includes('pierce')) return false
    if (u.id === 'triple' && activeIds.includes('triple')) return false
    if (u.id === 'shield' && activeIds.includes('shield')) return false
    return true
  })
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

export default {
  name: 'KroustySurvivorsView',
  setup() { return { scoresStore: useScoresStore() } },
  data() {
    return {
      screen: 'start', // start | playing | upgrade | gameover
      score: 0,
      wave: 0,
      player: null,
      enemies: [],
      projectiles: [],
      keys: { up: false, down: false, left: false, right: false },
      shootTimer: 0,
      invincibleTimer: 0,
      blink: false,
      waveSpawnQueue: 0,
      spawnTimer: 0,
      enemiesPerWave: 0,
      killedThisWave: 0,
      pendingUpgrades: [],
      activeUpgrades: [],
      rafId: null,
      lastTime: null,
      stats: { playerSpeed: BASE_PLAYER_SPEED, shootInterval: BASE_SHOOT, pierce: false, triple: false, invincibleDuration: INVINCIBLE_DUR }
    }
  },
  mounted() {
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    cancelAnimationFrame(this.rafId)
  },
  methods: {
    startGame() {
      this.score = 0
      this.wave = 0
      this.player = { x: W/2, y: H/2, lives: 3 }
      this.enemies = []
      this.projectiles = []
      this.shootTimer = 0
      this.invincibleTimer = 0
      this.blink = false
      this.activeUpgrades = []
      this.stats = { playerSpeed: BASE_PLAYER_SPEED, shootInterval: BASE_SHOOT, pierce: false, triple: false, invincibleDuration: INVINCIBLE_DUR }
      this.screen = 'playing'
      this.startWave()
      this.lastTime = null
      cancelAnimationFrame(this.rafId)
      this.rafId = requestAnimationFrame(this.loop)
    },

    startWave() {
      this.wave++
      const count = 3 + this.wave * 3
      this.enemiesPerWave = count
      this.waveSpawnQueue = count
      this.killedThisWave = 0
      this.spawnTimer = 0.5
    },

    loop(ts) {
      if (!this.lastTime) this.lastTime = ts
      const delta = Math.min((ts - this.lastTime) / 1000, 0.05)
      this.lastTime = ts
      if (this.screen === 'playing') this.update(delta)
      this.draw()
      if (this.screen !== 'gameover') this.rafId = requestAnimationFrame(this.loop)
    },

    update(delta) {
      const p = this.player

      // Move player
      let vx = 0, vy = 0
      if (this.keys.left)  vx -= this.stats.playerSpeed
      if (this.keys.right) vx += this.stats.playerSpeed
      if (this.keys.up)    vy -= this.stats.playerSpeed
      if (this.keys.down)  vy += this.stats.playerSpeed
      if (vx && vy) { vx *= 0.707; vy *= 0.707 }
      p.x = Math.max(PLAYER_R, Math.min(W - PLAYER_R, p.x + vx * delta))
      p.y = Math.max(PLAYER_R, Math.min(H - PLAYER_R, p.y + vy * delta))

      // Invincibility blink
      if (this.invincibleTimer > 0) {
        this.invincibleTimer -= delta
        this.blink = Math.floor(this.invincibleTimer * 8) % 2 === 0
      } else {
        this.blink = false
      }

      // Spawn enemies progressively
      if (this.waveSpawnQueue > 0) {
        this.spawnTimer -= delta
        if (this.spawnTimer <= 0) {
          this.spawnEnemy()
          this.waveSpawnQueue--
          this.spawnTimer = Math.max(0.4, 1.5 - this.wave * 0.15)
        }
      }

      // Move enemies toward player
      const speed = 50 + this.wave * 14
      for (const e of this.enemies) {
        const dx = p.x - e.x, dy = p.y - e.y
        const d = Math.hypot(dx, dy) || 1
        e.x += (dx/d) * e.speed * delta
        e.y += (dy/d) * e.speed * delta
      }

      // Auto-shoot
      this.shootTimer -= delta
      if (this.shootTimer <= 0 && this.enemies.length > 0) {
        this.shootTimer = this.stats.shootInterval
        this.doShoot()
      }

      // Move bullets
      for (const b of this.projectiles) { b.x += b.vx * delta; b.y += b.vy * delta }

      // Bullets hit enemies
      const BULLET_SPEED = 340
      for (let bi = this.projectiles.length - 1; bi >= 0; bi--) {
        const b = this.projectiles[bi]
        if (b.x < -30 || b.x > W+30 || b.y < -30 || b.y > H+30) { this.projectiles.splice(bi, 1); continue }
        for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
          const e = this.enemies[ei]
          if (Math.hypot(b.x - e.x, b.y - e.y) < BULLET_R + ENEMY_R) {
            this.enemies.splice(ei, 1)
            this.score += 10
            this.killedThisWave++
            if (!this.stats.pierce) { this.projectiles.splice(bi, 1); break }
          }
        }
      }

      // Enemy hits player
      if (this.invincibleTimer <= 0) {
        for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
          if (Math.hypot(this.enemies[ei].x - p.x, this.enemies[ei].y - p.y) < ENEMY_R + PLAYER_R) {
            this.enemies.splice(ei, 1)
            this.killedThisWave++  // compte aussi les ennemis qui touchent le joueur
            p.lives--
            this.invincibleTimer = this.stats.invincibleDuration
            if (p.lives <= 0) { this.endGame(); return }
            break
          }
        }
      }

      // Wave clear check
      if (this.waveSpawnQueue === 0 && this.enemies.length === 0 && this.killedThisWave >= this.enemiesPerWave) {
        this.score += this.wave * 50
        this.pendingUpgrades = pickUpgrades(this.activeUpgrades)
        this.screen = 'upgrade'
        cancelAnimationFrame(this.rafId)
      }
    },

    doShoot() {
      const p = this.player
      const sorted = [...this.enemies].sort((a, b) => Math.hypot(a.x-p.x, a.y-p.y) - Math.hypot(b.x-p.x, b.y-p.y))
      const targets = this.stats.triple ? sorted.slice(0, 3) : sorted.slice(0, 1)
      const BULLET_SPEED = 340
      for (const t of targets) {
        const dx = t.x - p.x, dy = t.y - p.y
        const d = Math.hypot(dx, dy) || 1
        this.projectiles.push({ x: p.x, y: p.y, vx: (dx/d)*BULLET_SPEED, vy: (dy/d)*BULLET_SPEED })
      }
    },

    spawnEnemy() {
      const side = Math.floor(Math.random() * 4)
      let x, y
      if (side === 0) { x = Math.random()*W; y = -20 }
      else if (side === 1) { x = W+20; y = Math.random()*H }
      else if (side === 2) { x = Math.random()*W; y = H+20 }
      else { x = -20; y = Math.random()*H }
      const speed = 55 + this.wave * 14 + Math.random()*20
      this.enemies.push({ x, y, speed })
    },

    chooseUpgrade(upg) {
      this.activeUpgrades.push(upg.id)
      if (upg.id === 'life') this.player.lives = Math.min(this.player.lives + 1, 6)
      if (upg.id === 'fastshoot') this.stats.shootInterval = Math.max(0.25, this.stats.shootInterval * 0.7)
      if (upg.id === 'speed') this.stats.playerSpeed = Math.min(this.stats.playerSpeed * 1.4, 420)
      if (upg.id === 'pierce') this.stats.pierce = true
      if (upg.id === 'triple') this.stats.triple = true
      if (upg.id === 'shield') this.stats.invincibleDuration = INVINCIBLE_DUR * 2
      this.screen = 'playing'
      this.startWave()
      this.lastTime = null
      this.rafId = requestAnimationFrame(this.loop)
    },

    async endGame() {
      this.screen = 'gameover'
      cancelAnimationFrame(this.rafId)
      this.draw()
      if (this.score > 0) {
        try { await this.scoresStore.saveScore('krousty-survivors', this.score) } catch (_) {}
      }
    },

    draw() {
      const canvas = this.$refs.canvas
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#0f1016'; ctx.fillRect(0, 0, W, H)

      // Grid
      ctx.strokeStyle = '#1e2030'; ctx.lineWidth = 1
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke() }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke() }

      // Bullets
      ctx.fillStyle = '#f4a261'
      for (const b of this.projectiles) { ctx.beginPath(); ctx.arc(b.x, b.y, BULLET_R, 0, Math.PI*2); ctx.fill() }

      // Enemies
      ctx.font = `${ENEMY_R*2}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      for (const e of this.enemies) {
        ctx.fillStyle = '#e63946'; ctx.beginPath(); ctx.arc(e.x, e.y, ENEMY_R, 0, Math.PI*2); ctx.fill()
        ctx.fillText('🍟', e.x, e.y+1)
      }

      // Player
      if (!this.blink && this.player) {
        ctx.fillStyle = '#8c52ff'; ctx.beginPath(); ctx.arc(this.player.x, this.player.y, PLAYER_R, 0, Math.PI*2); ctx.fill()
        ctx.font = `${PLAYER_R*2}px serif`
        ctx.fillText('🍗', this.player.x, this.player.y+1)
      }

      // HUD
      if (this.player) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, 38)
        ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Poppins,sans-serif'
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
        ctx.fillText(`Score: ${this.score}`, 12, 19)
        ctx.textAlign = 'center'
        ctx.fillText(`Vague ${this.wave}`, W/2, 19)
        ctx.textAlign = 'right'
        const lives = '❤️'.repeat(Math.max(0, this.player.lives))
        ctx.fillText(lives, W - 10, 19)
      }

      // Wave progress bar
      if (this.screen === 'playing' && this.enemiesPerWave > 0) {
        const progress = this.killedThisWave / this.enemiesPerWave
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, H-6, W, 6)
        ctx.fillStyle = '#8c52ff'; ctx.fillRect(0, H-6, W * progress, 6)
      }
    },

    onKeyDown(e) {
      if (['ArrowUp','w','z'].includes(e.key)) this.keys.up = true
      if (['ArrowDown','s'].includes(e.key))   this.keys.down = true
      if (['ArrowLeft','a','q'].includes(e.key)) this.keys.left = true
      if (['ArrowRight','d'].includes(e.key))  this.keys.right = true
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault()
    },
    onKeyUp(e) {
      if (['ArrowUp','w','z'].includes(e.key)) this.keys.up = false
      if (['ArrowDown','s'].includes(e.key))   this.keys.down = false
      if (['ArrowLeft','a','q'].includes(e.key)) this.keys.left = false
      if (['ArrowRight','d'].includes(e.key))  this.keys.right = false
    }
  }
}
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <h1 class="text-3xl font-extrabold text-white">🛡️ Krousty Survivors</h1>

    <!-- Start -->
    <div v-if="screen === 'start'" class="flex flex-col items-center gap-4">
      <p class="text-[#b0b3c6] text-center max-w-sm">
        Survie face à des vagues d'ennemies !<br>
        Ton personnage tire automatiquement. Choisis des upgrades entre chaque vague.
      </p>
      <p class="text-[#b0b3c6] text-sm">🎮 ZQSD / Flèches pour se déplacer</p>
      <button @click="startGame"
        class="bg-[#e63946] text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-[#d62828] transition">
        Survivre !
      </button>
    </div>

    <!-- Game Over -->
    <div v-if="screen === 'gameover'" class="flex flex-col items-center gap-3">
      <p class="text-2xl font-bold text-white">Game Over !</p>
      <p class="text-[#e63946] text-3xl font-extrabold">{{ score }} pts</p>
      <p class="text-[#b0b3c6] text-sm">Vague {{ wave }} atteinte</p>
      <button @click="startGame"
        class="bg-[#e63946] text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-[#d62828] transition">
        Rejouer
      </button>
    </div>

    <!-- Canvas -->
    <canvas ref="canvas" :width="600" :height="500"
      class="rounded-xl border border-[#232533]"
      :class="{ hidden: screen === 'start' }">
    </canvas>

    <!-- Upgrade overlay (par-dessus le canvas) -->
    <div v-if="screen === 'upgrade'" class="flex flex-col items-center gap-5 -mt-4">
      <div class="bg-[#0f1016]/90 border border-[#8c52ff] rounded-2xl px-8 py-6 flex flex-col items-center gap-4 w-full max-w-xl">
        <p class="text-green-400 font-bold text-lg">✅ Vague {{ wave - 1 }} terminée ! +{{ (wave-1) * 50 }} pts bonus</p>
        <p class="text-white font-bold">Choisis ton amélioration :</p>
        <div class="flex gap-3 flex-wrap justify-center">
          <button
            v-for="upg in pendingUpgrades"
            :key="upg.id"
            @click="chooseUpgrade(upg)"
            class="bg-[#1e2030] border border-[#8c52ff] rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-[#2a2c3f] transition cursor-pointer w-36"
          >
            <span class="text-3xl">{{ upg.icon }}</span>
            <span class="text-white font-bold text-sm text-center leading-tight">{{ upg.label }}</span>
            <span class="text-[#b0b3c6] text-xs text-center leading-tight">{{ upg.desc }}</span>
          </button>
        </div>
      </div>
    </div>

    <p v-if="screen === 'playing'" class="text-[#63667c] text-xs">
      ZQSD / Flèches pour bouger • Tir automatique • Barre violette = progression de vague
    </p>
  </div>
</template>
