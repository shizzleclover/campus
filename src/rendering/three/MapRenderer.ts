import * as THREE from 'three';
import type { UniversityMap, LocationData, DecorativeBuilding } from '../../university/schema/types';
import { demoUniversityMap } from '../../university/data/demo/demoMap';
import { BuildingFactory } from '../../world/buildings/BuildingFactory';

export class MapRenderer {
  private scene: THREE.Scene;
  public interactableMeshes: THREE.Mesh[] = [];
  public mapGroup: THREE.Group;
  private selectionOutline: THREE.Mesh | null = null;
  private selectedId: string | null = null;
  private mapData: UniversityMap;

  // Materials
  private materials = {
    grass: new THREE.MeshLambertMaterial({ color: 0x90b27a }),
    water: new THREE.MeshLambertMaterial({ color: 0x4a90e2, transparent: true, opacity: 0.8 }),
    roadMain: new THREE.MeshLambertMaterial({ color: 0x666666 }),
    roadSec: new THREE.MeshLambertMaterial({ color: 0x888888 }),
    roadPath: new THREE.MeshLambertMaterial({ color: 0xaaaaaa }),
    lotBase: new THREE.MeshLambertMaterial({ color: 0xcccccc }),
    trunk: new THREE.MeshLambertMaterial({ color: 0x5c4033 }),
    leavesGrass: new THREE.MeshLambertMaterial({ color: 0x228b22 }),
    leavesPalm: new THREE.MeshLambertMaterial({ color: 0x3cb371 }),
    roofDark: new THREE.MeshLambertMaterial({ color: 0x333333 }),
    roofLight: new THREE.MeshLambertMaterial({ color: 0xeeeeee }),
  };

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.mapGroup = new THREE.Group();
    this.scene.add(this.mapGroup);
    this.mapData = demoUniversityMap;
    
