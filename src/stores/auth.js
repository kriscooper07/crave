import { defineStore } from 'pinia'
import { loadJSON, saveJSON } from '../utils/persist'

const AUTH_KEY = 'crave_auth_v1'
const USERS_KEY = 'crave_users_v1'
const AGENTS_KEY = 'crave_support_agents_v1'

// Mock OTP storage (in real app, this would be server-side)
const OTP_STORAGE = {}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function loadUsers() {
  return loadJSON(USERS_KEY, {})
}

function loadAgents() {
  return loadJSON(AGENTS_KEY, {})
}

function saveAgents(agents) {
  saveJSON(AGENTS_KEY, agents)
}

function saveUsers(users) {
  saveJSON(USERS_KEY, users)
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: loadJSON(AUTH_KEY, null), // { id, phone, name }
    isAuthenticated: !!loadJSON(AUTH_KEY, null),
  }),

  getters: {
    currentUser: (state) => state.user,
  },

  actions: {
    _persist() {
      saveJSON(AUTH_KEY, this.user)
    },

    // Send OTP to email with user details
    async sendEmailOTP(email, name, location) {
      const otp = generateOTP()
      OTP_STORAGE[email] = {
        otp,
        expires: Date.now() + 5 * 60 * 1000, // 5 minutes
        name,
        location,
      }

      // In real app, this would send email
      console.log(`OTP for ${email}: ${otp}`)

      return { success: true, message: 'OTP sent to your email' }
    },

    // Verify OTP and login
    async verifyOTP(phone, otp) {
      const stored = OTP_STORAGE[phone]

      if (!stored) {
        return { success: false, message: 'No OTP sent to this number' }
      }

      if (Date.now() > stored.expires) {
        delete OTP_STORAGE[phone]
        return { success: false, message: 'OTP expired' }
      }

      if (stored.otp !== otp) {
        return { success: false, message: 'Invalid OTP' }
      }

      // OTP verified, create/login user
      const users = loadUsers()
      let user = users[phone]

      if (!user) {
        // New user
        user = {
          id: 'user_' + Date.now(),
          phone,
          name: '',
          email: '',
          location: '',
          photo: '',
          paymentMethods: [],
          savedAddresses: [],
          createdAt: new Date().toISOString(),
        }
        users[phone] = user
        saveUsers(users)
      }

      // Set as current user
      this.user = user
      this.isAuthenticated = true
      this._persist()

      // Clean up OTP
      delete OTP_STORAGE[phone]

      return { success: true, message: 'Login successful', user }
    },

    // Verify email OTP and login
    async verifyEmailOTP(email, otp, name, location) {
      const stored = OTP_STORAGE[email]

      if (!stored) {
        return { success: false, message: 'No OTP sent to this email' }
      }

      if (Date.now() > stored.expires) {
        delete OTP_STORAGE[email]
        return { success: false, message: 'OTP expired' }
      }

      if (stored.otp !== otp) {
        return { success: false, message: 'Invalid OTP' }
      }

      // OTP verified, create/login user
      const users = loadUsers()
      let user = users[email]

      if (!user) {
        // New user
        user = {
          id: 'user_' + Date.now(),
          email,
          name,
          location,
          phone: '',
          photo: '',
          paymentMethods: [],
          savedAddresses: [],
          createdAt: new Date().toISOString(),
        }
        users[email] = user
        saveUsers(users)
      } else {
        // Update existing user with new name/location if provided
        if (name && name !== user.name) user.name = name
        if (location && location !== user.location) user.location = location
        users[email] = user
        saveUsers(users)
      }

      // Set as current user
      this.user = user
      this.isAuthenticated = true
      this._persist()

      // Clean up OTP
      delete OTP_STORAGE[email]

      return { success: true, message: 'Login successful', user }
    },

    // Login support agent
    async loginSupportAgent(agentId, password) {
      const agents = loadAgents()

      // Mock agent credentials for demo
      const mockAgents = {
        'agent_001': { password: 'password123', name: 'Sarah Johnson', role: 'support_agent' },
        'agent_002': { password: 'password123', name: 'Mike Chen', role: 'support_agent' },
        'agent_003': { password: 'password123', name: 'Emma Davis', role: 'support_agent' }
      }

      const agentData = mockAgents[agentId]
      if (!agentData || agentData.password !== password) {
        return { success: false, message: 'Invalid agent ID or password' }
      }

      // Create agent user object
      const agent = {
        id: agentId,
        agentId,
        name: agentData.name,
        role: 'support_agent',
        email: `${agentId}@crave.support`,
        createdAt: new Date().toISOString(),
      }

      // Set as current user
      this.user = agent
      this.isAuthenticated = true
      this._persist()

      return { success: true, message: 'Agent login successful', user: agent }
    },

    // Logout
    logout() {
      this.user = null
      this.isAuthenticated = false
      saveJSON(AUTH_KEY, null)
    },

    // Update user profile
    updateProfile(updates) {
      if (!this.user) return

      this.user = { ...this.user, ...updates }
      this._persist()

      // Update in users storage
      const users = loadUsers()
      users[this.user.phone] = this.user
      saveUsers(users)
    },

    // Return all registered consumer users as an array
    getAllUsers() {
      const users = loadUsers()
      return Object.values(users || {})
    },
  }
})