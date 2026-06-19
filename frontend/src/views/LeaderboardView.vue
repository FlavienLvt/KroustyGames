<script setup>
import { ref, onMounted, watch } from 'vue'
import { useScoresStore } from '../stores/scores'

const scoresStore = useScoresStore()

// On définit nos jeux disponibles
const games = [
  { slug: '2048', name: '2048' },
  { slug: 'krousty-run', name: 'Krousty Run' },
  { slug: 'flappy-nugget', name: 'Flappy Nugget' }
]

const selectedGame = ref(games[0].slug) // Par défaut, on affiche 2048
const isLoading = ref(true)

// Fonction pour charger les scores selon le jeu sélectionné
async function loadScores() {
  isLoading.value = true
  try {
    await scoresStore.fetchLeaderboard(selectedGame.value)
  } catch (error) {
    console.error("Impossible de charger les scores")
  } finally {
    isLoading.value = false
  }
}

// On charge au premier affichage
onMounted(() => {
  loadScores()
})

// On recharge si l'utilisateur change de jeu dans le menu déroulant
watch(selectedGame, () => {
  loadScores()
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-4">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-extrabold text-white flex items-center gap-3">
        🏆 <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Classement Mondial</span>
      </h1>
      
      <select 
        v-model="selectedGame" 
        class="bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 outline-none"
      >
        <option v-for="game in games" :key="game.slug" :value="game.slug">
          {{ game.name }}
        </option>
      </select>
    </div>

    <div class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-900 border-b border-gray-700 text-gray-400 uppercase text-xs tracking-wider">
            <th class="p-4 w-20 text-center">Rang</th>
            <th class="p-4">Joueur</th>
            <th class="p-4 text-right">Score</th>
            <th class="p-4 text-right">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="4" class="p-8 text-center text-gray-400">Chargement des scores...</td>
          </tr>
          
          <tr v-else-if="!scoresStore.leaderboards[selectedGame]?.length">
            <td colspan="4" class="p-8 text-center text-gray-500 italic">Aucun score enregistré pour ce jeu. Soyez le premier !</td>
          </tr>
          
          <tr 
            v-else
            v-for="(entry, index) in scoresStore.leaderboards[selectedGame]" 
            :key="entry.id"
            class="border-b border-gray-700 hover:bg-gray-750 transition"
            :class="{'bg-gray-800/50': index % 2 === 0}"
          >
            <td class="p-4 text-center font-bold">
              <span v-if="index === 0" class="text-2xl">🥇</span>
              <span v-else-if="index === 1" class="text-2xl">🥈</span>
              <span v-else-if="index === 2" class="text-2xl">🥉</span>
              <span v-else class="text-gray-400">{{ index + 1 }}</span>
            </td>
            <td class="p-4 font-semibold text-white">
              {{ entry.User?.username || 'Joueur Inconnu' }}
            </td>
            <td class="p-4 text-right font-mono font-bold text-green-400 text-lg">
              {{ entry.score.toLocaleString() }}
            </td>
            <td class="p-4 text-right text-sm text-gray-500">
              {{ new Date(entry.createdAt).toLocaleDateString('fr-FR') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>