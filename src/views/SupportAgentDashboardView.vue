<template>
  <div class="wrap">
    <div class="top">
      <div class="top-title">Support Dashboard</div>
      <button class="icon-btn" @click="logout">🚪</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">💬</div>
        <div class="stat-number">{{ activeChats }}</div>
        <div class="stat-label">Active Chats</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-number">{{ resolvedToday }}</div>
        <div class="stat-label">Resolved Today</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-number">{{ avgResponseTime }}</div>
        <div class="stat-label">Avg Response</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-number">{{ satisfactionRate }}</div>
        <div class="stat-label">Satisfaction</div>
      </div>
    </div>

    <!-- Agent Profile & Resources -->
    <div class="section">
      <div class="section-header">
        <h2>Agent Profile</h2>
      </div>

      <div class="agent-card" style="display:flex;gap:16px;align-items:center;">
        <div style="width:72px;height:72px;border-radius:12px;background:var(--crave-blue-1);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:20px;">A</div>
        <div style="flex:1">
          <div style="font-weight:900;font-size:16px">{{ currentAgentName }}</div>
          <div style="color:var(--crave-muted);font-size:13px">ID: {{ currentAgentId }} • {{ currentAgentEmail }}</div>
          <div style="margin-top:8px;color:var(--crave-muted);font-size:13px">Role: {{ currentAgentRole }}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn-secondary" @click="refreshData">Refresh</button>
          <button class="btn-primary" @click="logout">Sign out</button>
        </div>
      </div>

      <div style="margin-top:16px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-number">{{ kycPendingCount }}</div>
          <div class="stat-label">KYC Pending</div>
          <div style="margin-top:8px">
            <button class="btn-primary" @click="openFullList('kyc')" v-if="kycPendingCount > 0" style="width:100%;padding:6px;font-size:12px">Review</button>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-number">{{ customersList.length }}</div>
          <div class="stat-label">Customers</div>
          <div style="margin-top:8px;max-height:100px;overflow:auto">
            <div v-for="u in customersList.slice(0,4)" :key="u.id" style="padding:4px 0;border-bottom:1px solid var(--crave-border);font-size:12px">
              <a href="#" @click.prevent="openEntityModal(u, 'customer')">{{ displayName(u) }}</a>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🏬</div>
          <div class="stat-number">{{ merchantsList.length }}</div>
          <div class="stat-label">Merchants</div>
          <div style="margin-top:8px;max-height:100px;overflow:auto">
            <div v-for="m in merchantsList.slice(0,4)" :key="m.id" style="padding:4px 0;border-bottom:1px solid var(--crave-border);font-size:12px">
              <a href="#" @click.prevent="openEntityModal(m, 'merchant')">{{ m.name || m.title || ('Store ' + (m.id || '').slice(-4)) }}</a>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🛵</div>
          <div class="stat-number">{{ ridersList.length }}</div>
          <div class="stat-label">Riders</div>
          <div style="margin-top:8px;max-height:100px;overflow:auto">
            <div v-for="r in ridersList.slice(0,4)" :key="r.id" style="padding:4px 0;border-bottom:1px solid var(--crave-border);font-size:12px">
              <a href="#" @click.prevent="openEntityModal(r, 'rider')">{{ r.name || r.fullName || ('Rider ' + (r.id || '').slice(-4)) }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Chats Section -->
    <div class="section">
      <div class="section-header">
        <h2>Active Chats</h2>
        <div class="status-indicator">
          <div class="status-dot online"></div>
          Online
        </div>
      </div>

      <div v-if="activeChatsList.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <div class="empty-title">No active chats</div>
        <div class="empty-subtitle">Waiting for customer inquiries...</div>
      </div>

      <div v-else class="chats-list">
        <div
          v-for="chat in activeChatsList"
          :key="chat.id"
          class="chat-card"
          @click="openChat(chat)"
        >
          <div class="chat-header">
            <div class="chat-user">{{ getUserName(chat.userId) }}</div>
            <div class="chat-time">{{ formatTime(chat.lastMessageTime) }}</div>
          </div>
          <div class="chat-preview">{{ getLastMessage(chat) }}</div>
          <div class="chat-meta">
            <span class="priority" :class="chat.priority">{{ chat.priority }}</span>
            <span class="unread" v-if="chat.unread > 0">{{ chat.unread }} new</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="section">
      <div class="section-header">
        <h2>Quick Actions</h2>
      </div>

      <div class="actions-grid">
        <button class="action-btn" @click="startNewChat">
          <div class="action-icon">➕</div>
          <div class="action-label">New Chat</div>
        </button>
        <button class="action-btn" @click="viewKnowledgeBase">
          <div class="action-icon">📚</div>
          <div class="action-label">Knowledge Base</div>
        </button>
        <button class="action-btn" @click="viewReports">
          <div class="action-icon">📊</div>
          <div class="action-label">Reports</div>
        </button>
        <button class="action-btn" @click="updateStatus">
          <div class="action-icon">⚙️</div>
          <div class="action-label">Settings</div>
        </button>
      </div>
    </div>

    <!-- Chat Modal -->
    <div v-if="selectedChat" class="modal-overlay" @click="closeChat">
      <div class="modal chat-modal" @click.stop>
        <div class="modal-header">
          <h3>Chat with {{ getUserName(selectedChat.userId) }}</h3>
          <button @click="closeChat" class="close-btn">×</button>
        </div>

        <div class="chat-info">
          <div class="info-row">
            <span class="label">Priority:</span>
            <span class="value priority-badge" :class="selectedChat.priority">{{ selectedChat.priority }}</span>
          </div>
          <div class="info-row">
            <span class="label">Started:</span>
            <span class="value">{{ formatDateTime(selectedChat.createdAt) }}</span>
          </div>
        </div>

        <div class="chat-messages">
          <div
            v-for="msg in selectedChat.messages"
            :key="msg.id"
            class="message"
            :class="{ user: msg.sender === 'user', agent: msg.sender === 'agent' }"
          >
            <div class="message-text">{{ msg.text }}</div>
            <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>

        <div class="chat-input">
          <input
            v-model="agentMessage"
            @keyup.enter="sendMessage"
            placeholder="Type your response..."
            class="input message-input"
          />
          <button @click="sendMessage" class="send-btn" :disabled="!agentMessage.trim()">Send</button>
        </div>

        <div class="chat-actions">
          <button @click="transferChat" class="btn-secondary">Transfer</button>
          <button @click="resolveChat" class="btn-primary">Resolve Chat</button>
        </div>
      </div>
    </div>

    <!-- Rating Modal (shown after chat resolution) -->
    <div v-if="selectedChat && selectedChat.status === 'resolved' && !ratingSubmitted" class="modal-overlay" @click.stop>
      <div class="modal" style="max-width:600px" @click.stop>
        <div class="modal-header">
          <h3>Rate This Conversation</h3>
          <button @click="closeChat" class="close-btn">×</button>
        </div>
        <div style="padding:20px">
          <div style="margin-bottom:24px">
            <div style="font-weight:900;margin-bottom:8px">How would you rate this support agent?</div>
            <div style="display:flex;gap:8px;font-size:28px;cursor:pointer">
              <span v-for="n in 5" :key="n" @click="agentRating = n" style="opacity: n <= agentRating ? 1 : 0.3;transition:opacity 0.2s">★</span>
            </div>
          </div>
          <div style="margin-bottom:24px">
            <div style="font-weight:900;margin-bottom:8px">Rate the customer interaction</div>
            <div style="display:flex;gap:8px;font-size:28px;cursor:pointer">
              <span v-for="n in 5" :key="n" @click="customerRating = n" style="opacity: n <= customerRating ? 1 : 0.3;transition:opacity 0.2s">★</span>
            </div>
          </div>
          <div style="display:flex;gap:8px">
            <button @click="closeChat" class="btn-secondary">Skip</button>
            <button @click="submitRating" class="btn-primary" :disabled="agentRating === 0 || customerRating === 0">Submit Rating</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUserDataStore } from '../stores/userData'
