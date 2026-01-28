import { defineStore } from 'pinia'
import { loadJSON, saveJSON } from '../utils/persist'

const PAYMENT_KEY = 'crave_payment_v1'
const ADDRESS_KEY = 'crave_addresses_v1'
const SUPPORT_KEY = 'crave_support_v1'
const RIDER_KEY = 'crave_rider_v1'
const VIOLATIONS_KEY = 'crave_violations_v1'

export const useUserDataStore = defineStore('userData', {
  state: () => ({
    paymentMethods: loadJSON(PAYMENT_KEY, []),
    savedAddresses: loadJSON(ADDRESS_KEY, []),
    supportChats: loadJSON(SUPPORT_KEY, []),
    riderChats: loadJSON(RIDER_KEY, []),
    violations: loadJSON(VIOLATIONS_KEY, []),
  }),

  getters: {
    userPaymentMethods: (state) => (userId) =>
      state.paymentMethods.filter(pm => pm.userId === userId),

    userAddresses: (state) => (userId) =>
      state.savedAddresses.filter(addr => addr.userId === userId),

    userSupportChats: (state) => (userId) =>
      state.supportChats.filter(chat => chat.userId === userId),

    allRiderChats: (state) => state.riderChats,
  },

  actions: {
    _persist() {
      saveJSON(PAYMENT_KEY, this.paymentMethods)
      saveJSON(ADDRESS_KEY, this.savedAddresses)
      saveJSON(SUPPORT_KEY, this.supportChats)
      saveJSON(RIDER_KEY, this.riderChats)
      saveJSON(VIOLATIONS_KEY, this.violations)
    },

    // Payment Methods
    addPaymentMethod(userId, method) {
      const pm = {
        id: 'pm_' + Date.now(),
        userId,
        type: method.type, // 'gcash', 'paymaya', 'paypal', 'gotyme', 'debit', 'credit'
        label: method.label,
        details: method.details, // masked account/card number
        isDefault: method.isDefault || false,
        createdAt: new Date().toISOString(),
      }

      // If this is default, unset others
      if (pm.isDefault) {
        this.paymentMethods.forEach(p => {
          if (p.userId === userId) p.isDefault = false
        })
      }

      this.paymentMethods.push(pm)
      this._persist()
      return pm.id
    },

    removePaymentMethod(paymentMethodId) {
      this.paymentMethods = this.paymentMethods.filter(pm => pm.id !== paymentMethodId)
      this._persist()
    },

    setDefaultPaymentMethod(paymentMethodId) {
      this.paymentMethods.forEach(pm => {
        pm.isDefault = pm.id === paymentMethodId
      })
      this._persist()
    },

    // Saved Addresses
    addAddress(userId, address) {
      const addr = {
        id: 'addr_' + Date.now(),
        userId,
        label: address.label,
        street: address.street,
        barangay: address.barangay,
        city: address.city,
        province: address.province,
        zipCode: address.zipCode,
        isDefault: address.isDefault || false,
        createdAt: new Date().toISOString(),
      }

      // If this is default, unset others
      if (addr.isDefault) {
        this.savedAddresses.forEach(a => {
          if (a.userId === userId) a.isDefault = false
        })
      }

      this.savedAddresses.push(addr)
      this._persist()
      return addr.id
    },

    updateAddress(addressId, updates) {
      const addr = this.savedAddresses.find(a => a.id === addressId)
      if (addr) {
        Object.assign(addr, updates)

        // If setting as default, unset others
        if (updates.isDefault) {
          this.savedAddresses.forEach(a => {
            if (a.userId === addr.userId && a.id !== addressId) a.isDefault = false
          })
        }

        this._persist()
      }
    },

    removeAddress(addressId) {
      this.savedAddresses = this.savedAddresses.filter(a => a.id !== addressId)
      this._persist()
    },

    // Support Chat
    startSupportChat(userId, message) {
      const chat = {
        id: 'chat_' + Date.now(),
        userId,
        messages: [{
          id: 'msg_' + Date.now(),
          sender: 'user',
          text: message,
          timestamp: new Date().toISOString(),
        }],
        status: 'active', // active, resolved, closed
        createdAt: new Date().toISOString(),
      }

      this.supportChats.push(chat)
      this._persist()
      return chat.id
    },

    addMessage(chatId, message) {
      const chat = this.supportChats.find(c => c.id === chatId)
      if (chat) {
        chat.messages.push({
          id: 'msg_' + Date.now(),
          sender: message.sender, // 'user' or 'support'
          text: message.text,
          timestamp: new Date().toISOString(),
        })
        this._persist()
      }
    },

    closeSupportChat(chatId) {
      const chat = this.supportChats.find(c => c.id === chatId)
      if (chat) {
        chat.status = 'closed'
        this._persist()
      }
    },

    // Rider Chat
    startRiderChat(riderId, message) {
      const chat = {
        id: 'rider_chat_' + Date.now(),
        riderId,
        messages: [{
          id: 'msg_' + Date.now(),
          sender: 'rider',
          text: message,
          timestamp: new Date().toISOString(),
        }],
        status: 'active',
        createdAt: new Date().toISOString(),
      }

      this.riderChats.push(chat)
      this._persist()
      return chat.id
    },

    addRiderMessage(chatId, message) {
      const chat = this.riderChats.find(c => c.id === chatId)
      if (chat) {
        chat.messages.push({
          id: 'msg_' + Date.now(),
          sender: message.sender, // 'rider' or 'support'
          text: message.text,
          timestamp: new Date().toISOString(),
        })
        this._persist()
      }
    },

    closeRiderChat(chatId) {
      const chat = this.riderChats.find(c => c.id === chatId)
      if (chat) {
        chat.status = 'closed'
        this._persist()
      }
    },

    // Violations & Suspensions
    reportViolation(violation) {
      const v = {
        id: 'viol_' + Date.now(),
        type: violation.type,
        targetType: violation.targetType, // 'store' or 'rider'
        targetName: violation.targetName,
        targetId: violation.targetId,
        reason: violation.reason,
        description: violation.description,
        reportedBy: violation.reportedBy,
        orderId: violation.orderId,
        status: 'pending', // pending, suspended, dismissed
        createdAt: new Date().toISOString(),
      }

      this.violations.unshift(v)
      this._persist()
      return v.id
    },

    suspendEntity(violationId) {
      const violation = this.violations.find(v => v.id === violationId)
      if (violation) {
        violation.status = 'suspended'
        this._persist()
      }
    },

    dismissViolation(violationId) {
      const violation = this.violations.find(v => v.id === violationId)
      if (violation) {
        violation.status = 'dismissed'
        this._persist()
      }
    },
  }
})