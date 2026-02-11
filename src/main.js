import './style.css'
import { supabase } from './supabase.js'
import confetti from 'canvas-confetti'

// --- State and Identification ---
const STORAGE_KEY = 'val_user_id'
let userId = localStorage.getItem(STORAGE_KEY)
if (!userId) {
  userId = crypto.randomUUID()
  localStorage.setItem(STORAGE_KEY, userId)
}

let yesClicks = 0
let noClicks = 0
let currentScale = 1
let hasSubmittedMessage = false

// --- DOM Elements ---
const yesBtn = document.getElementById('yes-btn')
const noBtn = document.getElementById('no-btn')
const mainSection = document.getElementById('main-section')
const outcomeSection = document.getElementById('outcome-section')
const bgContainer = document.getElementById('bg-animation')
const messageInput = document.getElementById('val-message')
const submitBtn = document.getElementById('submit-msg')
const feedback = document.getElementById('feedback')

// --- Background Animation ---
const emojis = ['🌸', '❤️', '🌹', '💖', '💐', '✨']
function createFloatingElement() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const el = document.createElement('div')
  el.className = 'floating-element'
  el.innerText = emojis[Math.floor(Math.random() * emojis.length)]
  el.style.left = Math.random() * 100 + 'vw'
  el.style.animationDuration = Math.random() * 5 + 10 + 's'
  el.style.fontSize = Math.random() * 20 + 20 + 'px'

  bgContainer.appendChild(el)

  el.addEventListener('animationend', () => {
    el.remove()
  })
}

setInterval(createFloatingElement, 1500)
for (let i = 0; i < 10; i++) {
  setTimeout(createFloatingElement, Math.random() * 5000)
}

// --- Interaction Logic ---

// NO Button: Moves away on click
noBtn.addEventListener('click', (e) => {
  noClicks++
  updateClicks(0, 1)

  // Escape the container to prevent positioning bugs
  if (noBtn.parentElement !== document.body) {
    document.body.appendChild(noBtn)
  }

  // Calculate new position
  const moveDist = 150
  const angle = Math.random() * 2 * Math.PI

  // Get current position
  const rect = noBtn.getBoundingClientRect()
  let newX = rect.left + Math.cos(angle) * moveDist
  let newY = rect.top + Math.sin(angle) * moveDist

  // Clamp to viewport
  const padding = 40
  newX = Math.max(padding, Math.min(newX, window.innerWidth - rect.width - padding))
  newY = Math.max(padding, Math.min(newY, window.innerHeight - rect.height - padding))

  noBtn.style.position = 'fixed'
  noBtn.style.left = `${newX}px`
  noBtn.style.top = `${newY}px`
  noBtn.style.margin = '0'
  noBtn.style.zIndex = '10' // Behind the growing yes button

  // Exponential growth for YES button
  currentScale = currentScale * 1.6 + 0.2
  yesBtn.style.transform = `scale(${currentScale})`

  if (currentScale > 1.1) {
    document.querySelector('.container').style.zIndex = '1000'
    yesBtn.style.zIndex = '1000' // High enough to cover No button
  }
})

// YES Button: Outcome
yesBtn.addEventListener('click', async () => {
  yesClicks++
  await updateClicks(1, 0)

  // Trigger Confetti
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#ff477e', '#ff85a1', '#fbb1bd', '#ffffff']
  })

  // Transition UI
  mainSection.style.display = 'none'
  outcomeSection.style.display = 'block'
  noBtn.style.display = 'none' // Hide the No button for good

  // Check if already submitted
  checkExistingMessage()
})

// Submit Message
submitBtn.addEventListener('click', async () => {
  const message = messageInput.value.trim()
  if (!message) return
  if (hasSubmittedMessage) return

  submitBtn.disabled = true
  submitBtn.innerText = 'Sending...'

  try {
    const { error } = await supabase
      .from('interactions')
      .update({ message })
      .eq('user_id', userId)

    if (error) throw error

    hasSubmittedMessage = true
    feedback.innerText = "Message sent! ✨"
    submitBtn.innerText = 'Sent!'
  } catch (err) {
    console.error(err)
    feedback.innerText = "Couldn't send message. Try again?"
    submitBtn.disabled = false
    submitBtn.innerText = 'Send'
  }
})

// --- Supabase Integration ---

async function updateClicks(yesInc = 0, noInc = 0) {
  try {
    console.log('Syncing clicks...', { userId, yesClicks, noClicks, yesInc, noInc });

    const { error: upsertError } = await supabase
      .from('interactions')
      .upsert(
        { user_id: userId, yes_clicks: yesClicks, no_clicks: noClicks },
        { onConflict: 'user_id' }
      );

    if (upsertError) throw upsertError;

    const { error: rpcError } = await supabase.rpc('increment_global_stats', { yes_inc: yesInc, no_inc: noInc });
    if (rpcError) throw rpcError;

    console.log('✅ Sync successful');
  } catch (err) {
    console.error('❌ Data error:', err);
  }
}

async function checkExistingMessage() {
  try {
    const { data, error } = await supabase
      .from('interactions')
      .select('message')
      .eq('user_id', userId)
      .single()

    if (data && data.message) {
      hasSubmittedMessage = true
      messageInput.value = data.message
      messageInput.disabled = true
      submitBtn.disabled = true
      submitBtn.innerText = 'Sent!'
      feedback.innerText = "You've already sent a message ❤️"
    }
  } catch (err) {
    // Single might fail if user doesn't exist yet, which is fine
  }
}