import { usePartnerStore } from '../stores/partner'

const router = useRouter()
const auth = useAuthStore()
const userData = useUserDataStore()

const selectedChat = ref(null)
const agentMessage = ref('')

const partner = usePartnerStore()

const currentAgentId = computed(() => auth.currentUser?.id || auth.currentUser?.agentId || 'unknown')
const currentAgentName = computed(() => auth.currentUser?.name || auth.currentUser?.agentId || 'Support Agent')
const currentAgentEmail = computed(() => auth.currentUser?.email || '')
const currentAgentRole = computed(() => auth.currentUser?.role || '')

// Mock data for demonstration
const activeChatsList = computed(() => {
  return userData.supportChats.filter(chat => chat.status === 'active').slice(0, 5)
})

const customersList = computed(() => {
  try {
    return typeof auth.getAllUsers === 'function' ? auth.getAllUsers() : (auth.users || [])
  } catch (e) {
    return []
  }
})

const merchantsList = computed(() => partner.stores || [])
const ridersList = computed(() => partner.riders || [])

const kycApplications = computed(() => partner.allApplications || [])
const kycPendingCount = computed(() => kycApplications.value.filter(a => a.status === 'Pending').length)

const activeChats = computed(() => activeChatsList.value.length)
const resolvedToday = ref(12)
const avgResponseTime = ref('2.3m')
const satisfactionRate = ref('4.8/5')

