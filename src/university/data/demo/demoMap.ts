import type { UniversityMap, DistrictDefinition, LocationData, MapLot, RoadSegment, PropPlacement, WaterFeature, GroundPatch, DecorativeBuilding } from '../../schema/types';

// World dimensions
const WORLD_WIDTH = 800;
const WORLD_DEPTH = 800;

// ──────────────────────────────────────────────
// Districts
// ──────────────────────────────────────────────
const districts: DistrictDefinition[] = [
  {
    id: 'academic',
    name: 'Academic District',
    type: 'academic',
    center: { x: 0, z: -150 },
    bounds: { width: 300, depth: 200 }
  },
  {
    id: 'residential',
    name: 'Hostel District',
    type: 'residential',
    center: { x: -250, z: -50 },
    bounds: { width: 200, depth: 250 }
  },
  {
    id: 'social',
    name: 'Central Quad',
    type: 'social',
    center: { x: 0, z: 50 },
    bounds: { width: 250, depth: 200 }
  },
  {
    id: 'sports',
    name: 'Sports Complex',
    type: 'sports',
    center: { x: 250, z: 0 },
    bounds: { width: 250, depth: 300 }
  },
  {
    id: 'entrance',
    name: 'Main Entrance',
    type: 'entrance',
    center: { x: 0, z: 300 },
    bounds: { width: 300, depth: 150 }
  }
];

// ──────────────────────────────────────────────
// Locations & Lots
// ──────────────────────────────────────────────
const locations: LocationData[] = [];
const lots: MapLot[] = [];

function addLocationAndLot(
  locId: string, 
  name: string, 
  category: LocationData['category'], 
  districtId: string, 
  position: {x: number, z: number}, 
  footprint: {width: number, height: number, depth: number},
  color: number,
  size: LocationData['size'],
  isEnterable: boolean = true,
  description?: string
) {
  locations.push({
    id: locId,
    name,
    category,
    districtId,
    position,
    footprint,
    color,
    size,
    isEnterable,
    interiorScene: locId,
    description
  });
  
  lots.push({
    id: `lot-${locId}`,
    locationId: locId,
    districtId,
    position,
    size: { width: footprint.width * 1.5, depth: footprint.depth * 1.5 },
    type: 'interactive'
  });
}

// Academic
addLocationAndLot('main-library', 'Central Library', 'library', 'academic', {x: 0, z: -200}, {width: 40, height: 25, depth: 35}, 0x81b29a, 'landmark', true, 'A multi-story brutalist library with quiet reading rooms and digital archives.');
addLocationAndLot('lecture-hall-1', 'Main Lecture Hall', 'lecture-hall', 'academic', {x: -80, z: -120}, {width: 35, height: 15, depth: 35}, 0x3d5a80, 'large', true, 'A massive 1000-seat amphitheater for general courses.');
addLocationAndLot('faculty-sci', 'Faculty of Science', 'faculty', 'academic', {x: 80, z: -150}, {width: 30, height: 20, depth: 40}, 0x5a7d9a, 'large', true, 'Laboratories and lecture halls for the physical sciences.');

// Residential
addLocationAndLot('hostel-a', 'Hostel Block A', 'hostel', 'residential', {x: -250, z: -120}, {width: 20, height: 30, depth: 55}, 0xe07a5f, 'large', true, 'Primary undergraduate male accommodation block.');
addLocationAndLot('hostel-b', 'Hostel Block B', 'hostel', 'residential', {x: -300, z: -10}, {width: 20, height: 30, depth: 55}, 0xdd6a4f, 'large', true, 'Primary undergraduate female accommodation block.');
addLocationAndLot('health-center', 'Campus Health Centre', 'health-centre', 'residential', {x: -180, z: 20}, {width: 20, height: 10, depth: 20}, 0xff9999, 'medium', true, '24/7 clinic, pharmacy, and emergency care.');

