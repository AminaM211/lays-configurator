// src/main.js
import * as THREE from "three"
import "./style.css"
import { initUI } from "./ui"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import laysLogo from "/assets/lays.png"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createBackTexture, updateBagTexture } from "./bagTexture"

import backImg1 from "/assets/back-img1.png"
import backImg2 from "/assets/back-img2.png"

// ------------------------------
// LOADER
// ------------------------------
const loader = document.getElementById("loader")

function showLoader(text = "Loading…") {
  if (!loader) return
  loader.style.display = "flex"
  loader.querySelector("p").innerText = text
}

function hideLoader() {
  if (!loader) return
  loader.style.display = "none"
}

// ------------------------------
// TOKEN FROM URL
// ------------------------------
const params = new URLSearchParams(window.location.search)
const API_URL = "https://lays-api-jj8b.onrender.com/api/v1"
const url = `${API_URL}/bag`

const isPreview = params.get("preview") === "true"
const bagId = params.get("bagId")

const app = document.querySelector("#app")

// ------------------------------
// RENDERER
// ------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setClearColor(0x000000, 0)
renderer.setSize(window.innerWidth, window.innerHeight * 0.9);
renderer.setAnimationLoop( animate );

renderer.setPixelRatio(window.devicePixelRatio)
THREE.ColorManagement.enabled = false
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
app.appendChild(renderer.domElement)

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
camera.position.set(0, 2, 4)
camera.lookAt(0, 1.8, 0)
scene.add(camera)

window.addEventListener("resize", () => {
  camera.fov = window.innerWidth <= 800 ? 60 : 35
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// ------------------------------
// CONTROLS
// ------------------------------
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.enabled = false


function updateControlsTarget() {
  const isMobile = window.innerWidth <= 800
  if (!bag) return
  bag.position.x = isMobile ? 0 : 0
  bag.position.y = isMobile ? 2.8 : 1.8
  controls.target.set(isMobile ? 0 : 0.6, 1, 0)
  controls.update()
}

// ------------------------------
// LIGHTS
// ------------------------------
scene.add(new THREE.DirectionalLight(0xffffff, 1))
scene.add(new THREE.AmbientLight(0xffffff, 1.2))
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2))

// ------------------------------
// BAG
// ------------------------------
let bag
gsap.registerPlugin(ScrollTrigger);


async function loadBagFromAPI(bagId) {
  const res = await fetch(`https://lays-api-jj8b.onrender.com/api/v1/bag/${bagId}`)
  if (!res.ok) return null
  return await res.json()
}

function loadBagModel() {
  const mtlLoader = new MTLLoader()

  mtlLoader.load("/assets/chips-bag-obj/bag.mtl", (materials) => {
    materials.preload()

    const objLoader = new OBJLoader()
    objLoader.setMaterials(materials)

    objLoader.load("/assets/chips-bag-obj/bag.obj", async (object) => {
      bag = object
      bag.scale.set(0.5, 0.5, 0.6)
      bag.position.set(0.6, 1, 0)
      scene.add(bag)

      setupScrollAnimation()

      if (bagId) {
        const data = await loadBagFromAPI(bagId)
        if (data) {
          config.name = data.name || ""
          config.bagColor = data.bagColor || "#d32b2b"
          config.keyFlavours = data.keyFlavours || []
          config.backgroundPreset = data.backgroundPreset
          if (data.image) {
            customImageLoaded = false
            customImage.src = data.image

            customImage.onload = () => {
              customImageLoaded = true
              updateBagTexture(bag,config,logoImg,customImage,customImageLoaded)
            }
          }
          config.backgroundColor = data.backgroundColor || "#05060a"
        }
      }

      createBackTexture(bag, config, backImage1, backImage2)
      updateBagTexture(bag,config,logoImg,customImage,customImageLoaded)
      updateControlsTarget()
      tryInitTextures()
    })
  })
}

function setupScrollAnimation() {
  if (!bag) return

  const vh = window.innerHeight

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: document.body,
      start: "top top",
      end: "bottom top",
      scrub: 0.25
    }
  })

  // ───────── STEP 0 — START (intro)
  tl.to(bag.position, {
    x: -0.6,
    y: 2.2,
    duration:0.6,
    ease: "power1.out"
  })
  .to(bag.rotation, {
    y: 0.2,
    duration: 0.4
  }, "<")

  // ───────── STEP 1 — NAME (links naast UI)
  tl.to(bag.position, {
    x: -0.7,
    y: 1.9,
    duration: 0.4,
    ease: "power1.out"
  })
  .to(bag.rotation, {
    y: 0.7,
    duration: 0.4
  }, "<")

  // ───────── STEP 2 — COLOR (rechts naast UI)
  tl.to(bag.position, {
    x: 2,
    y: 1.7,
    duration: 0.7,
    ease: "power1.out"
  })
  .to(bag.rotation, {
    y: -7,
    duration:0.4
  }, "<")

  // ───────── STEP 3 — BACKGROUND (links + iets lager)
  tl.to(bag.position, {
    x: -1,
    y: 1.9,
    duration: 0.4,
    ease: "power1.out"
  })
  .to(bag.rotation, {
    y: -12.5,
    duration: 0.4
  }, "<")

  // ───────── STEP 4 — IMAGE (rechts + focus)
  tl.to(bag.position, {
    x: 2,
    y: 1.8,
    duration: 0.6,
    ease: "power1.out"
  })
  .to(bag.rotation, {
    y: -13.3,
    duration:0.4
  }, "<")
  tl.to(bag.position, {
    x: -1,
    y: 1.9,
    duration:0.4,
    ease: "power1.out"
  })
  .to(bag.rotation, {
    y: -11.8,
    duration:0.6
  }, "<")

  if (window.innerWidth <= 800) {
    tl.to(bag.position, {
      x: 0,
      y: 2.5,
      duration: 0.4,
      ease: "power1.out"
    })
    .to(bag.rotation, {
      y: -6.3,
      duration: 0.4
    }, "<")
  } else {
    tl.to(bag.position, {
      x: 0.6,
      y: 1.8,
      duration: 0.4,
      ease: "power1.out"
    })
    .to(bag.rotation, {
      y: -6.4,
      duration: 0.4
    }, "<")
  }
  // ───────── FINAL — terug naar midden (zoals start)
