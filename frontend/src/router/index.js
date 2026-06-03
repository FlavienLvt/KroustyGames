// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import MyGame from '../views/games/2048View.vue' 
import KroustyClickerView from '../views/games/KroutsyClickerView.vue'
import HomeView from '../views/HomeView.vue' // On importe la vraie page d'accueil

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView // On pointe vers HomeView, plus vers App !
  },
  {
    path: '/games/2048',
    name: '2048',
    component: MyGame
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router