import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import MyGame from '../views/games/2048View.vue'
import KroustyRun from '../views/games/KroustyRunView.vue'
import FlappyNugget from '../views/games/FlappyNuggetView.vue'
import NouveautesView from '../views/NouveautesView.vue'
import TendancesView from '../views/TendancesView.vue'
import CategoryView from '../views/CategoryView.vue'
import SearchView from '../views/SearchView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import LeaderboardView from '../views/LeaderboardView.vue'
import BadgesView from '../views/BadgesView.vue'
import KroustyCrushView from '../views/games/KroustyCrushView.vue'
import KroustySurvivorsView from '../views/games/KroustySurvivorsView.vue'
import AngryNuggetsView from '../views/games/AngryNuggetsView.vue'

const routes = [
  { path: '/',            name: 'home',         component: HomeView        },
  { path: '/login',       name: 'login',        component: LoginView       },
  { path: '/register',    name: 'register',     component: RegisterView    },
  { path: '/leaderboard', name: 'leaderboard',  component: LeaderboardView },
  { path: '/badges',      name: 'badges',       component: BadgesView      },
  { path: '/games/2048',             name: '2048',              component: MyGame           },
  { path: '/games/krousty-run',     name: 'krousty-run',     component: KroustyRun      },
  { path: '/games/flappy-nugget',   name: 'flappy-nugget',   component: FlappyNugget    },
  { path: '/games/krousty-crush',   name: 'krousty-crush',   component: KroustyCrushView    },
  { path: '/games/krousty-survivors', name: 'krousty-survivors', component: KroustySurvivorsView },
  { path: '/games/angry-nuggets',   name: 'angry-nuggets',   component: AngryNuggetsView    },
  { path: '/nouveautes',          name: 'nouveautes',    component: NouveautesView },
  { path: '/tendances',           name: 'tendances',     component: TendancesView  },
  { path: '/category/:category',  name: 'category',      component: CategoryView, props: true },
  { path: '/search',              name: 'search',        component: SearchView     },
  { path: '/:pathMatch(.*)*',     name: 'not-found',     component: NotFoundView   }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
