<template>
  <div class="game-wrapper">
    <div class="game-header">
      <div class="titles">
        <h1>Krousty Run</h1>
        <p>Saute (Espace/Haut) sur les friteuses, baisse-toi (Bas) pour les spatules !</p>
      </div>
      <div class="score-board">
        <div class="lives-box">
          <span v-for="n in lives" :key="'life-'+n" class="life-icon">🍗</span>
        </div>
        <div class="score-box">
          <span>SCORE</span>
          <strong>{{ Math.floor(score) }}</strong>
        </div>
      </div>
    </div>

    <div class="game-container">
      <div v-if="gameOver" class="game-overlay">
        <h2>Game Over 💀</h2>
        <button class="primary-btn" @click="resetGame">Rejouer</button>
      </div>
      <div v-if="!gameStarted && !gameOver" class="game-overlay">
        <h2>Prêt à courir ?</h2>
        <button class="primary-btn" @click="startGame">Jouer</button>
      </div>

      <div class="run-area" ref="runArea">
        <div class="sky-background">
        </div>
        
        <div
          class="player"
          :class="{ 'player-ducking': isDucking, 'is-invulnerable': isInvulnerable }"
          :style="{ bottom: (15 + player.y) + 'px' }"
        >
          <img src="../../assets/img/krousty_poulet.png" class="poulet-img" alt="Poulet Crousty" />
        </div>

        <div
          v-for="obs in obstacles"
          :key="obs.id"
          class="obstacle"
        :style="{ left: obs.x + 'px', bottom: obs.bottom + 'px', width: obs.width + 'px', height: obs.height + 'px' }"
        >
          <img v-if="obs.type === 'friteuse'" src="../../assets/img/friteuse.png" alt="Friteuse" style="width: 100%; height: 100%; object-fit: contain;" />
          <img v-else src="../../assets/img/spatule.png" alt="Spatule" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>

        <div class="ground"></div>
      </div>
    </div>

    <div class="controls-hint">
      <p>🎮 <strong>Espace / Flèche Haut</strong> pour sauter, <strong>Flèche Bas</strong> pour glisser.</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      gameStarted: false,
      gameOver: false,
      score: 0,
      lives: 3,
      isInvulnerable: false,
      lastTime: 0,
      gameSpeed: 350,
      player: {
        y: 0,
        vy: 0,
        isJumping: false,
        gravity: 2500,
        jumpPower: 800
      },
      isDucking: false,
      obstacles: [],
      nextObstacleTime: 0,
      obstacleId: 0,
      animationFrameId: null
    };
  },
  methods: {
    startGame() {
      this.resetGame();
      this.gameStarted = true;
      this.lastTime = performance.now();
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    },
    resetGame() {
      this.gameOver = false;
      this.score = 0;
      this.lives = 3;
      this.isInvulnerable = false;
      this.obstacles = [];
      this.player.y = 0;
      this.player.vy = 0;
      this.player.isJumping = false;
      this.isDucking = false;
      this.gameSpeed = 350;
      this.nextObstacleTime = 1000;
      this.gameStarted = false; 
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    },
    handleKeydown(e) {
      if (["Space", " ", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
      }

      if (this.gameOver && (e.key === " " || e.key === "Space")) {
        this.startGame();
        return;
      }
      if (!this.gameStarted && (e.key === " " || e.key === "Space")) {
        this.startGame();
        return;
      }

      if (["Space", " ", "ArrowUp"].includes(e.key)) {
        if (!this.player.isJumping && !this.isDucking) {
          this.player.vy = this.player.jumpPower;
          this.player.isJumping = true;
        }
      }

      if (e.key === "ArrowDown") {
        if (!this.player.isJumping) {
          this.isDucking = true;
        } else {
          // Plongeon rapide si le joueur est en l'air (très utile pour esquiver rapidement)
          this.player.vy -= 1500;
        }
      }
    },
    handleKeyup(e) {
      if (e.key === "ArrowDown") {
        this.isDucking = false;
      }
    },
    gameLoop(time) {
      if (this.gameOver) return;

      const delta = (time - this.lastTime) / 1000;
      this.lastTime = time;

      // Prévenir les bugs physiques si l'utilisateur change d'onglet
      if (delta > 0.1) {
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
        return;
      }

      this.updatePlayer(delta);
      this.updateObstacles(delta);
      this.checkCollisions();

      this.score += delta * 20;
      this.gameSpeed += delta * 2; // Accélération progressive

      if (!this.gameOver) {
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
      }
    },
    updatePlayer(delta) {
      if (this.player.isJumping) {
        this.player.y += this.player.vy * delta;
        this.player.vy -= this.player.gravity * delta;

        if (this.player.y <= 0) {
          this.player.y = 0;
          this.player.isJumping = false;
          this.player.vy = 0;
        }
      }
    },
    updateObstacles(delta) {
      this.nextObstacleTime -= delta * 1000;
      if (this.nextObstacleTime <= 0) {
        this.spawnObstacle();
        const minTime = Math.max(400, 1200 - (this.gameSpeed - 350));
        this.nextObstacleTime = minTime + Math.random() * 1500;
      }

      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        obs.x -= this.gameSpeed * delta;
        if (obs.x < -100) { // Augmenté pour correspondre à la nouvelle taille
          this.obstacles.splice(i, 1);
        }
      }
    },
    spawnObstacle() {
      const isFlying = Math.random() > 0.5;
      this.obstacles.push({
        id: this.obstacleId++,
        type: isFlying ? "spatule" : "friteuse",
        x: 600, // Apparition juste en dehors du conteneur (600px de large)
        bottom: isFlying ? 120 : 15, // Spatule plus haute, friteuse au niveau du joueur
        width: 95,
        height: 95
      });
    },
    checkCollisions() {
      // Hitbox plus petite que les sprites (10px de marge) pour pardonner visuellement
      const pLeft = 50 + 10; 
      const pWidth = this.isDucking ? 90 : 70;
      const pRight = 50 + pWidth - 10;
      const pBottom = this.player.y + 15 + 10;
      const pHeight = this.isDucking ? 45 : 80;
      const pTop = this.player.y + 15 + pHeight - 10;

      for (const obs of this.obstacles) {
        const oLeft = obs.x + 25;
        const oRight = obs.x + obs.width - 25;
        const oBottom = obs.bottom + 20;
        const oTop = obs.bottom + obs.height - 20;

        if (pLeft < oRight && pRight > oLeft && pBottom < oTop && pTop > oBottom) {
          if (!this.isInvulnerable) {
            this.lives--;
            if (this.lives <= 0) {
              this.gameOver = true;
              cancelAnimationFrame(this.animationFrameId);
            } else {
              this.isInvulnerable = true;
              setTimeout(() => {
                this.isInvulnerable = false;
              }, 1500);
            }
          }
        }
      }
    }
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeydown);
    window.addEventListener("keyup", this.handleKeyup);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeydown);
    window.removeEventListener("keyup", this.handleKeyup);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
};
</script>