// Social / Central
addLocationAndLot('student-centre', 'Student Union Building', 'student-centre', 'social', {x: -50, z: 50}, {width: 35, height: 15, depth: 30}, 0xd9a05b, 'large', true, 'Hub for student clubs, indoor games, and social events.');
addLocationAndLot('main-cafeteria', 'Central Cafeteria', 'cafeteria', 'social', {x: 60, z: 30}, {width: 35, height: 12, depth: 30}, 0xf2cc8f, 'large', true, 'Large food court serving multiple local dishes and snacks.');
addLocationAndLot('chapel', 'Campus Chapel', 'chapel', 'social', {x: -100, z: 120}, {width: 20, height: 25, depth: 30}, 0xfcfcfc, 'medium', true, 'A quiet place for worship and reflection.');
addLocationAndLot('mosque', 'Campus Mosque', 'mosque', 'social', {x: -60, z: 110}, {width: 20, height: 20, depth: 20}, 0xfcfcfc, 'medium', true, 'Central mosque serving the campus Muslim community.');

// Sports
addLocationAndLot('main-stadium', 'University Stadium', 'stadium', 'sports', {x: 250, z: -50}, {width: 80, height: 20, depth: 110}, 0xe0e0e0, 'landmark', true, 'Track and field, football pitch, and 5000-seat bleachers.');
addLocationAndLot('indoor-sports', 'Indoor Sports Centre', 'sports-centre', 'sports', {x: 200, z: 100}, {width: 45, height: 20, depth: 45}, 0xcccccc, 'large', true, 'Basketball, badminton, and gym facilities.');

// Entrance
addLocationAndLot('main-gate', 'Main Gate', 'gate', 'entrance', {x: 0, z: 300}, {width: 60, height: 12, depth: 15}, 0x555555, 'landmark', true, 'The grand entrance to the university. Security checks required.');
addLocationAndLot('campus-mart', 'Campus Mart', 'shop', 'entrance', {x: 80, z: 270}, {width: 25, height: 10, depth: 25}, 0x99ccff, 'medium', true, 'Groceries, stationery, and university merchandise.');
addLocationAndLot('bus-park', 'Shuttle Park', 'bus-stop', 'entrance', {x: -80, z: 280}, {width: 40, height: 6, depth: 30}, 0xf4a261, 'medium', true, 'Terminal for intra-campus shuttles and tricycles.');

// ──────────────────────────────────────────────
// Roads
// ──────────────────────────────────────────────
const roads: RoadSegment[] = [
  // Main Artery North-South
  { id: 'road-ns-main', tier: 'main', start: {x: 0, z: 350}, end: {x: 0, z: -300}, width: 16 },
  
  // Main Artery East-West (Entrance)
  { id: 'road-ew-entrance', tier: 'main', start: {x: -350, z: 250}, end: {x: 350, z: 250}, width: 16 },
  
  // Main Artery East-West (Central)
  { id: 'road-ew-central', tier: 'main', start: {x: -350, z: -50}, end: {x: 350, z: -50}, width: 16 },
  
  // Secondary roads
  { id: 'road-hostel-loop-1', tier: 'secondary', start: {x: -200, z: -50}, end: {x: -200, z: -200}, width: 8 },
  { id: 'road-hostel-loop-2', tier: 'secondary', start: {x: -200, z: -200}, end: {x: -350, z: -200}, width: 8 },
  
  { id: 'road-sports-loop', tier: 'secondary', start: {x: 150, z: -50}, end: {x: 150, z: 150}, width: 8 },
  
  // Pedestrian Paths
  { id: 'path-quad', tier: 'path', start: {x: -100, z: 50}, end: {x: 100, z: 50}, width: 4 },
  { id: 'path-library', tier: 'path', start: {x: -100, z: -150}, end: {x: 100, z: -150}, width: 4 },
];

// ──────────────────────────────────────────────
// Ground Patches (Plazas, Fields)
// ──────────────────────────────────────────────
const groundPatches: GroundPatch[] = [
  // Existing
  { id: 'central-quad', position: {x: 0, z: 50}, size: {width: 150, depth: 100}, color: 0x88aa77, type: 'field' },
  { id: 'stadium-pitch', position: {x: 250, z: -50}, size: {width: 80, depth: 120}, color: 0x3a7d44, type: 'field' },
  { id: 'entrance-plaza', position: {x: 0, z: 280}, size: {width: 200, depth: 60}, color: 0xaaaaaa, type: 'paved' },
  // Plazas / Sidewalks
  { id: 'library-plaza', position: {x: 0, z: -170}, size: {width: 100, depth: 40}, color: 0x999999, type: 'paved' },
  { id: 'student-center-plaza', position: {x: -50, z: 20}, size: {width: 80, depth: 30}, color: 0xaaaaaa, type: 'paved' },
  { id: 'mosque-plaza', position: {x: -60, z: 110}, size: {width: 40, depth: 40}, color: 0xcccccc, type: 'paved' },
];

