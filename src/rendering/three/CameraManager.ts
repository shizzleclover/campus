import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class CameraManager {
  public camera: THREE.PerspectiveCamera;
  public controls: OrbitControls;
  
  private isFocusing = false;
  private focusTarget = new THREE.Vector3();
  private focusStartTarget = new THREE.Vector3();
  private focusProgress = 0;
  private focusDuration = 1.0; // seconds
  
  constructor(domElement: HTMLElement, aspect: number) {
    // 3D Perspective Camera with lower FOV (25) to flatten the perspective
    // This perfectly mimics the "Sims" isometric vibe while still being true 3D
    this.camera = new THREE.PerspectiveCamera(25, aspect, 1, 3500);
    
    // Initial top-down isometric-ish position (diagonal corner view)
    this.camera.position.set(400, 400, 400);

    this.controls = new OrbitControls(this.camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    
    // Limits
    this.controls.minDistance = 100; // Can't zoom inside buildings
    this.controls.maxDistance = 1200; // Can't zoom into space (increased for lower FOV)
    
    // Vertical rotation limits (Polar angle)
    this.controls.minPolarAngle = 0; // Top-down
    this.controls.maxPolarAngle = Math.PI / 2.5; // Don't go below ground (keep it elevated)
    
    // Panning limits
    // We constrain the target so the camera doesn't pan infinitely
  }

  public updateAspect(aspect: number) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  public update(delta: number) {
    if (this.isFocusing) {
      this.focusProgress += delta / this.focusDuration;
      if (this.focusProgress >= 1.0) {
        this.focusProgress = 1.0;
        this.isFocusing = false;
      }
      
      // Smooth step interpolation
      const t = this.focusProgress;
      const ease = t * t * (3 - 2 * t);
      
      this.controls.target.lerpVectors(this.focusStartTarget, this.focusTarget, ease);
    }
    
    // Clamp the target to keep camera over the campus (800x800 world)
    const bound = 380;
    this.controls.target.x = THREE.MathUtils.clamp(this.controls.target.x, -bound, bound);
    this.controls.target.z = THREE.MathUtils.clamp(this.controls.target.z, -bound, bound);
    this.controls.target.y = 0; // Lock target to ground plane

    this.controls.update(); // required if damping enabled
  }

  public focusOn(position: { x: number; y?: number; z: number }) {
    this.isFocusing = true;
    this.focusProgress = 0;
    this.focusStartTarget.copy(this.controls.target);
    this.focusTarget.set(position.x, 0, position.z);
  }
}
