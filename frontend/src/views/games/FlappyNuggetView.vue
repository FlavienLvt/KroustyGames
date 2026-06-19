<template>
  <div class="game-wrapper">
    <div class="game-header">
      <div class="titles">
        <h1>Flappy Nugget</h1>
        <p>Cliquez ou appuyez sur Espace pour faire voler le nugget !</p>
      </div>
      <div class="score-board">
        <div class="score-box">
          <span>SCORE</span>
          <strong>{{ score }}</strong>
        </div>
      </div>
    </div>

    <div class="game-container" ref="gameContainer" @click="flap">
      <div v-if="gameOver" class="game-overlay">
        <h2>Game Over 💀</h2>
        <p>Score final : {{ score }}</p>
        <button class="primary-btn" @click="startGame">Rejouer</button>
      </div>
      <div v-if="!gameStarted && !gameOver" class="game-overlay">
        <h2>Prêt à voler ?</h2>
        <button class="primary-btn" @click="startGame">Jouer</button>
      </div>

      <div class="game-area">
        <div class="player" :style="{ transform: `translateY(${player.y}px) rotate(${player.vy * 0.1}deg)` }">
          <img src="../../assets/img/flappy.png" alt="Flappy Nugget" class="nugget-img">
        </div>

        <div
          v-for="pipe in pipes"
          :key="pipe.id"
          class="pipe-pair"
          :style="{ left: pipe.x + 'px' }"
        >
          <div class="pipe pipe-top" :style="{ height: pipe.topHeight + 'px' }">
            <img src="../../assets/img/mayo_down.png" alt="Top Pipe" class="pipe-img">
          </div>
          <div class="pipe pipe-bottom" :style="{ height: pipe.bottomHeight + 'px' }">
            <img src="../../assets/img/mayo_up.png" alt="Bottom Pipe" class="pipe-img">
          </div>
        </div>
      </div>
    </div>

    <div class="controls-hint">
      <p>🎮 <strong>Espace / Clic</strong> pour voler.</p>
    </div>
  </div>
</template>

<script>
import { useScoresStore } from '../../stores/scores';

export default {
  // 1️⃣ AJOUT : On injecte le store ici
  setup() {
    const scoresStore = useScoresStore();
    return { scoresStore };
  },

  data() {
    return {
      gameStarted: false,
      gameOver: false,
      score: 0,
      lastTime: 0,
      gameSpeed: 150, // pixels par seconde
      player: {
        y: 300, // Position de départ au milieu (600 / 2)
        vy: 0,
        gravity: 800,
        flapPower: 300,
      },
      pipes: [],
      pipeGap: 160,
      pipeWidth: 80,
      pipeSpawnTimer: 0,
      pipeSpawnInterval: 2, // secondes
      nextPipeId: 0,
      animationFrameId: null,
      containerHeight: 600, // Hauteur fixe basée sur le CSS
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
      // On replace le joueur au centre
      this.player.y = this.containerHeight / 2;
      this.player.vy = 0;
      this.pipes = [];
      this.pipeSpawnTimer = 0;
      this.gameStarted = false;
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    },
    handleKeydown(e) {
      if (e.key === " " || e.key === "Space") {
        e.preventDefault();
        if (!this.gameStarted) {
          this.startGame();
        } else if (!this.gameOver) {
          this.flap();
        } else {
          this.startGame();
        }
      }
    },
    flap() {
      if (this.gameOver || !this.gameStarted) return;
      this.player.vy = -this.player.flapPower;
    },
    gameLoop(time) {
      if (this.gameOver) return;

      const delta = (time - this.lastTime) / 1000;
      this.lastTime = time;

      // Évite que le jeu s'emballe si on change d'onglet
      if (delta > 0.1) {
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
        return;
      }

      this.updatePlayer(delta);
      this.updatePipes(delta);
      this.checkCollisions();

      if (!this.gameOver) {
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
      }
    },
    updatePlayer(delta) {
      this.player.vy += this.player.gravity * delta;
      this.player.y += this.player.vy * delta;
    },
    updatePipes(delta) {
      this.pipeSpawnTimer += delta;
      if (this.pipeSpawnTimer > this.pipeSpawnInterval) {
        this.pipeSpawnTimer = 0;
        this.spawnPipe();
      }

      for (let i = this.pipes.length - 1; i >= 0; i--) {
        const pipe = this.pipes[i];
        pipe.x -= this.gameSpeed * delta;

        // Le joueur est à x = 50. On gagne un point quand le tuyau le dépasse
        if (!pipe.passed && pipe.x < 50 - this.pipeWidth) {
          pipe.passed = true;
          this.score++;
        }

        if (pipe.x < -this.pipeWidth) {
          this.pipes.splice(i, 1);
        }
      }
    },
    spawnPipe() {
      const minHeight = 40;
      const maxPipeHeight = this.containerHeight - this.pipeGap - minHeight * 2;
      const topHeight = Math.random() * maxPipeHeight + minHeight;
      const bottomHeight = this.containerHeight - topHeight - this.pipeGap;

      this.pipes.push({
        id: this.nextPipeId++,
        x: this.$refs.gameContainer.clientWidth,
        topHeight,
        bottomHeight,
        passed: false,
      });
    },
    checkCollisions() {
      const playerSize = 30; // Hitbox un peu plus petite que l'image pour être juste
      const playerLeft = 50 - playerSize / 2;
      const playerRight = 50 + playerSize / 2;
      const playerTop = this.player.y - playerSize / 2;
      const playerBottom = this.player.y + playerSize / 2;

      // Limites de l'écran (sol et plafond)
      if (playerBottom > this.containerHeight || playerTop < 0) {
        this.endGame();
        return;
      }

      for (const pipe of this.pipes) {
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + this.pipeWidth;
        const topPipeBottom = pipe.topHeight;
        const bottomPipeTop = this.containerHeight - pipe.bottomHeight;

        // Si on est aligné horizontalement avec le tuyau
        if (playerRight > pipeLeft && playerLeft < pipeRight) {
          // Si on touche le tuyau du haut OU du bas
          if (playerTop < topPipeBottom || playerBottom > bottomPipeTop) {
            this.endGame();
            return;
          }
        }
      }
    },
    
    // 2️⃣ AJOUT : On passe en async et on sauvegarde
    async endGame() {
      this.gameOver = true;
      this.gameStarted = false;
      cancelAnimationFrame(this.animationFrameId);

      const finalScore = Math.floor(this.score);
      if (finalScore > 0) {
        try {
          // On utilise bien le slug 'flappy-nugget' défini dans le router
          await this.scoresStore.saveScore('flappy-nugget', finalScore);
          console.log("Score sauvegardé avec succès !");
        } catch (error) {
          console.log("Le score n'a pas été sauvegardé (non connecté ou erreur).");
        }
      }
    }
  },
  mounted() {
    this.containerHeight = this.$refs.gameContainer.clientHeight;
    this.resetGame();
    window.addEventListener("keydown", this.handleKeydown);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeydown);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  },
};
</script>

