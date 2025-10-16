import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class ChipsConfigurator {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.chipBag = null;
        this.logo = null;
        this.rotationSpeed = 0.5;
        
        this.init();
        this.createChipBag();
        this.createLights();
        this.setupEventListeners();
        this.animate();
    }
    
    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        const container = document.getElementById('canvas-container');
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        container.appendChild(this.renderer.domElement);
        
        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    createChipBag() {
        // Create chip bag group
        const bagGroup = new THREE.Group();
        
        // Main bag body (rectangular prism with rounded edges)
        const bagGeometry = new THREE.BoxGeometry(2, 3, 0.8);
        const bagMaterial = new THREE.MeshPhongMaterial({
            color: 0xffd700,
            shininess: 50,
            specular: 0x888888
        });
        
        const bag = new THREE.Mesh(bagGeometry, bagMaterial);
        bag.castShadow = true;
        bag.receiveShadow = true;
        bagGroup.add(bag);
        
        // Top sealed part
        const topGeometry = new THREE.CylinderGeometry(0.3, 1, 0.5, 32);
        const topMaterial = new THREE.MeshPhongMaterial({
            color: 0xffd700,
            shininess: 50,
            specular: 0x888888
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 1.75;
        top.rotation.x = Math.PI / 2;
        bagGroup.add(top);
        
        // Logo (using simple text-like shape)
        const logoGeometry = new THREE.CircleGeometry(0.6, 32);
        const logoMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            side: THREE.DoubleSide
        });
        this.logo = new THREE.Mesh(logoGeometry, logoMaterial);
        this.logo.position.z = 0.41;
        bagGroup.add(this.logo);
        
        // Add text geometry for "LAY'S"
        const textShape = new THREE.Shape();
        textShape.moveTo(-0.4, 0.1);
        textShape.lineTo(-0.4, -0.1);
        textShape.lineTo(-0.3, -0.1);
        textShape.lineTo(-0.3, 0);
        textShape.lineTo(-0.25, 0);
        textShape.lineTo(-0.25, 0.1);
        textShape.closePath();
        
        const textGeometry = new THREE.ShapeGeometry(textShape);
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const text = new THREE.Mesh(textGeometry, textMaterial);
        text.position.z = 0.42;
        bagGroup.add(text);
        
        this.chipBag = bagGroup;
        this.scene.add(bagGroup);
    }
    
    createLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // Point light for highlights
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(-5, 5, 2);
        this.scene.add(pointLight);
    }
    
    setupEventListeners() {
        // Bag color
        const bagColorSelect = document.getElementById('bag-color');
        bagColorSelect.addEventListener('change', (e) => {
            this.updateBagColor(e.target.value);
        });
        
        // Logo size
        const logoSizeInput = document.getElementById('logo-size');
        const logoSizeValue = document.getElementById('logo-size-value');
        logoSizeInput.addEventListener('input', (e) => {
            const scale = parseFloat(e.target.value);
            this.logo.scale.set(scale, scale, 1);
            logoSizeValue.textContent = scale.toFixed(1);
        });
        
        // Bag shine
        const bagShineInput = document.getElementById('bag-shine');
        const bagShineValue = document.getElementById('bag-shine-value');
        bagShineInput.addEventListener('input', (e) => {
            const shine = parseFloat(e.target.value);
            this.updateBagShine(shine);
            bagShineValue.textContent = shine.toFixed(1);
        });
        
        // Rotation speed
        const rotationSpeedInput = document.getElementById('rotation-speed');
        const rotationSpeedValue = document.getElementById('rotation-speed-value');
        rotationSpeedInput.addEventListener('input', (e) => {
            this.rotationSpeed = parseFloat(e.target.value);
            rotationSpeedValue.textContent = this.rotationSpeed.toFixed(1);
        });
        
        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        resetBtn.addEventListener('click', () => this.resetToDefault());
    }
    
    updateBagColor(colorOption) {
        let color;
        switch(colorOption) {
            case 'classic-yellow':
                color = 0xffd700;
                break;
            case 'red':
                color = 0xdc143c;
                break;
            case 'blue':
                color = 0x4169e1;
                break;
            case 'green':
                color = 0x32cd32;
                break;
            case 'orange':
                color = 0xff8c00;
                break;
            default:
                color = 0xffd700;
        }
        
        this.chipBag.children.forEach((child) => {
            if (child.material && child !== this.logo && child.material.color) {
                child.material.color.setHex(color);
            }
        });
    }
    
    updateBagShine(shine) {
        this.chipBag.children.forEach((child) => {
            if (child.material && child !== this.logo && child.material.shininess !== undefined) {
                child.material.shininess = shine * 100;
                child.material.needsUpdate = true;
            }
        });
    }
    
    resetToDefault() {
        // Reset bag color
        document.getElementById('bag-color').value = 'classic-yellow';
        this.updateBagColor('classic-yellow');
        
        // Reset logo size
        document.getElementById('logo-size').value = '1';
        document.getElementById('logo-size-value').textContent = '1.0';
        this.logo.scale.set(1, 1, 1);
        
        // Reset bag shine
        document.getElementById('bag-shine').value = '0.5';
        document.getElementById('bag-shine-value').textContent = '0.5';
        this.updateBagShine(0.5);
        
        // Reset rotation speed
        document.getElementById('rotation-speed').value = '0.5';
        document.getElementById('rotation-speed-value').textContent = '0.5';
        this.rotationSpeed = 0.5;
        
        // Reset camera position
        this.camera.position.set(0, 0, 5);
        this.controls.reset();
    }
    
    onWindowResize() {
        const container = document.getElementById('canvas-container');
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Rotate the chip bag
        if (this.chipBag && this.rotationSpeed > 0) {
            this.chipBag.rotation.y += this.rotationSpeed * 0.01;
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the configurator when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new ChipsConfigurator();
});
