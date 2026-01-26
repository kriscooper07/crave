<template>
  <div class="wrap">
    <div class="header">
      <div>
        <div class="title">Profile</div>
        <div class="sub">Your details for delivery</div>
      </div>
    </div>

    <div class="card hero">
      <div class="avatar-container">
        <div class="avatar" :style="{ backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none' }">
          <span v-if="!avatarUrl">{{ initials }}</span>
        </div>
        <button class="edit-photo" @click="triggerPhotoUpload">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </button>
        <input
          ref="photoInput"
          type="file"
          accept="image/*"
          @change="handlePhotoUpload"
          style="display: none"
        />
      </div>
      <div>
        <div class="name">{{ auth.currentUser?.name || 'Guest' }}</div>
        <div class="meta">{{ auth.currentUser?.phone || 'Not logged in' }}</div>
      </div>
    </div>

    <div class="card">
      <div class="label">Full Name</div>
      <input class="input" v-model="form.name" placeholder="Your name" />

      <div class="label" style="margin-top:12px;">Email Address</div>
      <input class="input" v-model="form.email" type="email" placeholder="your@email.com" />

      <div class="label" style="margin-top:12px;">Phone</div>
      <input class="input" v-model="form.phone" placeholder="09xx xxx xxxx" disabled />

      <button class="btn-primary full" @click="save">
        Save Profile
      </button>

      <div class="hint" v-if="saved">Profile saved ✅</div>
    </div>

    <div class="card">
      <div class="section-title">Account</div>
      <button class="danger full" @click="logout">
        Logout & Switch Account
      </button>
    </div>

    <!-- Payment Methods -->
    <div class="card">
      <div class="section-title">Payment Methods</div>

      <div v-if="userPaymentMethods.length === 0" class="empty-state">
        <div class="empty-icon">💳</div>
        <div class="empty-text">No payment methods added</div>
      </div>

      <div v-else class="payment-list">
        <div
          v-for="pm in userPaymentMethods"
          :key="pm.id"
          class="payment-item"
          :class="{ default: pm.isDefault }"
        >
          <div class="payment-info">
            <div class="payment-icon">{{ getPaymentIcon(pm.type) }}</div>
            <div>
              <div class="payment-label">{{ pm.label }}</div>
              <div class="payment-details">{{ pm.details }}</div>
            </div>
          </div>
          <div class="payment-actions">
            <button v-if="!pm.isDefault" @click="setDefaultPayment(pm.id)" class="action-btn">
              Set Default
            </button>
            <button @click="removePaymentMethod(pm.id)" class="action-btn remove">
              Remove
            </button>
          </div>
        </div>
      </div>

      <button class="btn-secondary full" @click="showAddPayment = true">
        Add Payment Method
      </button>
    </div>

    <!-- Add Payment Method Modal -->
    <div v-if="showAddPayment" class="modal-overlay" @click="showAddPayment = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Add Payment Method</h3>
          <button @click="showAddPayment = false" class="close-btn">×</button>
        </div>

        <div class="payment-types">
          <button
            v-for="type in paymentTypes"
            :key="type.id"
            class="payment-type-btn"
            @click="selectPaymentType(type)"
          >
            <span class="type-icon">{{ type.icon }}</span>
            <span class="type-name">{{ type.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Saved Addresses -->
    <div class="card">
      <div class="section-title">Saved Addresses</div>

      <div v-if="userAddresses.length === 0" class="empty-state">
        <div class="empty-icon">📍</div>
        <div class="empty-text">No saved addresses</div>
      </div>

      <div v-else class="address-list">
        <div
          v-for="addr in userAddresses"
          :key="addr.id"
          class="address-item"
          :class="{ default: addr.isDefault }"
        >
          <div class="address-info">
            <div class="address-label">{{ addr.label }}</div>
            <div class="address-text">
              {{ addr.street }}, {{ addr.barangay }}<br>
              {{ addr.city }}, {{ addr.province }} {{ addr.zipCode }}
            </div>
          </div>
          <div class="address-actions">
            <button v-if="!addr.isDefault" @click="setDefaultAddress(addr.id)" class="action-btn">
              Set Default
            </button>
            <button @click="editAddress(addr)" class="action-btn">Edit</button>
            <button @click="removeAddress(addr.id)" class="action-btn remove">
              Remove
            </button>
          </div>
        </div>
      </div>

      <button class="btn-secondary full" @click="showAddAddress = true">
        Add Address
      </button>
    </div>

    <!-- Add/Edit Address Modal -->
    <div v-if="showAddAddress || editingAddress" class="modal-overlay" @click="closeAddressModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingAddress ? 'Edit Address' : 'Add Address' }}</h3>
          <button @click="closeAddressModal" class="close-btn">×</button>
        </div>

        <form @submit.prevent="saveAddress">
          <div class="form-group">
            <label>Label (e.g., Home, Work)</label>
            <input v-model="addressForm.label" class="input" required />
          </div>

          <div class="form-group">
            <label>Street Address</label>
            <input v-model="addressForm.street" class="input" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Barangay</label>
              <input v-model="addressForm.barangay" class="input" required />
            </div>
            <div class="form-group">
              <label>City</label>
              <input v-model="addressForm.city" class="input" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Province</label>
              <input v-model="addressForm.province" class="input" required />
            </div>
            <div class="form-group">
              <label>ZIP Code</label>
              <input v-model="addressForm.zipCode" class="input" required />
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="addressForm.isDefault" />
              Set as default address
            </label>
          </div>

          <button type="submit" class="btn-primary full">
            {{ editingAddress ? 'Update Address' : 'Save Address' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Support -->
    <div class="card">
      <div class="section-title">Support</div>

      <div v-if="userSupportChats.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <div class="empty-text">No support chats yet</div>
      </div>

      <div v-else class="chat-list">
        <div
          v-for="chat in userSupportChats"
          :key="chat.id"
          class="chat-item"
          @click="openChat(chat)"
        >
          <div class="chat-info">
            <div class="chat-title">Support Chat #{{ chat.id.slice(-4) }}</div>
            <div class="chat-status" :class="chat.status">
              {{ chat.status }}
            </div>
          </div>
          <div class="chat-date">{{ formatDate(chat.createdAt) }}</div>
        </div>
      </div>

      <button class="btn-secondary full" @click="startNewChat">
        Start New Chat
      </button>
    </div>

    <!-- Support Chat Modal -->
    <div v-if="activeChat" class="modal-overlay" @click="closeChat">
      <div class="modal chat-modal" @click.stop>
        <div class="modal-header">
          <h3>Support Chat</h3>
          <button @click="closeChat" class="close-btn">×</button>
        </div>

        <div class="chat-messages">
          <div
            v-for="msg in activeChat.messages"
            :key="msg.id"
            class="message"
            :class="{ user: msg.sender === 'user', support: msg.sender === 'support' }"
          >
            <div class="message-text">{{ msg.text }}</div>
            <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>

        <div v-if="activeChat.status === 'active'" class="chat-input">
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            placeholder="Type your message..."
            class="input"
          />
          <button @click="sendMessage" class="send-btn">Send</button>
        </div>

        <div v-else class="chat-closed">
          This chat has been {{ activeChat.status }}.
        </div>
      </div>
    </div>

    <!-- Start New Chat Modal -->
    <div v-if="showNewChat" class="modal-overlay" @click="showNewChat = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Start Support Chat</h3>
          <button @click="showNewChat = false" class="close-btn">×</button>
        </div>

        <form @submit.prevent="createNewChat">
          <div class="form-group">
            <label>How can we help you?</label>
            <textarea
              v-model="newChatMessage"
              class="input"
              rows="4"
              placeholder="Describe your issue or question..."
              required
            ></textarea>
          </div>

          <button type="submit" class="btn-primary full">
            Start Chat
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUserDataStore } from '../stores/userData'

const router = useRouter()
const auth = useAuthStore()
const userData = useUserDataStore()

const saved = ref(false)
const photoInput = ref(null)
const showAddPayment = ref(false)
const showAddAddress = ref(false)
const editingAddress = ref(null)
const activeChat = ref(null)
const showNewChat = ref(false)
const newMessage = ref('')
const newChatMessage = ref('')

const form = reactive({
  name: auth.currentUser?.name || '',
  email: auth.currentUser?.email || '',
  phone: auth.currentUser?.phone || '',
})

const addressForm = reactive({
  label: '',
  street: '',
  barangay: '',
  city: '',
  province: '',
  zipCode: '',
  isDefault: false,
})

const paymentTypes = [
  { id: 'gcash', name: 'GCash', icon: '💰' },
  { id: 'paymaya', name: 'PayMaya', icon: '💳' },
  { id: 'paypal', name: 'PayPal', icon: '🌐' },
  { id: 'gotyme', name: 'GoTyme', icon: '🏦' },
  { id: 'debit', name: 'Debit Card', icon: '💳' },
  { id: 'credit', name: 'Credit Card', icon: '💳' },
]

const userId = computed(() => auth.currentUser?.id)
const userPaymentMethods = computed(() => userData.userPaymentMethods(userId.value))
const userAddresses = computed(() => userData.userAddresses(userId.value))
const userSupportChats = computed(() => userData.userSupportChats(userId.value))

const avatarUrl = computed(() => auth.currentUser?.photo || '')

const initials = computed(() => {
  const n = (auth.currentUser?.name || 'CRAVE').trim()
  const parts = n.split(/\s+/).slice(0,2)
  return parts.map(p => p[0]?.toUpperCase()).join('')
})

onMounted(() => {
  if (auth.currentUser) {
    form.email = auth.currentUser.email || ''
  }
})

function triggerPhotoUpload() {
  photoInput.value?.click()
}

function handlePhotoUpload(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const photoUrl = e.target.result
      auth.updateProfile({ photo: photoUrl })
    }
    reader.readAsDataURL(file)
  }
}

function save(){
  auth.updateProfile({
    name: form.name,
    email: form.email
  })
  saved.value = true
  setTimeout(() => (saved.value = false), 1200)
}

function getPaymentIcon(type) {
  const typeMap = {
    gcash: '💰',
    paymaya: '💳',
    paypal: '🌐',
    gotyme: '🏦',
    debit: '💳',
    credit: '💳'
  }
  return typeMap[type] || '💳'
}

function selectPaymentType(type) {
  // In a real app, this would open a form to collect payment details
  // For demo purposes, we'll create a mock payment method
  const mockDetails = {
    gcash: '0917 *** 1234',
    paymaya: '0917 *** 5678',
    paypal: 'user@email.com',
    gotyme: '0917 *** 9012',
    debit: '**** **** **** 1234',
    credit: '**** **** **** 5678'
  }

  userData.addPaymentMethod(userId.value, {
    type: type.id,
    label: type.name,
    details: mockDetails[type.id] || '**** **** **** 9999',
    isDefault: userPaymentMethods.value.length === 0
  })

  showAddPayment.value = false
}

function setDefaultPayment(paymentMethodId) {
  userData.setDefaultPaymentMethod(paymentMethodId)
}

function removePaymentMethod(paymentMethodId) {
  if (confirm('Remove this payment method?')) {
    userData.removePaymentMethod(paymentMethodId)
  }
}

function editAddress(address) {
  editingAddress.value = address
  Object.assign(addressForm, address)
  showAddAddress.value = true
}

function closeAddressModal() {
  showAddAddress.value = false
  editingAddress.value = null
  resetAddressForm()
}

function resetAddressForm() {
  Object.assign(addressForm, {
    label: '',
    street: '',
    barangay: '',
    city: '',
    province: '',
    zipCode: '',
    isDefault: false,
  })
}

function saveAddress() {
  if (editingAddress.value) {
    userData.updateAddress(editingAddress.value.id, addressForm)
  } else {
    userData.addAddress(userId.value, addressForm)
  }
  closeAddressModal()
}

function setDefaultAddress(addressId) {
  userData.updateAddress(addressId, { isDefault: true })
}

function removeAddress(addressId) {
  if (confirm('Remove this address?')) {
    userData.removeAddress(addressId)
  }
}

function startNewChat() {
  showNewChat.value = true
}

function createNewChat() {
  const chatId = userData.startSupportChat(userId.value, newChatMessage.value)
  newChatMessage.value = ''

  // Simulate support response after a delay
  setTimeout(() => {
    userData.addMessage(chatId, {
      sender: 'support',
      text: 'Thank you for contacting CRAVE support. We\'ll get back to you shortly.'
    })
  }, 2000)

  showNewChat.value = false
}

function openChat(chat) {
  activeChat.value = chat
}

function closeChat() {
  activeChat.value = null
  newMessage.value = ''
}

function sendMessage() {
  if (!newMessage.value.trim()) return

  userData.addMessage(activeChat.value.id, {
    sender: 'user',
    text: newMessage.value.trim()
  })

  newMessage.value = ''

  // Simulate support response
  setTimeout(() => {
    const responses = [
      'I understand your concern. Let me help you with that.',
      'Thank you for providing that information.',
      'I\'m checking our system for the details.',
      'Your issue has been noted and will be resolved soon.',
      'Is there anything else I can help you with?'
    ]
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    userData.addMessage(activeChat.value.id, {
      sender: 'support',
      text: randomResponse
    })
  }, 1000 + Math.random() * 3000)
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString()
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function logout(){
  if (confirm('Are you sure you want to logout?')) {
    auth.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.wrap{ display:flex; flex-direction: column; gap: 14px; }
.header{ display:flex; justify-content: space-between; align-items:flex-start; gap: 12px; }
.title{ font-size: 20px; font-weight: 900; }
.sub{ margin-top: 4px; color: var(--crave-muted); font-weight: 700; font-size: 13px; }
.danger{
  border: 1px solid #ef4444;
  background: #fef2f2;
  color: #ef4444;
  border-radius: 14px;
  padding: 12px 16px;
  font-weight: 900;
  width: 100%;
  margin-top: 8px;
  cursor: pointer;
}
.danger:hover{
  background: #fee2e2;
}

.hero{
  display:flex;
  align-items:center;
  gap: 12px;
  background: linear-gradient(180deg, var(--crave-blue-2), #fff);
}
.avatar-container{
  position: relative;
}
.avatar{
  width: 52px;
  height: 52px;
  border-radius: 18px;
  border: 1px solid var(--crave-border);
  background:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight: 900;
  background-size: cover;
  background-position: center;
}
.edit-photo{
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border: 2px solid #fff;
  background: var(--crave-blue);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
}
.name{ font-weight: 900; font-size: 16px; }
.meta{ margin-top: 4px; color: var(--crave-muted); font-weight: 800; font-size: 12px; }

.label{ color: var(--crave-muted); font-weight: 900; font-size: 12px; margin-bottom: 6px; }
.btn-primary.full{ width: 100%; margin-top: 12px; }
.hint{ margin-top: 10px; text-align:center; color: var(--crave-muted); font-weight: 800; font-size: 12px; }

.section-title{ font-weight: 900; margin-bottom: 10px; }

/* Payment Methods */
.payment-list{
  margin-bottom: 16px;
}
.payment-item{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--crave-border);
  border-radius: 12px;
  margin-bottom: 8px;
}
.payment-item.default{
  border-color: var(--crave-blue);
  background: rgba(59, 130, 246, 0.05);
}
.payment-info{
  display: flex;
  align-items: center;
  gap: 12px;
}
.payment-icon{
  font-size: 24px;
}
.payment-label{
  font-weight: 900;
  font-size: 14px;
}
.payment-details{
  color: var(--crave-muted);
  font-size: 12px;
}
.payment-actions{
  display: flex;
  gap: 8px;
}
.action-btn{
  padding: 6px 12px;
  border: 1px solid var(--crave-border);
  border-radius: 8px;
  background: #fff;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}
.action-btn.remove{
  color: #ef4444;
  border-color: #ef4444;
}

/* Addresses */
.address-list{
  margin-bottom: 16px;
}
.address-item{
  padding: 12px;
  border: 1px solid var(--crave-border);
  border-radius: 12px;
  margin-bottom: 8px;
}
.address-item.default{
  border-color: var(--crave-blue);
  background: rgba(59, 130, 246, 0.05);
}
.address-info{
  margin-bottom: 8px;
}
.address-label{
  font-weight: 900;
  font-size: 14px;
  margin-bottom: 4px;
}
.address-text{
  color: var(--crave-muted);
  font-size: 12px;
  line-height: 1.4;
}
.address-actions{
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Support Chat */
.chat-list{
  margin-bottom: 16px;
}
.chat-item{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--crave-border);
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
}
.chat-item:hover{
  background: var(--crave-blue-1);
}
.chat-info{
  display: flex;
  align-items: center;
  gap: 12px;
}
.chat-title{
  font-weight: 900;
  font-size: 14px;
}
.chat-status{
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
}
.chat-status.active{
  background: #e8f5e8;
  color: #2e7d32;
}
.chat-status.resolved{
  background: #e3f2fd;
  color: #1565c0;
}
.chat-status.closed{
  background: #fafafa;
  color: var(--crave-muted);
}
.chat-date{
  color: var(--crave-muted);
  font-size: 12px;
}

/* Modal Styles */
.modal-overlay{
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
.modal{
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
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
.modal-header h3{
  margin: 0;
  font-size: 18px;
  font-weight: 900;
}
.close-btn{
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--crave-muted);
}

/* Payment Types */
.payment-types{
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.payment-type-btn{
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--crave-border);
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.1s ease;
}
.payment-type-btn:hover{
  border-color: var(--crave-blue);
  background: var(--crave-blue-1);
}
.type-icon{
  font-size: 24px;
}
.type-name{
  font-weight: 800;
  font-size: 14px;
}

/* Form Styles */
.form-group{
  margin-bottom: 16px;
}
.form-group label{
  display: block;
  color: var(--crave-muted);
  font-weight: 900;
  font-size: 12px;
  margin-bottom: 6px;
}
.form-row{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.checkbox-label{
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 800 !important;
}

/* Chat Modal */
.chat-modal{
  max-width: 500px;
  max-height: 600px;
}
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
  align-self: flex-end;
  background: var(--crave-blue);
  color: white;
}
.message.support{
  align-self: flex-start;
  background: var(--crave-blue-1);
  color: var(--crave-text);
}
.message-text{
  font-size: 14px;
  line-height: 1.4;
}
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
.send-btn{
  padding: 12px 16px;
  background: var(--crave-blue);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 900;
  cursor: pointer;
}
.chat-closed{
  padding: 20px;
  text-align: center;
  color: var(--crave-muted);
  font-weight: 800;
}

/* Empty States */
.empty-state{
  text-align: center;
  padding: 40px 20px;
  color: var(--crave-muted);
}
.empty-icon{
  font-size: 48px;
  margin-bottom: 12px;
}
.empty-text{
  font-weight: 800;
  font-size: 14px;
}

/* Button Styles */
.btn-secondary{
  border: 1px solid var(--crave-border);
  background: #fff;
  color: var(--crave-text);
  border-radius: 14px;
  padding: 12px 16px;
  font-weight: 900;
  width: 100%;
  margin-top: 8px;
  cursor: pointer;
}
.btn-secondary:hover{
  background: var(--crave-blue-1);
}
</style>
