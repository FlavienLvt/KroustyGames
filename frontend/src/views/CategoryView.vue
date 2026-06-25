<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchGames } from '../services/gameApi'

const props = defineProps({ category: { type: String, required: true } })
const router = useRouter()

const CATEGORIES = {
  puzzle: {
    label: 'Puzzle', icon: '🧩', color: '#f97316',
    slugs: ['2048', 'krousty-crush', 'angry-nuggets']
  },
  arcade: {
    label: 'Arcade', icon: '⚡', color: '#f4a261',
    slugs: ['krousty-run', 'flappy-nugget', 'frite-fighter']
  },
  action: {
    label: 'Action', icon: '⚔️', color: '#e63946',
    slugs: ['krousty-survivors', 'ketchup-defender']
  },
}

const catInfo = ref(null)
const games   = ref([])
const loading = ref(false)
const error   = ref(null)

async function load(cat) {
  catInfo.value = CATEGORIES[cat] ?? null
  if (!catInfo.value) { error.value = 'Catégorie inconnue.'; return }
  loading.value = true; error.value = null
  try {
    const all = await fetchGames()
    games.value = all.filter(g => catInfo.value.slugs.includes(g.slug))
  } catch {
    error.value = 'Erreur lors du chargement.'
  } finally {
    loading.value = false
  }
}

onMounted(() => load(props.category))
watch(() => props.category, load)
</script>

<template>
  <div>
    <!-- Header -->
    <div v-if="catInfo" class="flex items-center gap-4 mb-8">
      <span class="text-5xl">{{ catInfo.icon }}</span>
      <div>
        <h1 class="text-3xl font-extrabold text-white m-0">{{ catInfo.label }}</h1>
        <p class="text-[#b0b3c6] text-sm mt-1 m-0">{{ games.length }} jeu{{ games.length > 1 ? 'x' : '' }} dans cette catégorie</p>
      </div>
    </div>

    <div v-if="loading" class="text-[#63667c] py-16 text-center">Chargement...</div>
    <div v-else-if="error" class="text-red-400 py-16 text-center">{{ error }}</div>
    <div v-else-if="games.length === 0" class="text-[#63667c] py-16 text-center">Aucun jeu dans cette catégorie.</div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="game in games"
        :key="game.id"
        class="group relative rounded-xl overflow-hidden cursor-pointer bg-[#1a1a24] aspect-[4/3]"
        @click="router.push({ name: game.slug })"
      >
        <img
          :src="game.image"
          :alt="game.title"
          class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div
          v-if="game.badge"
          class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wider z-10"
          :class="{
            'bg-[#f97316] text-white': game.badgeType === 'purple',
            'bg-yellow-400 text-black': game.badgeType === 'yellow',
            'bg-red-500 text-white': game.badgeType === 'red',
            'bg-[#00b4d8] text-white': game.badgeType === 'blue',
          }"
        >
          {{ game.badge }}
        </div>
        <div class="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <h3 class="text-[0.9rem] font-bold text-white m-0 leading-tight">{{ game.title }}</h3>
          <p class="text-white/60 text-xs mt-1 m-0 leading-snug">{{ game.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
