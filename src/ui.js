// src/ui.js
import blueBg from "./assets/blue-bg.png"
import greenBg from "./assets/green-bg.png"
import pinkBg from "./assets/pink-bg.png"
import redBg from "./assets/red-bg.png"

export function createUI(onUpdate, onSave) {
    const ui = document.createElement('div')
    ui.className = 'ui'
  
    ui.innerHTML = `
      <h2>Customize your bag</h2>
  
      <label class="h3">Name:
        <input type="text" id="bag-name" placeholder="Bag name">
      </label>
  
      <!-- BAG COLOR -->
      <div class="color-presets">
        <h3>Bag color</h3>
        <div class="colors">
          <button type="button" class="color-swatch is-active" data-color="#d32b2b" style="--swatch-color:#d32b2b"></button>
          <button type="button" class="color-swatch" data-color="#f5a623" style="--swatch-color:#f5a623"></button>
          <button type="button" class="color-swatch" data-color="#0077c8" style="--swatch-color:#0077c8"></button>
          <button type="button" class="color-swatch" data-color="#1c9c5b" style="--swatch-color:#1c9c5b"></button>
          <button type="button" class="color-swatch" data-color="#ffc928" style="--swatch-color:#ffc928"></button>
          <button type="button" class="color-swatch" data-color="#4a1f5c" style="--swatch-color:#4a1f5c"></button>
  
          <button type="button" class="color-swatch" data-color="custom"></button>
          <input type="color" id="bag-color" value="#d32b2b" class="color-input-hidden">
        </div>
      </div>
  
      <!-- BACKGROUND -->       
       <h3>Background </h3>
      <div class="background-group">
        <label class="bg-label">
          <button type="button" class="bg-swatch" data-color="custom"></button>
          <input type="color" id="bg-color" value="#d32b2b" class="color-input-hidden">
        </label>
            <img class="bg-img-thumb" data-img="red" src="${redBg}">
            <img class="bg-img-thumb" data-img="blue" src="${blueBg}">
            <img class="bg-img-thumb" data-img="green" src="${greenBg}">
            <img class="bg-img-thumb" data-img="pink" src="${pinkBg}">

            <input type="file" id="bg-image" accept="image/*">
        </div>

  
      <!-- FONT -->
      <fieldset class="font-group">
        <legend>Font</legend>
  
        <label class="font-option">
          <input type="radio" name="bag-font" value="Helvetica" checked>
          <span>Helvetica</span>
        </label>
  
        <label class="font-option">
          <input type="radio" name="bag-font" value="Arial">
          <span>Arial</span>
        </label>
  
        <label class="font-option">
          <input type="radio" name="bag-font" value="Impact">
          <span>Impact</span>
        </label>
      </fieldset>
  
      <!-- CUSTOM IMAGE -->
      <label class="h3">Image:
        <input type="file" id="bag-image" accept="image/*">
      </label>
  
      <!-- FLAVOURS -->
      <label class="h3">Key flavours:
        <textarea id="bag-flavours" placeholder="salt, pepper" maxlength="40" style="resize: none;"></textarea>
      </label>
  
      <!-- BUTTONS -->
      <div class="button-row">
        <button id="save-config">Upload</button>
        <button id="reset-config" type="button">Reset design</button>
      </div>
    `
  
    document.body.appendChild(ui)
  
    // ELEMENTS
    const nameInput = ui.querySelector('#bag-name')
    const imageInput = ui.querySelector('#bag-image')
    const flavoursInput = ui.querySelector('#bag-flavours')
    const saveBtn = ui.querySelector('#save-config')
    const resetBtn = ui.querySelector('#reset-config')
  
    const colorInput = ui.querySelector('#bag-color')
    const swatches = ui.querySelectorAll('.color-swatch')
    const customSwatch = ui.querySelector('.color-swatch[data-color="custom"]')
  
    const fontRadios = ui.querySelectorAll('input[name="bag-font"]')
  
    const bgColorInput = ui.querySelector('#bg-color')
    const bgImageInput = ui.querySelector('#bg-image')
    const bgSwatches = ui.querySelectorAll('.bg-swatch')
    const customBgSwatch = ui.querySelector('.bg-swatch[data-color="custom"]')
  
    const bgThumbs = ui.querySelectorAll(".bg-img-thumb")

    bgThumbs.forEach((thumb) => {
        thumb.addEventListener("click", () => {
          
          // highlight UI
          bgThumbs.forEach((t) => t.classList.remove("is-active"))
          thumb.classList.add("is-active")
      
          const chosen = thumb.dataset.img
          window.selectedPresetBg = chosen // store globally
      
          // remove custom color + upload
          window.bgColorInput.value = "#05060a"
          window.bgImageInput.value = ""
          
          onUpdate()
        })
      })
      

    // BAG COLOR LOGIC
    swatches.forEach((btn) => {
      btn.addEventListener('click', () => {
        swatches.forEach((b) => b.classList.remove('is-active'))
        btn.classList.add('is-active')
  
        const val = btn.dataset.color
        if (val === 'custom') {
          colorInput.click()
        } else {
          colorInput.value = val
          onUpdate()
        }
      })
    })
  
    colorInput.addEventListener('input', () => {
      swatches.forEach((b) => b.classList.remove('is-active'))
      customSwatch.classList.add('is-active')
      onUpdate()
    })
  
    // BACKGROUND COLOR LOGIC
    bgSwatches.forEach((btn) => {
      btn.addEventListener('click', () => {
        bgSwatches.forEach((b) => b.classList.remove('is-active'))
        btn.classList.add('is-active')
  
        const val = btn.dataset.color
        if (val === 'custom') {
          bgColorInput.click()
        } else {
          bgColorInput.value = val
          onUpdate()
        }
      })
    })
  
    bgColorInput.addEventListener('input', () => {
      bgSwatches.forEach((b) => b.classList.remove('is-active'))
      customBgSwatch.classList.add('is-active')
      onUpdate()
    })
  
    bgImageInput.addEventListener('input', onUpdate)
  
    // PRESET BACKGROUND IMAGES
const bgImageThumbs = ui.querySelectorAll(".bg-img-thumb")

bgImageThumbs.forEach(img => {
  img.addEventListener("click", () => {
    // visual toggle
    bgImageThumbs.forEach(i => i.classList.remove("is-active"))
    img.classList.add("is-active")

    // override color selection (deselect color swatches)
    bgSwatches.forEach(b => b.classList.remove("is-active"))

    // clear input
    bgImageInput.value = ""

    // send mode + file name to main.js
    window.selectedPresetBg = img.dataset.img

    onUpdate()
  })
})

    // BASIC FIELDS
    nameInput.addEventListener('input', onUpdate)
    imageInput.addEventListener('input', onUpdate)
    flavoursInput.addEventListener('input', onUpdate)
  
    fontRadios.forEach((r) => {
      r.addEventListener('change', onUpdate)
    })
  
    // SAVE
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault()
      onSave()
    })
  
    // RESET
    resetBtn.addEventListener('click', () => {
      nameInput.value = ''
      flavoursInput.value = ''
      imageInput.value = ''
  
      colorInput.value = '#d32b2b'
      swatches.forEach((b, i) => b.classList.toggle('is-active', i === 0))
  
      bgColorInput.value = '#05060a'
      bgImageInput.value = ''
      bgSwatches.forEach((b, i) => b.classList.toggle('is-active', i === 0))
  
      fontRadios.forEach((r) => {
        r.checked = r.value === 'Helvetica'
      })
  
      onUpdate()
    })
  }
  