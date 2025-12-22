import * as THREE from "three"

// ------------------------------
// BACK TEXTURE
// ------------------------------
export function createBackTexture(bag, config, backImage1, backImage2) {
  const canvas = document.createElement("canvas")
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext("2d")

  ctx.fillStyle = config.bagColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)


  ctx.drawImage(backImage1, 80, 200, 420, 520)
  ctx.drawImage(backImage2, 560, 200, 360, 520)

  const tex = new THREE.CanvasTexture(canvas)
  tex.flipY = false

  if (!bag) return
  bag.traverse((child) => {
    if (child.isMesh && child.material && child.material.name === "front") {
      child.material.map = tex
      child.material.needsUpdate = true
    }
  })
}

// ------------------------------
// FRONT TEXTURE
// ------------------------------
export function updateBagTexture( 
    bag,
    config,
    logoImg,
    customImage,
    customImageLoaded
) {
    if (!logoImg || !logoImg.complete) return

  const canvas = document.createElement("canvas")
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext("2d")

  ctx.fillStyle = config.bagColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

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

  // BADGE
  ctx.beginPath()
  ctx.ellipse(canvas.width - 160, canvas.height - 120, 100, 70, 0, 0, Math.PI * 2)
  ctx.fillStyle = "rgba(0, 0, 0, 0.24)"
  ctx.fill()
  ctx.lineWidth = 8
  ctx.strokeStyle = "rgba(0, 0, 0, 0.10)"
  ctx.stroke()

  ctx.fillStyle = "#fff"
  ctx.textAlign = "center"
  ctx.font = "10px Helvetica"
  ctx.fillText("MADE WITH", canvas.width - 160, canvas.height - 150)
  ctx.font = "30px Helvetica"
  ctx.fillText("100%", canvas.width - 160, canvas.height - 120)
  ctx.fillText("Quality", canvas.width - 160, canvas.height - 95)
  ctx.font = "10px Helvetica"
  ctx.fillText("INGREDIENTS", canvas.width - 160, canvas.height - 75)

  const tex = new THREE.CanvasTexture(canvas)
  tex.flipY = false

  if (!bag) return
  bag.traverse((child) => {
    if (child.isMesh && child.material && child.material.name === "back") {
      child.material.map = tex
      child.material.needsUpdate = true
    }
  })
}