tl.to(bag.position, {
  x: 8.3,
  y: 0,
  duration:0.6,
  ease: "power1.out"
})
.to(bag.rotation, {
  y: 0,
  duration: 0.6,
  ease: "power1.out"
}, "<")
}

// ------------------------------
// CONFIG
// ------------------------------
const config = {
  name: "",
  bagColor: "#d32b2b",
  font: "Helvetica",
  keyFlavours: [],
  backgroundColor: "#05060a",
  backgroundPreset: "", 
  backgroundImageBase64: null
}
window.config = config


// ------------------------------
// IMAGES
// ------------------------------
const logoImg = new Image()
let logoLoaded = false
logoImg.src = laysLogo
logoImg.onload = () => {
  logoLoaded = true
  tryInitTextures()
  updateBagTexture(bag,config,logoImg,customImage,customImageLoaded)
}

const backImage1 = new Image()
const backImage2 = new Image()
let backsReady = 0

backImage1.src = backImg1
backImage2.src = backImg2

backImage1.onload = () => {
  backsReady++
  if (backsReady === 2) createBackTexture(bag, config, backImage1, backImage2)
}
backImage2.onload = () => {
  backsReady++
  if (backsReady === 2) createBackTexture(bag, config, backImage1, backImage2)
}

let customImageLoaded = false
let customImageUrl = null
const customImage = new Image()

// ------------------------------
// UPDATE CONFIG
// ------------------------------
function updateConfig() {
  if (isPreview) return

  const nameInput = document.querySelector("#bag-name")
  const colorInput = document.querySelector("#bag-color")
  const fontInput = document.querySelector('input[name="bag-font"]:checked')
  const imageInput = document.querySelector("#bag-image")
  const flavoursInput = document.querySelector("#bag-flavours")
  const bgColorInput = document.querySelector("#background-color")

  config.name = nameInput.value
  config.bagColor = colorInput.value
  config.font = fontInput.value
  config.bagColor = colorInput.value

  if (bgColorInput) {
    config.backgroundColor = bgColorInput.value
  }

  // CUSTOM IMAGE
  if (imageInput.files && imageInput.files[0]) {
    if (customImageUrl) URL.revokeObjectURL(customImageUrl)
    customImageUrl = URL.createObjectURL(imageInput.files[0])

    customImageLoaded = false
    customImage.src = customImageUrl

    customImage.onload = () => {
      customImageLoaded = true
      updateBagTexture(bag,config,logoImg,customImage,customImageLoaded)
    }
  }

  // FLAVOURS
  const raw = flavoursInput.value.slice(0, 60)
  flavoursInput.value = raw

  config.keyFlavours = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  if (!bag) return
  createBackTexture(bag, config, backImage1, backImage2)
  updateBagTexture(bag,config,logoImg,customImage,customImageLoaded)
}

// ------------------------------
// SAVE TO API
// ------------------------------
async function saveToAPI() {
  const imageInput = document.querySelector("#bag-image")

  async function sendPayload(imgBase64) {
    const payload = {
      name: config.name,
      bagColor: config.bagColor,
      font: config.font,
      keyFlavours: config.keyFlavours,
      backgroundColor: config.backgroundColor,
      image: imgBase64 || null,
      backgroundPreset: config.backgroundPreset || null,
      backgroundImage: config.backgroundImageBase64 || null
    }

    showLoader("Saving your design…")

    try {
      const res = await fetch(url, {
        method: "POST",
        credentials: "include", 
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
      

      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      window.location.href = "https://lays-vue-2.vercel.app/";
    } catch (err) {
      console.error("API error:", err)
      alert("Error saving")
    }
  }

  if (imageInput.files && imageInput.files[0]) {
    const file = imageInput.files[0]
    const reader = new FileReader()
    reader.onload = () => sendPayload(reader.result)
    reader.readAsDataURL(file)
    return
  }

  sendPayload(null)
}

// ------------------------------
// ANIMATION LOOP
// ------------------------------
function animate() {
  // requestAnimationFrame(animate)
  controls.update();
  renderer.render(scene, camera)
}
animate()


initUI(updateConfig, saveToAPI)

showLoader("Loading bag…")
loadBagModel()

function tryInitTextures() {
  if (bag && logoLoaded && backImage1.complete) {
    createBackTexture(bag, config, backImage1, backImage2)
    updateBagTexture(bag,config,logoImg,customImage,customImageLoaded)
    hideLoader() 
}
}
