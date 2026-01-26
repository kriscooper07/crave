<template>
  <div class="wrap">
    <div class="top">
      <button class="icon-btn" @click="router.back()"><ArrowLeft class="ico" /></button>
      <div class="top-title">Login</div>
      <div style="width:40px;"></div>
    </div>

    <div class="card hero">
      <div class="big">🔐</div>
      <div class="title">Welcome Back</div>
      <div class="sub">Enter your phone number to continue</div>

      <!-- Phone Input Step -->
      <div v-if="!otpSent" class="form">
        <div class="input-group">
          <label class="label">Phone Number</label>
          <input
            v-model="phone"
            class="input"
            type="tel"
            placeholder="Enter your phone number"
            @keyup.enter="sendOTP"
          />
        </div>

        <button class="btn-primary full" @click="sendOTP" :disabled="!phone || loading">
          {{ loading ? 'Sending...' : 'Send OTP' }}
        </button>
      </div>

      <!-- OTP Input Step -->
      <div v-else class="form">
        <div class="otp-info">
          <div class="muted">OTP sent to {{ phone }}</div>
          <button class="link" @click="otpSent = false">Change number</button>
        </div>

        <div class="input-group">
          <label class="label">Enter OTP</label>
          <input
            v-model="otp"
            class="input otp-input"
            type="text"
            placeholder="000000"
            maxlength="6"
            @keyup.enter="verifyOTP"
          />
        </div>

        <button class="btn-primary full" @click="verifyOTP" :disabled="!otp || loading">
          {{ loading ? 'Verifying...' : 'Verify & Login' }}
        </button>

        <button class="ghost full" @click="resendOTP" :disabled="resendDisabled">
          {{ resendDisabled ? `Resend in ${countdown}s` : 'Resend OTP' }}
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

const phone = ref('')
const otp = ref('')
const otpSent = ref(false)
const loading = ref(false)
const error = ref('')
const message = ref('')
const resendDisabled = ref(false)
const countdown = ref(0)

onMounted(() => {
  // Redirect if already authenticated
  if (auth.isAuthenticated) {
    router.push('/home')
  }
})

async function sendOTP() {
  if (!phone.value) return

  loading.value = true
  error.value = ''
  message.value = ''

  try {
    const result = await auth.sendOTP(phone.value)
    if (result.success) {
      otpSent.value = true
      message.value = result.message
      startResendTimer()
    } else {
      error.value = result.message
    }
  } catch (err) {
    error.value = 'Failed to send OTP. Please try again.'
  }

  loading.value = false
}

async function verifyOTP() {
  if (!otp.value) return

  loading.value = true
  error.value = ''
  message.value = ''

  try {
    const result = await auth.verifyOTP(phone.value, otp.value)
    if (result.success) {
      message.value = result.message
      // Redirect after successful login
      setTimeout(() => {
        router.push('/home')
      }, 1000)
    } else {
      error.value = result.message
    }
  } catch (err) {
    error.value = 'Failed to verify OTP. Please try again.'
  }

  loading.value = false
}

async function resendOTP() {
  await sendOTP()
}

function startResendTimer() {
  resendDisabled.value = true
  countdown.value = 30

  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      resendDisabled.value = false
      clearInterval(timer)
    }
  }, 1000)
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
.otp-input{
  text-align: center;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 4px;
}

.otp-info{
  display:flex;
  justify-content: space-between;
  align-items:center;
  font-size: 14px;
}
.link{
  color: var(--crave-blue);
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
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

.ghost{
  background: transparent;
  color: var(--crave-text);
  border: 1px solid var(--crave-border);
  padding: 12px 16px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
}
.ghost.full{ width: 100%; margin-top: 8px; }
.ghost:disabled{ opacity: 0.6; cursor: not-allowed; }

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