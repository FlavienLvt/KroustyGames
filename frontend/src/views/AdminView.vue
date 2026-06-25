<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const authStore = useAuthStore()
const API = import.meta.env.VITE_API_URL

const activeTab  = ref('users')
const users      = ref([])
const scores     = ref([])
const loading    = ref(false)
const error      = ref('')
const toast      = ref('')

// ── Filtres ─────────────────────────────────────────────────────────────────
const userSearch   = ref('')
const scoreSearch  = ref('')
const scoreFilter  = ref('')

// ── Modal ────────────────────────────────────────────────────────────────────
const modal = ref({ show: false, type: '', data: {} })

// ── Jeux disponibles pour filtre ─────────────────────────────────────────────
const gameSlugs = computed(() => {
  const slugs = [...new Set(scores.value.map(s => s.gameSlug))].sort()
  return slugs
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function authHeaders() {
  return { headers: { Authorization: `Bearer ${authStore.token}` } }
}

function showToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 3000)
}

// ── Fetch users ───────────────────────────────────────────────────────────────
async function fetchUsers() {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.get(`${API}/api/admin/users`, authHeaders())
    users.value = res.data
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur lors du chargement des utilisateurs.'
  } finally {
    loading.value = false
  }
}

// ── Fetch scores ──────────────────────────────────────────────────────────────
async function fetchScores() {
  loading.value = true
  error.value = ''
  try {
    const params = scoreFilter.value ? { gameSlug: scoreFilter.value } : {}
    const res = await axios.get(`${API}/api/admin/scores`, { ...authHeaders(), params })
    scores.value = res.data
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur lors du chargement des scores.'
  } finally {
    loading.value = false
  }
}

// ── CRUD utilisateurs ─────────────────────────────────────────────────────────
function openEditUser(user) {
  modal.value = {
    show: true,
    type: 'editUser',
    data: { id: user.id, username: user.username, email: user.email, role: user.role }
  }
}

async function saveUser() {
  try {
    await axios.put(`${API}/api/admin/users/${modal.value.data.id}`, {
      username: modal.value.data.username,
      email:    modal.value.data.email,
      role:     modal.value.data.role
    }, authHeaders())
    showToast('Utilisateur mis à jour ✓')
    closeModal()
    fetchUsers()
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur lors de la mise à jour.'
  }
}

async function deleteUser(id) {
  modal.value = { show: true, type: 'confirmDeleteUser', data: { id } }
}

async function confirmDeleteUser() {
  try {
    await axios.delete(`${API}/api/admin/users/${modal.value.data.id}`, authHeaders())
    showToast('Utilisateur supprimé ✓')
    closeModal()
    fetchUsers()
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur lors de la suppression.'
    closeModal()
  }
}

// ── CRUD scores ───────────────────────────────────────────────────────────────
function openEditScore(score) {
  modal.value = {
    show: true,
    type: 'editScore',
    data: { id: score.id, score: score.score, username: score.User?.username, gameSlug: score.gameSlug }
  }
}

async function saveScore() {
  try {
    await axios.put(`${API}/api/admin/scores/${modal.value.data.id}`, {
      score: Number(modal.value.data.score)
    }, authHeaders())
    showToast('Score mis à jour ✓')
    closeModal()
    fetchScores()
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur lors de la mise à jour.'
  }
}

async function deleteScore(id) {
  modal.value = { show: true, type: 'confirmDeleteScore', data: { id } }
}

async function confirmDeleteScore() {
  try {
    await axios.delete(`${API}/api/admin/scores/${modal.value.data.id}`, authHeaders())
    showToast('Score supprimé ✓')
    closeModal()
    fetchScores()
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur lors de la suppression.'
    closeModal()
  }
}

function closeModal() {
  modal.value = { show: false, type: '', data: {} }
}

// ── Données filtrées ──────────────────────────────────────────────────────────
const filteredUsers = computed(() => {
  const q = userSearch.value.toLowerCase()
  if (!q) return users.value
  return users.value.filter(u =>
    u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  )
})

