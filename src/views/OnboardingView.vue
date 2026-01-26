<template>
  <div class="wrap">
    <div class="top">
      <button class="skip" @click="finish">Skip</button>
    </div>

    <div class="card hero">
      <div class="emoji">{{ slides[i].emoji }}</div>
      <div class="title">{{ slides[i].title }}</div>
      <div class="sub">{{ slides[i].sub }}</div>

      <div class="dots">
        <span v-for="n in slides.length" :key="n" class="dot" :class="{ active: i === (n-1) }"></span>
      </div>

      <button class="btn-primary full" @click="next">
        {{ i === slides.length - 1 ? 'Get Started' : 'Next' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { setOnboardingDone } from '../utils/storage'

const router = useRouter()

const slides = [
  { emoji: '⚡', title: 'Fast ordering', sub: 'Find your cravings quickly with search and categories.' },
  { emoji: '🛒', title: 'Easy cart', sub: 'Adjust quantity, review totals, and checkout smoothly.' },
  { emoji: '📦', title: 'Track orders', sub: 'See your order status in one clean place.' },
]

const i = ref(0)

function next(){
  if (i.value < slides.length - 1) i.value += 1
  else finish()
}

function finish(){
  setOnboardingDone()
  router.push('/home')
}
</script>

<style scoped>
.wrap{ min-height: calc(100vh - 32px); display:flex; flex-direction: column; padding: 10px 4px; }
.top{ display:flex; justify-content:flex-end; }
.skip{
  border: 1px solid var(--crave-border);
  background:#fff;
  border-radius: 14px;
  padding: 10px 12px;
  font-weight: 900;
  color: var(--crave-muted);
}
.hero{
  margin-top: 18px;
  padding: 18px;
  border-radius: 20px;
  background: linear-gradient(180deg, var(--crave-blue-2), #fff);
  text-align:center;
}
.emoji{ font-size: 44px; }
.title{ margin-top: 10px; font-weight: 900; font-size: 20px; }
.sub{ margin-top: 8px; color: var(--crave-muted); font-weight: 700; }
.dots{ display:flex; justify-content:center; gap: 8px; margin: 14px 0 4px; }
.dot{ width: 8px; height: 8px; border-radius: 99px; background: var(--crave-border); }
.dot.active{ background: var(--crave-blue); }
.btn-primary.full{ width: 100%; margin-top: 12px; }
</style>
