<template>
  <div class="space-y-12">

    <!-- ── Category pills ──────────────────────────────────────────── -->
    <section class="flex gap-4 overflow-x-auto pb-1 [&::-webkit-scrollbar]:h-0">
      <button
        v-for="tag in categoryTags"
        :key="tag.id"
        class="flex items-center gap-4 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.5)] active:scale-95"
        :style="{ background: tag.color }"
      >
        <span>{{ tag.icon }}</span>
        <span class="text-white/90 tracking-tight">{{ tag.title }}</span>
      </button>
    </section>

    <!-- ── Top picks — hero cinématique ───────────────────────────── -->
    <section v-if="topPicks.length > 0">
      <div class="flex items-center gap-3 mb-5">
        <span class="block w-[3px] h-5 bg-[#8c52ff] rounded-full"></span>
        <h2 class="text-xs font-bold tracking-[0.15em] uppercase text-[#8c7aaa] m-0">Sélection pour vous</h2>
      </div>

      <div class="flex gap-3 h-[460px]">
        <!-- Featured : grande carte -->
        <div
          class="relative rounded-2xl overflow-hidden cursor-pointer group"
          :class="topPicks.length > 1 ? 'flex-[2]' : 'flex-1'"
          @click="navigateToGame(topPicks[0].slug)"
        >
          <img
            :src="topPicks[0].image"
            :alt="topPicks[0].title"
            class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent"></div>
          <div
            v-if="topPicks[0].badge"
            class="absolute top-4 left-4 px-2.5 py-1 rounded-md text-[0.65rem] font-bold uppercase tracking-wider z-10"
            :class="badgeClass(topPicks[0].badgeType)"
          >
            {{ topPicks[0].badge }}
          </div>
          <div class="absolute bottom-0 left-0 right-0 p-6">
            <p class="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#a47fff] mb-2 m-0">À la une</p>
            <h3 class="text-[1.9rem] font-extrabold text-white m-0 leading-tight">{{ topPicks[0].title }}</h3>
            <p class="text-sm text-white/50 mt-2.5 m-0 group-hover:text-white/80 transition-colors duration-300">
              Jouer maintenant →
            </p>
          </div>
        </div>

        <!-- Cartes secondaires -->
        <div v-if="topPicks.length > 1" class="flex-1 flex flex-col gap-3">
          <div
            v-for="game in topPicks.slice(1, 3)"
            :key="game.id"
            class="flex-1 relative rounded-2xl overflow-hidden cursor-pointer group"
            @click="navigateToGame(game.slug)"
          >
            <img
              :src="game.image"
              :alt="game.title"
              class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div
              v-if="game.badge"
              class="absolute top-3 left-3 px-2 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wider z-10"
              :class="badgeClass(game.badgeType)"
            >
              {{ game.badge }}
            </div>
            <div class="absolute bottom-0 left-0 right-0 p-4">
              <h3 class="text-[0.95rem] font-bold text-white m-0 leading-snug">{{ game.title }}</h3>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Jeux en vedette — galerie hover ────────────────────────── -->
    <section v-if="featuredGames.length > 0">
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-3">
          <span class="block w-[3px] h-5 bg-[#00d68f] rounded-full"></span>
          <h2 class="text-xs font-bold tracking-[0.15em] uppercase text-[#8c7aaa] m-0">Jeux en vedette</h2>
        </div>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <div
          v-for="game in featuredGames"
          :key="game.id"
          class="group relative rounded-xl overflow-hidden cursor-pointer bg-[#1a1a24] aspect-[4/3]"
          @click="navigateToGame(game.slug)"
        >
          <img
            :src="game.image"
            :alt="game.title"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07]"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="absolute bottom-0 left-0 right-0 p-3 translate-y-1.5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
            <h3 class="text-[0.85rem] font-bold text-white m-0 leading-tight">{{ game.title }}</h3>
          </div>
          <div
            v-if="game.badge"
            class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wider z-10"
            :class="badgeClass(game.badgeType)"
          >
            {{ game.badge }}
          </div>
        </div>
      </div>
    </section>

    <!-- ── Nouveaux jeux ───────────────────────────────────────────── -->
    <section v-if="newGames.length > 0">
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-3">
          <span class="block w-[3px] h-5 bg-[#ff6b35] rounded-full"></span>
          <h2 class="text-xs font-bold tracking-[0.15em] uppercase text-[#8c7aaa] m-0">Nouveaux jeux</h2>
        </div>
        <router-link to="/nouveautes" class="text-[#8c52ff] text-sm font-medium no-underline hover:text-[#b07fff] transition-colors duration-200">
          Voir tous →
        </router-link>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <div
          v-for="game in newGames"
          :key="game.id"
          class="group relative rounded-xl overflow-hidden cursor-pointer bg-[#1a1a24] aspect-square"
          @click="navigateToGame(game.slug)"
        >
          <img
            :src="game.image"
            :alt="game.title"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07]"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="absolute top-2.5 right-2.5 bg-[#ff6b35] text-white text-[0.55rem] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full">
            Nouveau
          </div>
          <div class="absolute bottom-0 left-0 right-0 p-3 translate-y-1.5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
            <h3 class="text-[0.8rem] font-bold text-white m-0 leading-tight">{{ game.title }}</h3>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Empty state ─────────────────────────────────────────────── -->
    <section v-if="!topPicks.length && !featuredGames.length && !newGames.length && !isLoading" class="flex flex-col items-center justify-center py-24 text-center">
      <div class="text-[3rem] mb-4">🎮</div>
      <h3 class="text-lg font-bold text-white m-0 mb-2">Aucun jeu disponible</h3>
      <p class="text-sm text-[#63667c] m-0">Les jeux arrivent bientôt, revenez dans un instant.</p>
    </section>

  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchGames } from '../services/gameApi'

