import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth'

const API = import.meta.env.VITE_API_URL

export const useBadgesStore = defineStore('badges', () => {
  const badges = ref([])
  const leaderboard = ref([])

  async function fetchBadges() {
    const authStore = useAuthStore()
    const headers = authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}
    const res = await axios.get(`${API}/api/badges`, { headers })
    badges.value = res.data
  }

  async function fetchLeaderboard() {
    const res = await axios.get(`${API}/api/badges/leaderboard`)
    leaderboard.value = res.data
  }

  return { badges, leaderboard, fetchBadges, fetchLeaderboard }
})
