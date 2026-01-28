import { defineStore } from 'pinia'
import { loadJSON, saveJSON } from '../utils/persist'
import { riders as mockRiders } from '../data/mock'

const KEY = 'crave_partner_v1'

function uid(prefix='id') {
  return prefix + '_' + Math.random().toString(16).slice(2) + Date.now().toString(16)
}

export const usePartnerStore = defineStore('partner', {
  state: () => {
    const data = loadJSON(KEY, {
      applications: [], // { id, ownerKey, ownerName, ownerPhone, ownerEmail, storeName, storeCategory, storeAddress, storePhone, status, createdAt }
      stores: [],       // { id, ownerKey, name, category, address, phone, status, createdAt }
      products: [],     // { id, storeId, name, price, category, image, isAvailable, createdAt }
      riders: [],       // { id, name, phone, email, vehicle, status, location, createdAt }
    })
    
    // Ensure data has all required properties (in case of corrupted localStorage)
    if (!data.applications) data.applications = []
    if (!data.stores) data.stores = []
    if (!data.products) data.products = []
    if (!data.riders) data.riders = []
    
    // Initialize with mock riders if empty
    if (data.riders.length === 0) {
      data.riders = mockRiders.map(r => ({ ...r, createdAt: new Date().toISOString() }))
    }
    
    return data
  },

  getters: {
    allApplications: (s) =>
      [...s.applications].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)),

    myApplication: (s) => (ownerKey) =>
      s.applications.find(a => a.ownerKey === ownerKey) || null,

    myStore: (s) => (ownerKey) =>
      s.stores.find(st => st.ownerKey === ownerKey) || null,

    productsByStore: (s) => (storeId) =>
      s.products
        .filter(p => p.storeId === storeId)
        .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)),

    activeStores: (s) =>
      s.stores.filter(store => store.status === 'Active'),

    activeRiders: (s) =>
      s.riders.filter(rider => rider.status === 'Active'),

    availableProducts: (s) =>
      s.products
        .filter(p => {
          const store = s.stores.find(st => st.id === p.storeId)
          return store && store.status === 'Active' && p.isAvailable
        })
        .map(p => ({
          ...p,
          store: s.stores.find(st => st.id === p.storeId)
        }))
        .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)),
  },

  actions: {
    _persist() {
      saveJSON(KEY, {
        applications: this.applications,
        stores: this.stores,
        products: this.products,
        riders: this.riders,
      })
    },

    submitApplication(payload) {
      // prevent duplicate "Pending" submissions for same owner
      const existing = this.applications.find(a => a.ownerKey === payload.ownerKey && a.status === 'Pending')
      if (existing) return existing.id

      const app = {
        id: uid('app'),
        ownerKey: payload.ownerKey,
        ownerName: payload.ownerName || '',
        ownerPhone: payload.ownerPhone || '',
        ownerEmail: payload.ownerEmail || '',

        storeName: payload.storeName || '',
        storeCategory: payload.storeCategory || 'Food',
        storeAddress: payload.storeAddress || '',
        storePhone: payload.storePhone || '',

        status: 'Pending', // Pending | Approved | Rejected
        createdAt: new Date().toISOString(),
      }

      this.applications.unshift(app)
      this._persist()
      return app.id
    },

    approveApplication(appId) {
      const app = this.applications.find(a => a.id === appId)
      if (!app) return null

      app.status = 'Approved'

      // create store record if not exists
      const existingStore = this.stores.find(s => s.ownerKey === app.ownerKey)
      if (!existingStore) {
        const store = {
          id: uid('store'),
          ownerKey: app.ownerKey,
          name: app.storeName,
          category: app.storeCategory,
          address: app.storeAddress,
          phone: app.storePhone,
          status: 'Active', // Active | Disabled (UI)
          createdAt: new Date().toISOString(),
        }
        this.stores.unshift(store)
      }

      this._persist()
      return appId
    },

    rejectApplication(appId) {
      const app = this.applications.find(a => a.id === appId)
      if (!app) return null
      app.status = 'Rejected'
      this._persist()
      return appId
    },

    setStoreStatus(storeId, status) {
      const st = this.stores.find(s => s.id === storeId)
      if (!st) return
      st.status = status
      this._persist()
    },

    addProduct(storeId, payload) {
      const p = {
        id: uid('prod'),
        storeId,
        name: payload.name || '',
        price: Number(payload.price || 0),
        category: payload.category || 'General',
        image: payload.image || '',
        isAvailable: payload.isAvailable !== false,
        createdAt: new Date().toISOString(),
      }
      this.products.unshift(p)
      this._persist()
      return p.id
    },

    toggleProductAvailability(productId) {
      const p = this.products.find(x => x.id === productId)
      if (!p) return
      p.isAvailable = !p.isAvailable
      this._persist()
    },

    removeProduct(productId) {
      this.products = this.products.filter(p => p.id !== productId)
      this._persist()
    },

    // Rider management
    addRider(rider) {
      const r = {
        id: uid('rider'),
        name: rider.name,
        phone: rider.phone,
        email: rider.email,
        vehicle: rider.vehicle,
        status: rider.status || 'Active',
        location: rider.location || 'Unknown',
        createdAt: new Date().toISOString(),
      }
      this.riders.push(r)
      this._persist()
      return r.id
    },

    setRiderStatus(riderId, status) {
      const r = this.riders.find(x => x.id === riderId)
      if (r) {
        r.status = status
        this._persist()
      }
    }
  }
})
