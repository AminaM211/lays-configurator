// src/ui.js
export function initUI(onUpdate, onSave) {
  const $ = (q) => document.querySelector(q)

  const bgBox = $("#bg-box")
  const presetClasses = ["bg-red", "bg-blue", "bg-green", "bg-pink", "bg-orange", "bg-yellow"]

  const nameInput = $("#bag-name")
  const colorInput = $("#bag-color")
  const imageInput = $("#bag-image")
  const flavoursInput = $("#bag-flavours")
  const saveBtn = $("#save-config")
  const resetBtn = $("#reset-config")
  const fontRadios = document.querySelectorAll('input[name="bag-font"]')

  const bgColorInput = $("#bg-color")
  const bgImageInput = $("#bg-image")
  const bgThumbs = document.querySelectorAll(".bg-img-thumb")
  const swatches = document.querySelectorAll(".color-swatch")

  // ------------------------------
  // BASIC INPUTS
  // ------------------------------
  nameInput.addEventListener("input", onUpdate)
  imageInput.addEventListener("input", onUpdate)
  flavoursInput.addEventListener("input", onUpdate)

  fontRadios.forEach((r) => r.addEventListener("change", onUpdate))

  // ------------------------------
  // BAG COLOR SWATCHES
  // ------------------------------
  swatches.forEach((btn) => {
    btn.addEventListener("click", () => {
      swatches.forEach((b) => b.classList.remove("is-active"))
      btn.classList.add("is-active")

      const val = btn.dataset.color
      if (val === "custom") {
        colorInput.click()
      } else {
        colorInput.value = val
        onUpdate()
      }
    })
  })

  colorInput.addEventListener("input", () => {
    swatches.forEach((b) => b.classList.remove("is-active"))
    document.querySelector('.color-swatch[data-color="custom"]')?.classList.add("is-active")
    onUpdate()
  })

  // ------------------------------
  // BACKGROUND PRESETS (CSS classes)
  // ------------------------------
  bgThumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      bgThumbs.forEach((t) => t.classList.remove("is-active"))
      thumb.classList.add("is-active")

      // state
      window.config.backgroundPreset = thumb.dataset.img
      window.config.backgroundImageBase64 = null
      window.config.backgroundColor = "#05060a"

      // UI inputs reset
      bgColorInput.value = "#05060a"
      bgImageInput.value = ""

      // apply preset class on bg-box
      bgBox.classList.remove(...presetClasses)
      bgBox.classList.add(`bg-${thumb.dataset.img}`)
      bgBox.style.backgroundColor = "transparent" // preset images are used
      bgBox.style.backgroundImage = "" // ensure inline upload isn't stuck

      onUpdate()
    })
  })

  // ------------------------------
  // BACKGROUND COLOR (custom)
  // ------------------------------
  bgColorInput.addEventListener("input", () => {
    window.config.backgroundColor = bgColorInput.value
    window.config.backgroundPreset = null
    window.config.backgroundImageBase64 = null

    bgBox.classList.remove(...presetClasses)
    bgBox.style.backgroundImage = ""
    bgBox.style.backgroundColor = window.config.backgroundColor

    bgThumbs.forEach((t) => t.classList.remove("is-active"))

    onUpdate()
  })

  // ------------------------------
  // BACKGROUND IMAGE UPLOAD (custom)
  // ------------------------------
  bgImageInput.addEventListener("change", () => {
    const file = bgImageInput.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      window.config.backgroundPreset = null
      window.config.backgroundImageBase64 = reader.result

      bgBox.classList.remove(...presetClasses)
      bgBox.style.backgroundColor = "transparent"
      bgBox.style.backgroundImage = `url("${reader.result}")`

      bgThumbs.forEach((t) => t.classList.remove("is-active"))

      onUpdate()
    }
    reader.readAsDataURL(file)
  })

  // ------------------------------
  // SAVE
  // ------------------------------
  saveBtn.addEventListener("click", (e) => {
    e.preventDefault()
    onSave()
  })

  // ------------------------------
  // RESET
  // ------------------------------
  resetBtn.addEventListener("click", () => {
    nameInput.value = ""
    flavoursInput.value = ""
    imageInput.value = ""
    colorInput.value = "#d32b2b"

    // reset bg inputs
    bgColorInput.value = "#05060a"
    bgImageInput.value = ""

    // reset bg state + visual: back to default red preset
    window.config.backgroundColor = "#05060a"
    window.config.backgroundPreset = ""
    window.config.backgroundImageBase64 = null

    bgBox.classList.remove(...presetClasses)
    bgBox.classList.add("bg-red")
    bgBox.style.backgroundColor = "transparent"
    bgBox.style.backgroundImage = ""

    bgThumbs.forEach((t) => t.classList.remove("is-active"))
    document.querySelector('.bg-img-thumb[data-img="red"]')?.classList.add("is-active")

    // reset font
    fontRadios.forEach((r) => (r.checked = r.value === "Helvetica"))

    // reset active swatch UI (keeps your existing first-active setup)
    swatches.forEach((b) => b.classList.remove("is-active"))
    document.querySelector('.color-swatch[data-color="custom"]')?.classList.add("is-active")

    onUpdate()
  })
}
