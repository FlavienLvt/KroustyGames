<template>
  <div>
    <h2 class="section-title">Nouveaux jeux</h2>

    <div v-if="loading">Chargement...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else-if="games.length === 0">Aucun nouveau jeu pour l'instant.</div>
    <div v-else class="standard-grid">
      <div
        v-for="game in games"
        :key="game.id"
        class="game-card"
        @click="navigateToGame(game.slug)"
      >
        <div v-if="game.badge" class="badge" :class="game.badgeType">{{ game.badge }}</div>
        <img :src="game.image" :alt="game.title" class="game-image" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchGames } from '../services/gameApi'

const router = useRouter()
const games = ref([])
const loading = ref(false)
const error = ref(null)

const navigateToGame = (slug) => {
  if (['2048', 'krousty-run', 'flappy-nugget'].includes(slug)) {
    router.push({ name: slug })
  } else {
    alert("Ce jeu n'est pas encore disponible !")
  }
}

onMounted(async () => {
  loading.value = true
  try {
    games.value = await fetchGames('new')
  } catch (err) {
    error.value = 'Erreur lors du chargement des jeux.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 20px 0;
}

.standard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  grid-auto-rows: 120px;
  gap: 15px;
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
}

.game-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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
}

.badge.yellow { background-color: #f5c518; color: #000; }
.badge.blue   { background-color: #00b4d8; color: #fff; }
.badge.red    { background-color: #ff4d4d; color: #fff; }
.badge.purple { background-color: #8c52ff; color: #fff; }
</style>
