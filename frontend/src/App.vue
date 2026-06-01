<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="logo">
        <h2>🎮 CrazyJeux</h2>
      </div>
      <nav class="menu">
        <ul>
          <li class="active"><span class="icon">🏠</span> Accueil</li>
          <li><span class="icon">🕒</span> Récents</li>
          <li><span class="icon">✨</span> Nouveautés</li>
          <li><span class="icon">🔥</span> Tendances</li>
        </ul>
        <div class="divider"></div>
        <h3>Catégories</h3>
        <ul>
          <li><span class="icon">⚔️</span> Action</li>
          <li><span class="icon">🗺️</span> Aventure</li>
          <li><span class="icon">🚗</span> Voiture</li>
          <li><span class="icon">🧩</span> Puzzle</li>
          <li><span class="icon">🔫</span> Tir</li>
        </ul>
      </nav>
    </aside>

    <div class="main-wrapper">
      <header class="topbar">
        <div class="search-container">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Rechercher des jeux et des catégories..." class="search-bar" />
        </div>
        <div class="user-actions">
          <button class="icon-btn">🔔</button>
          <button class="icon-btn">❤️</button>
          <button class="login-btn">Se connecter</button>
        </div>
      </header>

      <main class="content">
        <section class="category-tags">
          <div v-for="tag in categoryTags" :key="tag.id" class="tag-card" :style="{ background: tag.color }">
            <span class="tag-title">{{ tag.title }}</span>
            <span class="tag-icon">{{ tag.icon }}</span>
          </div>
        </section>

        <section class="game-section">
          <h2 class="section-title">Sélection pour vous</h2>
          <div class="top-picks-grid">
            <div 
              v-for="(game, index) in topPicks" 
              :key="game.id" 
              :class="['game-card', { 'featured': index === 0 }]"
            >
              <div v-if="game.badge" class="badge" :class="game.badgeType">{{ game.badge }}</div>
              <img :src="game.image" :alt="game.title" class="game-image" />
            </div>
          </div>
        </section>

        <section class="game-section">
          <h2 class="section-title">Jeux en vedette</h2>
          <div class="standard-grid">
            <div v-for="game in featuredGames" :key="game.id" class="game-card">
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
      </main>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      categoryTags: [
        { id: 1, title: "Réflexion", icon: "🧠", color: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)" },
        { id: 2, title: "Adrénaline", icon: "🏎️", color: "linear-gradient(135deg, #4b134f, #c94b4b)" },
        { id: 3, title: "Entre amis", icon: "👏", color: "linear-gradient(135deg, #11998e, #38ef7d)" },
        { id: 4, title: "Fun 5 minutes", icon: "☕", color: "linear-gradient(135deg, #b79891, #94716b)" },
        { id: 5, title: "Classiques", icon: "🕹️", color: "linear-gradient(135deg, #141e30, #243b55)" }
      ],
      topPicks: [
        { id: 1, title: "Bloxd.io", image: "https://placehold.co/600x400/2a2a35/ffffff?text=Bloxd.io", badge: "Top", badgeType: "yellow" },
        { id: 2, title: "Archer", image: "https://placehold.co/300x200/2a2a35/ffffff?text=Archer" },
        { id: 3, title: "Moto X3M", image: "https://placehold.co/300x200/2a2a35/ffffff?text=Moto" },
        { id: 4, title: "Veck.io", image: "https://placehold.co/300x200/2a2a35/ffffff?text=Veck.io" },
        { id: 5, title: "Color", image: "https://placehold.co/300x200/2a2a35/ffffff?text=Color" }
      ],
      featuredGames: [
        { id: 1, title: "Clicker", image: "https://placehold.co/300x200/1e1e24/ffffff?text=Clicker", badge: "Updated", badgeType: "blue" },
        { id: 2, title: "Sword", image: "https://placehold.co/300x200/1e1e24/ffffff?text=Sword" },
        { id: 3, title: "Block", image: "https://placehold.co/300x200/1e1e24/ffffff?text=Block", badge: "Hot", badgeType: "red" },
        { id: 4, title: "Bastion", image: "https://placehold.co/300x200/1e1e24/ffffff?text=Bastion", badge: "Updated", badgeType: "blue" },
        { id: 5, title: "Swarm", image: "https://placehold.co/300x200/1e1e24/ffffff?text=Swarm", badge: "Originals", badgeType: "purple" },
        { id: 6, title: "Gang", image: "https://placehold.co/300x200/1e1e24/ffffff?text=Gang", badge: "Top", badgeType: "yellow" }
      ],
      newGames: [
        { id: 1, title: "Maze", image: "https://placehold.co/300x200/2b2b36/ffffff?text=Maze" },
        { id: 2, title: "Room", image: "https://placehold.co/300x200/2b2b36/ffffff?text=Room" },
        { id: 3, title: "Bot", image: "https://placehold.co/300x200/2b2b36/ffffff?text=Bot" },
        { id: 4, title: "Racing", image: "https://placehold.co/300x200/2b2b36/ffffff?text=Racing" },
        { id: 5, title: "Kebab", image: "https://placehold.co/300x200/2b2b36/ffffff?text=Kebab", badge: "Hot", badgeType: "red" },
        { id: 6, title: "Hoop", image: "https://placehold.co/300x200/2b2b36/ffffff?text=Hoop" }
      ]
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
/* Reset global et thématique */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Poppins', system-ui, -apple-system, sans-serif;
}

