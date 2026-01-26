import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/theme.css'

// Initialize stores
import { useAuthStore } from './stores/auth'
import { useUserDataStore } from './stores/userData'

createApp(App).use(createPinia()).use(router).mount('#app')

// Initialize stores after Pinia is ready
const auth = useAuthStore()
const userData = useUserDataStore()
