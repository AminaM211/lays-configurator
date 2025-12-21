// src/ui.js
export function initUI(onUpdate, onSave) {
  const $ = (q) => document.querySelector(q)
  const $$ = (q) => document.querySelectorAll(q)

  const bgBox = $("#bg-box")
  const presetClasses = ["bg-red", "bg-blue", "bg-green", "bg-pink", "bg-orange", "bg-yellow"]

  const nameInput = $("#bag-name")
  const colorInput = $("#bag-color")
  const imageInput = $("#bag-image")
  const flavoursInput = $("#bag-flavours")
  const saveBtn = $("#save-config")
  const resetBtn = $("#reset-config")
  const fontRadios = $$('input[name="bag-font"]')

  const bgImageInput = $("#bg-image")
  const bgThumbs = $$(".bg-img-thumb")
  const swatches = $$(".color-swatch")


  // ------------------------------
  // BASIC INPUTS
  // ------------------------------
  nameInput?.addEventListener("input", onUpdate)
  imageInput?.addEventListener("input", onUpdate)
  flavoursInput?.addEventListener("input", onUpdate)
  fontRadios.forEach(r => r.addEventListener("change", onUpdate))

  // ------------------------------
  // BAG COLOR SWATCHES
  // ------------------------------
  swatches.forEach(btn => {
    btn.addEventListener("click", () => {
      swatches.forEach(b => b.classList.remove("is-active"))
      btn.classList.add("is-active")

      const val = btn.dataset.color
      if (val === "custom") {
        colorInput?.click()
      } else if (colorInput) {
        colorInput.value = val
        onUpdate()
      }
    })
  })

  colorInput?.addEventListener("input", () => {
    swatches.forEach(b => b.classList.remove("is-active"))
    $('.color-swatch[data-color="custom"]')?.classList.add("is-active")
    onUpdate()
  })

  // ------------------------------
  // BACKGROUND PRESETS
  // ------------------------------
  bgThumbs.forEach(thumb => {
    thumb.addEventListener("click", () => {
      bgThumbs.forEach(t => t.classList.remove("is-active"))
      thumb.classList.add("is-active")

      window.config.backgroundPreset = thumb.dataset.img
      window.config.backgroundImageBase64 = null
      window.config.backgroundColor = "#05060a"

      if (bgImageInput) bgImageInput.value = ""

      bgBox?.classList.remove(...presetClasses)
      bgBox?.classList.add(`bg-${thumb.dataset.img}`)
      if (bgBox) {
        bgBox.style.backgroundColor = "transparent"
        bgBox.style.backgroundImage = ""
      }

      onUpdate()
    })
  })


  // ------------------------------
  // BACKGROUND IMAGE UPLOAD
  // ------------------------------
  bgImageInput?.addEventListener("change", () => {
    const file = bgImageInput.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      window.config.backgroundPreset = null
      window.config.backgroundImageBase64 = reader.result

      bgBox?.classList.remove(...presetClasses)
      if (bgBox) {
        bgBox.style.backgroundColor = "transparent"
        bgBox.style.backgroundImage = `url("${reader.result}")`
      }

      bgThumbs.forEach(t => t.classList.remove("is-active"))
      onUpdate()
    }
    reader.readAsDataURL(file)
  })

  // ------------------------------
  // SAVE
  // ------------------------------
  saveBtn?.addEventListener("click", (e) => {
    e.preventDefault()
    onSave()
  })

  // ------------------------------
  // RESET
  // ------------------------------
  resetBtn?.addEventListener("click", () => {
    if (nameInput) nameInput.value = ""
    if (flavoursInput) flavoursInput.value = ""
    if (imageInput) imageInput.value = ""
    if (colorInput) colorInput.value = "#d32b2b"
    if (bgImageInput) bgImageInput.value = ""

    window.config.backgroundColor = "#05060a"
    window.config.backgroundPreset = "red"
    window.config.backgroundImageBase64 = null

    bgBox?.classList.remove(...presetClasses)
    bgBox?.classList.add("bg-red")
    if (bgBox) {
      bgBox.style.backgroundColor = "transparent"
      bgBox.style.backgroundImage = ""
    }

    bgThumbs.forEach(t => t.classList.remove("is-active"))
    $('.bg-img-thumb[data-img="red"]')?.classList.add("is-active")

    fontRadios.forEach(r => r.checked = r.value === "Helvetica")

    swatches.forEach(b => b.classList.remove("is-active"))
    $('.color-swatch[data-color="custom"]')?.classList.add("is-active")

    onUpdate()
  })
}
