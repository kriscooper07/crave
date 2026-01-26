<template>
  <div v-if="order" class="wrap">
    <!-- Top bar -->
    <div class="top">
      <button class="icon-btn" @click="router.back()">←</button>
      <div class="top-center">
        <div class="top-title">Order</div>
        <div class="top-sub">#{{ orderCode }}</div>
      </div>
      <button class="icon-btn" @click="router.push('/orders')">≡</button>
    </div>

    <!-- Status + total -->
    <div class="card head">
      <div class="row">
        <div>
          <div class="date">{{ formatDate(order.createdAt) }}</div>
          <div class="muted">Items: {{ itemCount }}</div>
        </div>

        <div class="status" :class="statusClass">
          <span class="dot" :class="statusClass"></span>
          {{ order.status }}
        </div>
      </div>

      <div class="divider"></div>

      <div class="money">
        <div class="line">
          <span class="label">Subtotal</span>
          <span class="value">₱{{ subtotal }}</span>
        </div>
        <div class="line muted">
          <span class="label">Delivery</span>
          <span class="value">₱{{ deliveryFee }}</span>
        </div>
        <div class="line muted" v-if="discount">
          <span class="label">Discount</span>
          <span class="value">- ₱{{ discount }}</span>
        </div>
        <div class="line total">
          <span class="label">Total</span>
          <span class="value">₱{{ order.total }}</span>
        </div>
      </div>

      <button class="btn-primary full" @click="reorder">
        Reorder (UI)
      </button>
      <div class="hint">This will add items back to cart (UI only).</div>
    </div>

    <!-- Items -->
    <div class="card">
      <div class="section-title">Items</div>

      <div class="items">
        <div v-for="it in order.items" :key="it.key || it.id" class="item">
          <div class="thumb">{{ it.name?.slice(0, 1) || 'C' }}</div>

          <div class="mid">
            <div class="name">{{ it.name }}</div>
            <div v-if="it.optionsText" class="opts">{{ it.optionsText }}</div>
            <div class="sub muted">₱{{ it.price }} each • x{{ it.qty }}</div>
          </div>

          <div class="right">
            <div class="price">₱{{ it.price * it.qty }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status controls (UI-only) -->
    <div class="card">
      <div class="section-title">Update status (UI only)</div>
      <div class="actions">
        <button class="pill" :class="{ active: order.status==='Pending' }"
          @click="orders.setStatus(order.id, 'Pending')">
          Pending
        </button>
        <button class="pill" :class="{ active: order.status==='Preparing' }"
          @click="orders.setStatus(order.id, 'Preparing')">
          Preparing
        </button>
        <button class="pill" :class="{ active: order.status==='Delivered' }"
          @click="orders.setStatus(order.id, 'Delivered')">
          Delivered
        </button>
      </div>
      <div class="note">Backend will handle real status updates later.</div>
    </div>
  </div>

  <div v-else class="card">
    <h2 style="margin:0;">Order not found</h2>
    <p style="margin:8px 0 0;color:var(--crave-muted);font-weight:700;">
      The order id may be invalid.
    </p>
    <button class="btn-primary" style="margin-top:12px;" @click="router.push('/orders')">
      Back to Orders
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore } from '../stores/orders.js'
import { useCartStore } from '../stores/cart'

const route = useRoute()
const router = useRouter()
const orders = useOrdersStore()
const cart = useCartStore()

const order = computed(() => orders.orders.find(o => o.id === route.params.id))

const orderCode = computed(() => order.value?.id?.slice(-6).toUpperCase() || '------')

const itemCount = computed(() =>
  (order.value?.items || []).reduce((sum, it) => sum + (it.qty || 0), 0)
)

const subtotal = computed(() =>
  (order.value?.items || []).reduce((sum, it) => sum + (it.price * it.qty), 0)
)

/**
 * UI placeholders for breakdown. If your order object later includes these,
 * switch these computed values to read from order.value.deliveryFee/discount.
 */
