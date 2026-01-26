import { defineStore } from 'pinia'

const KEY = 'crave_user_v1'

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {}
}

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: load() || {
      name: 'Kris',
      phone: '',
      address: '',
    }
  }),

  actions: {
    updateProfile(next) {
      this.profile = { ...this.profile, ...next }
      save(this.profile)
    },

    reset() {
      this.profile = { name: 'Kris', phone: '', address: '' }
      save(this.profile)
    }
  }
})
