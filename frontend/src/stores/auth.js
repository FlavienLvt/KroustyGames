import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL + '/api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('userToken') || null,
    user: JSON.parse(localStorage.getItem('userData')) || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    // --- Inscription ---
    async register(username, email, password) {
      try {
        const response = await axios.post(`${API_URL}/register`, {
          username,
          email,
          password
        });
        return response.data; // Succès
      } catch (error) {
        throw error.response.data.message || 'Erreur lors de l\'inscription.';
      }
    },

    // --- Connexion ---
    async login(email, password) {
      try {
        const response = await axios.post(`${API_URL}/login`, {
          email,
          password
        });
        
        const { token, username, role } = response.data;

        this.token = token;
        this.user = { username, role };

        localStorage.setItem('userToken', token);
        localStorage.setItem('userData', JSON.stringify({ username, role }));

        return response.data; // Succès
      } catch (error) {
        throw error.response.data.message || 'Erreur lors de la connexion.';
      }
    },

    // --- Déconnexion ---
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
    }
  }
})