// src/main.js
import * as THREE from 'three'
import './style.css'
import { createUI } from './ui'
import axios from 'axios'

const app = document.querySelector('#app')

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
app.appendChild(renderer.domElement)

// scene + camera
const scene = new THREE.Scene()
scene.background = new THREE.Color('#f5f5f5')

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
)
camera.position.set(0, 1.5, 4)
scene.add(camera)

// licht
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(2, 4, 5)
scene.add(light)

const ambient = new THREE.AmbientLight(0xffffff, 0.4)
scene.add(ambient)

// chipszak als box
const geometry = new THREE.BoxGeometry(1.2, 2, 0.4)
// kleur laten we wit, omdat we kleur via texture doen
const material = new THREE.MeshStandardMaterial({ color: '#ffffff' })
const bag = new THREE.Mesh(geometry, material)
scene.add(bag)

// configuratie object dat naar je API gaat
const config = {
  name: '',
  image: 'https://example.com/chips.png', // file upload doen we later mooi
  bagColor: '#f2f2f2',
  font: 'Helvetica',
  pattern: 'none',
  keyFlavours: []
}

let textTexture = null

function updateBagTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  // achtergrond = gekozen kleur
  ctx.fillStyle = config.bagColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // tekst instellingen
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'

  // naam
  ctx.font = 'bold 50px Helvetica'
  ctx.fillText(config.name || '', canvas.width / 2, canvas.height / 2 - 20)

  // flavours
  ctx.font = '24px Helvetica'
  const flavoursText = config.keyFlavours.join(', ')
  ctx.fillText(flavoursText, canvas.width / 2, canvas.height / 2 + 30)

  // oude texture opruimen
  if (textTexture) {
    textTexture.dispose()
  }

  textTexture = new THREE.CanvasTexture(canvas)
  textTexture.needsUpdate = true

  bag.material.map = textTexture
  bag.material.needsUpdate = true
}

function updateConfig() {
  const nameInput = document.querySelector('#bag-name')
  const colorInput = document.querySelector('#bag-color')
  const fontSelect = document.querySelector('#bag-font')
  const imageInput = document.querySelector('#bag-image')
  const flavoursInput = document.querySelector('#bag-flavours')

  if (!nameInput || !colorInput || !fontSelect || !imageInput || !flavoursInput) {
    console.warn('UI elements not found, check ids in ui.js')
    return
  }

  config.name = nameInput.value
  config.bagColor = colorInput.value
  config.font = fontSelect.value

  // file input: voor nu alleen API-info, we gebruiken de file nog niet als texture
  if (imageInput.files && imageInput.files[0]) {
    config.image = imageInput.files[0].name
  }

  config.keyFlavours = flavoursInput.value
    .split(',')
    .map((f) => f.trim())
    .filter((f) => f)

  // update texture (kleur + tekst)
  updateBagTexture()
}

async function saveToAPI() {
  const TOKEN =
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MjA1YmExMDc2YTg5YmQwMjI3ZWU2YiIsInJvbGUiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwiaWF0IjoxNzYzNzI5NDA1LCJleHAiOjE3NjM3NDM4MDV9.n8Ip5mYDYfFha1ouT2c1FsMMg4ETD86ai0oIaMEup2s'

  try {
    await axios.post('http://localhost:4000/api/v1/bag', config, {
      headers: {
        Authorization: TOKEN
      }
    })
    alert('Saved! Check admin panel.')
  } catch (err) {
    console.error(err)
    alert('Error saving.')
  }
}

// animatie
function animate() {
  requestAnimationFrame(animate)
  bag.rotation.y += 0.01
  renderer.render(scene, camera)
}
animate()

// responsive
window.addEventListener('resize', () => {
  const w = window.innerWidth
  const h = window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
})

// UI aanmaken
createUI(updateConfig, saveToAPI)

// eerste draw zodat kleur en tekst vanaf start kloppen
updateConfig()
