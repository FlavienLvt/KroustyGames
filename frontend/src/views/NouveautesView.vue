<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchGames } from '../services/gameApi'

const router  = useRouter()
const games   = ref([])
const loading = ref(true)
const error   = ref(null)

const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001'

onMounted(async () => {
  try {
    const [allGames, statsRes] = await Promise.all([
      fetchGames(),
      fetch(`${apiBase}/api/scores/stats`).then(r => r.json())
    ])

    const statsMap = {}
    for (const s of statsRes) {
      statsMap[s.gameSlug] = s
    }

    // Trier : jeux avec le moins de parties d'abord (les moins découverts),
    // puis par orderIndex décroissant (les plus récemment ajoutés)
    games.value = [...allGames]
      .map(g => ({
        ...g,
        count:      statsMap[g.slug]?.count ?? 0,
        orderIndex: g.orderIndex ?? 0,
      }))
      .sort((a, b) => a.count - b.count || b.orderIndex - a.orderIndex)
  } catch {
    error.value = 'Erreur lors du chargement.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-8">
      <span class="block w-[3px] h-6 bg-[#f97316] rounded-full"></span>
      <div>
        <h1 class="text-3xl font-extrabold text-white m-0">✨ Nouveautés</h1>
        <p class="text-[#b0b3c6] text-sm mt-1 m-0">Les jeux les moins joués — soyez les premiers !</p>
      </div>
    </div>

    <div v-if="loading" class="text-[#63667c] py-16 text-center">Chargement...</div>
    <div v-else-if="error" class="text-red-400 py-16 text-center">{{ error }}</div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div
        v-for="game in games"
        :key="game.id"
        class="group relative rounded-xl overflow-hidden cursor-pointer bg-[#1a1a24] aspect-[4/3] flex flex-col"
        @click="router.push({ name: game.slug })"
      >
        <!-- Image -->
        <div class="relative flex-1 overflow-hidden">
          <img
            :src="game.image"
            :alt="game.title"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

          <!-- Badge "Nouveau" si aucune partie -->
          <div
            v-if="game.count === 0"
            class="absolute top-2.5 right-2.5 bg-[#ff6b35] text-white text-[0.55rem] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full"
          >
            Nouveau
          </div>
          <div
            v-else
            class="absolute top-2.5 right-2.5 bg-black/60 text-[#b0b3c6] text-[0.6rem] font-semibold px-2 py-0.5 rounded-full"
          >
            {{ game.count }} partie{{ game.count > 1 ? 's' : '' }}
          </div>
        </div>

        <!-- Title -->
        <div class="p-3 bg-[#161722]">
          <h3 class="text-white font-bold text-[0.85rem] m-0 leading-tight group-hover:text-[#f97316] transition-colors">
            {{ game.title }}
          </h3>
        </div>
      </div>
    </div>
  </div>
</template>