function getUserName(userId) {
  // Mock user lookup
  const mockUsers = {
    'user_001': 'Maria Santos',
    'user_002': 'Juan Dela Cruz',
    'user_003': 'Ana Reyes'
  }
  return mockUsers[userId] || `User ${userId.slice(-4)}`
}

function displayName(u) {
  if (!u) return 'Unknown'
  return u.name || u.fullName || u.email || u.phone || (u.id ? ('User ' + u.id.slice(-4)) : 'Unknown')
}

// Full list + search + pagination state
const showFullList = ref(false)
const fullListType = ref('customers')
const listSearch = ref('')
const listPage = ref(1)
const pageSize = ref(8)
const selectedEntityModal = ref(null)
const selectedEntityType = ref('')

// KYC modal state
const selectedKycApplication = ref(null)
const kycFeedback = ref('')
const kycAction = ref('')

const filteredCustomers = computed(() => {
  const q = listSearch.value.trim().toLowerCase()
  const all = customersList.value || []
  if (!q) return all
  return all.filter(u => (u.name||u.email||u.phone||'').toLowerCase().includes(q))
})

const filteredMerchants = computed(() => {
  const q = listSearch.value.trim().toLowerCase()
  const all = merchantsList.value || []
  if (!q) return all
  return all.filter(m => (m.name||m.title||m.email||'').toLowerCase().includes(q))
})

const filteredRiders = computed(() => {
  const q = listSearch.value.trim().toLowerCase()
  const all = ridersList.value || []
  if (!q) return all
  return all.filter(r => (r.name||r.fullName||r.phone||'').toLowerCase().includes(q))
})

const filteredKycApplications = computed(() => {
  const q = listSearch.value.trim().toLowerCase()
  const all = kycApplications.value || []
  if (!q) return all
  return all.filter(a => (a.storeName||a.ownerName||a.ownerEmail||'').toLowerCase().includes(q))
})

function totalPagesFor(listLength) {
  return Math.max(1, Math.ceil(listLength / pageSize.value))
}

function paginated(list) {
  const start = (listPage.value - 1) * pageSize.value
  return list.slice(start, start + pageSize.value)
}

function openFullList(type) {
  fullListType.value = type
  listSearch.value = ''
  listPage.value = 1
  showFullList.value = true
}

function closeFullList() {
  showFullList.value = false
}

function changePage(delta, listLength) {
  const pages = totalPagesFor(listLength)
  listPage.value = Math.min(Math.max(1, listPage.value + delta), pages)
}