<style scoped>
.game-wrapper {
  display: flex; flex-direction: column; align-items: center;
  font-family: 'Poppins', sans-serif; color: #ffffff; padding: 20px;
}
.game-header {
  display: flex; justify-content: space-between; align-items: center;
  width: 100%; max-width: 600px; margin-bottom: 20px; gap: 20px;
}
.titles { flex: 1; }
.titles h1 { font-size: 2.5rem; font-weight: 800; margin: 0; color: #8c52ff; letter-spacing: -1px; }
.titles p { margin: 0; color: #63667c; font-size: 0.9rem; line-height: 1.4; }
.score-board { flex-shrink: 0; display: flex; align-items: center; gap: 15px; }
.lives-box { display: flex; gap: 5px; }
.life-icon { font-size: 2rem; line-height: 1; } /* Style pour l'emoji */
.score-box {
  background-color: #232533; padding: 10px 20px; border-radius: 12px;
  text-align: center; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}
.score-box span { display: block; font-size: 0.75rem; color: #8c52ff; font-weight: bold; }
.score-box strong { font-size: 1.5rem; font-weight: 700; }

.game-container {
  position: relative; background-color: #161722; padding: 10px;
  border-radius: 15px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 600px; height: 350px; 
}
.run-area {
  position: relative; width: 100%; height: 100%;
  background-color: #1e1e24; border-radius: 10px; overflow: hidden;
}
.sky-background {
  position: absolute; top: 0; left: 0; right: 0; bottom: 30px;
  background-color: #f8f9fa; /* Couleur de secours si l'image ne charge pas */
  background-image: url('../../assets/img/background_kitchen.png');
  background-size: 400px 100%;
  background-repeat: repeat-x;
  animation: scrollBg 15s linear infinite;
}
@keyframes scrollBg {
  from { background-position: 0 0; }
  to { background-position: -400px 0; }
}
.ground {
  position: absolute; bottom: 0; left: 0; width: 100%; height: 30px;
  background-color: #313346; border-top: 4px solid #232533; z-index: 1;
}

.player {
  position: absolute; left: 50px; width: 70px; height: 80px;
  z-index: 2; transition: height 0.1s, width 0.1s;
}
.poulet-img { width: 100%; height: 100%; display: block; }
.player-ducking { height: 45px; width: 90px; }
.is-invulnerable { animation: blink 0.2s infinite; }
@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
}

.obstacle {
  position: absolute; display: flex;
  align-items: center; justify-content: center; font-size: 2rem; z-index: 2;
}

.game-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 16, 22, 0.85); display: flex; flex-direction: column;
  justify-content: center; align-items: center; border-radius: 15px; z-index: 10;
  backdrop-filter: blur(3px);
}
.game-overlay h2 { font-size: 2.5rem; margin-bottom: 20px; color: #fff; text-align: center; }
.controls-hint { margin-top: 20px; text-align: center; color: #63667c; font-size: 0.9rem; }
.primary-btn {
  font-family: 'Poppins', sans-serif; font-weight: 700; border: none;
  border-radius: 20px; cursor: pointer; background-color: #8c52ff; color: white;
  padding: 12px 30px; font-size: 1.1rem; transition: transform 0.2s;
}
.primary-btn:hover { transform: scale(1.05); }
</style>