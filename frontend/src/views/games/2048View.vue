<template>
    <div class="game-wrapper">
      <div class="game-header">
        <div class="titles">
          <h1>2048</h1>
          <p>Rejoins les nombres pour obtenir la tuile <strong>2048</strong> !</p>
        </div>
        <div class="score-board">
          <div class="score-box">
            <span>SCORE</span>
            <strong>{{ score }}</strong>
          </div>
        </div>
      </div>
  
      <div class="game-container">
        <div v-if="gameOver || gameWon" class="game-overlay">
          <h2>{{ gameWon ? 'Victoire ! 🎉' : 'Game Over 💀' }}</h2>
          <button class="primary-btn" @click="resetGame">Rejouer</button>
        </div>
  
        <div class="grid-background">
          <div v-for="i in 16" :key="'bg-'+i" class="grid-cell"></div>
        </div>
  
        <div class="tile-container">
          <div 
            v-for="tile in tiles" 
            :key="tile.id" 
            class="tile" 
            :style="getTileStyle(tile)"
          >
            <div 
              class="tile-inner"
              :class="['tile-' + (tile.nextValue || tile.value), tile.isNew ? 'tile-new' : '', tile.isMerged ? 'tile-merged' : '']"
            >
              {{ tile.nextValue || tile.value }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="controls-hint">
        <p>🎮 Utilise les <strong>flèches directionnelles</strong> de ton clavier pour jouer.</p>
        <button class="secondary-btn" @click="resetGame">Recommencer</button>
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
        // Structure: { id, value, position, isNew, isMerged, toDelete, nextValue }
        tiles: [], 
        score: 0,
        gameOver: false,
        gameWon: false,
        nextId: 1,
        isAnimating: false // Verrou pour empêcher de spammer
      };
    },
    methods: {
      getTileStyle(tile) {
        const row = Math.floor(tile.position / 4);
        const col = tile.position % 4;
        return {
          // 90px (taille) + 12px (gap) = 102px
          transform: `translate(${col * 102}px, ${row * 102}px)`,
          // Si la tuile va mourir, elle passe en dessous pour cacher le bug visuel
          zIndex: tile.toDelete ? 1 : 2 
        };
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
        const occupiedPositions = this.tiles.map(t => t.position);
        const emptyPositions = Array.from({length: 16}, (_, i) => i).filter(p => !occupiedPositions.includes(p));
          
        if (emptyPositions.length > 0) {
          const randomPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
          const value = Math.random() < 0.9 ? 2 : 4;
          
          this.tiles.push({
            id: this.nextId++,
            value: value,
            position: randomPos,
            isNew: true,
            isMerged: false,
            toDelete: false,
            nextValue: null
          });
        }
      },
      clearTileStates() {
        this.tiles.forEach(t => {
          t.isNew = false;
          t.isMerged = false;
        });
      },
      handleKeydown(e) {
        if (this.gameOver || this.gameWon || this.isAnimating) return;
  
        const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
        if (keys.includes(e.key)) {
          e.preventDefault();
          this.clearTileStates();
          
          let moved = false;
          if (e.key === "ArrowLeft") moved = this.move(-1, 0);
          if (e.key === "ArrowRight") moved = this.move(1, 0);
          if (e.key === "ArrowUp") moved = this.move(0, -1);
          if (e.key === "ArrowDown") moved = this.move(0, 1);
  
          if (moved) {
            this.isAnimating = true; // On verrouille le clavier
            
            // On attend la fin de la transition CSS (150ms) pour fusionner mathématiquement
            setTimeout(() => {
              this.cleanupAndMerge();
              this.addRandomTile();
              this.checkGameState();
              this.isAnimating = false; // On déverrouille
            }, 150);
          }
        }
      },
      
      // --- Phase 1 : Le Glissement ---
      move(dirX, dirY) {
        let moved = false;
        let mergedThisTurn = []; // IDs des tuiles déjà fusionnées ce tour-ci
  
        // On trie pour bouger d'abord les tuiles les plus proches du bord visé
        this.tiles.sort((a, b) => {
          const rowA = Math.floor(a.position / 4), colA = a.position % 4;
          const rowB = Math.floor(b.position / 4), colB = b.position % 4;
          if (dirX === -1) return colA - colB;      
          if (dirX === 1) return colB - colA;       
          if (dirY === -1) return rowA - rowB;      
          if (dirY === 1) return rowB - rowA;       
          return 0;
        });
  
        this.tiles.forEach(tile => {
          let row = Math.floor(tile.position / 4);
          let col = tile.position % 4;
          let targetRow = row;
          let targetCol = col;
          
          while (true) {
            let nextRow = targetRow + dirY;
            let nextCol = targetCol + dirX;
            
            if (nextRow < 0 || nextRow > 3 || nextCol < 0 || nextCol > 3) break;
            
            let targetPos = nextRow * 4 + nextCol;
            // On cherche ce qu'il y a sur la case cible
            let tileAtTarget = this.tiles.find(t => t.position === targetPos && !t.toDelete);
            
            if (!tileAtTarget) {
              // Case vide, on avance
              targetRow = nextRow;
              targetCol = nextCol;
            } else {
              // Collision !
              if (tileAtTarget.value === tile.value && !mergedThisTurn.includes(tileAtTarget.id)) {
                // Fusion programmée (mais pas encore appliquée visuellement)
                targetRow = nextRow;
                targetCol = nextCol;
                
                tile.toDelete = true; // Cette tuile va glisser puis mourir
                tileAtTarget.nextValue = tileAtTarget.value * 2; // La cible va évoluer
                mergedThisTurn.push(tileAtTarget.id);
              }
              break;
            }
          }
          
          let finalPos = targetRow * 4 + targetCol;
          if (tile.position !== finalPos) {
            tile.position = finalPos; // La tuile commence à glisser via CSS
            moved = true;
          }
        });
        
        return moved;
      },
  
      // --- Phase 2 : Le Nettoyage ---
      cleanupAndMerge() {
        this.tiles.forEach(t => {
          if (t.nextValue) {
            t.value = t.nextValue;
            this.score += t.value;
            t.nextValue = null;
            t.isMerged = true; // Déclenche l'animation de Pop
          }
        });
        // On purge les tuiles mortes
        this.tiles = this.tiles.filter(t => !t.toDelete);
      },
  
      async checkGameState() {
        if (this.tiles.some(t => t.value >= 2048)) this.gameWon = true;
        if (this.tiles.length === 16) {
          let canMove = false;
          const grid = Array(16).fill(0);
          this.tiles.forEach(t => grid[t.position] = t.value);
          
          for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
              const val = grid[r * 4 + c];
              if (c < 3 && val === grid[r * 4 + c + 1]) canMove = true;
              if (r < 3 && val === grid[(r + 1) * 4 + c]) canMove = true;
            }
          }
          if (!canMove){
            this.gameOver = true;
            const finalScore = Math.floor(this.score);
            if (finalScore > 0) {
              try {
                await this.scoresStore.saveScore('2048', finalScore);
                  console.log("Score sauvegardé avec succès !");
                } catch (error) {
                  console.log("Le score n'a pas été sauvegardé (non connecté ou erreur).");
                }
            }
          } 
        }
      }
    },
    mounted() {
      this.resetGame();
      window.addEventListener("keydown", this.handleKeydown);
    },
    beforeUnmount() {
      window.removeEventListener("keydown", this.handleKeydown);
    },
  };
  </script>
  
  <style scoped>
  /* --- Structure globale --- */
  .game-wrapper {
    display: flex; flex-direction: column; align-items: center;
    font-family: 'Poppins', sans-serif; color: #ffffff; padding: 20px;
  }
  .game-header {
    display: flex; justify-content: space-between; align-items: center;
    width: 100%; max-width: 450px; margin-bottom: 30px;
  }
  .titles h1 { font-size: 3rem; font-weight: 800; margin: 0; color: #8c52ff; letter-spacing: -1px; }
  .titles p { margin: 0; color: #63667c; font-size: 0.9rem; }
  .score-box {
    background-color: #232533; padding: 10px 20px; border-radius: 12px;
    text-align: center; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }
  .score-box span { display: block; font-size: 0.75rem; color: #8c52ff; font-weight: bold; }
  .score-box strong { font-size: 1.5rem; font-weight: 700; }
  
  /* --- Grille --- */
  .game-container {
    position: relative; background-color: #161722; padding: 15px;
    border-radius: 15px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    width: 426px; height: 426px; 
  }
  .grid-background {
    display: grid; grid-template-columns: repeat(4, 90px); grid-template-rows: repeat(4, 90px);
    gap: 12px; position: absolute; top: 15px; left: 15px;
  }
  .grid-cell { background-color: #1e1e24; border-radius: 10px; }
  .tile-container {
    position: absolute; top: 15px; left: 15px; width: 396px; height: 396px; z-index: 1;
  }
  
  /* --- La Tuile --- */
  .tile {
    position: absolute;
    width: 90px; height: 90px;
    /* C'est ICI que se fait le glissement. Timing synchronisé avec le setTimeout ! */
    transition: transform 0.15s ease-in-out; 
  }
  
  .tile-inner {
    width: 100%; height: 100%; border-radius: 10px;
    display: flex; justify-content: center; align-items: center;
    font-size: 2rem; font-weight: 700; color: #ffffff; background-color: #313346;
    transform-origin: center;
  }
  
  /* --- Animations de rebond (Pop) --- */
  .tile-new { animation: appear 0.2s ease backwards; }
  .tile-merged { animation: pop 0.2s ease backwards; }
  
  @keyframes appear {
    0% { transform: scale(0); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes pop {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  
  /* --- Couleurs --- */
  .tile-2 { background-color: #2a2c3f; }
  .tile-4 { background-color: #313346; }
  .tile-8 { background-color: #6a35ff; box-shadow: 0 0 10px rgba(106, 53, 255, 0.4); }
  .tile-16 { background-color: #8c52ff; box-shadow: 0 0 15px rgba(140, 82, 255, 0.5); }
  .tile-32 { background-color: #00b4d8; box-shadow: 0 0 15px rgba(0, 180, 216, 0.5); }
  .tile-64 { background-color: #0096b4; }
  .tile-128 { background-color: #ff4d4d; box-shadow: 0 0 15px rgba(255, 77, 77, 0.5); font-size: 1.7rem; }
  .tile-256 { background-color: #ff3333; font-size: 1.7rem; }
  .tile-512 { background-color: #f5c518; color: #0f1016; box-shadow: 0 0 20px rgba(245, 197, 24, 0.6); font-size: 1.7rem; }
  .tile-1024 { background-color: #d4a810; color: #0f1016; font-size: 1.4rem; }
  .tile-2048 { background-color: #38ef7d; color: #0f1016; box-shadow: 0 0 25px rgba(56, 239, 125, 0.8); font-size: 1.4rem; }
  
  /* --- HUD --- */
  .game-overlay {
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 16, 22, 0.85); display: flex; flex-direction: column;
    justify-content: center; align-items: center; border-radius: 15px; z-index: 10;
    backdrop-filter: blur(3px);
  }
  .game-overlay h2 { font-size: 2.5rem; margin-bottom: 20px; color: #fff; }
  .controls-hint { margin-top: 30px; text-align: center; color: #63667c; font-size: 0.9rem; }
  .primary-btn, .secondary-btn { font-family: 'Poppins', sans-serif; font-weight: 700; border: none; border-radius: 20px; cursor: pointer; transition: transform 0.2s; }
  .primary-btn { background-color: #8c52ff; color: white; padding: 12px 30px; font-size: 1.1rem; }
  .primary-btn:hover { transform: scale(1.05); }
  .secondary-btn { background-color: #232533; color: #b0b3c6; padding: 10px 20px; margin-top: 15px; }
  .secondary-btn:hover { background-color: #313346; color: white; }
  </style>