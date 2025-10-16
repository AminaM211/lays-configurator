# Lay's Chips Configurator

A 3D interactive configurator for Lay's chips bags built with Three.js. Customize your chip bag with different colors, logo sizes, and visual effects in real-time.

## Features

- **3D Visualization**: Real-time 3D rendering of a chips bag using Three.js
- **Color Customization**: Choose from multiple bag colors including:
  - Classic Yellow (Original)
  - Red (BBQ)
  - Blue (Salt & Vinegar)
  - Green (Sour Cream & Onion)
  - Orange (Cheddar)
- **Logo Size Control**: Adjust the size of the logo on the bag
- **Bag Shine Effect**: Control the shininess/glossiness of the bag material
- **Rotation Control**: Adjust the automatic rotation speed of the 3D model
- **Interactive Controls**: Use mouse/touch to rotate, zoom, and pan around the model
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

No build tools or npm installation required! The application uses Three.js from a CDN.

### Running Locally

1. Clone the repository:
```bash
git clone https://github.com/AminaM211/lays-configurator.git
cd lays-configurator
```

2. Open the `index.html` file in a web browser:
   - You can simply double-click the file, or
   - Use a local development server for better compatibility:
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Or using Python 2
     python -m SimpleHTTPServer 8000
     
     # Or using Node.js (if you have http-server installed)
     npx http-server
     ```

3. Navigate to `http://localhost:8000` in your browser

## Usage

### Controls Panel

The right sidebar contains all customization options:

- **Bag Color**: Select from dropdown to change the color of the chip bag
- **Logo Size**: Use slider to scale the logo up or down (0.5x to 2x)
- **Bag Shine**: Adjust the glossiness of the bag material (0 to 1)
- **Rotation Speed**: Control how fast the bag rotates automatically (0 to 2)
- **Reset Button**: Restore all settings to default values

### 3D Viewport Controls

- **Rotate**: Left-click and drag
- **Zoom**: Mouse wheel or pinch on touch devices
- **Pan**: Right-click and drag (or two-finger drag on touch devices)

## Technologies Used

- **Three.js**: 3D graphics library
- **JavaScript (ES6+)**: Modern JavaScript with modules
- **HTML5**: Semantic markup
- **CSS3**: Styling with gradients and responsive design

## Project Structure

```
lays-configurator/
├── index.html      # Main HTML file
├── style.css       # Stylesheet
├── main.js         # Three.js configurator logic
└── README.md       # This file
```

## Browser Compatibility

Works in all modern browsers that support:
- ES6 Modules
- WebGL
- Three.js

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

Possible features to add:
- More detailed 3D model with textures
- Additional customization options (text, patterns)
- Export/save configurations
- Share functionality
- More chip flavors and bag designs
- Realistic bag physics and animations

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Three.js community for excellent documentation
- Lay's brand for inspiration (This is a fan project, not affiliated with PepsiCo/Frito-Lay)