// ──────────────────────────────────────────────
// Water Features
// ──────────────────────────────────────────────
const waterFeatures: WaterFeature[] = [
  { id: 'campus-lake', name: 'Lagoon', position: {x: -250, z: 200}, size: {width: 150, depth: 100}, type: 'lake' },
  { id: 'quad-fountain', position: {x: 0, z: 50}, size: {width: 15, depth: 15}, type: 'fountain' }
];

// ──────────────────────────────────────────────
// Props / Vegetation
// ──────────────────────────────────────────────
const props: PropPlacement[] = [];

// Helper to scatter trees
function scatterTrees(startX: number, endX: number, startZ: number, endZ: number, count: number) {
  for (let i=0; i<count; i++) {
    props.push({
      id: `tree-${Math.random()}`,
      type: 'tree-cluster',
      position: {
        x: startX + Math.random() * (endX - startX),
        z: startZ + Math.random() * (endZ - startZ)
      },
      count: Math.floor(Math.random() * 3) + 1,
      scale: 0.6 + Math.random() * 0.4
    });
  }
}

// Forest edges
scatterTrees(-380, -300, -380, 380, 40);
scatterTrees(300, 380, -380, 380, 40);
scatterTrees(-380, 380, -380, -300, 40);

// Quad trees & benches
scatterTrees(-70, -20, 10, 90, 10);
scatterTrees(20, 70, 10, 90, 10);

// Add Benches and Lamp posts to Central Quad
for(let i=0; i<8; i++) {
  props.push({
    id: `bench-quad-${i}`,
    type: 'bench',
    position: { x: -40 + Math.random()*80, z: 20 + Math.random()*60 },
    rotation: Math.random() * Math.PI
  });
  props.push({
    id: `lamp-quad-${i}`,
    type: 'lamp-post',
    position: { x: -60 + Math.random()*120, z: 10 + Math.random()*80 },
  });
}

// Hostel trees
scatterTrees(-320, -180, -180, -30, 20);

// Lake palms
for(let i=0; i<15; i++) {
    props.push({
      id: `palm-${i}`,
      type: 'palm-cluster',
      position: {
        x: -250 + (Math.random() - 0.5) * 160,
        z: 200 + (Math.random() - 0.5) * 110
      },
      count: 1,
      scale: 0.8 + Math.random() * 0.4
    });
}


// ──────────────────────────────────────────────
// Decorative Buildings
// ──────────────────────────────────────────────
const decorativeBuildings: DecorativeBuilding[] = [];

// Helper to spawn generic blocks in an area
function spawnDecoBlocks(startX: number, endX: number, startZ: number, endZ: number, count: number) {
  for (let i = 0; i < count; i++) {
    decorativeBuildings.push({
      id: `deco-${Math.random()}`,
      position: {
        x: startX + Math.random() * (endX - startX),
        z: startZ + Math.random() * (endZ - startZ)
      },
      footprint: {
        width: 10 + Math.random() * 15, // reduced
        height: 8 + Math.random() * 15,
        depth: 10 + Math.random() * 15
      },
      color: Math.random() > 0.5 ? 0xdddddd : (Math.random() > 0.5 ? 0xefefef : 0xd2b48c),
      rotation: Math.random() * Math.PI
    });
  }
}

// Fill outer areas with generic campus structures (labs, small offices)
spawnDecoBlocks(-350, -150, -350, -250, 15);
spawnDecoBlocks(150, 350, -350, -100, 20);
spawnDecoBlocks(100, 300, 150, 350, 15);

export const demoUniversityMap: UniversityMap = {
  name: 'Federal University of Technology',
  worldSize: { width: WORLD_WIDTH, depth: WORLD_DEPTH },
  districts,
  locations,
  lots,
  roads,
  props,
  waterFeatures,
  groundPatches,
  decorativeBuildings
};