function openEntityModal(entity, type) {
  selectedEntityModal.value = entity
  selectedEntityType.value = type
}

function closeEntityModal() {
  selectedEntityModal.value = null
  selectedEntityType.value = ''
}

function saveEntityRating() {
  if (!selectedEntityModal.value || !selectedEntityModal.value.userRating) return
  
  const entityRatings = JSON.parse(localStorage.getItem('crave_entity_ratings') || '{}')
  const key = `${selectedEntityType.value}_${selectedEntityModal.value.id}`
  
  if (!entityRatings[key]) {
    entityRatings[key] = { ratings: [] }
  }
  
  entityRatings[key].ratings.push({
    rating: selectedEntityModal.value.userRating,
    timestamp: new Date().toISOString()
  })
  
  localStorage.setItem('crave_entity_ratings', JSON.stringify(entityRatings))
  alert('Rating saved!')
  closeEntityModal()
}

function getLastMessage(chat) {
  const lastMsg = chat.messages[chat.messages.length - 1]
  return lastMsg ? lastMsg.text.slice(0, 50) + '...' : 'No messages'
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString()
}

function openChat(chat) {
  selectedChat.value = chat
  // Mark as read
  chat.unread = 0
}

function closeChat() {
  selectedChat.value = null
  agentMessage.value = ''
}

function sendMessage() {
  if (!agentMessage.value.trim()) return

  userData.addMessage(selectedChat.value.id, {
    sender: 'agent',
    text: agentMessage.value.trim(),
    agentId: auth.currentUser.id,
    agentName: auth.currentUser.name
  })

  agentMessage.value = ''
}

function resolveChat() {
  userData.closeSupportChat(selectedChat.value.id)
  selectedChat.value.status = 'resolved'
  resolvedToday.value++
  closeChat()
}

function transferChat() {
  // Mock transfer functionality
  alert('Chat transferred to another agent')
  closeChat()
}

function startNewChat() {
  alert('New chat functionality would open here')
}

function viewKnowledgeBase() {
  alert('Knowledge base would open here')
}

function viewReports() {
  alert('Reports dashboard would open here')
}

function updateStatus() {
  alert('Agent settings would open here')
}

function logout() {
  auth.logout()
  router.push('/support/login')
}

function viewCustomer(u) {
  openEntityModal(u, 'customer')
}

function viewMerchant(m) {
  openEntityModal(m, 'merchant')
}

function viewRider(r) {
  openEntityModal(r, 'rider')
}

function refreshData() {
  // placeholder: could re-load persisted stores or fetch remote data
  partner.loadPartnerData && typeof partner.loadPartnerData === 'function' && partner.loadPartnerData()
}

// Rating state
const agentRating = ref(0)
const customerRating = ref(0)
const ratingSubmitted = ref(false)

function submitRating() {
  if (!selectedChat.value) return
  
  // Store ratings in localStorage for persistence
  const chatRatings = JSON.parse(localStorage.getItem('crave_chat_ratings') || '{}')
  chatRatings[selectedChat.value.id] = {
    agentRating: agentRating.value,
    customerRating: customerRating.value,
    timestamp: new Date().toISOString()
  }
  localStorage.setItem('crave_chat_ratings', JSON.stringify(chatRatings))
  
  ratingSubmitted.value = true
  setTimeout(() => {
    closeChat()
    ratingSubmitted.value = false
  }, 1500)
}

function getRatingStars(rating, maxStars = 5) {
  return '★'.repeat(rating) + '☆'.repeat(maxStars - rating)
}

function getAverageRating(entityId, ratingType = 'agentRating') {
  const chatRatings = JSON.parse(localStorage.getItem('crave_chat_ratings') || '{}')
  const ratings = Object.values(chatRatings)
    .filter(r => ratingType === 'agentRating' || ratingType === 'customerRating')
    .map(r => r[ratingType] || 0)
  
  if (ratings.length === 0) return 0
  return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
}