const router = useRouter()

const BADGE_CLASSES = {
  yellow: 'bg-yellow-400 text-black',
  blue:   'bg-[#00b4d8] text-white',
  red:    'bg-red-500 text-white',
  purple: 'bg-[#8c52ff] text-white',
}

function badgeClass(type) {
  return BADGE_CLASSES[type] ?? 'bg-gray-500 text-white'
}

const categoryTags = ref([
  { id: 1, title: "Réflexion",     icon: "🧠",  color: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)" },
  { id: 2, title: "Adrénaline",    icon: "🏎️", color: "linear-gradient(135deg, #4b134f, #c94b4b)" },
  { id: 3, title: "Entre amis",    icon: "👏",  color: "linear-gradient(135deg, #11998e, #38ef7d)" },
  { id: 4, title: "Fun 5 minutes", icon: "☕",  color: "linear-gradient(135deg, #b79891, #94716b)" },
  { id: 5, title: "Classiques",    icon: "🕹️", color: "linear-gradient(135deg, #141e30, #243b55)" },
])

const topPicks      = ref([])
const featuredGames = ref([])
const newGames      = ref([])
const isLoading     = ref(true)

const normalizeGame = (game) => ({
  id:        game.id,
  title:     game.title,
  slug:      game.slug,
  image:     game.image,
  badge:     game.badge,
  badgeType: game.badgeType,
  sections:  Array.isArray(game.sections) ? game.sections : [],
})

const gamesForSection = (games, section) => games.filter((g) => g.sections.includes(section))

const loadGames = async () => {
  isLoading.value = true
  try {
    const games = (await fetchGames()).map(normalizeGame)
    topPicks.value      = gamesForSection(games, 'top-picks')
    featuredGames.value = gamesForSection(games, 'featured')
    newGames.value      = gamesForSection(games, 'new')
  } catch (error) {
    console.error('Unable to load games from API', error)
  } finally {
    isLoading.value = false
  }
}

const navigateToGame = (slug) => {
  if (['2048', 'krousty-run', 'flappy-nugget', 'frite-fighter', 'ketchup-defender'].includes(slug)) {
    router.push({ name: slug })
  } else {
    alert("Ce jeu n'est pas encore disponible !")
  }
}

onMounted(loadGames)
</script>
