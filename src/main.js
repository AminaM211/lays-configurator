// src/main.js
import * as THREE from "three"
import "./style.css"
import { createUI } from "./ui"
import axios from "axios"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import laysLogo from "./assets/lays.png"

import backImg1 from "./assets/back-img1.png"
import backImg2 from "./assets/back-img2.png"

// --------------------------------------------------
// SETUP
// --------------------------------------------------
const app = document.querySelector("#app")

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
app.appendChild(renderer.domElement)

const scene = new THREE.Scene()
const textureLoader = new THREE.TextureLoader()

// camera
const camera = new THREE.PerspectiveCamera(
  window.innerWidth <= 800 ? 60 : 35,
  window.innerWidth / window.innerHeight,
  0.1,
  100
)
camera.position.set(-1, 2, 4)
scene.add(camera)

// controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05

// lights
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(2, 4, 5)
scene.add(light)
scene.add(new THREE.AmbientLight(0xffffff, 0.8))

// --------------------------------------------------
// BACKGROUND PLANE (small preview behind bag)
// --------------------------------------------------
const bgPlaneGeometry = new THREE.PlaneGeometry(8, 6)
const bgPlaneMaterial = new THREE.MeshBasicMaterial({ color: "#05060a" })
const bgPlane = new THREE.Mesh(bgPlaneGeometry, bgPlaneMaterial)

bgPlane.position.set(0, 1.5, -1.5) // behind bag
scene.add(bgPlane)

// --------------------------------------------------
// CHIPS BAG
// --------------------------------------------------
const geometry = new THREE.BoxGeometry(1.2, 2, 0.2)

const sideMaterial = new THREE.MeshStandardMaterial({ color: "#ffffff" })
const frontMaterial = new THREE.MeshStandardMaterial({ color: "#ffffff" })
const backMaterial = new THREE.MeshStandardMaterial({ color: "#ffffff" })

const bag = new THREE.Mesh(geometry, [
  sideMaterial,
  sideMaterial.clone(),
  sideMaterial.clone(),
  sideMaterial.clone(),
  frontMaterial,
  backMaterial
])
scene.add(bag)

function updateControlsTarget() {
  const isMobile = window.innerWidth <= 800
  bag.position.x = isMobile ? 0 : 0.6
  bag.position.y = isMobile ? 2 : 1
  controls.target.set(isMobile ? 0 : 0.6, isMobile ? 1 : 1, 0)
  controls.update()
}
updateControlsTarget()

// --------------------------------------------------
// CONFIG
// --------------------------------------------------
const config = {
  name: "",
  bagColor: "#d32b2b",
  keyFlavours: [],
  font: "Helvetica",
  backgroundColor: "#05060a",
}

let textTexture = null
let customImageLoaded = false
let customImageUrl = null
const customImage = new Image()

// --------------------------------------------------
// LOGO
// --------------------------------------------------
const logoImg = new Image()
let logoLoaded = false
logoImg.src = laysLogo
logoImg.onload = () => {
  logoLoaded = true
  updateBagTexture()
}

// --------------------------------------------------
// BACKSIDE TEXTURE
// --------------------------------------------------
const backImage1 = new Image()
const backImage2 = new Image()
let backLoaded = 0

backImage1.src = backImg1
backImage2.src = backImg2

backImage1.onload = tryMakeBack
backImage2.onload = tryMakeBack

function tryMakeBack() {
  backLoaded++
  if (backLoaded === 2) createBackTexture()
}

function createBackTexture() {
  const canvas = document.createElement("canvas")
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext("2d")

  // Base
  ctx.fillStyle = config.bagColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // soft gradient
  const grad = ctx.createRadialGradient(512, 512, 80, 512, 512, 520)
  grad.addColorStop(0, "rgba(255,255,255,0.3)")
  grad.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  function shade(hex, pct) {
    const num = parseInt(hex.slice(1), 16)
    const amt = Math.round(2.55 * pct)
    const r = Math.min(255, Math.max(0, (num >> 16) + amt))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 255) + amt))
    const b = Math.min(255, Math.max(0, (num & 255) + amt))
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }

  // rings
  const centerX = canvas.width / 2
  const centerY = canvas.height
  const bands = [
    { radius: 800, shade: -3, alpha: 0.2 },
    { radius: 700, shade: 3, alpha: 0.3 },
    { radius: 600, shade: -3, alpha: 0.4 },
    { radius: 500, shade: 3, alpha: 0.5 },
    { radius: 400, shade: -3, alpha: 0.4 },
  ]

  bands.forEach((b) => {
    ctx.fillStyle = shade(config.bagColor, b.shade)
    ctx.globalAlpha = b.alpha
    ctx.beginPath()
    ctx.arc(centerX, centerY, b.radius, Math.PI, 0)
    ctx.lineTo(centerX + b.radius, canvas.height)
    ctx.lineTo(centerX - b.radius, canvas.height)
    ctx.closePath()
    ctx.fill()
  })

  ctx.globalAlpha = 1
  ctx.drawImage(backImage1, 80, 200, 420, 520)
  ctx.drawImage(backImage2, 560, 200, 360, 520)

  const tex = new THREE.CanvasTexture(canvas)
  bag.material[5].map = tex
  bag.material[5].needsUpdate = true
}

