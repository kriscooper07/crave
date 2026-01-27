<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <div class="header-content">
        <h1>Support Dashboard</h1>
        <p>Manage customer support, orders, and violations</p>
      </div>
      <button @click="router.back()" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
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

    <!-- Order Lookup Tab -->
    <div v-if="activeTab === 'orders'" class="tab-content">
      <div class="section-header">
        <h2>Order Lookup</h2>
      </div>

      <div class="order-lookup">
        <div class="lookup-form">
          <input
            v-model="orderSearch"
            @keyup.enter="lookupOrder"
            placeholder="Enter Order ID (e.g., ORD_001)"
            class="input"
          />
          <button @click="lookupOrder" class="btn-primary">Search</button>
        </div>

        <div v-if="searchedOrder" class="order-details">
          <div class="order-card">
            <div class="order-header">
              <h3>{{ searchedOrder.id }}</h3>
              <div class="order-status" :class="searchedOrder.status">
                {{ searchedOrder.status }}
              </div>
            </div>

            <div class="order-info">
              <div class="info-row">
                <span class="label">Customer:</span>
                <span class="value">{{ searchedOrder.customerName }}</span>
              </div>
              <div class="info-row">
                <span class="label">Phone:</span>
                <span class="value">{{ searchedOrder.customerPhone }}</span>
              </div>
              <div class="info-row">
                <span class="label">Store:</span>
                <span class="value">{{ getStoreName(searchedOrder.storeId) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Total:</span>
                <span class="value">₱{{ searchedOrder.total }}</span>
              </div>
              <div class="info-row">
                <span class="label">Date:</span>
                <span class="value">{{ formatDateTime(searchedOrder.createdAt) }}</span>
              </div>
            </div>

            <div class="order-items">
              <h4>Items</h4>
              <div
                v-for="item in searchedOrder.items"
                :key="item.id"
                class="order-item"
              >
                <span>{{ item.name }} x{{ item.quantity }}</span>
                <span>₱{{ item.price * item.quantity }}</span>
              </div>
            </div>

            <div class="order-actions">
              <button @click="viewOrderChat(searchedOrder.id)" class="btn-primary">
                View Related Chats
              </button>
              <button @click="reportViolation(searchedOrder)" class="btn-danger">
                Report Violation
              </button>
            </div>
          </div>
        </div>

        <div v-else-if="orderSearch && !searchedOrder" class="empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-title">Order not found</div>
          <div class="empty-subtitle">Check the Order ID and try again</div>
        </div>
      </div>
    </div>

    <!-- Violations Tab -->
    <div v-if="activeTab === 'violations'" class="tab-content">
      <div class="section-header">
        <h2>Violations & Suspensions</h2>
        <button @click="showReportModal = true" class="btn-primary">
          Report New Violation
        </button>
      </div>

      <div class="violations-list">
        <div v-if="violations.length === 0" class="empty-state">
          <div class="empty-icon">⚖️</div>
          <div class="empty-title">No violations reported</div>
        </div>

        <div v-else>
          <div
            v-for="violation in violations"
            :key="violation.id"
            class="violation-card"
          >
            <div class="violation-header">
              <div class="violation-type">{{ violation.type }}</div>
              <div class="violation-status" :class="violation.status">
                {{ violation.status }}
              </div>
            </div>

            <div class="violation-details">
              <div class="detail-row">
                <span class="label">Reported by:</span>
                <span class="value">{{ violation.reportedBy }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Target:</span>
                <span class="value">{{ violation.targetName }} ({{ violation.targetType }})</span>
              </div>
              <div class="detail-row">
                <span class="label">Reason:</span>
                <span class="value">{{ violation.reason }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">{{ formatDateTime(violation.createdAt) }}</span>
              </div>
            </div>

            <div class="violation-actions">
              <button
                v-if="violation.status === 'pending'"
                @click="suspendEntity(violation)"
                class="btn-danger"
              >
                Suspend {{ violation.targetType }}
              </button>
              <button
                v-if="violation.status === 'pending'"
                @click="dismissViolation(violation.id)"
                class="btn-secondary"
              >
                Dismiss
              </button>
              <button @click="viewViolationChat(violation)" class="btn-primary">
                View Chat
              </button>
            </div>
          </div>
        </div>
      </div>
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

    <!-- Report Violation Modal -->
    <div v-if="showReportModal" class="modal-overlay" @click="showReportModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Report Violation</h3>
          <button @click="showReportModal = false" class="close-btn">×</button>
        </div>

        <form @submit.prevent="submitViolationReport">
          <div class="form-group">
            <label>Violation Type</label>
            <select v-model="violationForm.type" class="input" required>
              <option value="">Select type</option>
              <option value="Late Delivery">Late Delivery</option>
              <option value="Wrong Order">Wrong Order</option>
              <option value="Poor Food Quality">Poor Food Quality</option>
              <option value="Rude Behavior">Rude Behavior</option>
              <option value="Payment Issues">Payment Issues</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label>Target Type</label>
            <select v-model="violationForm.targetType" class="input" required>
              <option value="">Select target</option>
              <option value="store">Store</option>
              <option value="rider">Delivery Rider</option>
            </select>
          </div>

          <div class="form-group">
            <label>Target Name/ID</label>
            <input v-model="violationForm.targetName" class="input" required />
          </div>

          <div class="form-group">
            <label>Related Order (optional)</label>
            <input v-model="violationForm.orderId" class="input" placeholder="ORD_001" />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea
              v-model="violationForm.description"
              class="input"
              rows="4"
              required
            ></textarea>
          </div>

          <button type="submit" class="btn-primary full">
            Submit Report
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserDataStore } from '../stores/userData'
import { useAuthStore } from '../stores/auth'
import { usePartnerStore } from '../stores/partner'

const router = useRouter()
const userData = useUserDataStore()
const auth = useAuthStore()
const partner = usePartnerStore()

const activeTab = ref('chats')
const selectedChat = ref(null)
const adminMessage = ref('')
const orderSearch = ref('')
const searchedOrder = ref(null)
const showReportModal = ref(false)

const tabs = [
  { id: 'chats', name: 'Support Chats' },
  { id: 'orders', name: 'Order Lookup' },
  { id: 'violations', name: 'Violations' }
]

const violationForm = reactive({
  type: '',
  targetType: '',
  targetName: '',
  orderId: '',
  description: ''
})

const violations = computed(() => userData.violations)

const mockOrders = ref([
  {
    id: 'ORD_001',
    customerName: 'Maria Santos',
    customerPhone: '09171234567',
    storeId: 'store_001',
    items: [
      { id: '1', name: 'Classic Burger', quantity: 2, price: 129 },
      { id: '2', name: 'French Fries', quantity: 1, price: 59 }
    ],
    total: 317,
    status: 'delivered',
    createdAt: new Date().toISOString()
  }
])

const allSupportChats = computed(() => {
  // In a real app, this would fetch from all users
  return userData.supportChats || []
})

const totalChats = computed(() => allSupportChats.value.length)
const activeChats = computed(() =>
  allSupportChats.value.filter(chat => chat.status === 'active').length
)

function getUserName(userId) {
  // Mock user lookup - in real app, this would query user database
  const mockUsers = {
    'user_001': 'Maria Santos',
    'user_002': 'Juan Dela Cruz',
    'user_003': 'Ana Reyes'
  }
  return mockUsers[userId] || `User ${userId.slice(-4)}`
}

function getStoreName(storeId) {
  const store = partner.stores.find(s => s.id === storeId)
  return store?.name || 'Unknown Store'
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

function lookupOrder() {
  if (!orderSearch.value.trim()) return

  searchedOrder.value = mockOrders.value.find(order =>
    order.id.toLowerCase() === orderSearch.value.toLowerCase()
  )
}

function viewOrderChat(orderId) {
  // Find chats related to this order
  const relatedChat = allSupportChats.value.find(chat =>
    chat.messages.some(msg => msg.text.includes(orderId))
  )

  if (relatedChat) {
    openChat(relatedChat)
  } else {
    alert('No related chats found for this order')
  }
}

function reportViolation(order) {
  violationForm.orderId = order.id
  violationForm.targetName = order.storeId // Could be store or rider
  showReportModal.value = true
}

function submitViolationReport() {
  userData.reportViolation({
    type: violationForm.type,
    targetType: violationForm.targetType,
    targetName: violationForm.targetName,
    reason: violationForm.type,
    description: violationForm.description,
    reportedBy: 'Support Admin',
    orderId: violationForm.orderId
  })

  // Reset form
  Object.assign(violationForm, {
    type: '',
    targetType: '',
    targetName: '',
    orderId: '',
    description: ''
  })

  showReportModal.value = false
}

function suspendEntity(violation) {
  if (confirm(`Are you sure you want to suspend this ${violation.targetType}?`)) {
    userData.suspendEntity(violation.id)

    // In a real app, this would call an API to suspend the store/rider
    if (violation.targetType === 'store') {
      // Suspend store
      const store = partner.stores.find(s => s.name === violation.targetName)
      if (store) {
        partner.setStoreStatus(store.id, 'Suspended')
      }
    }

    alert(`${violation.targetType} has been suspended`)
  }
}

function dismissViolation(violationId) {
  userData.dismissViolation(violationId)
}

function viewViolationChat(violation) {
  // Find chat related to this violation
  const relatedChat = allSupportChats.value.find(chat =>
    chat.messages.some(msg =>
      msg.text.includes(violation.orderId) ||
      msg.text.toLowerCase().includes(violation.reason.toLowerCase())
    )
  )

  if (relatedChat) {
    openChat(relatedChat)
  } else {
    alert('No related chats found for this violation')
  }
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
  align-items: flex-start;
  padding: 16px 0;
}

.header-content h1 {
  font-size: 24px;
  font-weight: 900;
  margin: 0 0 4px 0;
}

.header-content p {
  margin: 0;
  color: var(--crave-muted);
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--crave-border);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.back-btn:active {
  transform: scale(0.95);
}

.nav-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--crave-border);
  padding-bottom: 16px;
}

.tab-btn {
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.1s ease;
}

.tab-btn.active {
  background: var(--crave-blue);
  color: white;
}

.tab-btn:hover:not(.active) {
  background: var(--crave-blue-1);
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 900;
  margin: 0;
}

.stats {
  display: flex;
  gap: 12px;
}

.stat {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 900;
  background: var(--crave-blue-1);
  color: var(--crave-blue);
}

.stat.active {
  background: #e8f5e8;
  color: #2e7d32;
}

.chats-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-card {
  border: 1px solid var(--crave-border);
  border-radius: 12px;
  padding: 16px;
  background: #fff;
  cursor: pointer;
  transition: all 0.1s ease;
}

.chat-card:hover {
  border-color: var(--crave-blue);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.chat-id {
  font-weight: 900;
  font-size: 14px;
}

.chat-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
}

.chat-status.active {
  background: #e8f5e8;
  color: #2e7d32;
}

.chat-status.resolved {
  background: #e3f2fd;
  color: #1565c0;
}

.chat-status.closed {
  background: #fafafa;
  color: var(--crave-muted);
}

.chat-user {
  font-weight: 700;
  margin-bottom: 4px;
}

.chat-last-message {
  color: var(--crave-muted);
  font-size: 14px;
  margin-bottom: 8px;
}

.chat-time {
  font-size: 12px;
  color: var(--crave-muted);
}

.order-lookup {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.lookup-form {
  display: flex;
  gap: 12px;
}

.lookup-form .input {
  flex: 1;
}

.order-details {
  margin-top: 16px;
}

.order-card {
  border: 1px solid var(--crave-border);
  border-radius: 12px;
  padding: 20px;
  background: #fff;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.order-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
}

.order-status {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.order-status.delivered {
  background: #e8f5e8;
  color: #2e7d32;
}

.order-info {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--crave-border);
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 700;
  color: var(--crave-muted);
}

.value {
  font-weight: 900;
}

.order-items {
  margin-bottom: 16px;
}

.order-items h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 900;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--crave-border);
}

.order-item:last-child {
  border-bottom: none;
}

.order-actions {
  display: flex;
  gap: 12px;
}

.violations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.violation-card {
  border: 1px solid var(--crave-border);
  border-radius: 12px;
  padding: 16px;
  background: #fff;
}

.violation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.violation-type {
  font-weight: 900;
  font-size: 16px;
}

.violation-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
}

