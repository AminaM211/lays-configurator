import * as THREE from 'three'
import './style.css'
import { createUI } from './ui'
import axios from 'axios'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import laysLogo from './assets/lays.png' // zorg dat dit bestand bestaat

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
camera.position.set(-1, 3, 4)
scene.add(camera)

// orbit controls (muis)
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.enablePan = true
controls.enableZoom = true
controls.target.set(0, 1, 0)
controls.update()

// licht
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(2, 4, 5)
scene.add(light)

const ambient = new THREE.AmbientLight(0xffffff, 0.4)
scene.add(ambient)

// chipszak als box, met verschillende materialen per vlak
const geometry = new THREE.BoxGeometry(1.2, 2, 0.4)

// basis materiaal voor zijkanten
const sideMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff' })
// front materiaal (hier komt canvas texture op)
const frontMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff' })
// back materiaal (vast design / andere kleur)
const backMaterial = new THREE.MeshStandardMaterial({ color: '#f0f0f0' })

// volgorde faces: 0=right,1=left,2=top,3=bottom,4=front,5=back
const bag = new THREE.Mesh(geometry, [
  sideMaterial,             // right
  sideMaterial.clone(),     // left
  sideMaterial.clone(),     // top
  sideMaterial.clone(),     // bottom
  frontMaterial,            // front (design)
  backMaterial              // back (vast)
])
bag.position.y = 1
scene.add(bag)

// configuratie object dat naar je API gaat
const config = {
  name: '',
  image: 'https://example.com/chips.png', // wordt overschreven door upload/info
  bagColor: '#f2f2f2',
  font: 'Helvetica',
  pattern: 'none',
  keyFlavours: []
}

let textTexture = null

// logo als Image zodat we hem kunnen tekenen in canvas
const logoImg = new Image()
let logoLoaded = false
logoImg.src = laysLogo
logoImg.onload = () => {
  logoLoaded = true
  updateBagTexture() // eerste keer tekenen zodra logo geladen is
}

function updateBagTexture() {
  if (!logoLoaded) return

  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')

  // achtergrond = gekozen kleur
  ctx.fillStyle = config.bagColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Lays logo
  const logoWidth = 300
  const logoHeight = 300
  ctx.drawImage(
    logoImg,
    canvas.width / 2 - logoWidth / 2,
    120, // Y-positie logo
    logoWidth,
    logoHeight
  )

  // NAAM
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.font = 'bold 70px Helvetica'
  ctx.fillText(config.name || '', canvas.width / 2, 500)

  // FLAVOURS
  ctx.font = '40px Helvetica'
  const flavoursText = config.keyFlavours.join(', ')
  ctx.fillText(flavoursText, canvas.width / 2, 580)

  // oude texture opruimen
  if (textTexture) {
    textTexture.dispose()
  }

  textTexture = new THREE.CanvasTexture(canvas)
  textTexture.needsUpdate = true

  // alleen op FRONT face (index 4)
  const frontMat = bag.material[4]
  frontMat.map = textTexture
  frontMat.needsUpdate = true
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

  // file input: voor nu gebruiken we alleen de bestandsnaam als info
  if (imageInput.files && imageInput.files[0]) {
    config.image = imageInput.files[0].name
  }

  let flavourText = flavoursInput.value.slice(0, 60) // max 40 chars
  flavoursInput.value = flavourText // update input UI
  
  config.keyFlavours = flavourText
    .split(',')
    .map((f) => f.trim())
    .filter((f) => f)
  

  // zijkanten meekleuren met bagColor (0–3), front/back apart
  for (let i = 0; i < 4; i++) {
    bag.material[i].color.set(config.bagColor)
  }

  // front krijgt kleur via texture, back blijft vaste kleur (#f0f0f0)

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
  controls.update()
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
