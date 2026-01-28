import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import SplashView from '../views/SplashView.vue'
import OnboardingView from '../views/OnboardingView.vue'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import ProductDetailsView from '../views/ProductDetailsView.vue'
import CartView from '../views/CartView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import OrdersView from '../views/OrdersView.vue'
import OrderDetailsView from '../views/OrderDetailsView.vue'
import OrderSuccessView from '../views/OrderSuccessView.vue'
import ProfileView from '../views/ProfileView.vue'
import PartnerLandingView from '../views/PartnerLandingView.vue'
import PartnerApplyView from '../views/PartnerApplyView.vue'
import PartnerDashboardView from '../views/PartnerDashboardView.vue'
import AdminView from '../views/AdminView.vue'
import StoreView from '../views/StoreView.vue'
import AdminSupportView from '../views/AdminSupportView.vue'
import SupportAgentLoginView from '../views/SupportAgentLoginView.vue'



const routes = [
  { path: '/', name: 'Splash', component: SplashView, meta: { hideNav: true } },
  { path: '/onboarding', name: 'Onboarding', component: OnboardingView, meta: { hideNav: true } },
  { path: '/login', name: 'Login', component: LoginView, meta: { hideNav: true } },

  { path: '/home', name: 'Home', component: HomeView, meta: { requiresAuth: true } },
  { path: '/product/:id', name: 'ProductDetails', component: ProductDetailsView, meta: { requiresAuth: true } },
  { path: '/cart', name: 'Cart', component: CartView, meta: { requiresAuth: true } },
  { path: '/checkout', name: 'Checkout', component: CheckoutView, meta: { requiresAuth: true } },
  { path: '/orders', name: 'Orders', component: OrdersView, meta: { requiresAuth: true } },
  { path: '/orders/:id', name: 'OrderDetails', component: OrderDetailsView, meta: { requiresAuth: true } },
  { path: '/order-success/:orderId', name: 'OrderSuccess', component: OrderSuccessView, meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/partner', name: 'PartnerLanding', component: PartnerLandingView, meta: { hideNav: true } },
  { path: '/partner/apply', name: 'PartnerApply', component: PartnerApplyView, meta: { hideNav: true } },
  { path: '/partner/dashboard', name: 'PartnerDashboard', component: PartnerDashboardView, meta: { hideNav: true } },
  { path: '/store/:id', name: 'Store', component: StoreView, meta: { requiresAuth: true } },
  { path: '/admin', name: 'Admin', component: AdminView, meta: { hideNav: true } },

  // Support Agent Routes
  { path: '/support/login', name: 'SupportAgentLogin', component: SupportAgentLoginView, meta: { hideNav: true } },
  { path: '/support/dashboard', name: 'SupportAgentDashboard', component: AdminSupportView, meta: { hideNav: true, agentOnly: true } },

  { path: '/:pathMatch(.*)*', name: 'NotFound', redirect: '/' },
]


const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // Support agent routes
  if (to.meta.agentOnly) {
    if (!auth.isAuthenticated || auth.currentUser?.role !== 'support_agent') {
      next('/support/login')
    } else {
      next()
    }
    return
  }

  // Consumer routes - block support agents from accessing consumer app
  if (to.meta.requiresAuth && auth.isAuthenticated && auth.currentUser?.role === 'support_agent') {
    next('/support/dashboard')
    return
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    // Redirect to login if trying to access protected route without auth
    next('/login')
  } else if (to.path === '/login' && auth.isAuthenticated && auth.currentUser?.role !== 'support_agent') {
    // Redirect to home if trying to access login while already authenticated as consumer
    next('/home')
  } else if (to.path === '/support/login' && auth.isAuthenticated && auth.currentUser?.role === 'support_agent') {
    // Redirect to support dashboard if trying to access agent login while already authenticated as agent
    next('/support/dashboard')
  } else {
    next()
  }
})

export default router