function getEntityAverageRating(entityId, entityType) {
  const entityRatings = JSON.parse(localStorage.getItem('crave_entity_ratings') || '{}')
  const key = `${entityType}_${entityId}`
  const data = entityRatings[key]
  
  if (!data || !data.ratings || data.ratings.length === 0) return 0
  
  const avg = data.ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / data.ratings.length
  return avg.toFixed(1)
}

function openKycApplication(app) {
  selectedKycApplication.value = app
  kycFeedback.value = ''
  kycAction.value = ''
}

function closeKycApplication() {
  selectedKycApplication.value = null
  kycFeedback.value = ''
  kycAction.value = ''
}

function submitKycDecision(decision) {
  if (!selectedKycApplication.value || !kycFeedback.value.trim()) {
    alert('Please provide feedback before submitting')
    return
  }

  const app = selectedKycApplication.value
  const updatedApp = {
    ...app,
    status: decision,
    agentId: auth.currentUser.id,
    agentName: auth.currentUser.name,
    feedback: kycFeedback.value.trim(),
    reviewedAt: new Date().toISOString()
  }

  // Update application in partner store
  const idx = partner.applications.findIndex(a => a.id === app.id)
  if (idx !== -1) {
    partner.applications[idx] = updatedApp
    partner._persist()
  }

  alert(`Application ${decision}. Feedback saved.`)
  closeKycApplication()
}

onMounted(() => {
  // Check if user is authenticated as support agent
  if (!auth.isAuthenticated || auth.currentUser?.role !== 'support_agent') {
    router.push('/support/login')
  }
})

// Detail modal template is rendered below the chat modal
</script>

<!-- Entity Detail Modal -->
<template v-if="selectedEntityModal" #entity-modal>
  <div class="modal-overlay" @click="closeEntityModal">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h3>{{ selectedEntityType === 'customer' ? 'Customer' : selectedEntityType === 'merchant' ? 'Merchant' : 'Rider' }} Details</h3>
        <button @click="closeEntityModal" class="close-btn">×</button>
      </div>
      <div style="padding:20px">
        <div style="font-weight:900;font-size:16px">{{ selectedEntityModal.name || selectedEntityModal.fullName || selectedEntityModal.email || ('ID: ' + (selectedEntityModal.id || '')) }}</div>
        <div style="color:var(--crave-muted);margin-top:8px">{{ selectedEntityModal.email || selectedEntityModal.phone || '' }}</div>
        <div style="margin-top:12px">{{ selectedEntityModal.address || selectedEntityModal.description || '' }}</div>
        <pre v-if="selectedEntityModal.meta" style="background:#f8f8f8;padding:8px;margin-top:12px;border-radius:8px">{{ selectedEntityModal.meta }}</pre>
        
        <!-- Rating Section -->
        <div style="margin-top:20px;padding-top:20px;border-top:1px solid var(--crave-border)">
          <div style="font-weight:900;margin-bottom:12px">Rate this {{ selectedEntityType }}:</div>
          <div style="display:flex;gap:8px;font-size:24px;cursor:pointer;margin-bottom:8px">
            <span v-for="n in 5" :key="n" @click="selectedEntityModal.userRating = n" :style="{opacity: (selectedEntityModal.userRating || 0) >= n ? 1 : 0.3, transition: 'opacity 0.2s'}">★</span>
          </div>
          <button class="btn-primary" @click="saveEntityRating" :disabled="!selectedEntityModal.userRating">Save Rating</button>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- Full List Drawer/Modal -->
