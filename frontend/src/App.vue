<script setup>
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

function handleLogout() {
  authStore.logout();
  router.push({ name: 'login' });
}

const categories = [
  { slug: 'action',   icon: '⚔️',  label: 'Action'   },
  { slug: 'aventure', icon: '🗺️', label: 'Aventure'  },
  { slug: 'voiture',  icon: '🚗',  label: 'Voiture'   },
  { slug: 'puzzle',   icon: '🧩',  label: 'Puzzle'    },
  { slug: 'tir',      icon: '🔫',  label: 'Tir'       },
]
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <aside class="hidden md:flex w-60 bg-[#161722] flex-col py-5 px-2.5 border-r border-[#232533] overflow-y-auto flex-shrink-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#2a2c3f] [&::-webkit-scrollbar-thumb]:rounded">
      <div>
        <router-link :to="{ name: 'home' }" class="no-underline">
          <h2 class="mt-0 mb-8 ml-2.5 text-[1.6rem] font-extrabold text-[#8c52ff] tracking-tight cursor-pointer">
            🎮 KroustyGames
          </h2>
        </router-link>
      </div>

      <nav>
        <ul class="list-none p-0 m-0">
          <router-link :to="{ name: 'home' }" custom v-slot="{ navigate, isActive }">
            <li @click="navigate"
                class="px-4 py-3 mb-1 rounded-lg cursor-pointer text-[0.95rem] text-[#b0b3c6] flex items-center transition-all hover:bg-[#232533] hover:text-white"
                :class="{ 'bg-[#232533] text-white font-bold': isActive }">
              <span class="mr-3 text-xl">🏠</span> Accueil
            </li>
          </router-link>
          <router-link :to="{ name: 'leaderboard' }" custom v-slot="{ navigate, isActive }">
            <li @click="navigate"
                class="px-4 py-3 mb-1 rounded-lg cursor-pointer text-[0.95rem] text-[#b0b3c6] flex items-center transition-all hover:bg-[#232533] hover:text-white"
                :class="{ 'bg-[#232533] text-white font-bold': isActive }">
              <span class="mr-3 text-xl">🏆</span> Classement
            </li>
          </router-link>
          <router-link :to="{ name: 'badges' }" custom v-slot="{ navigate, isActive }">
            <li @click="navigate"
                class="px-4 py-3 mb-1 rounded-lg cursor-pointer text-[0.95rem] text-[#b0b3c6] flex items-center transition-all hover:bg-[#232533] hover:text-white"
                :class="{ 'bg-[#232533] text-white font-bold': isActive }">
              <span class="mr-3 text-xl">🎖️</span> Badges
            </li>
          </router-link>
          <router-link :to="{ name: 'nouveautes' }" custom v-slot="{ navigate, isActive }">
            <li @click="navigate"
                class="px-4 py-3 mb-1 rounded-lg cursor-pointer text-[0.95rem] text-[#b0b3c6] flex items-center transition-all hover:bg-[#232533] hover:text-white"
                :class="{ 'bg-[#232533] text-white font-bold': isActive }">
              <span class="mr-3 text-xl">✨</span> Nouveautés
            </li>
          </router-link>
          <router-link :to="{ name: 'tendances' }" custom v-slot="{ navigate, isActive }">
            <li @click="navigate"
                class="px-4 py-3 mb-1 rounded-lg cursor-pointer text-[0.95rem] text-[#b0b3c6] flex items-center transition-all hover:bg-[#232533] hover:text-white"
                :class="{ 'bg-[#232533] text-white font-bold': isActive }">
              <span class="mr-3 text-xl">🔥</span> Tendances
            </li>
          </router-link>
        </ul>

        <div class="h-px bg-[#2a2c3f] mx-2.5 my-5"></div>
        <h3 class="text-[0.8rem] uppercase text-[#63667c] mb-2.5 ml-4 tracking-[0.05em]">Catégories</h3>

        <ul class="list-none p-0 m-0">
          <router-link v-for="cat in categories" :key="cat.slug" :to="{ name: 'category', params: { category: cat.slug } }" custom v-slot="{ navigate, isActive }">
            <li @click="navigate"
                class="px-4 py-3 mb-1 rounded-lg cursor-pointer text-[0.95rem] text-[#b0b3c6] flex items-center transition-all hover:bg-[#232533] hover:text-white"
                :class="{ 'bg-[#232533] text-white font-bold': isActive }">
              <span class="mr-3 text-xl">{{ cat.icon }}</span> {{ cat.label }}
            </li>
          </router-link>
        </ul>
      </nav>
    </aside>

    <!-- Main wrapper -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Topbar -->
      <header class="h-[70px] bg-[#161722] flex items-center justify-between px-8 border-b border-[#232533] flex-shrink-0">
        <div class="relative w-full max-w-[500px]">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[#63667c]">🔍</span>
          <input
            type="text"
            placeholder="Rechercher des jeux..."
            class="w-full py-3 pl-11 pr-5 bg-[#232533] border border-transparent rounded-full text-white text-[0.95rem] outline-none transition-all duration-300 focus:border-[#8c52ff] focus:bg-[#1c1e2b]"
          />
        </div>

        <div class="flex items-center gap-4">
          <button class="bg-[#232533] border-none rounded-full w-10 h-10 text-white cursor-pointer flex items-center justify-center transition hover:bg-[#313346]">🔔</button>
          <button class="bg-[#232533] border-none rounded-full w-10 h-10 text-white cursor-pointer flex items-center justify-center transition hover:bg-[#313346]">❤️</button>

          <template v-if="authStore.isAuthenticated">
            <span class="text-[0.95rem] text-[#b0b3c6] mr-2.5">
              Salut, <strong class="text-[#8c52ff]">{{ authStore.user?.username }}</strong>
            </span>
            <button
              @click="handleLogout"
              class="bg-[#e63946] text-white border-2 border-[#e63946] px-5 py-2 rounded-full font-bold cursor-pointer transition hover:bg-[#d62828] hover:border-[#d62828]"
            >
              Déconnexion
            </button>
          </template>

          <template v-else>
            <router-link :to="{ name: 'login' }">
              <button class="bg-transparent text-[#b0b3c6] border-2 border-[#b0b3c6] px-5 py-2 rounded-full font-bold cursor-pointer transition hover:bg-[#232533] hover:border-white hover:text-white">
                Connexion
              </button>
            </router-link>
            <router-link :to="{ name: 'register' }">
              <button class="bg-[#8c52ff] text-white border-2 border-[#8c52ff] px-5 py-2 rounded-full font-bold cursor-pointer transition hover:bg-[#7a3fff] hover:border-[#7a3fff]">
                S'inscrire
              </button>
            </router-link>
          </template>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-y-auto p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-[#2a2c3f] [&::-webkit-scrollbar-thumb]:rounded">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>
