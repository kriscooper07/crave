<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <div class="header-content">
        <h1>Support Dashboard</h1>
        <p>Manage customer support, orders, and violations</p>
      </div>
      <button @click="logout" class="back-btn">
        Logout
      </button>
    </div>

    <!-- Navigation Tabs -->
    <div class="nav-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="{ active: activeTab === tab.id }"
        class="tab-btn"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- Dashboard Tab -->
    <div v-if="activeTab === 'dashboard'" class="tab-content">
      <div class="dashboard-grid">
        <!-- Stats Cards -->
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-number">{{ totalUsers }}</div>
          <div class="stat-label">Total Users</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏪</div>
          <div class="stat-number">{{ partner?.activeStores?.length || 0 }}</div>
          <div class="stat-label">Active Stores</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏍️</div>
          <div class="stat-number">{{ partner?.activeRiders?.length || 0 }}</div>
          <div class="stat-label">Active Riders</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-number">{{ totalOrders }}</div>
          <div class="stat-label">Total Orders</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💬</div>
          <div class="stat-number">{{ activeChats }}</div>
          <div class="stat-label">Active Chats</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🚨</div>
          <div class="stat-number">{{ violations.length }}</div>
          <div class="stat-label">Violations</div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section">
        <h3>Recent Activity</h3>
        <div class="activity-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="activity-icon">{{ activity.icon }}</div>
            <div class="activity-content">
              <div class="activity-text">{{ activity.text }}</div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Support Chats Tab -->
    <div v-if="activeTab === 'chats'" class="tab-content">
      <div class="section-header">
        <h2>All Support Chats</h2>
        <div class="stats">
          <span class="stat">{{ totalChats }} total</span>
          <span class="stat active">{{ activeChats }} active</span>
        </div>
      </div>

      <div v-if="allSupportChats.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <div class="empty-title">No support chats yet</div>
      </div>

      <div v-else class="chats-list">
        <div
          v-for="chat in allSupportChats"
          :key="chat.id"
          class="chat-card"
          @click="openChat(chat)"
        >
          <div class="chat-header">
            <div class="chat-id">Chat #{{ chat.id.slice(-6) }}</div>
            <div class="chat-status" :class="chat.status">
              {{ chat.status }}
            </div>
          </div>
          <div class="chat-user">
            User: {{ getUserName(chat.userId) }}
          </div>
          <div class="chat-last-message">
            {{ getLastMessage(chat) }}
          </div>
          <div class="chat-time">
            {{ formatDateTime(chat.createdAt) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Placeholder for other tabs -->
    <div v-if="activeTab === 'riders'" class="tab-content">
      <h2>Rider Communications</h2>
      <p>Coming soon...</p>
    </div>

    <div v-if="activeTab === 'orders'" class="tab-content">
      <h2>Order Lookup</h2>
      <p>Coming soon...</p>
    </div>

    <div v-if="activeTab === 'violations'" class="tab-content">
      <h2>Violations & Reports</h2>
      <p>Coming soon...</p>
    </div>

    <!-- Chat Modal -->
    <div v-if="selectedChat" class="modal-overlay" @click="closeChat">
      <div class="modal chat-modal" @click.stop>
        <div class="modal-header">
          <h3>Support Chat #{{ selectedChat.id.slice(-6) }}</h3>
          <button @click="closeChat" class="close-btn">×</button>
        </div>

        <div class="chat-info">
          <div class="info-row">
            <span class="label">User:</span>
            <span class="value">{{ getUserName(selectedChat.userId) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="value">{{ selectedChat.status }}</span>
          </div>
          <div class="info-row">
            <span class="label">Created:</span>
            <span class="value">{{ formatDateTime(selectedChat.createdAt) }}</span>
          </div>
        </div>

        <div class="chat-messages">
          <div
            v-for="msg in selectedChat.messages"
            :key="msg.id"
            class="message"
            :class="{ user: msg.sender === 'user', support: msg.sender === 'support' }"
          >
            <div class="message-text">{{ msg.text }}</div>
            <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>

        <div v-if="selectedChat.status === 'active'" class="chat-input">
          <input
            v-model="adminMessage"
            @keyup.enter="sendAdminMessage"
            placeholder="Type your response..."
            class="input"
          />
          <button @click="sendAdminMessage" class="send-btn">Send</button>
        </div>

        <div class="chat-actions">
          <button
            v-if="selectedChat.status === 'active'"
            @click="resolveChat(selectedChat.id)"
            class="btn-secondary"
          >
            Mark as Resolved
          </button>
          <button @click="closeChat" class="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserDataStore } from '../stores/userData'
import { useAuthStore } from '../stores/auth'
import { usePartnerStore } from '../stores/partner'

const router = useRouter()
const userData = useUserDataStore()
const auth = useAuthStore()
const partner = usePartnerStore()

const activeTab = ref('dashboard')
const selectedChat = ref(null)
const adminMessage = ref('')

const tabs = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'chats', name: 'Support Chats' },
  { id: 'riders', name: 'Rider Chats' },
  { id: 'orders', name: 'Order Lookup' },
  { id: 'violations', name: 'Violations' }
]

const violations = computed(() => userData.violations)

const allSupportChats = computed(() => userData.supportChats || [])

const totalChats = computed(() => allSupportChats.value.length)
const activeChats = computed(() =>
  allSupportChats.value.filter(chat => chat.status === 'active').length
)

const totalUsers = computed(() => 1250) // Mock data
const totalOrders = computed(() => 5432) // Mock data

const recentActivities = computed(() => [
  { id: 1, icon: '💬', text: 'New support chat from Maria Santos', time: '2 min ago' },
  { id: 2, icon: '📦', text: 'Order ORD_001 delivered successfully', time: '5 min ago' },
  { id: 3, icon: '🏍️', text: 'Rider Juan Dela Cruz started delivery', time: '10 min ago' },
  { id: 4, icon: '🚨', text: 'New violation reported for Store ABC', time: '15 min ago' },
  { id: 5, icon: '👥', text: 'New user Ana Reyes registered', time: '20 min ago' }
])

function getUserName(userId) {
  // Mock user lookup - in real app, this would query user database
  const mockUsers = {
    'user_001': 'Maria Santos',
    'user_002': 'Juan Dela Cruz',
    'user_003': 'Ana Reyes'
  }
  return mockUsers[userId] || `User ${userId.slice(-4)}`
}

function getLastMessage(chat) {
  const lastMsg = chat.messages[chat.messages.length - 1]
  return lastMsg ? lastMsg.text.slice(0, 50) + '...' : 'No messages'
}

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString()
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function openChat(chat) {
  selectedChat.value = chat
}

function closeChat() {
  selectedChat.value = null
  adminMessage.value = ''
}

function sendAdminMessage() {
  if (!adminMessage.value.trim()) return

  userData.addMessage(selectedChat.value.id, {
    sender: 'support',
    text: adminMessage.value.trim()
  })

  adminMessage.value = ''
}

function resolveChat(chatId) {
  userData.closeSupportChat(chatId)
  selectedChat.value.status = 'resolved'
}

function logout() {
  auth.logout()
  router.push('/support/login')
}

onMounted(() => {
  // Component initialized
})
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 900;
}

.header-content p {
  margin: 5px 0 0 0;
  color: var(--crave-muted);
}

.back-btn {
  padding: 10px 16px;
  background: var(--crave-blue);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.content {
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.content h2 {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 700;
}

.content p {
  margin: 8px 0;
  font-size: 16px;
}

.nav-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 12px 20px;
  background: #f5f5f5;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: var(--crave-blue);
  color: white;
}

.tab-content {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.stats {
  display: flex;
  gap: 12px;
}

.stat {
  font-size: 14px;
  color: var(--crave-muted);
}

.stat.active {
  color: var(--crave-blue);
  font-weight: 700;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.chats-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-card {
  padding: 16px;
  border: 1px solid var(--crave-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chat-card:hover {
  border-color: var(--crave-blue);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.chat-id {
  font-weight: 700;
  font-size: 16px;
}

.chat-status {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
}

.chat-status.active {
  background: #E8F5E8;
  color: #2E7D32;
}

.chat-status.resolved {
  background: #E3F2FD;
  color: #1565C0;
}

.chat-user, .chat-last-message {
  font-size: 14px;
  color: var(--crave-muted);
  margin-bottom: 4px;
}

.chat-time {
  font-size: 12px;
  color: var(--crave-muted);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.chat-modal {
  max-width: 600px;
  width: 95%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-info {
  margin-bottom: 20px;
}

.chat-messages {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  padding: 12px 16px;
  border-radius: 16px;
  max-width: 70%;
}

.message.user {
  align-self: flex-end;
  background: var(--crave-blue);
  color: white;
}

.message.support {
  align-self: flex-start;
  background: var(--crave-blue-1);
  color: var(--crave-text);
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
}

.message-time {
  font-size: 10px;
  opacity: 0.7;
  margin-top: 4px;
}

.chat-input {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.chat-input .input {
  flex: 1;
}

.send-btn {
  padding: 12px 16px;
  background: var(--crave-blue);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.chat-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-primary {
  padding: 12px 16px;
  background: var(--crave-blue);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.btn-secondary {
  padding: 12px 16px;
  background: #f5f5f5;
  color: var(--crave-text);
  border: 1px solid var(--crave-border);
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--crave-border);
  border-radius: 12px;
  font-size: 16px;
}

.input:focus {
  outline: none;
  border-color: var(--crave-blue);
}

/* Dashboard Styles */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.stat-number {
  font-size: 28px;
  font-weight: 900;
  color: var(--crave-blue);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--crave-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.activity-section h3 {
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 700;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.activity-icon {
  font-size: 16px;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 14px;
  margin-bottom: 2px;
}

.activity-time {
  font-size: 12px;
  color: var(--crave-muted);
}
</style>