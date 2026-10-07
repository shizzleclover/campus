import * as THREE from 'three';
import type { LocationData } from '../../university/schema/types';

export class BuildingFactory {
  private materials: Record<string, THREE.Material> = {
    glass: new THREE.MeshStandardMaterial({ color: 0x88ccff, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.7 }),
    darkRoof: new THREE.MeshLambertMaterial({ color: 0x333333 }),
    lightRoof: new THREE.MeshLambertMaterial({ color: 0xdddddd }),
    concrete: new THREE.MeshLambertMaterial({ color: 0xcccccc }),
    accent: new THREE.MeshLambertMaterial({ color: 0xaa4444 }),
    whiteWall: new THREE.MeshLambertMaterial({ color: 0xffffff }),
  };

  private createSign(text: string, heightOffset: number): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.roundRect(0, 0, 512, 128, 30);
    ctx.fill();

    ctx.font = 'bold 64px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.toUpperCase(), 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(30, 7.5, 1);
    sprite.position.y = heightOffset;
    
    // Make it disappear at distance (simple fog/scale approximation could be used, but we'll let Three.js handle scale. 
    // To make it fade, we'd need to update it in the render loop. For now, it stays visible.)
    return sprite;
  }

  public createBuilding(loc: LocationData): THREE.Group {
    const group = new THREE.Group();
    group.position.set(loc.position.x, 0, loc.position.z);
    if (loc.rotation) group.rotation.y = loc.rotation;

    const baseMat = new THREE.MeshLambertMaterial({ color: loc.color });

    let mainMesh = new THREE.Mesh(); // Dummy fallback

    switch (loc.category) {
      case 'library':
        mainMesh = this.createLibrary(loc, baseMat);
        break;
      case 'hostel':
        mainMesh = this.createHostel(loc, baseMat);
        break;
      case 'lecture-hall':
        mainMesh = this.createLectureHall(loc, baseMat);
        break;
      case 'stadium':
        mainMesh = this.createStadium(loc, baseMat);
        break;
      case 'chapel':
        mainMesh = this.createChapel(loc, baseMat);
        break;
      case 'mosque':
        mainMesh = this.createMosque(loc, baseMat);
        break;
      case 'student-centre':
        mainMesh = this.createStudentCentre(loc, baseMat);
        break;
      case 'gate':
        mainMesh = this.createGate(loc, baseMat);
        break;
      case 'faculty':
        mainMesh = this.createFaculty(loc, baseMat);
        break;
      case 'health-centre':
        mainMesh = this.createHealthCentre(loc, baseMat);
        break;
      case 'shop':
      case 'kiosk':
      case 'bus-stop':
        mainMesh = this.createShop(loc, baseMat);
        break;
      default:
        mainMesh = this.createGenericBuilding(loc, baseMat);
        break;
    }

    if (loc.size === 'landmark' || loc.size === 'large') {
      const sign = this.createSign(loc.name, loc.footprint.height + 15);
      mainMesh.add(sign);
    }

    mainMesh.userData = { id: loc.id, isLocation: true };
    group.add(mainMesh);

    return group;
  }

  private createHealthCentre(loc: LocationData, mat: THREE.Material): THREE.Mesh {
    const baseGeo = new THREE.BoxGeometry(loc.footprint.width, loc.footprint.height, loc.footprint.depth);
    const baseMesh = new THREE.Mesh(baseGeo, mat);
    baseMesh.position.y = loc.footprint.height / 2;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;

    // Red Cross sign
    const crossGroup = new THREE.Group();
    const vGeo = new THREE.BoxGeometry(2, 6, 1);
    const hGeo = new THREE.BoxGeometry(6, 2, 1);
    const crossMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const v = new THREE.Mesh(vGeo, crossMat);
    const h = new THREE.Mesh(hGeo, crossMat);
    crossGroup.add(v, h);
    crossGroup.position.set(0, loc.footprint.height / 2 + 3, loc.footprint.depth / 2);
    baseMesh.add(crossGroup);

    return baseMesh;
  }

  private createShop(loc: LocationData, mat: THREE.Material): THREE.Mesh {
    const baseGeo = new THREE.BoxGeometry(loc.footprint.width, loc.footprint.height, loc.footprint.depth);
    const baseMesh = new THREE.Mesh(baseGeo, mat);
    baseMesh.position.y = loc.footprint.height / 2;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;

    // Awning
    const awningGeo = new THREE.BoxGeometry(loc.footprint.width * 1.1, 1, 6);
    const awningMat = new THREE.MeshLambertMaterial({ color: 0xff9900 });
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.position.set(0, loc.footprint.height / 2 - 2, loc.footprint.depth / 2 + 3);
    awning.rotation.x = 0.2;
    awning.castShadow = true;
    baseMesh.add(awning);

    return baseMesh;
  }

  private createGenericBuilding(loc: LocationData, mat: THREE.Material): THREE.Mesh {
    const geo = new THREE.BoxGeometry(loc.footprint.width, loc.footprint.height, loc.footprint.depth);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = loc.footprint.height / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Standard roof
    const roofGeo = new THREE.ConeGeometry(Math.max(loc.footprint.width, loc.footprint.depth) * 0.7, loc.footprint.height * 0.4, 4);
    const roof = new THREE.Mesh(roofGeo, this.materials.darkRoof);
    roof.position.y = loc.footprint.height / 2 + (loc.footprint.height * 0.4) / 2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    mesh.add(roof);

    return mesh;
  }

  private createLibrary(loc: LocationData, mat: THREE.Material): THREE.Mesh {
    const mainGroup = new THREE.Group();
    mainGroup.position.y = loc.footprint.height / 2;

    // Base block
    const baseGeo = new THREE.BoxGeometry(loc.footprint.width, loc.footprint.height, loc.footprint.depth);
    const baseMesh = new THREE.Mesh(baseGeo, mat);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    mainGroup.add(baseMesh);

    // Large glass front
    const glassGeo = new THREE.BoxGeometry(loc.footprint.width * 0.8, loc.footprint.height * 0.8, loc.footprint.depth + 1);
    const glassMesh = new THREE.Mesh(glassGeo, this.materials.glass);
    mainGroup.add(glassMesh);

    // Overhang roof
    const roofGeo = new THREE.BoxGeometry(loc.footprint.width * 1.1, 2, loc.footprint.depth * 1.1);
    const roof = new THREE.Mesh(roofGeo, this.materials.darkRoof);
    roof.position.y = loc.footprint.height / 2 + 1;
    roof.castShadow = true;
    mainGroup.add(roof);

    // Pillars
    const pillarGeo = new THREE.CylinderGeometry(1, 1, loc.footprint.height);
    const p1 = new THREE.Mesh(pillarGeo, this.materials.concrete);
    p1.position.set(-loc.footprint.width * 0.4, 0, loc.footprint.depth * 0.45);
    const p2 = p1.clone();
    p2.position.set(loc.footprint.width * 0.4, 0, loc.footprint.depth * 0.45);
    p1.castShadow = true; p2.castShadow = true;
    mainGroup.add(p1, p2);

    // Return a dummy mesh that holds the group, so raycasting works on the "bounding box" or we make the baseMesh the raycast target
    // Better: return baseMesh, and add everything to it.
    baseMesh.add(glassMesh, roof, p1, p2);
    return baseMesh;
  }

  private createHostel(loc: LocationData, mat: THREE.Material): THREE.Mesh {
    const baseGeo = new THREE.BoxGeometry(loc.footprint.width, loc.footprint.height, loc.footprint.depth);
    const baseMesh = new THREE.Mesh(baseGeo, mat);
    baseMesh.position.y = loc.footprint.height / 2;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;

    // Add balcony strips
    const floors = Math.floor(loc.footprint.height / 10);
    for (let i = 1; i < floors; i++) {
        const balconyGeo = new THREE.BoxGeometry(loc.footprint.width * 1.05, 1.5, loc.footprint.depth * 1.05);
        const balcony = new THREE.Mesh(balconyGeo, this.materials.concrete);
        balcony.position.y = -loc.footprint.height / 2 + (i * 10);
        balcony.castShadow = true;
        baseMesh.add(balcony);
    }

    // Water tank on roof
    const tankGeo = new THREE.CylinderGeometry(2, 2, 4, 16);
    const tankMat = new THREE.MeshLambertMaterial({ color: 0x111111 }); // Black PVC tank
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(0, loc.footprint.height / 2 + 2, 0);
    tank.castShadow = true;
    baseMesh.add(tank);

    // Flat roof with parapet
    const roofGeo = new THREE.BoxGeometry(loc.footprint.width, 1, loc.footprint.depth);
    const roof = new THREE.Mesh(roofGeo, this.materials.lightRoof);
    roof.position.y = loc.footprint.height / 2 + 0.5;
    baseMesh.add(roof);

    return baseMesh;
  }

  private createLectureHall(loc: LocationData, mat: THREE.Material): THREE.Mesh {
    // Wedge shape
    const shape = new THREE.Shape();
    shape.moveTo(-loc.footprint.width/2, -loc.footprint.depth/2);
    shape.lineTo(loc.footprint.width/2, -loc.footprint.depth/2);
    shape.lineTo(loc.footprint.width/2, loc.footprint.depth/2);
    shape.lineTo(-loc.footprint.width/2, loc.footprint.depth/2);
    
    const extrudeGeo = new THREE.ExtrudeGeometry(shape, { 
      depth: loc.footprint.height, 
      bevelEnabled: false 
    });
    
    const baseMesh = new THREE.Mesh(extrudeGeo, mat);
    baseMesh.rotation.x = -Math.PI / 2;
    baseMesh.rotation.y = 0.15; // Sloped roof effect
    baseMesh.position.y = loc.footprint.height * 0.8;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;

    return baseMesh;
  }

  private createStadium(loc: LocationData, mat: THREE.Material): THREE.Mesh {
    // Stadium is an extruded ring
    const shape = new THREE.Shape();
    shape.absarc(0, 0, loc.footprint.width * 0.5, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, loc.footprint.width * 0.35, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    
    const extrudeGeo = new THREE.ExtrudeGeometry(shape, { depth: loc.footprint.height, bevelEnabled: false, curveSegments: 24 });
    const baseMesh = new THREE.Mesh(extrudeGeo, mat);
    baseMesh.rotation.x = -Math.PI / 2;
    baseMesh.position.y = loc.footprint.height;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;

    // Add field
    const fieldGeo = new THREE.PlaneGeometry(loc.footprint.width * 0.7, loc.footprint.width * 0.7);
    const fieldMat = new THREE.MeshLambertMaterial({ color: 0x3a7d44 });
    const field = new THREE.Mesh(fieldGeo, fieldMat);
    // Move relative to baseMesh (which is rotated -PI/2)
    field.position.z = 0.5; // Z is up in this rotated coordinate space
    baseMesh.add(field);

    return baseMesh;
  }

  private createChapel(loc: LocationData, mat: THREE.Material): THREE.Mesh {
    const baseGeo = new THREE.BoxGeometry(loc.footprint.width, loc.footprint.height * 0.6, loc.footprint.depth);
    const baseMesh = new THREE.Mesh(baseGeo, mat);
    baseMesh.position.y = (loc.footprint.height * 0.6) / 2;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;

    // Steep A-frame roof
    const roofGeo = new THREE.ConeGeometry(Math.max(loc.footprint.width, loc.footprint.depth) * 0.6, loc.footprint.height * 0.8, 4);
    const roof = new THREE.Mesh(roofGeo, this.materials.lightRoof);
    roof.position.y = (loc.footprint.height * 0.6) / 2 + (loc.footprint.height * 0.8) / 2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    baseMesh.add(roof);

    return baseMesh;
  }

  private createMosque(loc: LocationData, mat: THREE.Material): THREE.Mesh {
    const baseGeo = new THREE.BoxGeometry(loc.footprint.width, loc.footprint.height * 0.7, loc.footprint.depth);
    const baseMesh = new THREE.Mesh(baseGeo, mat);
    baseMesh.position.y = (loc.footprint.height * 0.7) / 2;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;

    // Dome
    const domeGeo = new THREE.SphereGeometry(loc.footprint.width * 0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome = new THREE.Mesh(domeGeo, this.materials.lightRoof);
    dome.position.y = (loc.footprint.height * 0.7) / 2;
    dome.castShadow = true;
    baseMesh.add(dome);

    // Minaret
    const minaretGeo = new THREE.CylinderGeometry(1.5, 2, loc.footprint.height * 1.5, 8);
    const minaret = new THREE.Mesh(minaretGeo, this.materials.whiteWall);
    minaret.position.set(-loc.footprint.width / 2 + 2, (loc.footprint.height * 1.5) / 2 - (loc.footprint.height * 0.7)/2, loc.footprint.depth / 2 - 2);
    minaret.castShadow = true;
    baseMesh.add(minaret);

    return baseMesh;
  }

  private createStudentCentre(loc: LocationData, mat: THREE.Material): THREE.Mesh {
    const baseGeo = new THREE.BoxGeometry(loc.footprint.width, loc.footprint.height, loc.footprint.depth);
    const baseMesh = new THREE.Mesh(baseGeo, mat);
    baseMesh.position.y = loc.footprint.height / 2;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;

    // Curved front entrance canopy
    const canopyGeo = new THREE.CylinderGeometry(loc.footprint.width * 0.3, loc.footprint.width * 0.3, 2, 16, 1, false, 0, Math.PI);
    const canopy = new THREE.Mesh(canopyGeo, this.materials.accent);
    canopy.rotation.z = Math.PI / 2;
    canopy.position.set(0, 0, loc.footprint.depth / 2 + 2);
    canopy.castShadow = true;
    baseMesh.add(canopy);

    return baseMesh;
  }

  private createGate(loc: LocationData, mat: THREE.Material): THREE.Mesh {
    // Two pillars and a crossbeam
    const pillarGeo = new THREE.BoxGeometry(loc.footprint.width * 0.15, loc.footprint.height, loc.footprint.depth);
    const p1 = new THREE.Mesh(pillarGeo, mat);
    p1.position.set(-loc.footprint.width / 2 + (loc.footprint.width * 0.15)/2, loc.footprint.height / 2, 0);
    p1.castShadow = true;

    const p2 = new THREE.Mesh(pillarGeo, mat);
    p2.position.set(loc.footprint.width / 2 - (loc.footprint.width * 0.15)/2, loc.footprint.height / 2, 0);
    p2.castShadow = true;

    const beamGeo = new THREE.BoxGeometry(loc.footprint.width, 3, loc.footprint.depth * 0.8);
    const beam = new THREE.Mesh(beamGeo, this.materials.accent);
    beam.position.set(loc.footprint.width / 2 - (loc.footprint.width * 0.15)/2, loc.footprint.height / 2 - 1.5, 0);
    beam.castShadow = true;
    p1.add(beam);

    const groupMesh = new THREE.Mesh(new THREE.BoxGeometry(loc.footprint.width, 1, loc.footprint.depth), new THREE.MeshBasicMaterial({visible: false}));
    groupMesh.position.y = 0.5;
    groupMesh.add(p1, p2);

    return groupMesh;
  }

  private createFaculty(loc: LocationData, mat: THREE.Material): THREE.Mesh {
    const baseGeo = new THREE.BoxGeometry(loc.footprint.width, loc.footprint.height, loc.footprint.depth);
    const baseMesh = new THREE.Mesh(baseGeo, mat);
    baseMesh.position.y = loc.footprint.height / 2;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;

    // Roof parapet
    const roofGeo = new THREE.BoxGeometry(loc.footprint.width * 1.02, 2, loc.footprint.depth * 1.02);
    const roof = new THREE.Mesh(roofGeo, this.materials.darkRoof);
    roof.position.y = loc.footprint.height / 2 + 1;
    roof.castShadow = true;
    baseMesh.add(roof);

    return baseMesh;
  }
}
