<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const successMessage = ref('');

async function handleRegister() {
  errorMessage.value = '';
  successMessage.value = '';
  
  if (!username.value || !email.value || !password.value) {
    errorMessage.value = "Veuillez remplir tous les champs.";
    return;
  }

  try {
    await authStore.register(username.value, email.value, password.value);
    successMessage.value = "Compte créé ! Redirection vers la connexion...";
    // Rediriger vers la page de login après 2 secondes
    setTimeout(() => {
      router.push({ name: 'login' });
    }, 2000);
  } catch (error) {
    errorMessage.value = error;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 px-4">
    <div class="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
      <h2 class="text-3xl font-extrabold text-center text-white mb-8">Créer un compte <span class="text-orange-500">KroustyGames</span></h2>

      <form class="space-y-6" @submit.prevent="handleRegister">
        <div v-if="errorMessage" class="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded text-sm mb-4">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="bg-orange-900 border border-orange-700 text-orange-100 px-4 py-3 rounded text-sm mb-4">
          {{ successMessage }}
        </div>

        <div>
          <label for="username" class="block text-sm font-medium text-gray-300">Pseudo</label>
          <input id="username" v-model="username" type="text" required class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-300">Adresse email</label>
          <input id="email" v-model="email" type="email" required class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-300">Mot de passe</label>
          <input id="password" v-model="password" type="password" required class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>

        <div>
          <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150">
            S'inscrire
          </button>
        </div>
      </form>

      <div class="mt-6 text-center text-sm text-gray-400">
        Déjà un compte ?
        <router-link :to="{ name: 'login' }" class="font-medium text-orange-500 hover:text-orange-400">
          Connectez-vous ici
        </router-link>
      </div>
    </div>
  </div>
</template>