/* Layout Principal */
.layout {
  display: flex;
  height: 100vh;
  background-color: #0f1016; /* Fond très sombre */
  color: #ffffff;
  overflow: hidden;
}

/* Barre latérale (Sidebar) */
.sidebar {
  font-family: 'Poppins', system-ui, -apple-system, sans-serif;
  width: 240px;
  background-color: #161722;
  display: flex;
  flex-direction: column;
  padding: 20px 10px;
  border-right: 1px solid #232533;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar::-webkit-scrollbar { width: 6px; }
.sidebar::-webkit-scrollbar-thumb { background: #2a2c3f; border-radius: 4px; }

.logo h2 {
  margin: 0 0 30px 10px;
  font-size: 1.6rem;
  font-weight: 800; /* Extra bold */
  color: #8c52ff; 
  letter-spacing: -0.5px; /* Rapproche légèrement les lettres */
}

/* Les titres de sections */
.section-title {
  font-size: 1.4rem;
  font-weight: 700; /* Bold */
  margin: 0 0 15px 0;
  letter-spacing: -0.3px;
}

.menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu li {
  padding: 12px 15px;
  margin-bottom: 5px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  color: #b0b3c6;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.menu li .icon {
  margin-right: 12px;
  font-size: 1.2rem;
}

.menu li:hover {
  background-color: #232533;
  color: #ffffff;
}

.menu li.active {
  background-color: #232533;
  color: #ffffff;
  font-weight: bold;
}

.divider {
  height: 1px;
  background-color: #2a2c3f;
  margin: 20px 10px;
}

.menu h3 {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #63667c;
  margin: 0 0 10px 15px;
  letter-spacing: 0.05em;
}

/* Wrapper principal (Header + Contenu) */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* En-tête (Topbar) */
.topbar {
  height: 70px;
  background-color: #161722;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  border-bottom: 1px solid #232533;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #63667c;
}

.search-bar {
  width: 100%;
  padding: 12px 20px 12px 45px;
  background-color: #232533;
  border: 1px solid transparent;
  border-radius: 20px;
  color: white;
  font-size: 0.95rem;
  outline: none;
  transition: border 0.3s, background 0.3s;
}

.search-bar::placeholder {
  color: #63667c;
}

.search-bar:focus {
  border-color: #8c52ff;
  background-color: #1c1e2b;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.icon-btn {
  background: #232533;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: #313346;
}

.login-btn {
  background-color: #8c52ff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.login-btn:hover {
  background-color: #7a3fff;
}

/* Zone de contenu défilable */
.content {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
}

.content::-webkit-scrollbar { width: 8px; }
.content::-webkit-scrollbar-thumb { background: #2a2c3f; border-radius: 4px; }

/* Tags de catégories en haut */
.category-tags {
  font-family: Poppins, system-ui, -apple-system, sans-serif;
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

/* Sections de jeux */
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

/* Cartes de jeu globales */
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

/* Grille spéciale "Sélection pour vous" (1 grand à gauche, 4 petits à droite) */
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

/* Grille standard (Jeux en vedette, Nouveaux jeux) */
.standard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  grid-auto-rows: 120px;
  gap: 15px;
}

/* Badges (Top, Updated, Hot) */
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

/* Responsive basique */
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
@media (max-width: 768px) {
  .sidebar {
    display: none; /* Cacher la sidebar sur mobile pour simplifier */
  }
}
</style>