<template>
  <div class="wrap">
    <div class="header">
      <div class="title">Cart</div>
      <button class="ghost" v-if="cart.items.length" @click="cart.clear()">Clear</button>
    </div>

    <div v-if="!cart.items.length" class="card empty">
      <div class="big">🛒</div>
      <div class="empty-title">Your cart is empty</div>
      <div class="empty-sub">Add something from Home to get started.</div>
      <button class="btn-primary" style="margin-top:12px;" @click="router.push('/home')">
        Browse items
      </button>
    </div>

    <div v-else class="list">
      <div v-for="item in cart.items" :key="item.id" class="item">
        <div class="left">
          <div class="thumb">{{ item.name.slice(0,1) }}</div>
          <div class="info">
            <div class="name">{{ item.name }}</div>
            <div class="sub">₱{{ item.price }} each</div>
          </div>
        </div>

        <div class="right">
          <div class="qty">
            <button class="qty-btn" @click="cart.setQty(item.id, item.qty - 1)">−</button>
            <div class="qty-num">{{ item.qty }}</div>
            <button class="qty-btn" @click="cart.setQty(item.id, item.qty + 1)">+</button>
          </div>

          <div class="total">₱{{ item.price * item.qty }}</div>

          <button class="remove" @click="cart.remove(item.id)">Remove</button>
        </div>
      </div>

      <div class="card summary">
        <div class="row">
          <div class="label">Subtotal</div>
          <div class="value">₱{{ cart.subtotal }}</div>
        </div>
        <div class="row muted">
          <div class="label">Delivery</div>
          <div class="value">₱0 (UI placeholder)</div>
        </div>
        <button class="btn-primary full" @click="checkout">
          Checkout (UI) • ₱{{ cart.subtotal }}
        </button>
        <div class="note">Backend checkout will be added later (Node.js).</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useOrdersStore } from '../stores/orders.js'

const router = useRouter()
const cart = useCartStore()
const orders = useOrdersStore()

function checkout(){
  if (!cart.items.length) return
  orders.createFromCart(cart.items)
  cart.clear()
  router.push('/orders')
}
</script>


<style scoped>
.wrap{ display:flex; flex-direction: column; gap: 14px; }
.header{
  display:flex;
  align-items:center;
  justify-content: space-between;
}
.title{ font-size: 20px; font-weight: 900; }

.ghost{
  border: 1px solid var(--crave-border);
  background:#fff;
  border-radius: 14px;
  padding: 10px 12px;
  font-weight: 900;
  color: var(--crave-muted);
}

.empty{
  text-align:center;
  padding: 18px;
}
.big{ font-size: 34px; }
.empty-title{ margin-top: 8px; font-weight: 900; font-size: 16px; }
.empty-sub{ margin-top: 6px; color: var(--crave-muted); font-weight: 700; }

.list{ display:flex; flex-direction: column; gap: 12px; }

.item{
  display:flex;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid var(--crave-border);
  border-radius: 18px;
  padding: 12px;
  background:#fff;
}

.left{ display:flex; gap: 10px; align-items:center; }
.thumb{
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: var(--crave-blue-2);
  border: 1px solid var(--crave-border);
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight: 900;
}
.info .name{ font-weight: 900; }
.info .sub{ margin-top: 2px; color: var(--crave-muted); font-weight: 800; font-size: 12px; }

.right{ display:flex; flex-direction: column; align-items:flex-end; gap: 8px; }

.qty{
  display:flex;
  align-items:center;
  gap: 8px;
  border: 1px solid var(--crave-border);
  border-radius: 14px;
  padding: 6px 8px;
}
.qty-btn{
  width: 30px;
  height: 30px;
  border-radius: 12px;
  border: 1px solid var(--crave-border);
  background: #fff;
  font-weight: 900;
  font-size: 16px;
}
.qty-num{ width: 20px; text-align:center; font-weight: 900; }

.total{ font-weight: 900; }
.remove{
  border: none;
  background: transparent;
  color: var(--crave-muted);
  font-weight: 900;
  text-decoration: underline;
}

.summary .row{
  display:flex;
  justify-content: space-between;
  align-items:center;
  margin-bottom: 10px;
}
.summary .label{ color: var(--crave-muted); font-weight: 800; }
.summary .value{ font-weight: 900; }
.summary .muted .value{ color: var(--crave-muted); }

.btn-primary.full{ width: 100%; margin-top: 6px; }

.note{
  margin-top: 10px;
  text-align:center;
  color: var(--crave-muted);
  font-weight: 700;
  font-size: 12px;
}
</style>
