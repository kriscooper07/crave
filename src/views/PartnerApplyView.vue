<template>
  <div class="wrap">
    <div class="top">
      <button class="icon-btn" @click="router.back()">←</button>
      <div class="top-title">Apply</div>
      <div style="width:40px;"></div>
    </div>

    <div class="card">
      <div class="section-title">Owner info</div>

      <div class="label">Owner Name</div>
      <input class="input" v-model="form.ownerName" placeholder="Your name" />

      <div class="label" style="margin-top:12px;">Owner Phone</div>
      <input class="input" v-model="form.ownerPhone" placeholder="09xx xxx xxxx" />

      <div class="label" style="margin-top:12px;">Owner Email (optional)</div>
      <input class="input" v-model="form.ownerEmail" placeholder="you@email.com" />
    </div>

    <div class="card">
      <div class="section-title">Store info</div>

      <div class="label">Store Name</div>
      <input class="input" v-model="form.storeName" placeholder="CRAVE Burger - Santa Rosa" />

      <div class="label" style="margin-top:12px;">Category</div>
      <select class="input" v-model="form.storeCategory">
        <option>Food</option>
        <option>Drinks</option>
        <option>Dessert</option>
        <option>Grocery</option>
        <option>Other</option>
      </select>

      <div class="label" style="margin-top:12px;">Store Address</div>
      <textarea class="input" rows="3" v-model="form.storeAddress" placeholder="Street, barangay, city..."></textarea>

      <div class="label" style="margin-top:12px;">Store Phone</div>
      <input class="input" v-model="form.storePhone" placeholder="Store contact number" />

      <button class="btn-primary full" style="margin-top:12px;" @click="submit">
        Submit Application
      </button>

      <div class="hint" v-if="message">{{ message }}</div>
    </div>

    <div class="card" v-if="myApp">
      <div class="section-title">Your latest application</div>
      <div class="row">
        <span class="muted">Status</span>
        <span class="status" :class="myApp.status.toLowerCase()">{{ myApp.status }}</span>
      </div>
      <div class="row">
        <span class="muted">Store</span>
        <span class="strong">{{ myApp.storeName }}</span>
      </div>
      <button class="ghost full" @click="router.push('/partner/dashboard')">Go to dashboard</button>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePartnerStore } from '../stores/partner'
import { useUserStore } from '../stores/user'

const router = useRouter()
const partner = usePartnerStore()
const user = useUserStore()

const message = ref('')

const ownerKey = computed(() => {
  // UI-only identity key (no auth yet)
  const phone = (user.profile.phone || '').trim()
  const name = (user.profile.name || 'owner').trim().toLowerCase()
  return phone || name
})

const form = reactive({
  ownerName: user.profile.name || '',
  ownerPhone: user.profile.phone || '',
  ownerEmail: '',
  storeName: '',
  storeCategory: 'Food',
  storeAddress: user.profile.address || '',
  storePhone: '',
})

const myApp = computed(() => partner.myApplication(ownerKey.value))

function submit(){
  message.value = ''
  if (!form.ownerName.trim() || !form.ownerPhone.trim() || !form.storeName.trim() || !form.storeAddress.trim()) {
    message.value = 'Please fill Owner Name, Owner Phone, Store Name, and Store Address.'
    return
  }

  partner.submitApplication({
    ownerKey: ownerKey.value,
    ...form,
  })

  message.value = 'Submitted ✅ (Pending review)'
  router.push('/partner/dashboard')
}
</script>

<style scoped>
.wrap{ display:flex; flex-direction: column; gap: 14px; }
.top{ display:grid; grid-template-columns: 40px 1fr 40px; align-items:center; gap: 10px; }
.top-title{ text-align:center; font-weight: 900; }
.icon-btn{
  width: 40px; height: 40px; border-radius: 14px;
  border: 1px solid var(--crave-border); background:#fff; font-weight: 900;
}

.section-title{ font-weight: 900; margin-bottom: 10px; }
.label{ color: var(--crave-muted); font-weight: 900; font-size: 12px; margin-bottom: 6px; }

.full{ width:100%; }
.hint{ margin-top: 10px; text-align:center; color: var(--crave-muted); font-weight: 800; font-size: 12px; }

.row{ display:flex; justify-content: space-between; align-items:center; padding: 10px 0; border-top: 1px solid var(--crave-border); }
.muted{ color: var(--crave-muted); font-weight: 800; }
.strong{ font-weight: 900; }

.status{
  display:inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--crave-border);
  font-weight: 900;
  font-size: 12px;
}
.status.pending{ background:#fff; }
.status.approved{ background: var(--crave-blue-2); border-color: var(--crave-blue); }
.status.rejected{ background: #FEE2E2; border-color: #FCA5A5; }

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
