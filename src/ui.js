// src/ui.js
export function createUI(onUpdate, onSave) {
    const ui = document.createElement('div')
    ui.className = 'ui'
  
    ui.innerHTML = `
      <h2>Customize your bag</h2>
  
      <label class="h3"> Name:
        <input type="text" id="bag-name" placeholder="Bag name">
      </label>
  
     <div class="color-presets">
        <h3>Color</h3>
        <div class="colors">
        <button type="button" class="color-swatch is-active" data-color="#d32b2b" style="--swatch-color:#d32b2b" aria-label="Classic red"></button>
        <button type="button" class="color-swatch" data-color="#f5a623" style="--swatch-color:#f5a623" aria-label="Cheese orange"></button>
        <button type="button" class="color-swatch" data-color="#0077c8" style="--swatch-color:#0077c8" aria-label="Salted blue"></button>
        <button type="button" class="color-swatch" data-color="#1c9c5b" style="--swatch-color:#1c9c5b" aria-label="Sour cream green"></button>
        <button type="button" class="color-swatch" data-color="#ffc928" style="--swatch-color:#ffc928" aria-label="Paprika yellow"></button>
        <button type="button" class="color-swatch" data-color="#4a1f5c" style="--swatch-color:#4a1f5c" aria-label="Gourmet purple"></button>

        <button type="button" class="color-swatch" data-color="custom" aria-label="Custom color"></button>
        <input type="color" id="bag-color" value="#d32b2b" class="color-input-hidden">
        </div>
        </div>

  
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
  
      <label class="h3"> Image:
        <input type="file" id="bag-image" accept="image/*">
      </label>
  
      <label class="h3"> Key flavours:
        <textarea id="bag-flavours" placeholder="salt, pepper" maxlength="40" style="resize: none;"></textarea>
      </label>
  
      <div class="button-row">
        <button id="save-config">Upload</button>
        <button id="reset-config" type="button">Reset design</button>
      </div>
    `
  
    document.body.appendChild(ui)
  
    const nameInput = ui.querySelector('#bag-name')
    const imageInput = ui.querySelector('#bag-image')
    const flavoursInput = ui.querySelector('#bag-flavours')
    const saveBtn = ui.querySelector('#save-config')
    const resetBtn = ui.querySelector('#reset-config')
  
    const colorInput = ui.querySelector('#bag-color')
    const swatches = ui.querySelectorAll('.color-swatch')
    const customSwatch = ui.querySelector('.color-swatch[data-color="custom"]')
    const fontRadios = ui.querySelectorAll('input[name="bag-font"]')
  
    // presets behavior
    swatches.forEach((btn) => {
        btn.addEventListener('click', () => {
          swatches.forEach((b) => b.classList.remove('is-active'))
          btn.classList.add('is-active')
      
          const val = btn.dataset.color
      
          if (val === 'custom') {
            // direct native color picker openen
            colorInput.click()
          } else {
            // preset kleur kiezen
            colorInput.value = val
            onUpdate()
          }
        })
      })
      
  
      colorInput.addEventListener('input', () => {
        // custom swatch actief maken
        swatches.forEach((b) => b.classList.remove('is-active'))
        customSwatch.classList.add('is-active')
      
        onUpdate()
      })
      
  
    // normale fields
    nameInput.addEventListener('input', onUpdate)
    imageInput.addEventListener('input', onUpdate)
    flavoursInput.addEventListener('input', onUpdate)
  
    fontRadios.forEach((radio) => {
      radio.addEventListener('change', onUpdate)
    })
  
    // save en reset
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault()
      onSave()
    })
  
    resetBtn.addEventListener('click', () => {
      nameInput.value = ''
      flavoursInput.value = ''
      imageInput.value = ''
  
      // reset kleur naar rood preset
      colorInput.value = '#d32b2b'
      customColorRow.style.display = 'none'
      swatches.forEach((b, i) => {
        b.classList.toggle('is-active', i === 0)
      })
  
      // reset font
      fontRadios.forEach((r) => {
        r.checked = r.value === 'Helvetica'
      })
  
      onUpdate()
    })
  }
  