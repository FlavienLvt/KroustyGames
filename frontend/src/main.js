import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// Appliquer le thème sauvegardé au chargement
const savedTheme = localStorage.getItem('theme') || 'dark'
document.documentElement.classList.toggle('light', savedTheme === 'light')

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')