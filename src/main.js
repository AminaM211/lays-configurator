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
const backMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff' })

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
  bagColor: '#d32b2b',
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

  // 1) BASIS: volledige achtergrond in gekozen kleur
  ctx.fillStyle = config.bagColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 2) zachte gradient overlay
  const cx = canvas.width / 2
  const cy = canvas.height / 2
  const gradient = ctx.createRadialGradient(
    cx,cy,80,cx,cy,520
  )
  gradient.addColorStop(0, 'rgba(255,255,255,0.3)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 3) RINGEN (geen gradient, echte bogen)
  const centerX = canvas.width / 2
  const centerY = canvas.height   // centrum laag zetten, zoals op echte zak

  const bands = [
    { radius: 800, shade: -3, alpha: 0.2 },
    { radius: 700, shade: 3, alpha: 0.3 },
    { radius: 600, shade: -3, alpha: 0.4 },
    { radius: 500, shade: 3, alpha: 0.5 },
    { radius: 400, shade: -3, alpha: 0.4 }
  ]

  bands.forEach(band => {
    ctx.fillStyle = shadeColor(config.bagColor, band.shade)
    ctx.globalAlpha = band.alpha // Set transparency
    ctx.beginPath()
    // halve cirkel (boog) van links naar rechts
    ctx.arc(centerX, centerY, band.radius, Math.PI, 0)
    // onderkant dichtmaken tot buiten beeld
    ctx.lineTo(centerX + band.radius, canvas.height)
    ctx.lineTo(centerX - band.radius, canvas.height)
    ctx.closePath()
    ctx.fill()
  })

  ctx.globalAlpha = 1 // Reset transparency to default

  function shadeColor(color, percent) {
    const num = parseInt(color.slice(1), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = ((num >> 8) & 0x00ff) + amt
    const B = (num & 0x0000ff) + amt
    return (
      '#' +
      (0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255))
        .toString(16)
        .slice(1)
    )
  }
  
  // 3) LAYS LOGO
  const logoWidth = 500
  const logoHeight = 260
  ctx.drawImage(
    logoImg,
    canvas.width / 2 - logoWidth / 2,
    110,
    logoWidth,
    logoHeight
  )

  // 4) "Potato Chips" in wit, zonder donkere band
  ctx.fillStyle = 'white'
  ctx.font = 'bold 40px Helvetica'
  ctx.textAlign = 'center'
  ctx.fillText('Potato Chips', canvas.width / 2, 430)

  // 5) CUSTOM NAAM
  ctx.fillStyle = 'white'
  ctx.font = 'bold 80px Arial'
  ctx.letterSpacing = '2px'

  ctx.fillText(config.name || '', canvas.width / 2, 520)

  // 6) CUSTOM FLAVOURS
  ctx.font = '36px Helvetica'
  const flavoursText = config.keyFlavours.join(', ')
  ctx.fillText(flavoursText, canvas.width / 2, 580)

  // 7) KLEIN BADGE BOVEN HOEK (bv. “Limited” of gewoon een rondje)
  ctx.beginPath()
  ctx.ellipse(canvas.width - 160, canvas.height - 120, 100, 70, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.24)'
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.lineWidth = 8
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.10)'
  ctx.stroke()

  ctx.font = '10px Helvetica'
  ctx.textAlign = 'center'
  ctx.letterSpacing = '2px'

  ctx.fillText('MADE WITH', canvas.width - 160, canvas.height - 150)

  ctx.font = '30px Helvetica'
  ctx.textAlign = 'center'
  ctx.fillText('100%', canvas.width - 160, canvas.height - 120)

  ctx.font = '30px Helvetica'

  ctx.fillText('Quality', canvas.width - 160, canvas.height - 95)

  ctx.font = '10px Helvetica'
  ctx.fillText('INGREDIENTS', canvas.width - 160, canvas.height - 75)

  // 8) texture updaten (alleen front)
  if (textTexture) textTexture.dispose()

  textTexture = new THREE.CanvasTexture(canvas)
  textTexture.needsUpdate = true

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
  bag.material[5].color.set(config.bagColor)

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
