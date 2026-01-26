<template>
  <div class="wrap">
    <div class="card hero">
      <div class="big">✅</div>
      <div class="title">Order placed!</div>
      <div class="sub">Your order code is</div>
      <div class="code">#{{ code }}</div>

      <div class="actions">
        <button class="btn-primary full" @click="goOrder">View Order</button>
        <button class="ghost full" @click="goHome">Back to Home</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const id = computed(() => route.params.orderId)
const code = computed(() => String(id.value).slice(-6).toUpperCase())

function goOrder(){ router.push(`/orders/${id.value}`) }
function goHome(){ router.push('/home') }
</script>

<style scoped>
.wrap{
  min-height: 100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding: 16px;
}
.hero{
  width: 100%;
  max-width: 480px;
  text-align:center;
  border-radius: 24px;
  background: linear-gradient(180deg, var(--crave-blue-2), #fff);
}
.big{ font-size: 44px; }
.title{ margin-top: 10px; font-weight: 900; font-size: 20px; }
.sub{ margin-top: 8px; color: var(--crave-muted); font-weight: 700; }
.code{
  margin-top: 10px;
  font-weight: 900;
  font-size: 26px;
  letter-spacing: 2px;
}
.actions{ margin-top: 14px; display:flex; flex-direction: column; gap: 10px; }
.full{ width: 100%; }
.ghost{
  border: 1px solid var(--crave-border);
  background:#fff;
  border-radius: 14px;
  padding: 12px 14px;
  font-weight: 900;
  color: var(--crave-muted);
}

:root[data-theme="dark"] .ghost{
  background: rgba(255,255,255,0.06);
  color: var(--crave-text);
}
</style>
