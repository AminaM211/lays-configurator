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

// “chipszak” als box
const geometry = new THREE.BoxGeometry(1.2, 2, 0.4)
const material = new THREE.MeshStandardMaterial({ color: '#f2f2f2' })
const bag = new THREE.Mesh(geometry, material)
scene.add(bag)

const config = {
  name: '',
  image: 'https://example.com/chips.png', // voor nu placeholder
  bagColor: '#f2f2f2',
  font: 'Helvetica',
  pattern: 'none',
  packaging: 'classic',
  keyFlavours: []
}

function updateConfig() {
  config.name = document.querySelector('#bag-name').value
  config.bagColor = document.querySelector('#bag-color').value
  config.font = document.querySelector('#bag-font').value
  config.packaging = document.querySelector('#bag-packaging').value
  config.keyFlavours = document.querySelector('#bag-flavours').value
    .split(',')
    .map(f => f.trim())

  // update kleur op model
  bag.material.color.set(config.bagColor)
}

async function saveToAPI() {
  // JOUW ADMIN TOKEN HIER invullen tijdelijk
  const TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MjA1YmExMDc2YTg5YmQwMjI3ZWU2YiIsInJvbGUiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwiaWF0IjoxNzYzNzI5NDA1LCJleHAiOjE3NjM3NDM4MDV9.n8Ip5mYDYfFha1ouT2c1FsMMg4ETD86ai0oIaMEup2s"

  try {
    await axios.post('http://localhost:4000/api/v1/bag', config, {
      headers: {
        Authorization: TOKEN
      }
    })
    alert("Saved! Check admin panel.")
  } catch (err) {
    console.error(err)
    alert("Error saving.")
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

createUI(updateConfig, saveToAPI)