// --------------------------------------------------
// FRONT TEXTURE
// --------------------------------------------------
function updateBagTexture() {
  if (!logoLoaded) return

  const canvas = document.createElement("canvas")
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext("2d")

  // Base
  ctx.fillStyle = config.bagColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // gradient
  const grad = ctx.createRadialGradient(512, 512, 80, 512, 512, 520)
  grad.addColorStop(0, "rgba(255,255,255,0.3)")
  grad.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // rings
  const centerX = 512
  const centerY = canvas.height
  const bands = [
    { radius: 800, shade: -3, alpha: 0.2 },
    { radius: 700, shade: 3, alpha: 0.3 },
    { radius: 600, shade: -3, alpha: 0.4 },
    { radius: 500, shade: 3, alpha: 0.5 },
    { radius: 400, shade: -3, alpha: 0.4 },
  ]

  function shade(color, pct) {
    const n = parseInt(color.slice(1), 16)
    const amt = Math.round(2.55 * pct)
    return (
      "#" +
      (
        (1 << 24) +
        (Math.min(255, Math.max(0, (n >> 16) + amt)) << 16) +
        (Math.min(255, Math.max(0, ((n >> 8) & 255) + amt)) << 8) +
        Math.min(255, Math.max(0, (n & 255) + amt))
      )
        .toString(16)
        .slice(1)
    )
  }

  bands.forEach((b) => {
    ctx.fillStyle = shade(config.bagColor, b.shade)
    ctx.globalAlpha = b.alpha
    ctx.beginPath()
    ctx.arc(centerX, centerY, b.radius, Math.PI, 0)
    ctx.lineTo(centerX + b.radius, canvas.height)
    ctx.lineTo(centerX - b.radius, canvas.height)
    ctx.closePath()
    ctx.fill()
  })
  ctx.globalAlpha = 1

  // LOGO
  ctx.drawImage(logoImg, 262, 110, 500, 260)

  // NAME
  ctx.fillStyle = "white"
  ctx.textAlign = "center"
  ctx.font = "bold 80px Arial"
  ctx.fillText(config.name, 512, 470)

  // FLAVOUR TITLE
  ctx.font = "bold 40px Helvetica"
  ctx.fillText("Flavour", 512, 520)

  ctx.font = "36px Helvetica"
  ctx.fillText(config.keyFlavours.join(", "), 512, 580)

  // CUSTOM IMAGE
  if (customImageLoaded)
    ctx.drawImage(customImage, 287, canvas.height - 420, 450, 350)

  // SMALL BACKGROUND BEHIND BAG
  const file = window.bgImageInput?.files?.[0]

  if (window.selectedPresetBg) {
    textureLoader.load(window.selectedPresetBg, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      bgPlaneMaterial.map = tex
      bgPlaneMaterial.color.set("#ffffff")
      bgPlaneMaterial.needsUpdate = true
    })
  } else if (file) {
    const url = URL.createObjectURL(file)
    textureLoader.load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      bgPlaneMaterial.map = tex
      bgPlaneMaterial.color.set("#ffffff")
      bgPlaneMaterial.needsUpdate = true
    })
  } else {
    bgPlaneMaterial.map = null
    bgPlaneMaterial.color.set(config.backgroundColor)
  }

  // apply front texture
  if (textTexture) textTexture.dispose()
  textTexture = new THREE.CanvasTexture(canvas)
  bag.material[4].map = textTexture
  bag.material[4].needsUpdate = true
}

// --------------------------------------------------
// UPDATE CONFIG
// --------------------------------------------------
function updateConfig() {
  const nameInput = document.querySelector("#bag-name")
  const colorInput = document.querySelector("#bag-color")
  const fontInput = document.querySelector('input[name="bag-font"]:checked')
  const imageInput = document.querySelector("#bag-image")
  const flavoursInput = document.querySelector("#bag-flavours")

  config.name = nameInput.value
  config.bagColor = colorInput.value
  config.font = fontInput.value

  // custom image
  if (imageInput.files?.[0]) {
    const file = imageInput.files[0]
    if (customImageUrl) URL.revokeObjectURL(customImageUrl)
    customImageUrl = URL.createObjectURL(file)

    customImageLoaded = false
    customImage.src = customImageUrl
    customImage.onload = () => {
      customImageLoaded = true
      updateBagTexture()
    }
  }

  // flavours
  const raw = flavoursInput.value.slice(0, 60)
  flavoursInput.value = raw
  config.keyFlavours = raw.split(",").map((s) => s.trim()).filter(Boolean)

  // sync side materials
  for (let i = 0; i < 4; i++) {
    bag.material[i].color.set(config.bagColor)
  }

  createBackTexture()
  updateBagTexture()
}

// --------------------------------------------------
// LOOP
// --------------------------------------------------
function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
animate()

// --------------------------------------------------
// UI
// --------------------------------------------------
createUI(updateConfig, () => alert("Saving disabled"))
window.bgColorInput = document.querySelector("#bg-color")
window.bgImageInput = document.querySelector("#bg-image")

window.bgColorInput.addEventListener("input", () => {
  config.backgroundColor = window.bgColorInput.value
  updateBagTexture()
})

window.bgImageInput.addEventListener("change", updateBagTexture)

updateConfig()
