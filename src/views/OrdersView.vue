<template>
  <div class="wrap">
    <div class="top">
      <div class="top-title">Orders</div>
    </div>

    <div v-if="orders.all.length === 0" class="card">
      <h2 style="margin:0;">No orders yet</h2>
      <p style="margin:8px 0 0;color:var(--crave-muted);font-weight:700;">
        Your order history will appear here.
      </p>
      <button class="btn-primary" style="margin-top:12px;" @click="router.push('/home')">
        Start ordering
      </button>
    </div>

    <div v-else class="orders-list">
      <div
        v-for="order in orders.all"
        :key="order.id"
        class="card order-card"
        @click="router.push(`/orders/${order.id}`)"
      >
        <div class="row">
          <div>
            <div class="oid">#{{ order.id.slice(-6).toUpperCase() }}</div>
            <div class="date">{{ formatDate(order.createdAt) }}</div>
            <div class="items-count">{{ order.items.length }} item{{ order.items.length !== 1 ? 's' : '' }}</div>
          </div>

          <div class="status" :class="order.status.toLowerCase()">
            {{ order.status }}
          </div>
        </div>

        <div class="total">Total: ₱{{ order.total }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useOrdersStore } from '../stores/orders.js'

const router = useRouter()
const orders = useOrdersStore()

function formatDate(iso){
  const d = new Date(iso)
  return d.toLocaleString(undefined, { month:'short', day:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
}
</script>

<style scoped>
.wrap{ display:flex; flex-direction: column; gap: 14px; }

.top{
  display:flex;
  justify-content: center;
  align-items:center;
  padding: 10px 0;
}
.top-title{ font-weight: 900; font-size: 18px; }

.orders-list{ display:flex; flex-direction: column; gap: 12px; }

.order-card{
  cursor: pointer;
  transition: transform 0.2s ease;
}
.order-card:hover{
  transform: translateY(-2px);
}

.order-card .row{
  display:flex;
  justify-content: space-between;
  align-items:flex-start;
  gap: 12px;
}
.oid{ font-weight: 900; font-size: 16px; }
.date{ margin-top: 4px; color: var(--crave-muted); font-weight: 800; font-size: 12px; }
.items-count{ margin-top: 2px; color: var(--crave-muted); font-weight: 700; font-size: 12px; }
.total{ margin-top: 12px; font-weight: 900; font-size: 16px; }

.status{
  display:inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--crave-border);
  font-weight: 900;
  font-size: 11px;
  white-space: nowrap;
}
.status.pending{ background: #fff; }
.status.preparing{ background: var(--crave-blue-2); border-color: var(--crave-blue); }
.status.delivered{ background: #F3F4F6; }
</style>
