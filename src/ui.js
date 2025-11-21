export function createUI(onUpdate, onSave) {
    const ui = document.createElement('div')
    ui.className = 'ui'
  
    ui.innerHTML = `
      <h2>Customize your bag</h2>
  
      <div class="flex">
      <label> Name:
        <input type="text" id="bag-name" placeholder="Bag name">
      </label>
  
      <label> Bag color:
        <input type="color" id="bag-color" value="#ff0000">
      </label>
  
      <label> Font:
        <select id="bag-font">
            <option>Helvetica</option>
            <option>Arial</option>
            <option>Impact</option>
        </select>
      </label>
  
      <label> Image:
        <input type="file" id="bag-image" accept="image/*">
      </label>
  
      <label> Key flavours:
        <textarea id="bag-flavours" placeholder="salt, pepper" maxlength="40"></textarea>
      </label>
  
        </div>
         <div class= "buttons">
      <button id="save-config">Upload</button>
      <button id="reset-config">Reset design</button>
      </div>
    `
  
    document.body.appendChild(ui)
  
    ui.querySelector('#bag-color').addEventListener('input', onUpdate)
    ui.querySelector('#bag-name').addEventListener('input', onUpdate)
    ui.querySelector('#bag-font').addEventListener('change', onUpdate)
    ui.querySelector('#bag-image').addEventListener('input', onUpdate)
    ui.querySelector('#bag-flavours').addEventListener('input', onUpdate)
    ui.querySelector('#save-config').addEventListener('click', onSave)
    ui.querySelector('#reset-config').addEventListener('click', () => {
        ui.querySelector('#bag-name').value = ''
        ui.querySelector('#bag-color').value = '#f2f2f2'
        ui.querySelector('#bag-font').value = 'Helvetica'
        ui.querySelector('#bag-image').value = ''
        ui.querySelector('#bag-flavours').value = ''
        onUpdate()
    })
  }
