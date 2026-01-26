<template>
  <div class="wrap">
    <div class="top">
      <button class="icon-btn" @click="router.back()">←</button>
      <div class="top-title">Admin</div>
      <div class="top-actions">
        <button class="icon-btn" @click="router.push('/admin/support')">💬</button>
        <button class="icon-btn" @click="refresh">↻</button>
      </div>
    </div>

    <div class="card">
      <div class="section-title">Store Applications</div>

      <div v-if="apps.length === 0" class="hint">No applications yet.</div>

      <div v-else class="list">
        <div class="app" v-for="a in apps" :key="a.id">
          <div class="head">
            <div class="name">{{ a.storeName }}</div>
            <div class="status" :class="a.status.toLowerCase()">{{ a.status }}</div>
          </div>

          <div class="meta">
            <div><span class="muted">Owner:</span> <b>{{ a.ownerName }}</b></div>
            <div><span class="muted">Phone:</span> <b>{{ a.ownerPhone }}</b></div>
            <div><span class="muted">Category:</span> <b>{{ a.storeCategory }}</b></div>
            <div><span class="muted">Address:</span> <b>{{ a.storeAddress }}</b></div>
          </div>

          <div class="actions">
            <button class="btn" :disabled="a.status==='Approved'" @click="partner.approveApplication(a.id)">
              Approve
            </button>
            <button class="btn danger" :disabled="a.status==='Rejected'" @click="partner.rejectApplication(a.id)">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="section-title">Stores</div>

      <div v-if="stores.length === 0" class="hint">No stores yet.</div>

      <div v-else class="list">
        <div class="store" v-for="s in stores" :key="s.id">
          <div>
            <div class="name">{{ s.name }}</div>
            <div class="muted">{{ s.category }} • {{ s.address }}</div>
          </div>

          <div class="right">
            <div class="status" :class="s.status.toLowerCase()">{{ s.status }}</div>
            <button class="btn" @click="toggleStore(s)">
              {{ s.status === 'Active' ? 'Disable' : 'Enable' }}
            </button>
          </div>
        </div>
      </div>

      <div class="note">Admin pages are UI-only. Backend roles/permissions later.</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePartnerStore } from '../stores/partner'

const router = useRouter()
const partner = usePartnerStore()

const apps = computed(() => partner.allApplications)
const stores = computed(() => partner.stores)

function toggleStore(s){
  partner.setStoreStatus(s.id, s.status === 'Active' ? 'Disabled' : 'Active')
}

function refresh(){
  // no-op in UI, but keeps button useful
}
</script>

<style scoped>
.wrap{ display:flex; flex-direction: column; gap: 14px; }
.top{ display:grid; grid-template-columns: 40px 1fr 80px; align-items:center; gap: 10px; }
.top-title{ text-align:center; font-weight: 900; }
.top-actions{ display:flex; gap: 4px; }
.icon-btn{
  width: 40px; height: 40px; border-radius: 14px;
  border: 1px solid var(--crave-border); background:#fff; font-weight: 900;
}

.section-title{ font-weight: 900; margin-bottom: 10px; }
.hint{ text-align:center; color: var(--crave-muted); font-weight: 800; font-size: 12px; }

.list{ display:flex; flex-direction: column; gap: 10px; }

.app{
  border: 1px solid var(--crave-border);
  border-radius: 18px;
  padding: 12px;
  background:#fff;
}
.head{ display:flex; justify-content: space-between; align-items:flex-start; gap: 10px; }
.name{ font-weight: 900; }
.meta{ margin-top: 8px; display:flex; flex-direction: column; gap: 6px; font-weight: 700; }
.muted{ color: var(--crave-muted); font-weight: 800; }

.status{
  display:inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--crave-border);
  font-weight: 900;
  font-size: 12px;
  white-space: nowrap;
}
.status.pending{ background:#fff; }
.status.approved, .status.active{ background: var(--crave-blue-2); border-color: var(--crave-blue); }
.status.rejected{ background: #FEE2E2; border-color: #FCA5A5; }
.status.disabled{ background:#F3F4F6; }

.actions{ margin-top: 12px; display:flex; gap: 10px; }
.btn{
  border: 1px solid var(--crave-border);
  background:#fff;
  border-radius: 14px;
  padding: 10px 12px;
  font-weight: 900;
}
.btn:disabled{ opacity: .5; }
.danger{ background:#FEE2E2; border-color:#FCA5A5; }

.store{
  border: 1px solid var(--crave-border);
  border-radius: 18px;
  padding: 12px;
  background:#fff;
  display:flex;
  justify-content: space-between;
  align-items:center;
  gap: 10px;
}
.right{ display:flex; flex-direction: column; align-items:flex-end; gap: 8px; }

.note{ margin-top: 10px; text-align:center; color: var(--crave-muted); font-weight: 700; font-size: 12px; }
</style>
