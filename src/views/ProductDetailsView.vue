<template>
  <div v-if="product" class="wrap">
    <!-- Top bar -->
    <div class="top">
      <button class="icon-btn" @click="router.back()">←</button>
      <div class="top-title">Details</div>
      <button class="icon-btn" @click="router.push('/cart')">🛒</button>
    </div>

    <!-- Hero -->
    <div class="hero">
      <div class="hero-thumb">
        <img v-if="product.image" :src="product.image" :alt="product.name" @error="onImgError" />
        <div v-else class="no-image">{{ product.name.slice(0,1) }}</div>
      </div>
      <div class="hero-info">
        <div class="name">{{ product.name }}</div>
        <div class="store" @click="goToStore(product.store.id)">{{ product.store?.name || 'Store' }}</div>
        <div class="row">
          <div class="pill">Category: {{ product.category }}</div>
          <div class="pill" :class="{ available: product.isAvailable, unavailable: !product.isAvailable }">
            {{ product.isAvailable ? 'Available' : 'Unavailable' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Price + qty -->
    <div class="card">
      <div class="price-row">
        <div>
          <div class="label">Price</div>
          <div class="price">₱{{ product.price }}</div>
        </div>

        <div class="qty">
          <button class="qty-btn" @click="dec">−</button>
          <div class="qty-num">{{ qty }}</div>
          <button class="qty-btn" @click="inc">+</button>
        </div>
      </div>

      <button class="btn-primary full" @click="addToCart">
        Add to Cart • ₱{{ product.price * qty }}
      </button>
      <div class="hint">Items in cart: {{ cart.count }}</div>
    </div>
  </div>

  <div v-else class="card">
    <h2 style="margin:0;">Product not found</h2>
    <p style="margin:8px 0 0;color:var(--crave-muted);font-weight:700;">
      The product id may be invalid.
    </p>
    <button class="btn-primary" style="margin-top:12px;" @click="router.push('/home')">
      Back to Home
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePartnerStore } from '../stores/partner'
import { useCartStore } from '../stores/cart'

const route = useRoute()
const router = useRouter()
const partner = usePartnerStore()
const cart = useCartStore()

const qty = ref(1)

const product = computed(() => {
  const id = route.params.id
  return partner.availableProducts.find(p => p.id === id)
})

function inc(){ qty.value += 1 }
function dec(){ qty.value = Math.max(1, qty.value - 1) }

function addToCart(){
  if (!product.value) return
  cart.add(product.value, qty.value)
  router.push('/cart')
}

function goToStore(storeId) {
  router.push(`/store/${storeId}`)
}

function onImgError(e) {
  e.target.style.display = 'none'
  e.target.nextElementSibling.style.display = 'flex'
}
</script>

<style scoped>
.wrap{ display:flex; flex-direction: column; gap: 14px; }

.top{
  display:grid;
  grid-template-columns: 40px 1fr 40px;
  align-items:center;
}
.top-title{
  text-align:center;
  font-weight: 900;
}
.icon-btn{
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border: 1px solid var(--crave-border);
  background:#fff;
  font-weight: 900;
}

.hero{
  border: 1px solid var(--crave-border);
  border-radius: 18px;
  padding: 14px;
  background: linear-gradient(180deg, var(--crave-blue-2), #fff);
  display:flex;
  gap: 12px;
}
.hero-thumb{
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid var(--crave-border);
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight: 900;
  font-size: 20px;
  overflow: hidden;
}
.hero-thumb img{
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 17px;
}
.no-image{
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--crave-blue-2);
  color: var(--crave-text);
  font-weight: 900;
  font-size: 20px;
}

.name{ font-weight: 900; font-size: 18px; }
.store{
  margin-top: 4px;
  color: var(--crave-muted);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.1s ease;
}

.store:hover {
  color: var(--crave-text);
}
.row{
  margin-top: 10px;
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
}
.pill{
  padding: 8px 10px;
  border-radius: 999px;
  background:#fff;
  border: 1px solid var(--crave-border);
  font-weight: 900;
  font-size: 12px;
  color: var(--crave-text);
}
.pill.available{
  background: #e8f5e8;
  border-color: #4caf50;
  color: #2e7d32;
}
.pill.unavailable{
  background: #ffebee;
  border-color: #f44336;
  color: #c62828;
}

.price-row{
  display:flex;
  justify-content: space-between;
  align-items:center;
  gap: 10px;
}
.label{
  color: var(--crave-muted);
  font-weight: 800;
  font-size: 12px;
}
.price{
  font-weight: 900;
  font-size: 22px;
  margin-top: 4px;
}

.qty{
  display:flex;
  align-items:center;
  gap: 10px;
  border: 1px solid var(--crave-border);
  border-radius: 16px;
  padding: 8px 10px;
  background:#fff;
}
.qty-btn{
  width: 34px;
  height: 34px;
  border-radius: 14px;
  border: 1px solid var(--crave-border);
  background: var(--crave-blue-2);
  font-weight: 900;
  font-size: 18px;
}
.qty-num{
  width: 20px;
  text-align:center;
  font-weight: 900;
}

.btn-primary.full{
  width: 100%;
  margin-top: 12px;
}
.hint{
  margin-top: 10px;
  text-align:center;
  color: var(--crave-muted);
  font-weight: 800;
  font-size: 12px;
}
</style>
