<template>
  <nav class="nav">
    <RouterLink class="item" to="/home" :class="{ active: isActive('/home') }">
      <Home class="ico" />
      <span>Home</span>
    </RouterLink>

    <RouterLink class="item" to="/cart" :class="{ active: isActive('/cart') }">
      <span class="ico-wrap">
        <ShoppingCart class="ico" />
        <span v-if="cart.count" class="badge">{{ cart.count }}</span>
      </span>
      <span>Cart</span>
    </RouterLink>

    <RouterLink class="item" to="/orders" :class="{ active: isActive('/orders') }">
      <ClipboardList class="ico" />
      <span>Orders</span>
    </RouterLink>

    <RouterLink class="item" to="/profile" :class="{ active: isActive('/profile') }">
      <User class="ico" />
      <span>Profile</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { Home, ShoppingCart, ClipboardList, User } from 'lucide-vue-next'

const route = useRoute()
const cart = useCartStore()
const isActive = (path) => route.path === path
</script>

<style scoped>
.nav{
  position: sticky;
  bottom: 0;
  background: #fff;
  border-top: 1px solid var(--crave-border);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 10px 10px 14px;
}

.item{
  display:flex;
  flex-direction: column;
  align-items:center;
  gap: 6px;
  font-size: 12px;
  color: var(--crave-muted);
  font-weight: 800;
}

.ico{ width: 20px; height: 20px; }
.ico-wrap{ position: relative; display:inline-flex; }

.badge{
  position:absolute;
  top: -8px;
  right: -10px;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--crave-blue);
  color: #fff;
  font-size: 11px;
  font-weight: 900;
  display:flex;
  align-items:center;
  justify-content:center;
  border: 2px solid #fff;
}

.active{ color: var(--crave-text); }
.active .ico{ color: var(--crave-blue); }

/* Dark-mode friendly */
:root[data-theme="dark"] .nav{
  background: rgba(11,18,32,0.95);
}
</style>