<template v-if="showFullList">
  <div class="modal-overlay" @click="closeFullList">
    <div class="modal" style="max-width:900px" @click.stop>
      <div class="modal-header">
        <h3>{{ fullListType === 'customers' ? 'Customers' : fullListType === 'merchants' ? 'Merchants' : fullListType === 'riders' ? 'Riders' : 'KYC Applications' }}</h3>
        <button @click="closeFullList" class="close-btn">×</button>
      </div>
      <div style="padding:16px">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
          <input v-model="listSearch" placeholder="Search..." class="input" style="flex:1" />
          <select v-model.number="pageSize" style="width:100px">
            <option :value="5">5</option>
            <option :value="8">8</option>
            <option :value="12">12</option>
          </select>
        </div>

        <div v-if="fullListType === 'customers'">
          <div v-for="u in paginated(filteredCustomers)" :key="u.id" style="padding:8px;border-bottom:1px solid var(--crave-border);display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:900">{{ displayName(u) }}</div>
              <div style="color:var(--crave-muted);font-size:13px">{{ u.email || u.phone || '' }}</div>
              <div style="color:var(--crave-muted);font-size:12px;margin-top:4px">Rating: {{ getEntityAverageRating(u.id, 'customer') }} ★</div>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn-secondary" @click="openEntityModal(u,'customer')">View</button>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px">
            <div>Page {{ listPage }} / {{ totalPagesFor(filteredCustomers.length) }}</div>
            <div style="display:flex;gap:8px"><button class="btn-secondary" @click="changePage(-1, filteredCustomers.length)">Prev</button><button class="btn-primary" @click="changePage(1, filteredCustomers.length)">Next</button></div>
          </div>
        </div>

        <div v-if="fullListType === 'merchants'">
          <div v-for="m in paginated(filteredMerchants)" :key="m.id" style="padding:8px;border-bottom:1px solid var(--crave-border);display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:900">{{ m.name || m.title || ('Store ' + (m.id || '').slice(-4)) }}</div>
              <div style="color:var(--crave-muted);font-size:13px">{{ m.email || m.phone || '' }}</div>
              <div style="color:var(--crave-muted);font-size:12px;margin-top:4px">Rating: {{ getEntityAverageRating(m.id, 'merchant') }} ★</div>
            </div>
            <div style="display:flex;gap:8px"><button class="btn-secondary" @click="openEntityModal(m,'merchant')">View</button></div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px">
            <div>Page {{ listPage }} / {{ totalPagesFor(filteredMerchants.length) }}</div>
            <div style="display:flex;gap:8px"><button class="btn-secondary" @click="changePage(-1, filteredMerchants.length)">Prev</button><button class="btn-primary" @click="changePage(1, filteredMerchants.length)">Next</button></div>
          </div>
        </div>

        <div v-if="fullListType === 'riders'">
          <div v-for="r in paginated(filteredRiders)" :key="r.id" style="padding:8px;border-bottom:1px solid var(--crave-border);display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:900">{{ r.name || r.fullName || ('Rider ' + (r.id || '').slice(-4)) }}</div>
              <div style="color:var(--crave-muted);font-size:13px">{{ r.phone || r.email || '' }}</div>
              <div style="color:var(--crave-muted);font-size:12px;margin-top:4px">Rating: {{ getEntityAverageRating(r.id, 'rider') }} ★</div>
            </div>
            <div style="display:flex;gap:8px"><button class="btn-secondary" @click="openEntityModal(r,'rider')">View</button></div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px">
            <div>Page {{ listPage }} / {{ totalPagesFor(filteredRiders.length) }}</div>
            <div style="display:flex;gap:8px"><button class="btn-secondary" @click="changePage(-1, filteredRiders.length)">Prev</button><button class="btn-primary" @click="changePage(1, filteredRiders.length)">Next</button></div>
          </div>
        </div>

        <div v-if="fullListType === 'kyc'">
          <div v-for="app in paginated(filteredKycApplications)" :key="app.id" style="padding:12px;border-bottom:1px solid var(--crave-border);display:flex;justify-content:space-between;align-items:start">
            <div style="flex:1">
              <div style="font-weight:900">{{ app.storeName }}</div>
              <div style="color:var(--crave-muted);font-size:13px">Owner: {{ app.ownerName }} • {{ app.ownerEmail }}</div>
              <div style="color:var(--crave-muted);font-size:13px">Category: {{ app.storeCategory }} • {{ app.storeAddress }}</div>
              <div style="margin-top:6px">
                <span :style="{ background: app.status === 'Approved' ? '#d4edda' : app.status === 'Rejected' ? '#f8d7da' : '#fff3cd', color: app.status === 'Approved' ? '#155724' : app.status === 'Rejected' ? '#721c24' : '#856404', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '900' }">
                  {{ app.status }}
                </span>
              </div>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn-primary" @click="openKycApplication(app)" :disabled="app.status !== 'Pending'">Review</button>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px">
            <div>Page {{ listPage }} / {{ totalPagesFor(filteredKycApplications.length) }}</div>
            <div style="display:flex;gap:8px"><button class="btn-secondary" @click="changePage(-1, filteredKycApplications.length)">Prev</button><button class="btn-primary" @click="changePage(1, filteredKycApplications.length)">Next</button></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap{ display:flex; flex-direction: column; gap: 20px; padding: 16px; }

