import * as THREE from 'three'
import './style.css'

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
