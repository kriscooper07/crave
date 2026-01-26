<template>
  <div class="wrap">
    <div class="top">
      <button class="icon-btn" @click="router.back()">←</button>
      <div class="top-title">CRAVE Partner</div>
      <div style="width:40px;"></div>
    </div>

    <div class="card hero">
      <div class="title">Add your store to CRAVE</div>
      <div class="sub">Reach more customers and manage your menu easily.</div>

      <div class="grid">
        <div class="mini">
          <div class="mini-title">1) Apply</div>
          <div class="mini-sub">Submit store details for review</div>
        </div>
        <div class="mini">
          <div class="mini-title">2) Get approved</div>
          <div class="mini-sub">Admin approves your listing</div>
        </div>
        <div class="mini">
          <div class="mini-title">3) Add products</div>
          <div class="mini-sub">Manage menu in dashboard</div>
        </div>
        <div class="mini">
          <div class="mini-title">4) Receive orders</div>
          <div class="mini-sub">Backend later (UI now)</div>
        </div>
      </div>

      <button class="btn-primary full" @click="router.push('/partner/apply')">
        Apply your store
      </button>
      <button class="ghost full" @click="router.push('/partner/dashboard')">
        Go to dashboard
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.wrap{ display:flex; flex-direction: column; gap: 14px; }
.top{ display:grid; grid-template-columns: 40px 1fr 40px; align-items:center; gap: 10px; }
.top-title{ text-align:center; font-weight: 900; }
.icon-btn{
  width: 40px; height: 40px; border-radius: 14px;
  border: 1px solid var(--crave-border); background:#fff; font-weight: 900;
}

.hero{
  border-radius: 24px;
  background: linear-gradient(180deg, var(--crave-blue-2), #fff);
}
.title{ font-weight: 900; font-size: 18px; }
.sub{ margin-top: 8px; color: var(--crave-muted); font-weight: 700; }

.grid{
  margin-top: 14px;
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.mini{
  border: 1px solid var(--crave-border);
  border-radius: 18px;
  padding: 12px;
  background:#fff;
}
.mini-title{ font-weight: 900; }
.mini-sub{ margin-top: 4px; color: var(--crave-muted); font-weight: 700; font-size: 12px; }

.full{ width:100%; }
.btn-primary{ margin-top: 14px; }
.ghost{
  margin-top: 10px;
  border: 1px solid var(--crave-border);
  background:#fff;
  border-radius: 14px;
  padding: 12px 14px;
  font-weight: 900;
  color: var(--crave-muted);
}
</style>
