<template>
  <div class="wrap">
    <div class="top">
      <button class="icon-btn" @click="router.push('/partner')">←</button>
      <div class="top-title">Store Dashboard</div>
      <button class="icon-btn" @click="router.push('/admin')">⚙</button>
    </div>

    <!-- Store Status -->
    <div v-if="!store" class="card">
      <div class="section-title">Store Status</div>
      <div v-if="!application" class="status pending">
        <div class="big">📝</div>
        <div class="info">
          <div class="title">Application Pending</div>
          <div class="sub">Your store application is being reviewed.</div>
        </div>
      </div>
      <div v-else-if="application.status === 'Rejected'" class="status rejected">
        <div class="big">❌</div>
        <div class="info">
          <div class="title">Application Rejected</div>
          <div class="sub">You can re-apply with updated information.</div>
        </div>
        <button class="btn-primary" @click="router.push('/partner/apply')">Re-apply</button>
      </div>
      <div v-else class="status pending">
        <div class="big">⏳</div>
        <div class="info">
          <div class="title">Store Setup Pending</div>
          <div class="sub">Your application was approved. Store setup in progress.</div>
        </div>
      </div>
    </div>

    <!-- Store Overview -->
    <div v-else class="card">
      <div class="section-title">Store Overview</div>
      <div class="overview">
        <div class="stat">
          <div class="number">{{ products.length }}</div>
          <div class="label">Products</div>
        </div>
        <div class="stat">
          <div class="number">{{ availableProducts }}</div>
          <div class="label">Available</div>
        </div>
        <div class="stat">
          <div class="number">{{ store.status }}</div>
          <div class="label">Status</div>
        </div>
      </div>
    </div>

    <!-- Store Info -->
    <div v-if="store" class="card">
      <div class="section-title">Store Information</div>
      <div class="store-info">
        <div class="info-row">
          <span class="label">Store Name:</span>
          <span class="value">{{ store.name }}</span>
        </div>
        <div class="info-row">
          <span class="label">Category:</span>
          <span class="value">{{ store.category }}</span>
        </div>
        <div class="info-row">
          <span class="label">Address:</span>
          <span class="value">{{ store.address }}</span>
        </div>
        <div class="info-row">
          <span class="label">Phone:</span>
          <span class="value">{{ store.phone }}</span>
        </div>
      </div>
    </div>

    <!-- Products Management -->
    <div v-if="store" class="card">
      <div class="section-title">Products</div>

      <!-- Add Product Form -->
      <div class="form">
        <div class="form-title">Add New Product</div>
        <div class="form-row">
          <input v-model="newProduct.name" class="input" placeholder="Product name" />
          <input v-model.number="newProduct.price" class="input" type="number" placeholder="Price" />
        </div>
        <div class="form-row">
          <select v-model="newProduct.category" class="input">
            <option value="Food">Food</option>
            <option value="Drinks">Drinks</option>
            <option value="Dessert">Dessert</option>
            <option value="General">General</option>
          </select>
          <input v-model="newProduct.image" class="input" placeholder="Image URL (optional)" />
        </div>
        <button class="btn-primary" @click="addProduct" :disabled="!canAddProduct">
          Add Product
        </button>
      </div>

      <!-- Products List -->
      <div v-if="products.length === 0" class="empty">
        No products yet. Add your first product above.
      </div>

      <div v-else class="products-list">
        <div v-for="product in products" :key="product.id" class="product-item">
          <div class="product-left">
            <img v-if="product.image" :src="product.image" :alt="product.name" class="product-img" @error="onImgError" />
            <div v-else class="product-no-img">{{ product.name.slice(0,1) }}</div>
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-category">{{ product.category }}</div>
            </div>
          </div>
          <div class="product-right">
            <div class="product-price">₱{{ product.price }}</div>
            <div class="product-status" :class="{ available: product.isAvailable, unavailable: !product.isAvailable }">
              {{ product.isAvailable ? 'Available' : 'Unavailable' }}
            </div>
            <div class="product-actions">
              <button class="action-btn toggle" @click="toggleProduct(product.id)">
                {{ product.isAvailable ? 'Disable' : 'Enable' }}
              </button>
              <button class="action-btn delete" @click="removeProduct(product.id)">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Store Settings -->
    <div v-if="store" class="card">
      <div class="section-title">Store Settings</div>
      <div class="settings">
        <div class="setting-item">
          <div class="setting-label">Store Status</div>
          <div class="setting-value">
            <select v-model="storeStatus" @change="updateStoreStatus" class="input">
              <option value="Active">Active</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePartnerStore } from '../stores/partner'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const partner = usePartnerStore()
const auth = useAuthStore()

const ownerKey = computed(() => auth.currentUser?.phone || '')
const application = computed(() => partner.myApplication(ownerKey.value))
const store = computed(() => partner.myStore(ownerKey.value))
const products = computed(() => store.value ? partner.productsByStore(store.value.id) : [])
const availableProducts = computed(() => products.value.filter(p => p.isAvailable).length)

const storeStatus = ref('Active')

const newProduct = reactive({
  name: '',
  price: '',
  category: 'Food',
  image: '',
})

const canAddProduct = computed(() => {
  return newProduct.name.trim() && Number(newProduct.price) > 0
})

onMounted(() => {
  if (store.value) {
    storeStatus.value = store.value.status
  }
})

function addProduct() {
  if (!store.value || !canAddProduct.value) return

  partner.addProduct(store.value.id, {
    name: newProduct.name.trim(),
    price: Number(newProduct.price),
    category: newProduct.category,
    image: newProduct.image.trim(),
  })

  // Reset form
  newProduct.name = ''
  newProduct.price = ''
  newProduct.category = 'Food'
  newProduct.image = ''
}

function toggleProduct(productId) {
  partner.toggleProductAvailability(productId)
}

function removeProduct(productId) {
  if (confirm('Are you sure you want to remove this product?')) {
    partner.removeProduct(productId)
  }
}

function updateStoreStatus() {
  if (store.value) {
    partner.setStoreStatus(store.value.id, storeStatus.value)
  }
}

function onImgError(e) {
  e.target.style.display = 'none'
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
  font-weight: 900;
}

.section-title{ font-weight: 900; margin-bottom: 10px; }
</style>
