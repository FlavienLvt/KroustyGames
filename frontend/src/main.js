import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Importe le fichier créé à l'étape 2

const app = createApp(App)

app.use(router) // Indique à Vue d'utiliser le routeur
app.mount('#app')