const deliveryFee = computed(() => (subtotal.value >= 199 ? 0 : 39))
const discount = computed(() => 0)

const statusClass = computed(() => (order.value?.status || 'Pending').toLowerCase())

function formatDate(iso){
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month:'short', day:'2-digit', year:'numeric',
    hour:'2-digit', minute:'2-digit'
  })
}

function reorder(){
  if (!order.value) return
  // Add each item back into cart using the store method
  for (const it of order.value.items || []) {
    cart.add(it, it.qty)
  }
  router.push('/cart')
}
</script>

<style scoped>
.wrap{ display:flex; flex-direction: column; gap: 14px; }

.top{
  display:grid;
  grid-template-columns: 40px 1fr 40px;
  align-items:center;
  gap: 10px;
}
.top-center{ text-align:center; }
.top-title{ font-weight: 900; line-height: 1.1; }
.top-sub{ color: var(--crave-muted); font-weight: 800; font-size: 12px; margin-top: 2px; }

.icon-btn{
  width: 40px; height: 40px;
  border-radius: 14px;
  border: 1px solid var(--crave-border);
  background:#fff;
  font-weight: 900;
}

.head .row{
  display:flex;
  justify-content: space-between;
  align-items:flex-start;
  gap: 12px;
}
.date{ font-weight: 900; font-size: 14px; }
.muted{ color: var(--crave-muted); font-weight: 800; font-size: 12px; }

.status{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid var(--crave-border);
  font-weight: 900;
  font-size: 12px;
  white-space: nowrap;
  background: #fff;
}
.dot{
  width: 8px; height: 8px;
  border-radius: 99px;
  background: var(--crave-border);
}
.dot.pending{ background: var(--crave-border); }
.dot.preparing{ background: var(--crave-blue); }
.dot.delivered{ background: #9CA3AF; }

.divider{
  height: 1px;
  background: var(--crave-border);
  margin: 12px 0;
}

.money{ display:flex; flex-direction: column; gap: 10px; }
.money .line{ display:flex; justify-content: space-between; align-items:center; }
.money .label{ font-weight: 900; }
.money .value{ font-weight: 900; }
.money .muted .label, .money .muted .value{ color: var(--crave-muted); font-weight: 800; }
.money .total .label, .money .total .value{ font-size: 16px; }

.btn-primary.full{ width: 100%; margin-top: 12px; }
.hint{ margin-top: 10px; text-align:center; color: var(--crave-muted); font-weight: 700; font-size: 12px; }

.section-title{ font-weight: 900; margin-bottom: 10px; }

.items{ display:flex; flex-direction: column; gap: 10px; }
.item{
  display:grid;
  grid-template-columns: 44px 1fr auto;
  gap: 10px;
  align-items:center;
  padding: 10px;
  border: 1px solid var(--crave-border);
  border-radius: 16px;
  background: #fff;
}
.thumb{
  width: 44px; height: 44px;
  border-radius: 16px;
  background: var(--crave-blue-2);
  border: 1px solid var(--crave-border);
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight: 900;
}
.name{ font-weight: 900; }
.opts{ margin-top: 4px; color: var(--crave-muted); font-weight: 700; font-size: 12px; }
.sub{ margin-top: 6px; }

.right .price{ font-weight: 900; }

.actions{ display:flex; gap: 10px; flex-wrap: wrap; }
.pill{
  border: 1px solid var(--crave-border);
  background:#fff;
  border-radius: 999px;
  padding: 10px 12px;
  font-weight: 900;
}
.pill.active{
  border-color: var(--crave-blue);
  background: var(--crave-blue-2);
}

.note{
  margin-top: 10px;
  text-align:center;
  color: var(--crave-muted);
  font-weight: 700;
  font-size: 12px;
}

/* Dark-mode friendly */
:root[data-theme="dark"] .icon-btn,
:root[data-theme="dark"] .status,
:root[data-theme="dark"] .item,
:root[data-theme="dark"] .pill{
  background: rgba(255,255,255,0.06);
  color: var(--crave-text);
}
</style>
