<script setup>
import { computed, onMounted } from 'vue'
import { useBadgesStore } from '../stores/badges'
import { useAuthStore } from '../stores/auth'

const badgesStore = useBadgesStore()
const authStore = useAuthStore()

onMounted(async () => {
  await Promise.all([badgesStore.fetchBadges(), badgesStore.fetchLeaderboard()])
})

const CATEGORIES = [
  { key: 'account', label: 'Compte', icon: '👤' },
  { key: '2048',    label: '2048',   icon: '🔢', gameSlug: '2048' },
  { key: 'krousty-run',    label: 'Krousty Run',   icon: '🏃', gameSlug: 'krousty-run' },
  { key: 'flappy-nugget',  label: 'Flappy Nugget',  icon: '🐔', gameSlug: 'flappy-nugget' },
  { key: 'frite-fighter',  label: 'Frite Fighter',  icon: '🍟', gameSlug: 'frite-fighter' },
]

function badgesForCategory(cat) {
  if (cat.key === 'account') {
    return badgesStore.badges.filter(b => b.category === 'account')
  }
  return badgesStore.badges.filter(b => b.gameSlug === cat.gameSlug)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const rankEmoji = ['🥇', '🥈', '🥉']
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <h1 class="text-3xl font-extrabold text-white mb-1">Badges</h1>
    <p class="text-[#b0b3c6] mb-8 text-sm">
      {{ authStore.isAuthenticated ? 'Tes badges sont surlignés. Joue et progresse pour en débloquer de nouveaux !' : 'Connecte-toi pour voir tes badges débloqués.' }}
    </p>

    <!-- Grille par catégorie -->
    <div v-for="cat in CATEGORIES" :key="cat.key" class="mb-10">
      <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span>{{ cat.icon }}</span> {{ cat.label }}
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div
          v-for="badge in badgesForCategory(cat)"
          :key="badge.key"
          class="rounded-xl p-4 flex flex-col items-center text-center transition-all border"
          :class="badge.earned
            ? 'bg-[#1e1a30] border-[#8c52ff] shadow-[0_0_12px_rgba(140,82,255,0.25)]'
            : 'bg-[#161722] border-[#232533] opacity-50 grayscale'"
        >
          <span class="text-4xl mb-2">{{ badge.icon }}</span>
          <span class="text-white font-bold text-sm leading-tight mb-1">{{ badge.name }}</span>
          <span class="text-[#b0b3c6] text-xs leading-tight mb-2">{{ badge.description }}</span>
          <span v-if="badge.earned" class="text-[#8c52ff] text-[0.7rem] font-semibold mt-auto">
            ✓ {{ formatDate(badge.earnedAt) }}
          </span>
          <span v-else class="text-[#63667c] text-[0.7rem] mt-auto">🔒 Verrouillé</span>
        </div>
      </div>
    </div>

    <!-- Classement badges -->
    <div class="mt-12">
      <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span>🏆</span> Classement des collectionneurs
      </h2>
      <div class="bg-[#161722] border border-[#232533] rounded-xl overflow-hidden">
        <div v-if="badgesStore.leaderboard.length === 0" class="text-center text-[#63667c] py-10">
          Aucun joueur pour le moment.
        </div>
        <table v-else class="w-full">
          <thead>
            <tr class="text-[#63667c] text-xs uppercase border-b border-[#232533]">
              <th class="px-5 py-3 text-left">Rang</th>
              <th class="px-5 py-3 text-left">Joueur</th>
              <th class="px-5 py-3 text-right">Badges</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="entry in badgesStore.leaderboard"
              :key="entry.rank"
              class="border-b border-[#1e2030] transition hover:bg-[#1e2030]"
              :class="authStore.user?.username === entry.username ? 'bg-[#1e1a30]' : ''"
            >
              <td class="px-5 py-4 text-white font-bold w-16">
                <span v-if="entry.rank <= 3">{{ rankEmoji[entry.rank - 1] }}</span>
                <span v-else class="text-[#b0b3c6]">{{ entry.rank }}</span>
              </td>
              <td class="px-5 py-4 text-white">
                {{ entry.username }}
                <span v-if="authStore.user?.username === entry.username" class="ml-2 text-[0.7rem] text-[#8c52ff] font-semibold">(toi)</span>
              </td>
              <td class="px-5 py-4 text-right">
                <span class="bg-[#8c52ff] text-white text-xs font-bold px-3 py-1 rounded-full">
                  {{ entry.badgeCount }} / 13
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
