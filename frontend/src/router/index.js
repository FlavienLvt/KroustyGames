import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth' 

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import MyGame from '../views/games/2048View.vue' 
import KroustyRun from '../views/games/KroustyRunView.vue'
import FlappyNugget from '../views/games/FlappyNuggetView.vue'
import LeaderboardView from '../views/LeaderboardView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
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
    path: '/leaderboard',
    name: 'leaderboard',
    component: LeaderboardView
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

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    next({ name: 'home' }) 
  } 
  else {
    next()
  }
})

export default router