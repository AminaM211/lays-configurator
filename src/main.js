// src/main.js
import * as THREE from "three"
import "./style.css"
import { createUI } from "./ui"
import axios from "axios"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import laysLogo from "./assets/lays.png"

import backImg1 from "./assets/back-img1.png"
import backImg2 from "./assets/back-img2.png"

const app = document.querySelector("#app")
const bgBox = document.getElementById("bg-box")


// ------------------------------
// RENDERER
// ------------------------------
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
})
renderer.setClearColor(0x000000, 0) // volledig transparant
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
app.appendChild(renderer.domElement)

const textureLoader = new THREE.TextureLoader()
let bgTextureUrl = null
let usingBgImage = false

// ------------------------------
// SCENE + CAMERA
// ------------------------------
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  window.innerWidth <= 800 ? 60 : 35,
  window.innerWidth / window.innerHeight,
  0.1,
  100
)

//camera.position.set(-1, 2, 4)
camera.position.set(-1.4, 1.9, 4.4)

scene.add(camera)

window.addEventListener("resize", () => {
  camera.fov = window.innerWidth <= 800 ? 60 : 35
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
})

// ------------------------------
// CONTROLS
// ------------------------------
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05

function updateControlsTarget() {
  const isMobile = window.innerWidth <= 800
  bag.position.x = isMobile ? 0 : 0.6
  bag.position.y = isMobile ? 2 : 1
  controls.target.set(isMobile ? 0 : 0.6, isMobile ? 1 : 1, 0)
  controls.update()
}

// ------------------------------
// LIGHTS
// ------------------------------
scene.add(new THREE.DirectionalLight(0xffffff, 1))
scene.add(new THREE.AmbientLight(0xffffff, 0.8))


// ------------------------------
// BAG
// ------------------------------
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
updateControlsTarget()

// ------------------------------
// CONFIG
// ------------------------------
const config = {
  name: "",
  bagColor: "#d32b2b",
  font: "Helvetica",
  keyFlavours: [],
  backgroundColor: "#05060a"
}

// scene.background = new THREE.Color(config.backgroundColor)

// ------------------------------
// IMAGES
// ------------------------------
const customImage = new Image()
let customImageLoaded = false
let customImageUrl = null

let textTexture = null

const logoImg = new Image()
let logoLoaded = false
logoImg.src = laysLogo
logoImg.onload = () => {
  logoLoaded = true
  updateBagTexture()
}

// back images
const backImage1 = new Image()
const backImage2 = new Image()
let backLoaded = 0

backImage1.src = backImg1
backImage2.src = backImg2

const tryMakeBack = () => {
  backLoaded++
  if (backLoaded === 2) createBackTexture()
}

backImage1.onload = tryMakeBack
backImage2.onload = tryMakeBack

// ------------------------------
// BACK TEXTURE
// ------------------------------
function createBackTexture() {
  const canvas = document.createElement("canvas")
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext("2d")

  ctx.fillStyle = config.bagColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const grad = ctx.createRadialGradient(512, 512, 80, 512, 512, 520)
  grad.addColorStop(0, "rgba(255,255,255,0.3)")
  grad.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  function shadeColor(hex, pct) {
    const num = parseInt(hex.slice(1), 16)
    const amt = Math.round(2.55 * pct)
    const R = Math.min(255, Math.max(0, (num >> 16) + amt))
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt))
    const B = Math.min(255, Math.max(0, (num & 0xff) + amt))
    return "#" + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)
  }

  const bands = [
    { radius: 800, shade: -3, alpha: 0.2 },
    { radius: 700, shade: 3, alpha: 0.3 },
    { radius: 600, shade: -3, alpha: 0.4 },
    { radius: 500, shade: 3, alpha: 0.5 },
    { radius: 400, shade: -3, alpha: 0.4 }
  ]

  bands.forEach((b) => {
    ctx.fillStyle = shadeColor(config.bagColor, b.shade)
    ctx.globalAlpha = b.alpha
    ctx.beginPath()
    ctx.arc(512, canvas.height, b.radius, Math.PI, 0)
    ctx.lineTo(512 + b.radius, canvas.height)
    ctx.lineTo(512 - b.radius, canvas.height)
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

// ------------------------------
// FRONT TEXTURE
// ------------------------------
function updateBagTexture() {
  if (!logoLoaded) return

  const canvas = document.createElement("canvas")
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext("2d")

  ctx.fillStyle = config.bagColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const grad = ctx.createRadialGradient(512, 512, 80, 512, 512, 520)
  grad.addColorStop(0, "rgba(255,255,255,0.3)")
  grad.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 3) RINGEN (exact zoals achterkant, maar op de front)
const centerX = canvas.width / 2
const centerY = canvas.height

const bands = [
  { radius: 800, shade: -3, alpha: 0.2 },
  { radius: 700, shade: 3, alpha: 0.3 },
  { radius: 600, shade: -3, alpha: 0.4 },
  { radius: 500, shade: 3, alpha: 0.5 },
  { radius: 400, shade: -3, alpha: 0.4 }
]

function shadeColor(color, percent) {
  const num = parseInt(color.slice(1), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, Math.max(0, (num >> 16) + amt))
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt))
  const B = Math.min(255, Math.max(0, (num & 0xff) + amt))
  return "#" + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)
}

