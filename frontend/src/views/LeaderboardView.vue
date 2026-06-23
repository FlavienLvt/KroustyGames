<template>
  <div>
    <h2 class="section-title">Classement</h2>

    <div class="tabs">
      <button
        v-for="game in games"
        :key="game.slug"
        class="tab"
        :class="{ active: selectedGame === game.slug }"
        @click="selectGame(game.slug)"
      >
        {{ game.label }}
      </button>
    </div>

    <div v-if="loading" class="state">Chargement...</div>
    <div v-else-if="error" class="state error">{{ error }}</div>
    <div v-else-if="entries.length === 0" class="state">Aucun score enregistré pour ce jeu.</div>

    <table v-else class="leaderboard-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Joueur</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(entry, index) in entries" :key="entry.id" :class="{ podium: index < 3 }">
          <td class="rank">
            <span v-if="index === 0">🥇</span>
            <span v-else-if="index === 1">🥈</span>
            <span v-else-if="index === 2">🥉</span>
            <span v-else>{{ index + 1 }}</span>
          </td>
          <td>{{ entry.User?.username ?? '—' }}</td>
          <td class="score">{{ entry.score.toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001'

const games = [
  { slug: '2048',              label: '2048'             },
  { slug: 'krousty-run',       label: 'Krousty Run'      },
  { slug: 'flappy-nugget',     label: 'Flappy Nugget'    },
  { slug: 'krousty-crush',     label: 'Krousty Crush'    },
  { slug: 'krousty-survivors', label: 'Krousty Survivors'},
  { slug: 'angry-nuggets',     label: 'Angry Nuggets'    },
]

const selectedGame = ref(games[0].slug)
const entries = ref([])
const loading = ref(false)
const error = ref(null)

async function fetchLeaderboard(gameSlug) {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${apiBaseUrl}/api/scores/${gameSlug}`)
    if (!res.ok) throw new Error(`Erreur ${res.status}`)
    entries.value = await res.json()
  } catch (err) {
    error.value = 'Impossible de charger le classement.'
  } finally {
    loading.value = false
  }
}

function selectGame(slug) {
  selectedGame.value = slug
  fetchLeaderboard(slug)
}

onMounted(() => fetchLeaderboard(selectedGame.value))
</script>

<style scoped>
.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 24px 0;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.tab {
  padding: 8px 20px;
  border-radius: 20px;
  border: 1px solid #232533;
  background: transparent;
  color: #b0b3c6;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover { background: #232533; color: #fff; }
.tab.active { background: #8c52ff; border-color: #8c52ff; color: #fff; font-weight: 600; }

.state {
  color: #63667c;
  font-size: 0.95rem;
  padding: 40px 0;
  text-align: center;
}

.state.error { color: #ff4d4d; }

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
}

.leaderboard-table th {
  text-align: left;
  padding: 10px 16px;
  color: #63667c;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #232533;
}

.leaderboard-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #1a1c28;
  color: #b0b3c6;
}

.leaderboard-table tr.podium td { color: #fff; }

.rank { width: 48px; font-weight: bold; font-size: 1.1rem; }
.score { color: #8c52ff; font-weight: 700; font-size: 1rem; }
</style>
