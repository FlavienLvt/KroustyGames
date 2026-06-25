<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route  = useRoute()
const router = useRouter()

const API     = import.meta.env.VITE_API_URL
const results = ref([])
const loading = ref(false)
const query   = ref(route.query.q || '')

const BADGE_CLASSES = {
  yellow: 'bg-yellow-400 text-black',
  blue:   'bg-[#00b4d8] text-white',
  red:    'bg-red-500 text-white',
  purple: 'bg-[#f97316] text-white',
}
function badgeClass(type) {
  return BADGE_CLASSES[type] ?? 'bg-gray-500 text-white'
}

async function search(q) {
  if (!q || !q.trim()) { results.value = []; return }
  loading.value = true
  try {
    const res = await fetch(`${API}/api/games?search=${encodeURIComponent(q.trim())}`)
    results.value = await res.json()
  } catch {
    results.value = []
  } finally {
    loading.value = false
  }
}

function navigateToGame(slug) {
  router.push({ name: slug })
}

// Lancer la recherche à l'arrivée et à chaque changement de query param
watch(() => route.query.q, (q) => {
  query.value = q || ''
  search(q)
}, { immediate: true })
</script>

<template>
  <div>
    <!-- En-tête -->
    <div class="mb-8">
      <p class="text-sm font-medium mb-1" style="color: var(--text-dim)">Résultats pour</p>
      <h1 class="text-3xl font-extrabold tracking-tight" style="color: var(--text-primary)">
        "{{ query }}"
      </h1>
      <p class="mt-2 text-sm" style="color: var(--text-muted)">
        <template v-if="loading">Recherche en cours...</template>
        <template v-else>{{ results.length }} jeu{{ results.length > 1 ? 'x' : '' }} trouvé{{ results.length > 1 ? 's' : '' }}</template>
      </p>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="text-4xl animate-bounce">🔍</div>
    </div>

    <!-- Résultats -->
    <div v-else-if="results.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="game in results"
        :key="game.id"
        class="group relative rounded-xl overflow-hidden cursor-pointer aspect-[4/3]"
        style="background: var(--bg-card)"
        @click="navigateToGame(game.slug)"
      >
        <img
          :src="game.image"
          :alt="game.title"
          class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07]"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div
          v-if="game.badge"
          class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wider z-10"
          :class="badgeClass(game.badgeType)"
        >
          {{ game.badge }}
        </div>
        <div class="absolute bottom-0 left-0 right-0 p-3 translate-y-1.5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <h3 class="text-[0.9rem] font-bold text-white m-0">{{ game.title }}</h3>
        </div>
      </div>
    </div>

    <!-- Aucun résultat -->
    <div v-else class="flex flex-col items-center justify-center py-24 text-center">
      <div class="text-5xl mb-4">🕹️</div>
      <h3 class="text-lg font-bold mb-2" style="color: var(--text-primary)">Aucun jeu trouvé</h3>
      <p class="text-sm" style="color: var(--text-muted)">Essayez un autre mot-clé.</p>
    </div>
  </div>
</template>