<script setup>
import { ref } from 'vue';
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// ── Thème ──────────────────────────────────────────────────────────────────
const isDark = ref(localStorage.getItem('theme') !== 'light');

function toggleTheme() {
  isDark.value = !isDark.value;
  const theme = isDark.value ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
  document.documentElement.classList.toggle('light', !isDark.value);
}

// ── Auth ───────────────────────────────────────────────────────────────────
function handleLogout() {
  authStore.logout();
  router.push({ name: 'login' });
}

// ── Recherche ──────────────────────────────────────────────────────────────
const searchQuery = ref('');

function handleSearch() {
  const q = searchQuery.value.trim();
  if (!q) return;
  router.push({ name: 'search', query: { q } });
  searchQuery.value = '';
}

// ── Navigation ─────────────────────────────────────────────────────────────
const gameCategories = [
  { slug: 'puzzle', icon: '🧩', label: 'Puzzle' },
  { slug: 'arcade', icon: '⚡', label: 'Arcade' },
  { slug: 'action', icon: '⚔️', label: 'Action' },
];
</script>

<template>
  <div class="flex h-screen overflow-hidden" style="background: var(--bg-primary)">
    <!-- Sidebar -->
    <aside
      class="hidden md:flex w-60 flex-col py-5 px-2.5 overflow-y-auto flex-shrink-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded"
      style="background: var(--bg-sidebar); border-right: 1px solid var(--border-color); scrollbar-color: var(--scrollbar-thumb) transparent;"
    >
      <div>
        <router-link :to="{ name: 'home' }" class="no-underline">
          <h2 class="mt-0 mb-8 ml-2.5 text-[1.6rem] font-extrabold tracking-tight cursor-pointer flex items-center gap-2" style="color: var(--accent)">
            <span class="leading-none">🎮</span><span>KroustyGames</span>
          </h2>
        </router-link>
      </div>

      <nav class="flex-1">
        <ul class="list-none p-0 m-0">
          <router-link :to="{ name: 'home' }" custom v-slot="{ navigate, isActive }">
            <li @click="navigate"
                class="px-4 py-3 mb-1 rounded-lg cursor-pointer text-[0.95rem] flex items-center transition-all"
                :style="isActive
                  ? 'background: var(--nav-active-bg); color: var(--nav-active-text); font-weight: 700'
                  : 'color: var(--text-muted)'"
                @mouseenter="e => !isActive && (e.target.style.background = 'var(--bg-card)')"
                @mouseleave="e => !isActive && (e.target.style.background = '')">
              <span class="mr-3 text-xl">🏠</span> Accueil
            </li>
          </router-link>
          <router-link :to="{ name: 'leaderboard' }" custom v-slot="{ navigate, isActive }">
            <li @click="navigate"
                class="px-4 py-3 mb-1 rounded-lg cursor-pointer text-[0.95rem] flex items-center transition-all"
                :style="isActive
                  ? 'background: var(--nav-active-bg); color: var(--nav-active-text); font-weight: 700'
                  : 'color: var(--text-muted)'"
                @mouseenter="e => !isActive && (e.target.style.background = 'var(--bg-card)')"
                @mouseleave="e => !isActive && (e.target.style.background = '')">
              <span class="mr-3 text-xl">🏆</span> Classement
            </li>
          </router-link>
          <router-link :to="{ name: 'badges' }" custom v-slot="{ navigate, isActive }">
            <li @click="navigate"
                class="px-4 py-3 mb-1 rounded-lg cursor-pointer text-[0.95rem] flex items-center transition-all"
                :style="isActive
                  ? 'background: var(--nav-active-bg); color: var(--nav-active-text); font-weight: 700'
                  : 'color: var(--text-muted)'"
                @mouseenter="e => !isActive && (e.target.style.background = 'var(--bg-card)')"
                @mouseleave="e => !isActive && (e.target.style.background = '')">
              <span class="mr-3 text-xl">🎖️</span> Badges
            </li>
          </router-link>
          <router-link :to="{ name: 'nouveautes' }" custom v-slot="{ navigate, isActive }">
            <li @click="navigate"
                class="px-4 py-3 mb-1 rounded-lg cursor-pointer text-[0.95rem] flex items-center transition-all"
                :style="isActive
                  ? 'background: var(--nav-active-bg); color: var(--nav-active-text); font-weight: 700'
                  : 'color: var(--text-muted)'"
                @mouseenter="e => !isActive && (e.target.style.background = 'var(--bg-card)')"
                @mouseleave="e => !isActive && (e.target.style.background = '')">
              <span class="mr-3 text-xl">✨</span> Nouveautés
            </li>
          </router-link>
          <router-link :to="{ name: 'tendances' }" custom v-slot="{ navigate, isActive }">
            <li @click="navigate"
                class="px-4 py-3 mb-1 rounded-lg cursor-pointer text-[0.95rem] flex items-center transition-all"
                :style="isActive
                  ? 'background: var(--nav-active-bg); color: var(--nav-active-text); font-weight: 700'
                  : 'color: var(--text-muted)'"
                @mouseenter="e => !isActive && (e.target.style.background = 'var(--bg-card)')"
                @mouseleave="e => !isActive && (e.target.style.background = '')">
              <span class="mr-3 text-xl">🔥</span> Tendances
            </li>
          </router-link>

          <!-- Lien admin (visible uniquement pour les admins) -->
          <router-link v-if="authStore.isAdmin" :to="{ name: 'admin' }" custom v-slot="{ navigate, isActive }">
            <li @click="navigate"
                class="px-4 py-3 mb-1 rounded-lg cursor-pointer text-[0.95rem] flex items-center transition-all"
                :style="isActive
                  ? 'background: var(--nav-active-bg); color: var(--nav-active-text); font-weight: 700'
                  : 'color: var(--text-muted)'"
                @mouseenter="e => !isActive && (e.target.style.background = 'var(--bg-card)')"
                @mouseleave="e => !isActive && (e.target.style.background = '')">
              <span class="mr-3 text-xl">⚙️</span> Administration
            </li>
          </router-link>
        </ul>

        <div class="h-px mx-2.5 my-5" style="background: var(--border-color)"></div>
        <h3 class="text-[0.8rem] uppercase mb-2.5 ml-4 tracking-[0.05em]" style="color: var(--text-dim)">Catégories</h3>

        <ul class="list-none p-0 m-0">
          <router-link
            v-for="cat in gameCategories"
            :key="cat.slug"
            :to="{ name: 'category', params: { category: cat.slug } }"
            custom
            v-slot="{ navigate, isActive }"
          >
            <li
              @click="navigate"
              class="px-4 py-3 mb-1 rounded-lg cursor-pointer text-[0.95rem] flex items-center transition-all"
              :style="isActive
                ? 'background: var(--nav-active-bg); color: var(--nav-active-text); font-weight: 700'
                : 'color: var(--text-muted)'"
              @mouseenter="e => !isActive && (e.target.style.background = 'var(--bg-card)')"
              @mouseleave="e => !isActive && (e.target.style.background = '')"
            >
              <span class="mr-3 text-xl">{{ cat.icon }}</span> {{ cat.label }}
            </li>
          </router-link>
        </ul>
      </nav>
    </aside>

    <!-- Main wrapper -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Topbar -->
      <header
        class="h-[70px] flex items-center justify-between px-8 flex-shrink-0"
        style="background: var(--bg-topbar); border-bottom: 1px solid var(--border-color)"
      >
        <!-- Barre de recherche -->
        <div class="relative w-full max-w-[500px]">
          <span class="absolute left-4 top-1/2 -translate-y-1/2" style="color: var(--text-dim)">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher des jeux..."
            @keydown.enter="handleSearch"
            class="w-full py-3 pl-11 pr-5 border border-transparent rounded-full text-[0.95rem] outline-none transition-all duration-300"
            style="background: var(--bg-input); color: var(--text-primary)"
            @focus="e => e.target.style.borderColor = 'var(--accent)'"
            @blur="e => e.target.style.borderColor = 'transparent'"
          />
        </div>

        <div class="flex items-center gap-3">
          <!-- Toggle thème -->
          <button
            @click="toggleTheme"
            class="border-none rounded-full w-10 h-10 cursor-pointer flex items-center justify-center transition text-lg"
            style="background: var(--bg-card); color: var(--text-primary)"
            :title="isDark ? 'Passer en mode clair' : 'Passer en mode sombre'"
          >
            {{ isDark ? '☀️' : '🌙' }}
          </button>

          <template v-if="authStore.isAuthenticated">
            <span class="text-[0.95rem] mr-1" style="color: var(--text-muted)">
              Salut, <strong :style="{ color: 'var(--accent)' }">{{ authStore.user?.username }}</strong>
              <span v-if="authStore.isAdmin" class="ml-1 text-xs px-1.5 py-0.5 rounded font-bold" style="background: rgba(249,115,22,0.2); color: var(--accent)">admin</span>
            </span>
            <button
              @click="handleLogout"
              class="text-white border-none px-5 py-2 rounded-full font-bold cursor-pointer transition"
              style="background: #e63946"
            >
              Déconnexion
            </button>
          </template>

          <template v-else>
            <router-link :to="{ name: 'login' }">
              <button
                class="bg-transparent px-5 py-2 rounded-full font-bold cursor-pointer transition border-2"
                style="color: var(--text-muted); border-color: var(--text-muted)"
              >
                Connexion
              </button>
            </router-link>
            <router-link :to="{ name: 'register' }">
              <button
                class="text-white border-none px-5 py-2 rounded-full font-bold cursor-pointer transition"
                style="background: var(--accent)"
              >
                S'inscrire
              </button>
            </router-link>
          </template>
        </div>
      </header>

      <!-- Content -->
      <main
        class="flex-1 overflow-y-auto p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded"
        style="scrollbar-color: var(--scrollbar-thumb) transparent"
      >
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>
