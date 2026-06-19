<template>
    <div>
      <h1>Catégorie : {{ category }}</h1>
      <p>Découvrez les jeux de la catégorie "{{ category }}".</p>
  
      <div v-if="loading">Chargement des jeux...</div>
      <div v-else-if="error">{{ error }}</div>
      <div v-else>
        <ul>
          <li v-for="game in games" :key="game.id">
            <h3>{{ game.name }}</h3>
            <p>{{ game.description }}</p>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, watch } from 'vue'
  
  export default {
    name: 'CategoryView',
    props: {
      category: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      const games = ref([]) // Liste des jeux récupérés
      const loading = ref(false) // Indicateur de chargement
      const error = ref(null) // Message d'erreur
  
      // Fonction pour récupérer les jeux depuis l'API
      const fetchGamesByCategory = async (category) => {
        loading.value = true
        error.value = null
        try {
          const response = await fetch(`http://localhost:3000/api/games?category=${category}`)
          if (!response.ok) {
            throw new Error('Erreur lors de la récupération des jeux.')
          }
          const data = await response.json()
          games.value = data
        } catch (err) {
          error.value = err.message
        } finally {
          loading.value = false
        }
      }
  
      // Appeler la fonction lors du montage du composant
      onMounted(() => {
        fetchGamesByCategory(props.category)
      })
  
      // Regarder les changements de catégorie et recharger les jeux
      watch(() => props.category, (newCategory) => {
        fetchGamesByCategory(newCategory)
      })
  
      return {
        games,
        loading,
        error,
      }
    },
  }
  </script>
  
  <style scoped>
  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  ul {
    list-style: none;
    padding: 0;
  }
  
  li {
    margin-bottom: 1.5rem;
    border: 1px solid #ddd;
    padding: 1rem;
    border-radius: 8px;
  }
  
  h3 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  p {
    margin: 0.5rem 0 0;
    color: #555;
  }
  </style>