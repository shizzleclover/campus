import * as THREE from 'three';
import { CameraManager } from './CameraManager';
import { MapRenderer } from './MapRenderer';
import { useGameStore } from '../../application/store/gameStore';

export class GameRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private cameraManager: CameraManager;
  private mapRenderer: MapRenderer;
  private animationFrameId: number = 0;
  private raycaster = new THREE.Raycaster();
  private pointerDownPos = new THREE.Vector2();

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap; // Fixed removed PCFSoftShadowMap

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa0d8ef);
    // Use linear fog that starts much further away, so the immediate campus is crystal clear
    this.scene.fog = new THREE.Fog(0xa0d8ef, 800, 2000);

    const aspect = window.innerWidth / window.innerHeight;
    this.cameraManager = new CameraManager(canvas, aspect);

    this.setupLighting();

    this.mapRenderer = new MapRenderer(this.scene);

    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    canvas.addEventListener('pointerdown', (e) => {
      this.pointerDownPos.set(e.clientX, e.clientY);
    });

    canvas.addEventListener('pointerup', (e) => {
      const dist = this.pointerDownPos.distanceTo(new THREE.Vector2(e.clientX, e.clientY));
      if (dist < 10) { // Tolerate small movement (clicks)
        this.handleSelection(e.clientX, e.clientY);
      }
    });

    // Subscribe to state changes to update highlights
    useGameStore.subscribe((state, prevState) => {
      if (state.selectedLocationId !== prevState.selectedLocationId) {
        this.mapRenderer.highlightLocation(state.selectedLocationId);
      }
    });

    this.animate();
  }

  private setupLighting() {
    // Hemisphere light for a more natural outdoor ambient light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 200, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    dirLight.position.set(200, 300, -100);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 1000;
    // Cover the 800x800 world
    dirLight.shadow.camera.left = -500;
    dirLight.shadow.camera.right = 500;
    dirLight.shadow.camera.top = 500;
    dirLight.shadow.camera.bottom = -500;
    dirLight.shadow.bias = -0.0005; // Reduce shadow acne
    this.scene.add(dirLight);
  }

  private onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.cameraManager.updateAspect(width / height);
  }

  private handleSelection(clientX: number, clientY: number) {
    const pointer = new THREE.Vector2();
    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(pointer, this.cameraManager.camera);
    // Recursive check true
    const intersects = this.raycaster.intersectObjects(this.mapRenderer.interactableMeshes, true);

    if (intersects.length > 0) {
      let object: THREE.Object3D | null = intersects[0].object;
      let id = null;
      
      // Traverse up to find the location container
      while (object && !id) {
        if (object.userData.isLocation) {
          id = object.userData.id;
        }
        object = object.parent;
      }
      
      if (id) {
        useGameStore.getState().setSelectedLocation(id);
        
        // Find the actual location data to focus on
        // We look up the mesh again from mapRenderer just to be safe
        const mesh = this.mapRenderer.interactableMeshes.find(m => m.userData.id === id);
        if (mesh) {
            const meshWorldPos = new THREE.Vector3();
            mesh.getWorldPosition(meshWorldPos);
            this.cameraManager.focusOn(meshWorldPos);
        }
      }
    } else {
      useGameStore.getState().setSelectedLocation(null);
    }
  }

  private lastTime = performance.now();

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const time = performance.now();
    const delta = (time - this.lastTime) / 1000;
    this.lastTime = time;
    this.cameraManager.update(delta);
    this.renderer.render(this.scene, this.cameraManager.camera);
  }

  public dispose() {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    this.renderer.dispose();
  }
}
