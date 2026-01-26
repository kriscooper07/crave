import { defineStore } from 'pinia'
import { loadJSON, saveJSON } from '../utils/persist'

const KEY = 'crave_cart_v2'

const PROMOS = {
  CRAVE10: { type: 'percent', value: 10 },
  FREESHIP: { type: 'freeship', value: 0 },
}

function normalize(code){
  return (code || '').trim().toUpperCase()
}

export const useCartStore = defineStore('cart', {
  state: () => loadJSON(KEY, {
    items: [],     // { key, id, name, price, qty, optionsText? }
    promoCode: '',
  }),

  getters: {
    count: (s) => s.items.reduce((sum, i) => sum + i.qty, 0),
    subtotal: (s) => s.items.reduce((sum, i) => sum + i.price * i.qty, 0),

    promoInfo: (s) => PROMOS[normalize(s.promoCode)] || null,

    deliveryFee() {
      if (this.subtotal >= 199) return 0
      if (this.promoInfo?.type === 'freeship') return 0
      return 39
    },

    discount() {
      if (!this.promoInfo) return 0
      if (this.promoInfo.type === 'percent') {
        const d = Math.round(this.subtotal * (this.promoInfo.value / 100))
        return Math.min(d, 100) // cap ₱100
      }
      return 0
    },

    total() {
      return Math.max(0, this.subtotal + this.deliveryFee - this.discount)
    }
  },

  actions: {
    _persist() {
      saveJSON(KEY, { items: this.items, promoCode: this.promoCode })
    },

    add(product, qty = 1, options = null) {
      const optionsText = options?.optionsText || ''
      const key = product.id + '|' + (optionsText || '')
      const existing = this.items.find(i => i.key === key)

      const line = {
        key,
        id: product.id,
        name: product.name,
        price: (product.price || 0) + (options?.priceAdd || 0),
        qty,
        optionsText,
      }

      if (existing) existing.qty += qty
      else this.items.push(line)

      this._persist()
    },

    setQty(key, qty) {
      const item = this.items.find(i => i.key === key)
      if (!item) return
      item.qty = Math.max(1, qty)
      this._persist()
    },

    remove(key) {
      this.items = this.items.filter(i => i.key !== key)
      this._persist()
    },

    setPromo(code){
      this.promoCode = code
      this._persist()
    },

    clear() {
      this.items = []
      this.promoCode = ''
      this._persist()
    }
  }
})
