<template>
    <div>
      <section class="category-tags">
        <div v-for="tag in categoryTags" :key="tag.id" class="tag-card" :style="{ background: tag.color }">
          <span class="tag-title">{{ tag.title }}</span>
          <span class="tag-icon">{{ tag.icon }}</span>
        </div>
      </section>
  
      <section class="game-section">
        <h2 class="section-title">Sélection pour vous</h2>
        <div class="top-picks-grid">
          <router-link to="/games/2048" custom v-slot="{ navigate }">
            <div 
              v-for="(game, index) in topPicks" 
              :key="game.id" 
              :class="['game-card', { 'featured': index === 0 }]"
              @click="index === 0 ? navigate() : null" 
            >
              <div v-if="game.badge" class="badge" :class="game.badgeType">{{ game.badge }}</div>
              <img :src="game.image" :alt="game.title" class="game-image" />
            </div>
          </router-link>
        </div>
      </section>
  
      <section class="game-section">
        <h2 class="section-title">Jeux en vedette</h2>
        <div class="standard-grid">
            <div 
            v-for="game in featuredGames" 
            :key="game.id" 
            class="game-card" 
            @click="naviguerVersJeu(game.namePath)"
            >
            <div v-if="game.badge" class="badge" :class="game.badgeType">{{ game.badge }}</div>
            <img :src="game.image" :alt="game.title" class="game-image" />
            </div>
        </div>
        </section>
      
      <section class="game-section">
        <div class="section-header">
          <h2 class="section-title">Nouveaux jeux</h2>
          <a href="#" class="view-more">Voir plus</a>
        </div>
        <div class="standard-grid">
          <div v-for="game in newGames" :key="game.id" class="game-card">
            <img :src="game.image" :alt="game.title" class="game-image" />
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  
  // Initialisation du routeur
  const router = useRouter()
  
  // Déclaration de tes variables réactives avec ref()
  const categoryTags = ref([
    { id: 1, title: "Réflexion", icon: "🧠", color: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)" },
    { id: 2, title: "Adrénaline", icon: "🏎️", color: "linear-gradient(135deg, #4b134f, #c94b4b)" },
    { id: 3, title: "Entre amis", icon: "👏", color: "linear-gradient(135deg, #11998e, #38ef7d)" },
    { id: 4, title: "Fun 5 minutes", icon: "☕", color: "linear-gradient(135deg, #b79891, #94716b)" },
    { id: 5, title: "Classiques", icon: "🕹️", color: "linear-gradient(135deg, #141e30, #243b55)" }
  ])
  
  const topPicks = ref([
    { id: 1, title: "Bloxd.io", image: "https://placehold.co/600x400/2a2a35/ffffff?text=Bloxd.io", badge: "Top", badgeType: "yellow" },
    { id: 2, title: "Archer", image: "https://placehold.co/300x200/2a2a35/ffffff?text=Archer" },
    { id: 3, title: "Moto X3M", image: "https://placehold.co/300x200/2a2a35/ffffff?text=Moto" },
    { id: 4, title: "Veck.io", image: "https://placehold.co/300x200/2a2a35/ffffff?text=Veck.io" },
    { id: 5, title: "Color", image: "https://placehold.co/300x200/2a2a35/ffffff?text=Color" }
  ])
  
  const featuredGames = ref([
    { id: 1, title: "2048", image: "https://placehold.co/300x200/1e1e24/ffffff?text=Clicker", badge: "Updated", badgeType: "blue", namePath: "2048" },
  ])
  
  const newGames = ref([
    { id: 1, title: "Maze", image: "https://placehold.co/300x200/2b2b36/ffffff?text=Maze" },
    { id: 2, title: "Room", image: "https://placehold.co/300x200/2b2b36/ffffff?text=Room" },
    { id: 3, title: "Bot", image: "https://placehold.co/300x200/2b2b36/ffffff?text=Bot" },
    { id: 4, title: "Racing", image: "https://placehold.co/300x200/2b2b36/ffffff?text=Racing" },
    { id: 5, title: "Kebab", image: "https://placehold.co/300x200/2b2b36/ffffff?text=Kebab", badge: "Hot", badgeType: "red" },
    { id: 6, title: "Hoop", image: "https://placehold.co/300x200/2b2b36/ffffff?text=Hoop" }
  ])
  
  // Création d'une fonction propre pour la navigation
  const naviguerVersJeu = (namePath) => {
    if (namePath) {
      router.push({ name: namePath })
    }
  }
  </script>
  
  <style scoped>
  /* CSS des éléments de la page d'accueil uniquement */
  .section-title {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0 0 15px 0;
    letter-spacing: -0.3px;
  }
  
  .category-tags {
    display: flex;
    gap: 15px;
    margin-bottom: 40px;
    overflow-x: auto;
    padding-bottom: 10px;
  }
  
  .category-tags::-webkit-scrollbar { height: 0; }
  
  .tag-card {
    min-width: 160px;
    height: 80px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    transition: transform 0.2s;
    flex-shrink: 0;
  }
  
  .tag-card:hover {
    transform: translateY(-3px);
  }
  
  .tag-title {
    font-weight: 600;
    font-size: 0.95rem;
  }
  
  .tag-icon {
    font-size: 1.8rem;
  }
  
  .game-section {
    margin-bottom: 40px;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  
  .view-more {
    color: #8c52ff;
    text-decoration: none;
    font-size: 0.9rem;
    margin-bottom: 15px;
  }
  
  .view-more:hover {
    text-decoration: underline;
  }
  
  .game-card {
    position: relative;
    background-color: #1e1e24;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .game-card:hover {
    transform: scale(1.03);
    box-shadow: 0 10px 20px rgba(0,0,0,0.4);
    z-index: 1;
  }
  
  .game-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  
  .top-picks-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 140px);
    gap: 15px;
  }
  
  .top-picks-grid .featured {
    grid-column: span 2;
    grid-row: span 2;
  }
  
  .standard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    grid-auto-rows: 120px;
    gap: 15px;
  }
  
  .badge {
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: bold;
    text-transform: uppercase;
    z-index: 2;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  
  .badge.yellow { background-color: #f5c518; color: #000; }
  .badge.blue { background-color: #00b4d8; color: #fff; }
  .badge.red { background-color: #ff4d4d; color: #fff; }
  .badge.purple { background-color: #8c52ff; color: #fff; }
  
  @media (max-width: 900px) {
    .top-picks-grid {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: auto;
    }
    .top-picks-grid .featured {
      grid-column: span 2;
      grid-row: span 2;
      height: 250px;
    }
  }
  </style>