<style scoped>
.game-wrapper { display: flex; flex-direction: column; align-items: center; font-family: 'Poppins', sans-serif; color: #ffffff; padding: 20px; }
.game-header { display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 400px; margin-bottom: 20px; gap: 20px; }
.titles { flex: 1; }
.titles h1 { font-size: 2.5rem; font-weight: 800; margin: 0; color: #8c52ff; letter-spacing: -1px; }
.titles p { margin: 0; color: #63667c; font-size: 0.9rem; line-height: 1.4; }
.score-box { background-color: #232533; padding: 10px 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); }
.score-box span { display: block; font-size: 0.75rem; color: #8c52ff; font-weight: bold; }
.score-box strong { font-size: 1.5rem; font-weight: 700; }
.game-container { position: relative; background-color: #70c5ce; border-radius: 15px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); width: 400px; height: 600px; overflow: hidden; cursor: pointer; }

/* Correction du point d'origine du jeu (retrait de translateY) */
.game-area { position: relative; width: 100%; height: 100%; }

.player { position: absolute; left: 50px; top: 0; width: 50px; height: 50px; margin-left: -25px; margin-top: -25px; z-index: 10; transition: transform 0.1s linear; }
.nugget-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.3));
}
.pipe-pair { position: absolute; top: 0; bottom: 0; width: 80px; z-index: 1; }
.pipe { position: absolute; left: 0; width: 100%; }
.pipe-top { top: 0; }
.pipe-bottom { bottom: 0; }
.pipe-img {
  width: 100%;
  height: 100%;
  object-fit: fill;
}
.game-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 16, 22, 0.7); display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: 15px; z-index: 20; backdrop-filter: blur(3px); text-align: center; }
.game-overlay h2 { font-size: 2.5rem; margin-bottom: 10px; color: #fff; }
.game-overlay p { font-size: 1.2rem; color: #ccc; margin-bottom: 20px; }
.controls-hint { margin-top: 20px; text-align: center; color: #63667c; font-size: 0.9rem; }
.primary-btn { font-family: 'Poppins', sans-serif; font-weight: 700; border: none; border-radius: 20px; cursor: pointer; background-color: #8c52ff; color: white; padding: 12px 30px; font-size: 1.1rem; transition: transform 0.2s; }
.primary-btn:hover { transform: scale(1.05); }
</style>