<template>
  <div class="flex flex-col items-center text-white p-5">
    <!-- Header -->
    <div class="flex justify-between items-center w-full max-w-[600px] mb-5 gap-5">
      <div class="flex-1">
        <h1 class="text-[2.5rem] font-extrabold m-0 text-[#f97316] tracking-[-1px]">Krousty Run</h1>
        <p class="m-0 text-[#63667c] text-[0.9rem] leading-[1.4]">Saute (Espace/Haut) sur les friteuses, baisse-toi (Bas) pour les spatules !</p>
      </div>
      <div class="flex-shrink-0 flex items-center gap-4">
        <div class="flex gap-1">
          <span v-for="n in lives" :key="'life-'+n" class="text-[2rem] leading-none">🍗</span>
        </div>
        <div class="bg-[#232533] px-5 py-2.5 rounded-xl text-center shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
          <span class="block text-[0.75rem] text-[#f97316] font-bold">SCORE</span>
          <strong class="text-[1.5rem] font-bold">{{ Math.floor(score) }}</strong>
        </div>
      </div>
    </div>

    <!-- Game container -->
    <div class="relative bg-[#161722] p-2.5 rounded-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] w-[600px] h-[350px]">
      <!-- Game over overlay -->
      <div v-if="gameOver" class="absolute inset-0 bg-[rgba(15,16,22,0.85)] flex flex-col justify-center items-center rounded-[15px] z-10 backdrop-blur-sm">
        <h2 class="text-[2.5rem] mb-5 text-white text-center">Game Over 💀</h2>
        <button
          class="font-bold border-none rounded-full cursor-pointer bg-[#f97316] text-white px-8 py-3 text-[1.1rem] transition-transform duration-200 hover:scale-105"
          @click="resetGame"
        >
          Rejouer
        </button>
      </div>

      <!-- Start overlay -->
      <div v-if="!gameStarted && !gameOver" class="absolute inset-0 bg-[rgba(15,16,22,0.85)] flex flex-col justify-center items-center rounded-[15px] z-10 backdrop-blur-sm">
        <h2 class="text-[2.5rem] mb-5 text-white text-center">Prêt à courir ?</h2>
        <button
          class="font-bold border-none rounded-full cursor-pointer bg-[#f97316] text-white px-8 py-3 text-[1.1rem] transition-transform duration-200 hover:scale-105"
          @click="startGame"
        >
          Jouer
        </button>
      </div>

      <!-- Run area -->
      <div class="relative w-full h-full bg-[#1e1e24] rounded-[10px] overflow-hidden" ref="runArea">
        <!-- Scrolling background -->
        <div
          class="absolute top-0 left-0 right-0 bottom-[30px] animate-scroll-bg"
          :style="{
            backgroundColor: '#f8f9fa',
            backgroundImage: `url(${kitchenBg})`,
            backgroundSize: '400px 100%',
            backgroundRepeat: 'repeat-x',
          }"
        ></div>

        <!-- Player -->
        <div
          class="absolute left-[50px] z-[2] transition-[height,width] duration-100"
          :class="{ 'animate-blink': isInvulnerable }"
          :style="{
            bottom: (15 + player.y) + 'px',
            width:  isDucking ? '90px' : '70px',
            height: isDucking ? '45px' : '80px',
          }"
        >
          <img src="../../assets/img/krousty_poulet.png" class="w-full h-full block" alt="Poulet Crousty" />
        </div>

        <!-- Obstacles -->
        <div
          v-for="obs in obstacles"
          :key="obs.id"
          class="absolute flex items-center justify-center text-[2rem] z-[2]"
          :style="{ left: obs.x + 'px', bottom: obs.bottom + 'px', width: obs.width + 'px', height: obs.height + 'px' }"
        >
          <img v-if="obs.type === 'friteuse'" src="../../assets/img/friteuse.png" alt="Friteuse" class="w-full h-full object-contain" />
          <img v-else src="../../assets/img/spatule.png" alt="Spatule" class="w-full h-full object-contain" />
        </div>

        <!-- Ground -->
        <div class="absolute bottom-0 left-0 w-full h-[30px] bg-[#313346] border-t-4 border-[#232533] z-[1]"></div>
      </div>
    </div>

    <!-- Controls hint -->
    <div class="mt-5 text-center text-[#63667c] text-[0.9rem]">
      <p>🎮 <strong>Espace / Flèche Haut</strong> pour sauter, <strong>Flèche Bas</strong> pour glisser.</p>
    </div>
  </div>
