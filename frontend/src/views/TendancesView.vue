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

    // Trier : d'abord par nombre de scores enregistrés, puis par meilleur score
    games.value = [...allGames]
      .map(g => ({
        ...g,
        count:    statsMap[g.slug]?.count    ?? 0,
        maxScore: statsMap[g.slug]?.maxScore ?? 0,
      }))
      .sort((a, b) => b.count - a.count || b.maxScore - a.maxScore)
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
      <span class="block w-[3px] h-6 bg-[#ff6b35] rounded-full"></span>
      <div>
        <h1 class="text-3xl font-extrabold text-white m-0">🔥 Tendances</h1>
        <p class="text-[#b0b3c6] text-sm mt-1 m-0">Les jeux les plus joués, classés par popularité</p>
      </div>
    </div>

    <div v-if="loading" class="text-[#63667c] py-16 text-center">Chargement...</div>
    <div v-else-if="error" class="text-red-400 py-16 text-center">{{ error }}</div>

    <div v-else class="flex flex-col gap-3">
      <div
        v-for="(game, i) in games"
        :key="game.id"
        class="group flex items-center gap-5 bg-[#161722] border border-[#232533] rounded-xl p-4 cursor-pointer hover:bg-[#1e2030] hover:border-[#8c52ff] transition-all duration-200"
        @click="router.push({ name: game.slug })"
      >
        <!-- Rang -->
        <div class="w-10 text-center flex-shrink-0">
          <span v-if="i === 0" class="text-2xl">🥇</span>
          <span v-else-if="i === 1" class="text-2xl">🥈</span>
          <span v-else-if="i === 2" class="text-2xl">🥉</span>
          <span v-else class="text-[#63667c] font-bold text-lg">{{ i + 1 }}</span>
        </div>

        <!-- Image -->
        <div class="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
          <img :src="game.image" :alt="game.title" class="w-full h-full object-cover" />
        </div>

        <!-- Infos -->
        <div class="flex-1 min-w-0">
          <h3 class="text-white font-bold text-[1rem] m-0 leading-tight group-hover:text-[#8c52ff] transition-colors">
            {{ game.title }}
          </h3>
          <p class="text-[#63667c] text-xs mt-1 m-0 truncate">{{ game.description }}</p>
        </div>

        <!-- Stats -->
        <div class="flex flex-col items-end gap-1 flex-shrink-0 text-right">
          <span class="text-[#8c52ff] font-bold text-sm">
            {{ game.count }} partie{{ game.count > 1 ? 's' : '' }}
          </span>
          <span v-if="game.maxScore" class="text-[#63667c] text-xs">
            Meilleur : {{ game.maxScore.toLocaleString('fr-FR') }} pts
          </span>
          <span v-else class="text-[#3a3c4e] text-xs italic">Pas encore joué</span>
        </div>

        <span class="text-[#3a3c4e] group-hover:text-[#8c52ff] transition-colors text-lg flex-shrink-0">→</span>
      </div>
    </div>
  </div>
</template>
