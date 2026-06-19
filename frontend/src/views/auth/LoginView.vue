<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const errorMessage = ref('');

async function handleLogin() {
  errorMessage.value = '';
  
  if (!email.value || !password.value) {
    errorMessage.value = "Veuillez remplir tous les champs.";
    return;
  }

  try {
    await authStore.login(email.value, password.value);
    // Rediriger vers la page d'accueil après une connexion réussie
    router.push({ name: 'home' });
  } catch (error) {
    errorMessage.value = error;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 px-4">
    <div class="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
      <h2 class="text-3xl font-extrabold text-center text-white mb-8">Connexion <span class="text-green-500">KroustyGames</span></h2>
      
      <form class="space-y-6" @submit.prevent="handleLogin">
        <div v-if="errorMessage" class="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded text-sm mb-4">
          {{ errorMessage }}
        </div>
        
        <div>
          <label for="email" class="block text-sm font-medium text-gray-300">Adresse email</label>
          <input id="email" v-model="email" type="email" required class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-300">Mot de passe</label>
          <input id="password" v-model="password" type="password" required class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <div>
          <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150">
            Se connecter
          </button>
        </div>
      </form>

      <div class="mt-6 text-center text-sm text-gray-400">
        Pas encore de compte ? 
        <router-link :to="{ name: 'register' }" class="font-medium text-green-500 hover:text-green-400">
          Inscrivez-vous ici
        </router-link>
      </div>
    </div>
  </div>
</template>