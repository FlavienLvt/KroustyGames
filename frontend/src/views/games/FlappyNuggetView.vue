<template>
  <div class="flex flex-col items-center text-white p-5">
    <!-- Header -->
    <div class="flex justify-between items-center w-full max-w-[400px] mb-5 gap-5">
      <div class="flex-1">
        <h1 class="text-[2.5rem] font-extrabold m-0 text-[#f97316] tracking-[-1px]">Flappy Nugget</h1>
        <p class="m-0 text-[#63667c] text-[0.9rem] leading-[1.4]">Cliquez ou appuyez sur Espace pour faire voler le nugget !</p>
      </div>
      <div class="bg-[#232533] px-5 py-2.5 rounded-xl text-center shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
        <span class="block text-[0.75rem] text-[#f97316] font-bold">SCORE</span>
        <strong class="text-[1.5rem] font-bold">{{ score }}</strong>
      </div>
    </div>

    <!-- Game container -->
    <div
      class="relative bg-[#70c5ce] rounded-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] w-[400px] h-[600px] overflow-hidden cursor-pointer"
      ref="gameContainer"
      @click="flap"
    >
      <!-- Game over overlay -->
      <div v-if="gameOver" class="absolute inset-0 bg-[rgba(15,16,22,0.7)] flex flex-col justify-center items-center rounded-[15px] z-20 backdrop-blur-sm text-center">
        <h2 class="text-[2.5rem] mb-2.5 text-white">Game Over 💀</h2>
        <p class="text-[1.2rem] text-[#ccc] mb-5">Score final : {{ score }}</p>
        <button
          class="font-bold border-none rounded-full cursor-pointer bg-[#f97316] text-white px-8 py-3 text-[1.1rem] transition-transform duration-200 hover:scale-105"
          @click="startGame"
        >
          Rejouer
        </button>
      </div>

      <!-- Start overlay -->
      <div v-if="!gameStarted && !gameOver" class="absolute inset-0 bg-[rgba(15,16,22,0.7)] flex flex-col justify-center items-center rounded-[15px] z-20 backdrop-blur-sm text-center">
        <h2 class="text-[2.5rem] mb-2.5 text-white">Prêt à voler ?</h2>
        <button
          class="font-bold border-none rounded-full cursor-pointer bg-[#f97316] text-white px-8 py-3 text-[1.1rem] transition-transform duration-200 hover:scale-105"
          @click="startGame"
        >
          Jouer
        </button>
      </div>

      <div class="relative w-full h-full">
        <!-- Player -->
        <div
          class="absolute left-[50px] top-0 w-[50px] h-[50px] -ml-[25px] -mt-[25px] z-10 transition-transform duration-100 ease-linear"
          :style="{ transform: `translateY(${player.y}px) rotate(${player.vy * 0.1}deg)` }"
        >
          <img src="../../assets/img/flappy.png" alt="Flappy Nugget" class="w-full h-full object-contain drop-shadow-[2px_2px_2px_rgba(0,0,0,0.3)]" />
        </div>

        <!-- Pipes -->
        <div
          v-for="pipe in pipes"
          :key="pipe.id"
          class="absolute top-0 bottom-0 w-[80px] z-[1]"
          :style="{ left: pipe.x + 'px' }"
        >
          <div class="absolute top-0 left-0 w-full" :style="{ height: pipe.topHeight + 'px' }">
            <img src="../../assets/img/mayo_down.png" alt="Top Pipe" class="w-full h-full object-fill" />
          </div>
          <div class="absolute bottom-0 left-0 w-full" :style="{ height: pipe.bottomHeight + 'px' }">
            <img src="../../assets/img/mayo_up.png" alt="Bottom Pipe" class="w-full h-full object-fill" />
          </div>
        </div>
      </div>
    </div>

    <!-- Controls hint -->
    <div class="mt-5 text-center text-[#63667c] text-[0.9rem]">
      <p>🎮 <strong>Espace / Clic</strong> pour voler.</p>
    </div>
  </div>
</template>

<script>
import { useScoresStore } from '../../stores/scores';

export default {
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
      gameSpeed: 150,
      player: { y: 300, vy: 0, gravity: 800, flapPower: 300 },
      pipes: [],
      pipeGap: 160,
      pipeWidth: 80,
      pipeSpawnTimer: 0,
      pipeSpawnInterval: 2,
      nextPipeId: 0,
      animationFrameId: null,
      containerHeight: 600,
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
      this.player.y = this.containerHeight / 2;
      this.player.vy = 0;
      this.pipes = [];
      this.pipeSpawnTimer = 0;
      this.gameStarted = false;
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    },
    handleKeydown(e) {
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        if (!this.gameStarted)     this.startGame();
        else if (!this.gameOver)   this.flap();
        else                       this.startGame();
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
      if (delta > 0.1) { this.animationFrameId = requestAnimationFrame(this.gameLoop); return; }
      this.updatePlayer(delta);
      this.updatePipes(delta);
      this.checkCollisions();
      if (!this.gameOver) this.animationFrameId = requestAnimationFrame(this.gameLoop);
    },
    updatePlayer(delta) {
      this.player.vy += this.player.gravity * delta;
      this.player.y  += this.player.vy * delta;
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
        if (!pipe.passed && pipe.x < 50 - this.pipeWidth) { pipe.passed = true; this.score++; }
        if (pipe.x < -this.pipeWidth) this.pipes.splice(i, 1);
      }
    },
    spawnPipe() {
      const minHeight = 40;
      const topHeight = Math.random() * (this.containerHeight - this.pipeGap - minHeight * 2) + minHeight;
      this.pipes.push({
        id: this.nextPipeId++,
        x: this.$refs.gameContainer.clientWidth,
        topHeight,
        bottomHeight: this.containerHeight - topHeight - this.pipeGap,
        passed: false,
      });
    },
    checkCollisions() {
      const size = 30;
      const pLeft   = 50 - size / 2, pRight  = 50 + size / 2;
      const pTop    = this.player.y - size / 2, pBottom = this.player.y + size / 2;
      if (pBottom > this.containerHeight || pTop < 0) { this.endGame(); return; }
      for (const pipe of this.pipes) {
        const pipeRight  = pipe.x + this.pipeWidth;
        if (pRight > pipe.x && pLeft < pipeRight) {
          if (pTop < pipe.topHeight || pBottom > this.containerHeight - pipe.bottomHeight) {
            this.endGame(); return;
          }
        }
      }
    },
    async endGame() {
      this.gameOver = true;
      this.gameStarted = false;
      cancelAnimationFrame(this.animationFrameId);
      const finalScore = Math.floor(this.score);
      if (finalScore > 0) {
        try {
          await this.scoresStore.saveScore('flappy-nugget', finalScore);
          console.log('Score sauvegardé avec succès !');
        } catch {
          console.log("Le score n'a pas été sauvegardé (non connecté ou erreur).");
        }
      }
    },
  },
  mounted() {
    this.containerHeight = this.$refs.gameContainer.clientHeight;
    this.resetGame();
    window.addEventListener('keydown', this.handleKeydown);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  },
};
</script>
