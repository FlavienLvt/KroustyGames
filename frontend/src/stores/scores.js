// frontend/src/stores/scores.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth' // On a besoin de savoir si on est connecté

const API_URL = import.meta.env.VITE_API_URL + '/api/scores'

export const useScoresStore = defineStore('scores', {
  state: () => ({
    leaderboards: {} // On stockera les classements par jeu ici
  }),

  actions: {
    // 1. Fonction pour récupérer le classement d'un jeu
    async fetchLeaderboard(gameSlug) {
      try {
        const response = await axios.get(`${API_URL}/${gameSlug}`)
        // On met à jour l'état local pour ce jeu
        this.leaderboards[gameSlug] = response.data
        return response.data
      } catch (error) {
        console.error("Erreur fetchLeaderboard :", error)
        throw error
      }
    },

    // 2. Fonction pour sauvegarder un nouveau score (Nécessite le token !)
    async saveScore(gameSlug, scoreValue) {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        throw new Error("Vous devez être connecté pour sauvegarder un score.")
      }

      try {
        // On attache le token JWT dans les headers de la requête
        const config = {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }

        const response = await axios.post(API_URL, {
          gameSlug: gameSlug,
          score: scoreValue
        }, config)

        // Une fois sauvegardé, on rafraîchit le classement local
        await this.fetchLeaderboard(gameSlug)
        
        return response.data
      } catch (error) {
        console.error("Erreur saveScore :", error)
        throw error.response?.data?.message || "Erreur lors de la sauvegarde"
      }
    }
  }
})