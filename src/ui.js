export function createUI(onUpdate, onSave) {
    const ui = document.createElement('div')
    ui.className = 'ui'
  
    ui.innerHTML = `
      <h2>Customize your bag</h2>
  
      <label> Name:
        <input type="text" id="bag-name" placeholder="Bag name">
      </label>
  
      <label> Bag color:
        <input type="color" id="bag-color" value="#f2f2f2">
      </label>
  
      <label> Font:
        <select id="bag-font">
            <option>Helvetica</option>
            <option>Arial</option>
            <option>Impact</option>
        </select>
      </label>
  
      <label> Packaging:
        <select id="bag-packaging">
            <option value="classic">Classic</option>
            <option value="matte">Matte</option>
            <option value="glossy">Glossy</option>
        </select>
      </label>
  
      <label> Key flavours:
        <input type="text" id="bag-flavours" placeholder="salt, pepper">
      </label>
  
      <button id="save-config">Save</button>
    `
  
    document.body.appendChild(ui)
  
    ui.querySelector('#bag-color').addEventListener('input', onUpdate)
    ui.querySelector('#bag-name').addEventListener('input', onUpdate)
    ui.querySelector('#bag-font').addEventListener('change', onUpdate)
    ui.querySelector('#bag-packaging').addEventListener('change', onUpdate)
    ui.querySelector('#bag-flavours').addEventListener('input', onUpdate)
  
    ui.querySelector('#save-config').addEventListener('click', onSave)
  }
  