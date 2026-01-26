<template>
  <div class="store-view">
    <div class="store-header">
      <button @click="router.back()" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <div class="store-info">
        <h1>{{ store?.name || 'Store' }}</h1>
        <p>{{ store?.category || 'Food' }} • {{ availableProducts.length }} items available</p>
      </div>
    </div>

    <div v-if="storeProducts.length === 0" class="empty-state">
      <div class="empty-icon">🏪</div>
      <div class="empty-title">No products available</div>
      <div class="empty-subtitle">This store doesn't have any products yet</div>
    </div>

    <div v-else class="products-section">
      <h2>Menu</h2>
      <div class="products-grid">
        <div
          v-for="product in storeProducts"
          :key="product.id"
          class="product-card"
          :class="{ unavailable: !product.isAvailable }"
          @click="goToProduct(product.id)"
        >
          <div class="product-image">
            <img
              v-if="product.image"
              :src="product.image"
              :alt="product.name"
              @error="onImgError"
            />
            <div v-else class="no-image">{{ product.name.slice(0,1) }}</div>
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="price">₱{{ product.price.toFixed(2) }}</p>
            <p class="category">{{ product.category }}</p>
            <div class="availability" :class="{ available: product.isAvailable }">
              {{ product.isAvailable ? 'Available' : 'Unavailable' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePartnerStore } from '../stores/partner'

const route = useRoute()
const router = useRouter()
const partner = usePartnerStore()

const storeId = route.params.id

const store = computed(() =>
  partner.stores.find(s => s.id === storeId)
)

const storeProducts = computed(() =>
  partner.productsByStore(storeId.value)
)

const availableProducts = computed(() =>
  storeProducts.value.filter(p => p.isAvailable)
)

function goToProduct(productId) {
  router.push(`/product/${productId}`)
}

function onImgError(e) {
  e.target.style.display = 'none'
  e.target.nextElementSibling.style.display = 'flex'
}
</script>

<style scoped>
.store-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.store-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--crave-border);
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--crave-border);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.back-btn:active {
  transform: scale(0.95);
}

.store-info h1 {
  font-size: 24px;
  font-weight: 900;
  margin: 0;
  color: var(--crave-text);
}

.store-info p {
  margin: 4px 0 0 0;
  color: var(--crave-muted);
  font-weight: 700;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--crave-muted);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-title {
  font-weight: 900;
  font-size: 20px;
  margin-bottom: 8px;
}

.empty-subtitle {
  font-size: 16px;
}

.products-section h2 {
  font-size: 20px;
  font-weight: 900;
  margin-bottom: 16px;
  color: var(--crave-text);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.product-card {
  border: 1px solid var(--crave-border);
  border-radius: 16px;
  padding: 16px;
  background: #fff;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-card:active {
  transform: scale(0.98);
}

.product-card.unavailable {
  opacity: 0.6;
}

.product-image {
  width: 100%;
  height: 120px;
  border-radius: 12px;
  background: var(--crave-blue-2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--crave-blue-2);
  color: var(--crave-text);
  font-weight: 900;
  font-size: 32px;
}

.product-info h3 {
  font-size: 16px;
  font-weight: 900;
  margin: 0 0 4px 0;
  color: var(--crave-text);
}

.price {
  font-size: 18px;
  font-weight: 900;
  color: var(--crave-text);
  margin: 0 0 4px 0;
}

.category {
  font-size: 12px;
  color: var(--crave-muted);
  font-weight: 700;
  margin: 0 0 8px 0;
  text-transform: uppercase;
}

.availability {
  font-size: 12px;
  font-weight: 900;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: uppercase;
}

.availability.available {
  background: #e8f5e8;
  color: #2e7d32;
}

.availability:not(.available) {
  background: #ffebee;
  color: #c62828;
}
</style>