import { defineStore } from 'pinia'
import { loadJSON, saveJSON } from '../utils/persist'

const KEY = 'crave_orders_v2'

function uid() {
  return 'ord_' + Math.random().toString(16).slice(2) + Date.now().toString(16)
}

export const useOrdersStore = defineStore('orders', {
  state: () => loadJSON(KEY, { orders: [] }),

  getters: {
    all: (s) => [...s.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    byStatus: (s) => (status) =>
      [...s.orders].filter(o => o.status === status)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  },

  actions: {
    _persist(){
      saveJSON(KEY, { orders: this.orders })
    },

    createFromCart({ items, subtotal, deliveryFee, discount, total }) {
      const order = {
        id: uid(),
        createdAt: new Date().toISOString(),
        status: 'Pending',
        items: items.map(i => ({ ...i })),
        subtotal,
        deliveryFee,
        discount,
        total,
      }
      this.orders.unshift(order)
      this._persist()
      return order.id
    },

    setStatus(orderId, status) {
      const o = this.orders.find(x => x.id === orderId)
      if (!o) return
      o.status = status
      this._persist()
    },

    clearAll() {
      this.orders = []
      this._persist()
    }
  }
})