</template>

<script>
import { useScoresStore } from '../../stores/scores';
import kitchenBg from '../../assets/img/background_kitchen.png';

export default {
  setup() {
    const scoresStore = useScoresStore();
    return { scoresStore };
  },
  data() {
    return {
      kitchenBg,
      gameStarted: false,
      gameOver: false,
      score: 0,
      lives: 3,
      isInvulnerable: false,
      lastTime: 0,
      gameSpeed: 350,
      player: { y: 0, vy: 0, isJumping: false, gravity: 2500, jumpPower: 800 },
      isDucking: false,
      obstacles: [],
      nextObstacleTime: 0,
      obstacleId: 0,
      animationFrameId: null,
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
      if (['Space', ' ', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
      if (this.gameOver && (e.key === ' ' || e.key === 'Space')) { this.startGame(); return; }
      if (!this.gameStarted && (e.key === ' ' || e.key === 'Space')) { this.startGame(); return; }
      if (['Space', ' ', 'ArrowUp'].includes(e.key)) {
        if (!this.player.isJumping && !this.isDucking) {
          this.player.vy = this.player.jumpPower;
          this.player.isJumping = true;
        }
      }
      if (e.key === 'ArrowDown') {
        if (!this.player.isJumping) this.isDucking = true;
        else this.player.vy -= 1500;
      }
    },
    handleKeyup(e) {
      if (e.key === 'ArrowDown') this.isDucking = false;
    },
    gameLoop(time) {
      if (this.gameOver) return;
      const delta = (time - this.lastTime) / 1000;
      this.lastTime = time;
      if (delta > 0.1) { this.animationFrameId = requestAnimationFrame(this.gameLoop); return; }
      this.updatePlayer(delta);
      this.updateObstacles(delta);
      this.checkCollisions();
      this.score += delta * 20;
      this.gameSpeed += delta * 2;
      if (!this.gameOver) this.animationFrameId = requestAnimationFrame(this.gameLoop);
    },
    updatePlayer(delta) {
      if (this.player.isJumping) {
        this.player.y  += this.player.vy * delta;
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
        this.obstacles[i].x -= this.gameSpeed * delta;
        if (this.obstacles[i].x < -100) this.obstacles.splice(i, 1);
      }
    },
    spawnObstacle() {
      const isFlying = Math.random() > 0.5;
      this.obstacles.push({
        id: this.obstacleId++,
        type:   isFlying ? 'spatule' : 'friteuse',
        x:      600,
        bottom: isFlying ? 120 : 15,
        width:  95,
        height: 95,
      });
    },
    checkCollisions() {
      const pLeft   = 50 + 10;
      const pWidth  = this.isDucking ? 90 : 70;
      const pRight  = 50 + pWidth - 10;
      const pBottom = this.player.y + 15 + 10;
      const pHeight = this.isDucking ? 45 : 80;
      const pTop    = this.player.y + 15 + pHeight - 10;
      for (const obs of this.obstacles) {
        const oLeft   = obs.x + 25, oRight  = obs.x + obs.width - 25;
        const oBottom = obs.bottom + 20, oTop = obs.bottom + obs.height - 20;
        if (pLeft < oRight && pRight > oLeft && pBottom < oTop && pTop > oBottom) {
          if (!this.isInvulnerable) {
            this.lives--;
            if (this.lives <= 0) {
              this.endGame();
            } else {
              this.isInvulnerable = true;
              setTimeout(() => { this.isInvulnerable = false; }, 1500);
            }
          }
        }
      }
    },
    async endGame() {
      this.gameOver = true;
      this.gameStarted = false;
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      const finalScore = Math.floor(this.score);
      if (finalScore > 0) {
        try {
          await this.scoresStore.saveScore('krousty-run', finalScore);
          console.log('Score sauvegardé avec succès !');
        } catch {
          console.log("Le score n'a pas été sauvegardé (non connecté ou erreur).");
        }
      }
    },
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown);
    window.addEventListener('keyup', this.handleKeyup);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('keyup', this.handleKeyup);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  },
};
</script>
