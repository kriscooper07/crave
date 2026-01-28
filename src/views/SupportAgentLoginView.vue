<template>
  <div class="wrap">
    <div class="top">
      <button class="icon-btn" @click="router.back()"><ArrowLeft class="ico" /></button>
      <div class="top-title">Support Agent Login</div>
      <div style="width:40px;"></div>
    </div>

    <div class="card hero">
      <div class="logo-container">
        <img src="/src/assets/crave-logo.svg" alt="CRAVE" class="logo" />
      </div>
      <div class="big">🎧</div>
      <div class="title">Support Agent Portal</div>
      <div class="sub">Enter your agent credentials to continue</div>

      <!-- Agent Login Form -->
      <div class="form">
        <div class="input-group">
          <label class="label">Agent ID</label>
          <input
            v-model="agentId"
            class="input"
            type="text"
            placeholder="Enter your agent ID"
            @keyup.enter="loginAgent"
          />
        </div>

        <div class="input-group">
          <label class="label">Password</label>
          <input
            v-model="password"
            class="input"
            type="password"
            placeholder="Enter your password"
            @keyup.enter="loginAgent"
          />
        </div>

        <button class="btn-primary full" @click="loginAgent" :disabled="!agentId || !password || loading">
          {{ loading ? 'Logging in...' : 'Login as Agent' }}
        </button>
      </div>

      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="message" class="success">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const agentId = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const message = ref('')

onMounted(() => {
  // Redirect if already authenticated as agent
  if (auth.isAuthenticated && auth.currentUser?.role === 'support_agent') {
    router.push('/support/dashboard')
  }
  // Redirect consumers to main app
  else if (auth.isAuthenticated && auth.currentUser?.role !== 'support_agent') {
    router.push('/home')
  }
})

async function loginAgent() {
  if (!agentId.value || !password.value) return

  loading.value = true
  error.value = ''
  message.value = ''

  try {
    const result = await auth.loginSupportAgent(agentId.value, password.value)
    if (result.success) {
      message.value = result.message
      // Redirect to support dashboard
      setTimeout(() => {
        router.push('/support/dashboard')
      }, 1000)
    } else {
      error.value = result.message
    }
  } catch (err) {
    error.value = 'Login failed. Please try again.'
  }

  loading.value = false
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

.hero{
  width: 100%;
  max-width: 480px;
  margin: 20px auto;
  text-align:center;
  border-radius: 24px;
  background: linear-gradient(180deg, var(--crave-blue-2), #fff);
  padding: 24px;
}
.logo-container{
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}
.logo{
  height: 80px;
  width: 80px;
  border-radius: 50%;
}
.big{ font-size: 48px; margin-bottom: 16px; }
.title{ font-weight: 900; font-size: 24px; margin-bottom: 8px; }
.sub{ color: var(--crave-muted); font-weight: 700; margin-bottom: 24px; }

.form{ display:flex; flex-direction: column; gap: 16px; }

.input-group{ text-align:left; }
.label{
  display:block;
  font-weight: 900;
  font-size: 14px;
  margin-bottom: 8px;
}
.input{
  width: 100%;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid var(--crave-border);
  outline: none;
  font-size: 16px;
}

.btn-primary{
  background: var(--crave-blue);
  color: white;
  border: none;
  padding: 14px 16px;
  border-radius: 14px;
  font-weight: 900;
  font-size: 16px;
  cursor: pointer;
}
.btn-primary:disabled{ opacity: 0.6; cursor: not-allowed; }
.btn-primary.full{ width: 100%; }

.error{
  color: #ef4444;
  font-weight: 700;
  font-size: 14px;
  margin-top: 8px;
}
.success{
  color: #22c55e;
  font-weight: 700;
  font-size: 14px;
  margin-top: 8px;
}
</style>