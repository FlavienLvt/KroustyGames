// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import MyGame from '../views/games/2048View.vue' 
import HomeView from '../views/HomeView.vue' // On importe la vraie page d'accueil
import KroustyRun from '../views/games/KroustyRunView.vue'
import FlappyNugget from '../views/games/FlappyNuggetView.vue'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView // On pointe vers HomeView, plus vers App !
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/games/2048',
    name: '2048',
    component: MyGame
  },
  {
    path: '/games/krousty-run',
    name: 'krousty-run',
    component: KroustyRun
  },
  {
    path: '/games/flappy-nugget',
    name: 'flappy-nugget',
    component: FlappyNugget
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router