const filteredScores = computed(() => {
  const q = scoreSearch.value.toLowerCase()
  if (!q) return scores.value
  return scores.value.filter(s =>
    (s.User?.username || '').toLowerCase().includes(q) ||
    s.gameSlug.toLowerCase().includes(q)
  )
})

// ── Changer d'onglet ──────────────────────────────────────────────────────────
async function changeTab(tab) {
  activeTab.value = tab
  error.value = ''
  if (tab === 'users') fetchUsers()
  if (tab === 'scores') fetchScores()
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => fetchUsers())
</script>

<template>
  <div class="max-w-6xl mx-auto">

    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold tracking-tight mb-1" style="color: var(--text-primary)">
        ⚙️ Administration
      </h1>
      <p style="color: var(--text-muted)">Gestion des utilisateurs et des scores</p>
    </div>

    <!-- Toast -->
    <div
      v-if="toast"
      class="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl font-semibold text-sm shadow-xl text-white transition-all"
      style="background: #34D399"
    >
      {{ toast }}
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6 border-b" style="border-color: var(--border-color)">
      <button
        v-for="tab in [{ id: 'users', label: '👥 Utilisateurs' }, { id: 'scores', label: '🏅 Scores' }]"
        :key="tab.id"
        @click="changeTab(tab.id)"
        class="px-5 py-3 font-semibold text-sm transition-all rounded-t-lg border-b-2 -mb-px"
        :style="activeTab === tab.id
          ? 'color: var(--accent); border-color: var(--accent); background: transparent'
          : 'color: var(--text-muted); border-color: transparent'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Erreur -->
    <div v-if="error" class="mb-4 px-4 py-3 rounded-lg text-sm" style="background: rgba(248,113,113,0.12); color: #F87171; border: 1px solid rgba(248,113,113,0.25)">
      {{ error }}
    </div>

    <!-- ── ONGLET UTILISATEURS ────────────────────────────────────────────── -->
    <div v-if="activeTab === 'users'">
      <!-- Barre de recherche -->
      <div class="flex gap-3 mb-4">
        <input
          v-model="userSearch"
          type="text"
          placeholder="Filtrer par nom ou email..."
          class="flex-1 px-4 py-2.5 rounded-lg border text-sm outline-none transition"
          style="background: var(--bg-card); color: var(--text-primary); border-color: var(--border-color)"
        />
        <span class="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center" style="background: var(--bg-card); color: var(--text-muted)">
          {{ filteredUsers.length }} utilisateur{{ filteredUsers.length > 1 ? 's' : '' }}
        </span>
      </div>

      <!-- Table -->
      <div class="rounded-xl overflow-hidden border" style="border-color: var(--border-color)">
        <!-- En-têtes -->
        <div class="grid grid-cols-[40px_1fr_1fr_100px_120px_100px] gap-0 px-4 py-3 text-xs font-bold uppercase tracking-wider" style="background: var(--bg-card); color: var(--text-dim); border-bottom: 1px solid var(--border-color)">
          <div>#</div>
          <div>Utilisateur</div>
          <div>Email</div>
          <div>Rôle</div>
          <div>Inscrit le</div>
          <div>Actions</div>
        </div>

        <!-- Chargement -->
        <div v-if="loading" class="py-12 text-center" style="color: var(--text-muted)">
          Chargement...
        </div>

        <!-- Vide -->
        <div v-else-if="filteredUsers.length === 0" class="py-12 text-center" style="color: var(--text-muted)">
          Aucun utilisateur trouvé.
        </div>

        <!-- Lignes -->
        <div
          v-for="(user, i) in filteredUsers"
          :key="user.id"
          class="grid grid-cols-[40px_1fr_1fr_100px_120px_100px] gap-0 px-4 py-3.5 items-center text-sm transition"
          :style="`border-bottom: 1px solid var(--border-color); background: ${i % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-sidebar)'}`"
        >
          <div style="color: var(--text-dim)" class="font-mono text-xs">{{ user.id }}</div>
          <div class="font-semibold" style="color: var(--text-primary)">{{ user.username }}</div>
          <div style="color: var(--text-muted)" class="truncate">{{ user.email }}</div>
          <div>
            <span
              class="px-2 py-0.5 rounded text-xs font-bold"
              :style="user.role === 'admin'
                ? 'background: rgba(249,115,22,0.15); color: var(--accent)'
                : 'background: var(--bg-card); color: var(--text-muted)'"
            >
              {{ user.role }}
            </span>
          </div>
          <div style="color: var(--text-dim)" class="text-xs">{{ formatDate(user.createdAt) }}</div>
          <div class="flex gap-2">
            <button
              @click="openEditUser(user)"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              style="background: rgba(249,115,22,0.12); color: var(--accent)"
            >
              Modifier
            </button>
            <button
              @click="deleteUser(user.id)"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              style="background: rgba(248,113,113,0.12); color: #F87171"
            >
              Suppr.
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── ONGLET SCORES ──────────────────────────────────────────────────── -->
    <div v-if="activeTab === 'scores'">
      <!-- Filtres -->
      <div class="flex gap-3 mb-4 flex-wrap">
        <input
          v-model="scoreSearch"
          type="text"
          placeholder="Filtrer par joueur ou jeu..."
          class="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg border text-sm outline-none"
          style="background: var(--bg-card); color: var(--text-primary); border-color: var(--border-color)"
        />
        <select
          v-model="scoreFilter"
          @change="fetchScores"
          class="px-4 py-2.5 rounded-lg border text-sm outline-none cursor-pointer"
          style="background: var(--bg-card); color: var(--text-primary); border-color: var(--border-color)"
        >
          <option value="">Tous les jeux</option>
          <option v-for="slug in gameSlugs" :key="slug" :value="slug">{{ slug }}</option>
        </select>
        <span class="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center" style="background: var(--bg-card); color: var(--text-muted)">
          {{ filteredScores.length }} score{{ filteredScores.length > 1 ? 's' : '' }}
        </span>
      </div>

      <!-- Table -->
      <div class="rounded-xl overflow-hidden border" style="border-color: var(--border-color)">
        <div class="grid grid-cols-[40px_1fr_1fr_100px_130px_100px] gap-0 px-4 py-3 text-xs font-bold uppercase tracking-wider" style="background: var(--bg-card); color: var(--text-dim); border-bottom: 1px solid var(--border-color)">
          <div>#</div>
          <div>Joueur</div>
          <div>Jeu</div>
          <div>Score</div>
          <div>Date</div>
          <div>Actions</div>
        </div>

        <div v-if="loading" class="py-12 text-center" style="color: var(--text-muted)">
          Chargement...
        </div>

        <div v-else-if="filteredScores.length === 0" class="py-12 text-center" style="color: var(--text-muted)">
          Aucun score trouvé.
        </div>

        <div
          v-for="(score, i) in filteredScores"
          :key="score.id"
          class="grid grid-cols-[40px_1fr_1fr_100px_130px_100px] gap-0 px-4 py-3.5 items-center text-sm transition"
          :style="`border-bottom: 1px solid var(--border-color); background: ${i % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-sidebar)'}`"
        >
          <div style="color: var(--text-dim)" class="font-mono text-xs">{{ score.id }}</div>
          <div class="font-semibold" style="color: var(--text-primary)">{{ score.User?.username || '—' }}</div>
          <div style="color: var(--text-muted)" class="text-xs">{{ score.gameSlug }}</div>
          <div class="font-bold font-mono" style="color: var(--accent)">{{ score.score.toLocaleString() }}</div>
          <div style="color: var(--text-dim)" class="text-xs">{{ formatDate(score.createdAt) }}</div>
          <div class="flex gap-2">
            <button
              @click="openEditScore(score)"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style="background: rgba(249,115,22,0.12); color: var(--accent)"
            >
              Modifier
            </button>
            <button
              @click="deleteScore(score.id)"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style="background: rgba(248,113,113,0.12); color: #F87171"
            >
              Suppr.
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── MODALES ────────────────────────────────────────────────────────── -->
    <Teleport to="body">
      <div
        v-if="modal.show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.6); backdrop-filter: blur(4px)"
        @click.self="closeModal"
      >

        <!-- Modale : édition utilisateur -->
        <div
          v-if="modal.type === 'editUser'"
          class="w-full max-w-md rounded-2xl p-6 shadow-2xl"
          style="background: var(--bg-sidebar); border: 1px solid var(--border-color)"
        >
          <h2 class="text-xl font-bold mb-5" style="color: var(--text-primary)">Modifier l'utilisateur</h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1.5" style="color: var(--text-muted)">Nom d'utilisateur</label>
              <input
                v-model="modal.data.username"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
                style="background: var(--bg-card); color: var(--text-primary); border-color: var(--border-color)"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5" style="color: var(--text-muted)">Email</label>
              <input
                v-model="modal.data.email"
                type="email"
                class="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
                style="background: var(--bg-card); color: var(--text-primary); border-color: var(--border-color)"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5" style="color: var(--text-muted)">Rôle</label>
              <select
                v-model="modal.data.role"
                class="w-full px-4 py-2.5 rounded-lg border text-sm outline-none cursor-pointer"
                style="background: var(--bg-card); color: var(--text-primary); border-color: var(--border-color)"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button @click="closeModal" class="px-5 py-2.5 rounded-xl text-sm font-semibold" style="background: var(--bg-card); color: var(--text-muted)">
              Annuler
            </button>
            <button @click="saveUser" class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style="background: var(--accent)">
              Enregistrer
            </button>
          </div>
        </div>

        <!-- Modale : confirmation suppression utilisateur -->
        <div
          v-if="modal.type === 'confirmDeleteUser'"
          class="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
          style="background: var(--bg-sidebar); border: 1px solid var(--border-color)"
        >
          <h2 class="text-xl font-bold mb-3" style="color: var(--text-primary)">Supprimer l'utilisateur ?</h2>
          <p class="text-sm mb-6" style="color: var(--text-muted)">Cette action est irréversible. Tous les scores et badges de cet utilisateur seront supprimés.</p>
          <div class="flex justify-end gap-3">
            <button @click="closeModal" class="px-5 py-2.5 rounded-xl text-sm font-semibold" style="background: var(--bg-card); color: var(--text-muted)">
              Annuler
            </button>
            <button @click="confirmDeleteUser" class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style="background: #e63946">
              Supprimer
            </button>
          </div>
        </div>

        <!-- Modale : édition score -->
        <div
          v-if="modal.type === 'editScore'"
          class="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
          style="background: var(--bg-sidebar); border: 1px solid var(--border-color)"
        >
          <h2 class="text-xl font-bold mb-1" style="color: var(--text-primary)">Modifier le score</h2>
          <p class="text-sm mb-5" style="color: var(--text-muted)">
            {{ modal.data.username }} — {{ modal.data.gameSlug }}
          </p>
          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: var(--text-muted)">Valeur du score</label>
            <input
              v-model.number="modal.data.score"
              type="number"
              min="0"
              class="w-full px-4 py-2.5 rounded-lg border text-sm outline-none font-mono"
              style="background: var(--bg-card); color: var(--text-primary); border-color: var(--border-color)"
            />
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="closeModal" class="px-5 py-2.5 rounded-xl text-sm font-semibold" style="background: var(--bg-card); color: var(--text-muted)">
              Annuler
            </button>
            <button @click="saveScore" class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style="background: var(--accent)">
              Enregistrer
            </button>
          </div>
        </div>

        <!-- Modale : confirmation suppression score -->
        <div
          v-if="modal.type === 'confirmDeleteScore'"
          class="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
          style="background: var(--bg-sidebar); border: 1px solid var(--border-color)"
        >
          <h2 class="text-xl font-bold mb-3" style="color: var(--text-primary)">Supprimer ce score ?</h2>
          <p class="text-sm mb-6" style="color: var(--text-muted)">Cette action est irréversible.</p>
          <div class="flex justify-end gap-3">
            <button @click="closeModal" class="px-5 py-2.5 rounded-xl text-sm font-semibold" style="background: var(--bg-card); color: var(--text-muted)">
              Annuler
            </button>
            <button @click="confirmDeleteScore" class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style="background: #e63946">
              Supprimer
            </button>
          </div>
        </div>

      </div>
    </Teleport>

  </div>
</template>