.top{
  display:flex;
  justify-content: space-between;
  align-items:center;
  padding: 16px 0;
}
.top-title{ font-size: 24px; font-weight: 900; }
.icon-btn{
  width: 40px; height: 40px;
  border-radius: 12px;
  border: 1px solid var(--crave-border);
  background:#fff;
  font-weight: 900;
  cursor: pointer;
}

.stats-grid{
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.stat-card{
  background: #fff;
  border: 1px solid var(--crave-border);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
}
.stat-icon{ font-size: 24px; margin-bottom: 8px; }
.stat-number{ font-size: 28px; font-weight: 900; margin-bottom: 4px; }
.stat-label{ color: var(--crave-muted); font-weight: 700; font-size: 12px; }

.section{ margin-bottom: 24px; }
.section-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-header h2{
  font-size: 20px;
  font-weight: 900;
  margin: 0;
}
.status-indicator{
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
}
.status-dot{
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
}
.status-dot.online{ background: #22c55e; }

.chats-list{ display: flex; flex-direction: column; gap: 12px; }
.chat-card{
  border: 1px solid var(--crave-border);
  border-radius: 12px;
  padding: 16px;
  background: #fff;
  cursor: pointer;
  transition: all 0.1s ease;
}
.chat-card:hover{ border-color: var(--crave-blue); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

.chat-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.chat-user{ font-weight: 900; font-size: 16px; }
.chat-time{ color: var(--crave-muted); font-size: 12px; }

.chat-preview{ color: var(--crave-muted); margin-bottom: 8px; }

.chat-meta{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.priority{
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
}
.priority.low{ background: #e3f2fd; color: #1565c0; }
.priority.medium{ background: #fff3cd; color: #856404; }
.priority.high{ background: #f8d7da; color: #721c24; }
.priority.urgent{ background: #f8d7da; color: #721c24; }

.unread{
  background: var(--crave-blue);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 900;
}

.actions-grid{
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.action-btn{
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: #fff;
  border: 1px solid var(--crave-border);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.1s ease;
}
.action-btn:hover{ border-color: var(--crave-blue); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.action-icon{ font-size: 24px; }
.action-label{ font-weight: 700; font-size: 14px; }

.empty-state{
  text-align: center;
  padding: 40px 20px;
}
.empty-icon{ font-size: 48px; margin-bottom: 16px; }
.empty-title{ font-size: 18px; font-weight: 900; margin-bottom: 8px; }
.empty-subtitle{ color: var(--crave-muted); font-size: 14px; }

/* Modal Styles */
.modal-overlay{
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.modal{
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}
.modal-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--crave-border);
}
.modal-header h3{ margin: 0; font-size: 18px; font-weight: 900; }
.close-btn{
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--crave-muted);
}

.chat-info{ padding: 20px; border-bottom: 1px solid var(--crave-border); }
.info-row{
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}
.priority-badge{
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}
.priority-badge.low{ background: #e3f2fd; color: #1565c0; }
.priority-badge.medium{ background: #fff3cd; color: #856404; }
.priority-badge.high{ background: #f8d7da; color: #721c24; }

.chat-messages{
  padding: 20px;
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.message{
  padding: 12px 16px;
  border-radius: 16px;
  max-width: 70%;
}
.message.user{
  align-self: flex-start;
  background: #f0f0f0;
  color: var(--crave-text);
  border: 1px solid var(--crave-border);
}
.message.agent{
  align-self: flex-end;
  background: var(--crave-blue);
  color: white;
}
.message-text{ font-size: 14px; line-height: 1.4; }
.message-time{
  font-size: 10px;
  opacity: 0.7;
  margin-top: 4px;
}

.chat-input{
  padding: 20px;
  border-top: 1px solid var(--crave-border);
  display: flex;
  gap: 12px;
}
.message-input{ flex: 1; }
.send-btn{
  padding: 12px 16px;
  background: var(--crave-blue);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 900;
  cursor: pointer;
}
.send-btn:disabled{ opacity: 0.6; cursor: not-allowed; }

.chat-actions{
  padding: 20px;
  border-top: 1px solid var(--crave-border);
  display: flex;
  gap: 12px;
}

.btn-primary{
  flex: 1;
  padding: 12px 16px;
  background: var(--crave-blue);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 900;
  cursor: pointer;
}
.btn-secondary{
  flex: 1;
  padding: 12px 16px;
  background: #f5f5f5;
  color: var(--crave-text);
  border: 1px solid var(--crave-border);
  border-radius: 12px;
  font-weight: 900;
  cursor: pointer;
}
</style>

<!-- KYC Review Modal -->
<template v-if="selectedKycApplication">
  <div class="modal-overlay" @click="closeKycApplication">
    <div class="modal" style="max-width:700px" @click.stop>
      <div class="modal-header">
        <h3>KYC Application Review</h3>
        <button @click="closeKycApplication" class="close-btn">×</button>
      </div>
      <div style="padding:20px">
        <!-- Store Details -->
        <div style="background:#f8f8f8;padding:16px;border-radius:8px;margin-bottom:20px">
          <div style="font-weight:900;font-size:16px;margin-bottom:8px">{{ selectedKycApplication.storeName }}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;color:var(--crave-muted)">
            <div><strong>Owner:</strong> {{ selectedKycApplication.ownerName }}</div>
            <div><strong>Email:</strong> {{ selectedKycApplication.ownerEmail }}</div>
            <div><strong>Phone:</strong> {{ selectedKycApplication.ownerPhone }}</div>
            <div><strong>Category:</strong> {{ selectedKycApplication.storeCategory }}</div>
            <div><strong>Address:</strong> {{ selectedKycApplication.storeAddress }}</div>
            <div><strong>Store Phone:</strong> {{ selectedKycApplication.storePhone }}</div>
            <div><strong>Applied:</strong> {{ new Date(selectedKycApplication.createdAt).toLocaleDateString() }}</div>
            <div><strong>Status:</strong> <span style="background:#fff3cd;padding:2px 6px;border-radius:4px;color:#856404;font-weight:900">{{ selectedKycApplication.status }}</span></div>
          </div>
        </div>

        <!-- Feedback Section -->
        <div style="margin-bottom:20px">
          <label style="display:block;font-weight:900;margin-bottom:8px">Review Feedback:</label>
          <textarea v-model="kycFeedback" placeholder="Enter your review feedback, findings, or required changes..." style="width:100%;min-height:100px;padding:8px;border:1px solid var(--crave-border);border-radius:8px;font-family:inherit" />
        </div>

        <!-- Actions -->
        <div style="display:flex;gap:8px">
          <button @click="submitKycDecision('Approved')" style="flex:1;padding:12px;background:#d4edda;color:#155724;border:none;border-radius:8px;font-weight:900;cursor:pointer">✓ Approve</button>
          <button @click="submitKycDecision('Pending')" style="flex:1;padding:12px;background:#fff3cd;color:#856404;border:none;border-radius:8px;font-weight:900;cursor:pointer">⏳ Mark Pending</button>
          <button @click="submitKycDecision('Rejected')" style="flex:1;padding:12px;background:#f8d7da;color:#721c24;border:none;border-radius:8px;font-weight:900;cursor:pointer">✗ Reject</button>
        </div>
      </div>
    </div>
  </div>
</template>