    this.buildWorld();
  }

  private buildWorld() {
    this.buildGround();
    this.buildWater();
    this.buildPatches();
    this.buildRoads();
    this.buildLots();
    
    this.mapData.locations.forEach(loc => {
      this.buildLocation(loc);
    });

    this.mapData.decorativeBuildings.forEach(deco => {
      this.buildDecorative(deco);
    });

    this.buildProps();
  }

  private buildGround() {
    const geo = new THREE.PlaneGeometry(this.mapData.worldSize.width * 1.5, this.mapData.worldSize.depth * 1.5);
    const mesh = new THREE.Mesh(geo, this.materials.grass);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0; // Ground is exactly at Y=0
    mesh.receiveShadow = true;
    this.mapGroup.add(mesh);
  }

  private buildWater() {
    this.mapData.waterFeatures.forEach(wf => {
      const geo = new THREE.PlaneGeometry(wf.size.width, wf.size.depth);
      const mesh = new THREE.Mesh(geo, this.materials.water);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(wf.position.x, 0.1, wf.position.z);
      mesh.receiveShadow = true;
      this.mapGroup.add(mesh);
    });
  }

  private buildPatches() {
    this.mapData.groundPatches.forEach(gp => {
      const geo = new THREE.PlaneGeometry(gp.size.width, gp.size.depth);
      const mat = new THREE.MeshLambertMaterial({ color: gp.color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(gp.position.x, 0.05, gp.position.z);
      mesh.receiveShadow = true;
      this.mapGroup.add(mesh);
    });
  }

  private buildRoads() {
    this.mapData.roads.forEach(road => {
      const dx = road.end.x - road.start.x;
      const dz = road.end.z - road.start.z;
      const length = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);

      const geo = new THREE.PlaneGeometry(road.width, length);
      
      let mat = this.materials.roadMain;
      if (road.tier === 'secondary') mat = this.materials.roadSec;
      if (road.tier === 'path') mat = this.materials.roadPath;

      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = -angle;
      
      mesh.position.set(
        road.start.x + dx / 2,
        0.2, // slightly above ground
        road.start.z + dz / 2
      );
      
      mesh.receiveShadow = true;
      this.mapGroup.add(mesh);
    });
  }

  private buildLots() {
    this.mapData.lots.forEach(lot => {
      const geo = new THREE.PlaneGeometry(lot.size.width, lot.size.depth);
      const mesh = new THREE.Mesh(geo, this.materials.lotBase);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(lot.position.x, 0.15, lot.position.z);
      mesh.receiveShadow = true;
      this.mapGroup.add(mesh);
    });
  }

  private buildingFactory = new BuildingFactory();

  private buildLocation(loc: LocationData) {
    const group = this.buildingFactory.createBuilding(loc);
    this.mapGroup.add(group);
    
    // Find the main interactable mesh (which we tagged in BuildingFactory)
    // and add it to our raycaster targets
    group.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.isLocation) {
         this.interactableMeshes.push(child);
      }
    });
  }

  private buildDecorative(deco: DecorativeBuilding) {
    const geo = new THREE.BoxGeometry(deco.footprint.width, deco.footprint.height, deco.footprint.depth);
    const mat = new THREE.MeshLambertMaterial({ color: deco.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(deco.position.x, deco.footprint.height / 2, deco.position.z);
    if (deco.rotation) mesh.rotation.y = deco.rotation;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.mapGroup.add(mesh);
  }

  private buildProps() {
    // Collect tree positions
    const treePositions: {pos: THREE.Vector3, scale: number}[] = [];
    const palmPositions: {pos: THREE.Vector3, scale: number}[] = [];

    const benchGeo = new THREE.BoxGeometry(4, 1.5, 1.5);
    const benchMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    
    const lampGeo = new THREE.CylinderGeometry(0.2, 0.2, 10);
    const lampMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const lampBulbGeo = new THREE.SphereGeometry(0.8);
    const lampBulbMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });

    this.mapData.props.forEach(prop => {
      if (prop.type === 'tree-cluster' || prop.type === 'palm-cluster') {
        const count = prop.count || 1;
        for(let i=0; i<count; i++) {
          const jitterX = count > 1 ? (Math.random() - 0.5) * 10 : 0;
          const jitterZ = count > 1 ? (Math.random() - 0.5) * 10 : 0;
          
          const pos = new THREE.Vector3(prop.position.x + jitterX, 0, prop.position.z + jitterZ);
          const scale = prop.scale || 1;

          if (prop.type === 'tree-cluster') treePositions.push({pos, scale});
          if (prop.type === 'palm-cluster') palmPositions.push({pos, scale});
        }
      } else if (prop.type === 'bench') {
        const bench = new THREE.Mesh(benchGeo, benchMat);
        bench.position.set(prop.position.x, 0.75, prop.position.z);
        if (prop.rotation) bench.rotation.y = prop.rotation;
        bench.castShadow = true;
        this.mapGroup.add(bench);
      } else if (prop.type === 'lamp-post') {
        const lamp = new THREE.Mesh(lampGeo, lampMat);
        lamp.position.set(prop.position.x, 5, prop.position.z);
        
        const bulb = new THREE.Mesh(lampBulbGeo, lampBulbMat);
        bulb.position.y = 5;
        lamp.add(bulb);
        
        lamp.castShadow = true;
        this.mapGroup.add(lamp);
      }
    });

    // Build instanced trees
    this.buildInstancedTrees(treePositions, this.materials.leavesGrass, 3, 2, 0.5);
    this.buildInstancedTrees(palmPositions, this.materials.leavesPalm, 5, 1.5, 0.3);
  }

  private buildInstancedTrees(data: {pos: THREE.Vector3, scale: number}[], leavesMat: THREE.Material, trunkHeight: number, leafSize: number, trunkRad: number) {
    if (data.length === 0) return;

    const trunkGeo = new THREE.CylinderGeometry(trunkRad, trunkRad, trunkHeight);
    const leavesGeo = new THREE.DodecahedronGeometry(leafSize);

    const trunks = new THREE.InstancedMesh(trunkGeo, this.materials.trunk, data.length);
    const leaves = new THREE.InstancedMesh(leavesGeo, leavesMat, data.length);

    trunks.castShadow = true; trunks.receiveShadow = true;
    leaves.castShadow = true; leaves.receiveShadow = true;

    const dummy = new THREE.Object3D();

    data.forEach((item, i) => {
      // Trunk
      dummy.position.set(item.pos.x, trunkHeight / 2, item.pos.z);
      dummy.scale.set(item.scale, item.scale, item.scale);
      dummy.updateMatrix();
      trunks.setMatrixAt(i, dummy.matrix);

      // Leaves
      dummy.position.set(item.pos.x, trunkHeight * item.scale + (leafSize/2 * item.scale), item.pos.z);
      dummy.scale.set(item.scale, item.scale, item.scale);
      dummy.updateMatrix();
      leaves.setMatrixAt(i, dummy.matrix);
    });

    this.mapGroup.add(trunks);
    this.mapGroup.add(leaves);
  }

  public highlightLocation(id: string | null) {
    if (this.selectedId === id) return;
    this.selectedId = id;

    if (this.selectionOutline) {
      this.mapGroup.remove(this.selectionOutline);
      this.selectionOutline.geometry.dispose();
      (this.selectionOutline.material as THREE.Material).dispose();
      this.selectionOutline = null;
    }

    if (!id) {
      this.interactableMeshes.forEach(mesh => {
        mesh.scale.set(1, 1, 1);
      });
      return;
    }

    const mesh = this.interactableMeshes.find(m => m.userData.id === id);
    if (mesh) {
      this.interactableMeshes.forEach(m => m.scale.set(1, 1, 1));
      mesh.scale.set(1.05, 1.05, 1.05);

      // Create a tasteful ground ring based on building size
      let radius = 15; // default
      // Retrieve the location data to get footprint
      const loc = this.mapData.locations.find(l => l.id === id);
      if (loc) {
          radius = Math.max(loc.footprint.width, loc.footprint.depth) * 0.6;
      }
      
      const ringGeo = new THREE.RingGeometry(radius, radius + 2, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
      this.selectionOutline = new THREE.Mesh(ringGeo, ringMat);
      this.selectionOutline.rotation.x = -Math.PI / 2;
      
      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      
      // Place it just above the ground
      this.selectionOutline.position.set(worldPos.x, 0.5, worldPos.z);
      this.mapGroup.add(this.selectionOutline);
    }
  }
}
