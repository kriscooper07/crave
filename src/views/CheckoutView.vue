<template>
  <div class="wrap">
    <div class="top">
      <button class="icon-btn" @click="router.back()"><ArrowLeft class="ico" /></button>
      <div class="top-title">Checkout</div>
      <div style="width:40px;"></div>
    </div>

    <div v-if="!cart.items.length" class="card empty">
      <div class="big">🧾</div>
      <div class="empty-title">Nothing to checkout</div>
      <div class="empty-sub">Add items to cart first.</div>
      <button class="btn-primary" style="margin-top:12px;" @click="router.push('/home')">
        Browse
      </button>
    </div>

    <template v-else>
      <div class="card">
        <div class="section-title">Delivery</div>

        <div class="row">
          <div class="label">Name</div>
          <div class="value">{{ auth.currentUser?.name || 'Guest' }}</div>
        </div>

        <div class="row">
          <div class="label">Phone</div>
          <div class="value">{{ auth.currentUser?.phone || '—' }}</div>
        </div>

        <div class="row">
          <div class="label">Address</div>
          <div class="value">—</div>
        </div>

        <button class="ghost" @click="router.push('/profile')">
          Edit in Profile
        </button>
      </div>

      <div class="card">
        <div class="section-title">Order Summary</div>

        <div class="lines">
          <div class="line" v-for="it in cart.items" :key="it.key">
            <div class="n">
              <div class="nm">{{ it.name }} <span class="muted">x{{ it.qty }}</span></div>
              <div v-if="it.optionsText" class="opt">{{ it.optionsText }}</div>
            </div>
            <div class="p">₱{{ it.price * it.qty }}</div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="tot">
          <div class="trow">
            <span class="muted">Subtotal</span>
            <span>₱{{ cart.subtotal }}</span>
          </div>
          <div class="trow">
            <span class="muted">Delivery</span>
            <span>₱{{ cart.deliveryFee }}</span>
          </div>
          <div class="trow" v-if="cart.discount">
            <span class="muted">Discount</span>
            <span>- ₱{{ cart.discount }}</span>
          </div>
          <div class="trow total">
            <span>Total</span>
            <span>₱{{ cart.total }}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="section-title">Payment (placeholder)</div>
        <div class="pay">
          <button class="pill" :class="{ active: payment==='COD' }" @click="payment='COD'">Cash on Delivery</button>
          <button class="pill" :class="{ active: payment==='GCash' }" @click="payment='GCash'">GCash (UI)</button>
          <button class="pill" :class="{ active: payment==='Card' }" @click="payment='Card'">Card (UI)</button>
        </div>
        <div class="note">Real payments will be added in backend later.</div>
      </div>

      <button class="btn-primary full" @click="openConfirm = true">
        Place Order • ₱{{ cart.total }}
      </button>

      <!-- Confirm Modal -->
      <div v-if="openConfirm" class="overlay" @click.self="openConfirm = false">
        <div class="modal">
          <div class="m-title">Confirm your order?</div>
          <div class="m-sub">
            Total: <b>₱{{ cart.total }}</b><br />
            Payment: <b>{{ payment }}</b>
          </div>
          <div class="m-actions">
            <button class="ghost" @click="openConfirm=false">Cancel</button>
            <button class="btn-primary" @click="placeOrder">Confirm</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useCartStore } from '../stores/cart'
import { useOrdersStore } from '../stores/orders'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const cart = useCartStore()
const orders = useOrdersStore()
const auth = useAuthStore()

const payment = ref('COD')
const openConfirm = ref(false)

function placeOrder(){
  // create order with breakdown
  const orderId = orders.createFromCart({
    items: cart.items,
    subtotal: cart.subtotal,
    deliveryFee: cart.deliveryFee,
    discount: cart.discount,
    total: cart.total,
  })

  cart.clear()
  openConfirm.value = false
  router.push(`/order-success/${orderId}`)
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
.top-title{ text-align:center; font-weight: 900; }
.icon-btn{
  width: 40px; height: 40px;
  border-radius: 14px;
  border: 1px solid var(--crave-border);
  background:#fff;
  display:flex; align-items:center; justify-content:center;
}
.ico{ width: 18px; height: 18px; }

.section-title{ font-weight: 900; margin-bottom: 10px; }

.row{ display:flex; justify-content: space-between; gap: 10px; padding: 8px 0; border-top: 1px solid var(--crave-border); }
.row:first-of-type{ border-top: none; }
.label{ color: var(--crave-muted); font-weight: 900; font-size: 12px; }
.value{ font-weight: 800; text-align:right; }

.ghost{
  margin-top: 10px;
  border: 1px solid var(--crave-border);
  background:#fff;
  border-radius: 14px;
  padding: 10px 12px;
  font-weight: 900;
  color: var(--crave-muted);
}

.lines{ display:flex; flex-direction: column; gap: 10px; }
.line{ display:flex; justify-content: space-between; gap: 10px; }
.nm{ font-weight: 900; }
.opt{ margin-top: 4px; color: var(--crave-muted); font-weight: 700; font-size: 12px; }
.p{ font-weight: 900; }
.muted{ color: var(--crave-muted); font-weight: 800; }

.divider{ height: 1px; background: var(--crave-border); margin: 12px 0; }

.tot{ display:flex; flex-direction: column; gap: 10px; font-weight: 900; }
.trow{ display:flex; justify-content: space-between; }
.trow.total{ font-size: 16px; }

.pay{ display:flex; gap: 10px; flex-wrap: wrap; }
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
.note{ margin-top: 10px; text-align:center; color: var(--crave-muted); font-weight: 700; font-size: 12px; }

.btn-primary.full{ width: 100%; }

.empty{ text-align:center; padding: 18px; }
.big{ font-size: 34px; }
.empty-title{ margin-top: 8px; font-weight: 900; font-size: 16px; }
.empty-sub{ margin-top: 6px; color: var(--crave-muted); font-weight: 700; }

/* Modal */
.overlay{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display:flex;
  align-items:flex-end;
  justify-content:center;
  padding: 16px;
  z-index: 50;
}
.modal{
  width: 100%;
  max-width: 480px;
  background: #fff;
  border-radius: 22px;
  padding: 16px;
  border: 1px solid var(--crave-border);
}
.m-title{ font-weight: 900; font-size: 16px; }
.m-sub{ margin-top: 8px; color: var(--crave-muted); font-weight: 700; line-height: 1.4; }
.m-actions{ display:flex; gap: 10px; margin-top: 14px; }
.m-actions .ghost{ margin-top: 0; width: 45%; }
.m-actions .btn-primary{ width: 55%; }

:root[data-theme="dark"] .icon-btn,
:root[data-theme="dark"] .ghost,
:root[data-theme="dark"] .pill,
:root[data-theme="dark"] .modal{
  background: rgba(255,255,255,0.06);
  color: var(--crave-text);
}
</style>