bands.forEach((b) => {
  ctx.fillStyle = shadeColor(config.bagColor, b.shade)
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
  ctx.fillText(config.name, 512, 460)

  // FLAVOUR TITLE
  ctx.font = "bold 40px Helvetica"
  ctx.fillText("Flavour", 512, 520)

  ctx.font = "36px Helvetica"
  ctx.fillText(config.keyFlavours.join(", "), 512, 580)

  // CUSTOM IMAGE
  if (customImageLoaded) {
    ctx.drawImage(customImage, 287, canvas.height - 420, 450, 350)
  }

  // --- BADGE RECHTONDER ---
ctx.beginPath();
ctx.ellipse(
  canvas.width - 160,
  canvas.height - 120,
  100,
  70,
  0,
  0,
  Math.PI * 2
);

ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
ctx.fill();

ctx.lineWidth = 8;
ctx.strokeStyle = "rgba(0, 0, 0, 0.10)";
ctx.stroke();

ctx.fillStyle = "#fff";
ctx.textAlign = "center";

// MADE WITH
ctx.font = "10px Helvetica";
ctx.fillText("MADE WITH", canvas.width - 160, canvas.height - 150);

// 100%
ctx.font = "30px Helvetica";
ctx.fillText("100%", canvas.width - 160, canvas.height - 120);

// Quality
ctx.fillText("Quality", canvas.width - 160, canvas.height - 95);

// INGREDIENTS
ctx.font = "10px Helvetica";
ctx.fillText("INGREDIENTS", canvas.width - 160, canvas.height - 75);


  // --------------------------
  // BACKGROUND UPDATE FIXED 🚀
  // --------------------------
 // ------- BACKGROUND HANDLING -------
 const loader = new THREE.TextureLoader()

 // 1. Thumbnails (preset images)
 window.bgThumbs = document.querySelectorAll(".bg-img-thumb")

 window.bgThumbs.forEach(thumb => {
   thumb.addEventListener("click", () => {
     const imgName = thumb.dataset.img
     const map = {
       blue:  "/src/assets/blue-bg.png",
       green: "/src/assets/green-bg.png",
       pink:  "/src/assets/pink-bg.png",
       red:   "/src/assets/red-bg.png",
     }
 
     bgBox.style.backgroundColor = "transparent"
     bgBox.style.backgroundImage = `url(${map[imgName]})`
   })
 })
 
 window.bgImageInput.addEventListener("change", () => {
  const file = bgImageInput.files[0]
  if (!file) return

  const url = URL.createObjectURL(file)

  bgBox.style.backgroundColor = "transparent"
  bgBox.style.backgroundImage = `url(${url})`
})


  // APPLY FRONT TEXTURE
  if (textTexture) textTexture.dispose()
  textTexture = new THREE.CanvasTexture(canvas)

  bag.material[4].map = textTexture
  bag.material[4].needsUpdate = true
}

// ------------------------------
// UPDATE CONFIG
// ------------------------------
function updateConfig() {
  const nameInput = document.querySelector("#bag-name")
  const colorInput = document.querySelector("#bag-color")
  const fontInput = document.querySelector('input[name="bag-font"]:checked')
  const imageInput = document.querySelector("#bag-image")
  const flavoursInput = document.querySelector("#bag-flavours")

  config.name = nameInput.value
  config.bagColor = colorInput.value
  config.font = fontInput.value

  // CUSTOM IMAGE
  if (imageInput.files && imageInput.files[0]) {
    const f = imageInput.files[0]

    if (customImageUrl) URL.revokeObjectURL(customImageUrl)
    customImageUrl = URL.createObjectURL(f)

    customImageLoaded = false
    customImage.src = customImageUrl
    customImage.onload = () => {
      customImageLoaded = true
      updateBagTexture()
    }
  }

  // FLAVOURS
  const raw = flavoursInput.value.slice(0, 60)
  flavoursInput.value = raw

  config.keyFlavours = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)


   // SIDE MATERIAL COLORS
  for (let i = 0; i < 4; i++) {
    bag.material[i].color.set(config.bagColor)
  }

  createBackTexture()
  updateBagTexture()
}

// ------------------------------
// SAVE
// ------------------------------
async function saveToAPI() {
  alert("saving disabled in demo")
}

// ------------------------------
// ANIMATION LOOP
// ------------------------------
function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
animate()



// ------------------------------
// UI INITIALIZE
// ------------------------------
createUI(updateConfig, saveToAPI)

window.bgColorInput = document.querySelector("#bg-color")
window.bgImageInput = document.querySelector("#bg-image")

window.bgColorInput.addEventListener("input", () => {
  config.backgroundColor = window.bgColorInput.value
  bgBox.style.backgroundImage = ""
  bgBox.style.backgroundColor = config.backgroundColor
})


window.bgImageInput.addEventListener("change", () => {
  updateBagTexture()
})

// first render
updateConfig()

// --- SET DEFAULT BACKGROUND TO RED ---
window.selectedPresetBg = "red"
bgBox.style.backgroundImage = 'url("/src/assets/red-bg.png")'
bgBox.style.backgroundColor = "transparent"

// rode thumbnail actief maken
document.querySelector('.bg-img-thumb[data-img="red"]')?.classList.add("is-active")
