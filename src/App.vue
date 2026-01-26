<template>
  <div class="crave-container">
    <main class="content">
      <RouterView v-slot="{ Component, route }">
        <Transition name="route" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
    </main>

    <BottomNav v-if="!hideNav" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()
const hideNav = computed(() => route.meta?.hideNav === true)
</script>

<style scoped>
.content{
  padding: 16px;
  padding-bottom: 92px; /* space for bottom nav */
  min-height: 100vh;
}

/* Route transitions */
.route-enter-active,
.route-leave-active{
  transition: opacity .18s ease, transform .18s ease;
}
.route-enter-from{
  opacity: 0;
  transform: translateY(8px);
}
.route-leave-to{
  opacity: 0;
  transform: translateY(-6px);
}
</style>
