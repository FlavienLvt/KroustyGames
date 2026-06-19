<script setup>
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';

// On récupère notre store et le routeur
const authStore = useAuthStore();
const router = useRouter();

// Fonction pour gérer la déconnexion
function handleLogout() {
  authStore.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="logo">
        <router-link :to="{ name: 'home' }" style="text-decoration: none;">
          <h2>🎮 KroustyGames</h2>
        </router-link>
      </div>
      <nav class="menu">
        <ul>
          <router-link :to="{ name: 'home' }" custom v-slot="{ navigate, isActive }">
            <li @click="navigate" :class="{ active: isActive }"><span class="icon">🏠</span> Accueil</li>
          </router-link>
          <router-link :to="{ name: 'leaderboard' }" custom v-slot="{ navigate, isActive }">
            <li @click="navigate" :class="{ active: isActive }"><span class="icon">🏆</span> Classement</li>
          </router-link>
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
          <input type="text" placeholder="Rechercher des jeux..." class="search-bar" />
        </div>
        
        <div class="user-actions">
          <button class="icon-btn">🔔</button>
          <button class="icon-btn">❤️</button>
          
          <template v-if="authStore.isAuthenticated">
            <span class="user-greeting">
              Salut, <strong>{{ authStore.user?.username }}</strong>
            </span>
            <button @click="handleLogout" class="login-btn logout-btn">Déconnexion</button>
          </template>
          
          <template v-else>
            <router-link :to="{ name: 'login' }">
              <button class="login-btn outline-btn">Connexion</button>
            </router-link>
            <router-link :to="{ name: 'register' }">
              <button class="login-btn">S'inscrire</button>
            </router-link>
          </template>
          
        </div>
      </header>
  
      <main class="content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>
  
<style>
/* Variables globales */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Poppins', system-ui, -apple-system, sans-serif;
  background-color: #0f1016; 
  color: #ffffff;
}
</style>

<style scoped>
/* CSS de la mise en page (Layout, Sidebar, Topbar) */
.layout { display: flex; height: 100vh; overflow: hidden; }

.sidebar {
  width: 240px; background-color: #161722; display: flex; flex-direction: column;
  padding: 20px 10px; border-right: 1px solid #232533; overflow-y: auto; flex-shrink: 0;
}
.sidebar::-webkit-scrollbar { width: 6px; }
.sidebar::-webkit-scrollbar-thumb { background: #2a2c3f; border-radius: 4px; }

.logo h2 { margin: 0 0 30px 10px; font-size: 1.6rem; font-weight: 800; color: #8c52ff; letter-spacing: -0.5px; cursor: pointer;}

.menu ul { list-style: none; padding: 0; margin: 0; }
.menu li {
  padding: 12px 15px; margin-bottom: 5px; border-radius: 8px; cursor: pointer;
  font-size: 0.95rem; color: #b0b3c6; display: flex; align-items: center; transition: all 0.2s;
}
.menu li .icon { margin-right: 12px; font-size: 1.2rem; }
.menu li:hover, .menu li.active { background-color: #232533; color: #ffffff; }
.menu li.active { font-weight: bold; }

.divider { height: 1px; background-color: #2a2c3f; margin: 20px 10px; }
.menu h3 { font-size: 0.8rem; text-transform: uppercase; color: #63667c; margin: 0 0 10px 15px; letter-spacing: 0.05em; }

.main-wrapper { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

.topbar {
  height: 70px; background-color: #161722; display: flex; align-items: center;
  justify-content: space-between; padding: 0 30px; border-bottom: 1px solid #232533;
}

.search-container { position: relative; width: 100%; max-width: 500px; }
.search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #63667c; }
.search-bar {
  width: 100%; padding: 12px 20px 12px 45px; background-color: #232533; border: 1px solid transparent;
  border-radius: 20px; color: white; font-size: 0.95rem; outline: none; transition: border 0.3s, background 0.3s;
}
.search-bar:focus { border-color: #8c52ff; background-color: #1c1e2b; }

.user-actions { display: flex; align-items: center; gap: 15px; }

.icon-btn {
  background: #232533; border: none; border-radius: 50%; width: 40px; height: 40px;
  color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s;
}
.icon-btn:hover { background: #313346; }

/* Styles modifiés pour les boutons d'authentification */
.user-greeting { font-size: 0.95rem; color: #b0b3c6; margin-right: 10px; }
.user-greeting strong { color: #8c52ff; }

.login-btn {
  background-color: #8c52ff; color: white; border: 2px solid #8c52ff; padding: 8px 20px;
  border-radius: 20px; font-weight: bold; cursor: pointer; transition: all 0.2s;
}
.login-btn:hover { background-color: #7a3fff; border-color: #7a3fff; }

.outline-btn { background-color: transparent; color: #b0b3c6; border-color: #b0b3c6; }
.outline-btn:hover { background-color: #232533; border-color: white; color: white; }

.logout-btn { background-color: #e63946; border-color: #e63946; }
.logout-btn:hover { background-color: #d62828; border-color: #d62828; }

.content { flex: 1; overflow-y: auto; padding: 30px; }
.content::-webkit-scrollbar { width: 8px; }
.content::-webkit-scrollbar-thumb { background: #2a2c3f; border-radius: 4px; }

@media (max-width: 768px) { .sidebar { display: none; } }
</style>