export const ONBOARD_KEY = 'crave_onboarding_done_v1'

export function isOnboardingDone(){
  return localStorage.getItem(ONBOARD_KEY) === '1'
}

export function setOnboardingDone(){
  localStorage.setItem(ONBOARD_KEY, '1')
}