.violation-status.pending {
  background: #fff3cd;
  color: #856404;
}

.violation-status.suspended {
  background: #f8d7da;
  color: #721c24;
}

.violation-status.dismissed {
  background: #d1ecf1;
  color: #0c5460;
}

.violation-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
}

.detail-row .label {
  font-weight: 700;
  color: var(--crave-muted);
  font-size: 14px;
}

.detail-row .value {
  font-weight: 800;
  font-size: 14px;
}

.violation-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--crave-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--crave-muted);
}

.chat-info {
  padding: 20px;
  border-bottom: 1px solid var(--crave-border);
}

.chat-messages {
  padding: 20px;
  max-height: 300px;
  overflow-y: auto;
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
  padding: 20px;
  border-top: 1px solid var(--crave-border);
  display: flex;
  gap: 12px;
}

.send-btn {
  padding: 12px 16px;
  background: var(--crave-blue);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 900;
  cursor: pointer;
}

.chat-actions {
  padding: 20px;
  border-top: 1px solid var(--crave-border);
  display: flex;
  gap: 12px;
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
  font-weight: 900;
  margin-bottom: 8px;
}

.empty-subtitle {
  color: var(--crave-muted);
  font-size: 14px;
}

.input {
  padding: 12px 16px;
  border: 1px solid var(--crave-border);
  border-radius: 12px;
  font-size: 16px;
  width: 100%;
}

.btn-primary {
  padding: 12px 16px;
  background: var(--crave-blue);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 900;
  cursor: pointer;
}

.btn-secondary {
  padding: 12px 16px;
  background: #f5f5f5;
  color: var(--crave-text);
  border: 1px solid var(--crave-border);
  border-radius: 12px;
  font-weight: 900;
  cursor: pointer;
}

.btn-danger {
  padding: 12px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 900;
  cursor: pointer;
}

.full {
  width: 100%;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 700;
  margin-bottom: 8px;
}
</style>