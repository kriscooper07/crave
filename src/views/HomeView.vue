<template>
  <div class="home">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="hello">Hi, {{ displayName }} 👋</div>
        <div class="sub">What are you craving today?</div>
      </div>
      <button class="pill" @click="router.push('/profile')">
        <span class="pin">📍</span> Delivery
      </button>
      <button class="btn-primary" @click="$router.push('/partner')">
        Add your store
      </button>

    </div>

    <!-- Search -->
    <div class="search">
      <span class="sicon">🔎</span>
      <input class="input sfield" v-model="query" placeholder="Search food, drinks, desserts..." />
    </div>

    <!-- Categories -->
    <div class="cats">
      <button
        v-for="c in categories"
        :key="c.id"
        class="cat"
        :class="{ active: selectedCat === c.id }"
        @click="selectedCat = c.id"
      >
        <div class="cicon">{{ c.icon }}</div>
        <div class="cname">{{ c.name }}</div>
      </button>
    </div>

    <!-- Featured -->
    <div class="featured" @click="goFeatured" role="button">
      <div class="fleft">
        <div class="fbadge">FEATURED</div>
        <div class="ftitle">Free delivery today</div>
        <div class="fsub">On orders above ₱199</div>
      </div>
      <div class="fright">→</div>
    </div>

    <!-- Popular -->
    <div class="section">
      <div class="section-top">
        <div class="section-title">Popular</div>
        <button class="link" @click="selectedCat='all'; query=''">Reset</button>
      </div>

      <div v-if="filtered.length === 0" class="empty-state">
        <div class="empty-icon">🍽️</div>
        <div class="empty-title">No products available</div>
        <div class="empty-subtitle">Check back later or try a different search</div>
      </div>

      <div v-else class="grid">
        <button v-for="p in filtered" :key="p.id" class="product" @click="goDetails(p.id)">
          <div class="thumb">
            <img v-if="p.image" :src="p.image" :alt="p.name" @error="onImgError" />
            <div v-else class="no-image">{{ p.name.slice(0,1) }}</div>
          </div>
          <div class="pname">{{ p.name }}</div>
          <div class="pstore" @click.stop="goToStore(p.store.id)">{{ p.store?.name || 'Store' }}</div>
          <div class="meta">
            <span class="price">₱{{ p.price.toFixed(2) }}</span>
            <span class="category">{{ p.category }}</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { usePartnerStore } from '../stores/partner'

const categories = [
  { id: 'all', name: 'All', icon: '✨' },
  { id: 'food', name: 'Food', icon: '🍽️' },
  { id: 'drinks', name: 'Drinks', icon: '🧋' },
  { id: 'dessert', name: 'Dessert', icon: '🍰' },
  { id: 'general', name: 'General', icon: '📦' },
]

const router = useRouter()
const user = useUserStore()
const partner = usePartnerStore()

const query = ref('')
const selectedCat = ref('all')

const displayName = computed(() => (user.profile.name || 'Guest').split(' ')[0])

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  const availableProducts = partner.availableProducts

  return availableProducts.filter(p => {
    const matchCat = selectedCat.value === 'all' || p.category.toLowerCase() === selectedCat.value
    const matchQ = !q || p.name.toLowerCase().includes(q) || (p.store && p.store.name.toLowerCase().includes(q))
    return matchCat && matchQ
  })
})

function goDetails(id){ router.push(`/product/${id}`) }
function goFeatured(){
  const availableProducts = partner.availableProducts
  if (availableProducts.length > 0) {
    router.push(`/product/${availableProducts[0].id}`)
  }
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
.home{ display:flex; flex-direction: column; gap: 14px; }

.header{
  display:flex;
  justify-content: space-between;
  align-items:flex-start;
  gap: 10px;
}
.hello{ font-weight: 900; font-size: 18px; }
.sub{ margin-top: 4px; color: var(--crave-muted); font-weight: 700; font-size: 13px; }

.pill{
  border: 1px solid var(--crave-border);
  background:#fff;
  border-radius: 999px;
  padding: 10px 12px;
  font-weight: 900;
  color: var(--crave-text);
  display:flex;
  align-items:center;
  gap: 6px;
}
.pin{ opacity: .85; }

.search{ position: relative; }
.sicon{
  position:absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  opacity: .7;
}
.sfield{ padding-left: 38px; }

.cats{
  display:flex;
  gap: 10px;
  overflow:auto;
  padding-bottom: 4px;
}
.cat{
  min-width: 92px;
  border: 1px solid var(--crave-border);
  background:#fff;
  border-radius: 18px;
  padding: 10px 12px;
  text-align:left;
}
.cat.active{
  border-color: var(--crave-blue);
  background: var(--crave-blue-2);
}
.cicon{ font-size: 18px; }
.cname{ margin-top: 8px; font-weight: 900; color: var(--crave-text); font-size: 12px; }

.featured{
  border: 1px solid var(--crave-border);
  border-radius: 20px;
  padding: 16px;
  background: linear-gradient(180deg, var(--crave-blue-2), #fff);
  display:flex;
  justify-content: space-between;
  align-items:center;
  cursor: pointer;
}
.fbadge{
  display:inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  background:#fff;
  border: 1px solid var(--crave-border);
  font-weight: 900;
  font-size: 11px;
  color: var(--crave-muted);
}
.ftitle{ margin-top: 10px; font-size: 18px; font-weight: 900; }
.fsub{ margin-top: 4px; color: var(--crave-muted); font-weight: 700; }
.fright{ font-weight: 900; font-size: 18px; color: var(--crave-muted); }

.section-top{
  display:flex;
  justify-content: space-between;
  align-items:center;
}
.section-title{ font-weight: 900; font-size: 16px; }
.link{
  border:none;
  background:transparent;
  color: var(--crave-muted);
  font-weight: 900;
  text-decoration: underline;
}

.grid{
  margin-top: 10px;
  display:grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.empty-state{
  text-align: center;
  padding: 40px 20px;
  color: var(--crave-muted);
}
.empty-icon{ font-size: 48px; margin-bottom: 16px; }
.empty-title{ font-weight: 900; font-size: 18px; margin-bottom: 8px; }
.empty-subtitle{ font-size: 14px; }

.product{
  border: 1px solid var(--crave-border);
  background:#fff;
  border-radius: 20px;
  padding: 12px;
  text-align:left;
  transition: transform .08s ease;
}
.product:active{ transform: scale(0.98); }

.thumb{
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: var(--crave-blue-2);
  border: 1px solid var(--crave-border);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size: 20px;
  margin-bottom: 10px;
  overflow: hidden;
}
.thumb img{
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 15px;
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
  font-size: 18px;
}

.pname{ font-weight: 900; font-size: 14px; }
.pstore{
  margin-top: 4px;
  color: var(--crave-muted);
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.1s ease;
}

.pstore:hover {
  color: var(--crave-text);
}
.meta{
  margin-top: 10px;
  display:flex;
  justify-content: space-between;
  align-items:center;
  font-weight: 900;
  font-size: 12px;
}
.price{ color: var(--crave-text); }
.category{
  color: var(--crave-muted);
  background: var(--crave-blue-1);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  text-transform: uppercase;
}
</style>
