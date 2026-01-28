<template>
  <div class="wrap">
    <div class="logo">
      <div class="mark">C</div>
      <div class="brand">
        <div class="name">CRAVE</div>
        <div class="tag">Order what you love</div>
      </div>
    </div>

    <div class="footer">
      <button class="btn-primary" @click="goNext">Get Started</button>
      <div class="hint">Light blue • White • Black/Gray accents</div>
      <button class="agent-link" @click="goToAgentLogin">Support Agent Login</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { isOnboardingDone } from '../utils/storage'

const router = useRouter()
const auth = useAuthStore()

function goNext(){
  if (auth.isAuthenticated) {
    router.push('/home')
  } else {
    router.push('/login')
  }
}

function goToAgentLogin(){
  router.push('/support/login')
}
</script>

<style scoped>
.wrap{
  min-height: calc(100vh - 32px);
  display:flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 4px;
}

.logo{
  margin-top: 56px;
  display:flex;
  align-items:center;
  gap: 14px;
  justify-content:center;
}

.mark{
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background: var(--crave-blue);
  color: white;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size: 28px;
  font-weight: 900;
}

.brand .name{
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 1px;
}

.brand .tag{
  margin-top: 4px;
  color: var(--crave-muted);
  font-weight: 700;
  font-size: 13px;
}

.footer{
  display:flex;
  flex-direction: column;
  gap: 10px;
}

.hint{
  text-align:center;
  color: var(--crave-muted);
  font-size: 12px;
  font-weight: 700;
}

.agent-link{
  background: transparent;
  color: var(--crave-blue);
  border: 1px solid var(--crave-blue);
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.agent-link:hover{
  background: var(--crave-blue);
  color: white;
}
</style>
