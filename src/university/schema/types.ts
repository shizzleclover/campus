/**
 * Campus Life — World Coordinate System
 * ======================================
 * Convention used throughout the codebase:
 *
 *   X = East / West   (horizontal axis)
 *   Y = Elevation      (vertical axis — height above ground)
 *   Z = North / South  (depth axis)
 *
 *   +X → East      -X → West
 *   +Y → Up        -Y → Down
 *   +Z → South     -Z → North
 *
 * The ground plane sits at Y = 0.
 * All ground-level positions use the (x, z) pair via GroundPosition.
 * Y is reserved exclusively for elevation / height.
 */

// ──────────────────────────────────────────────
// Coordinate primitives
// ──────────────────────────────────────────────

/** Full 3-D position in world space. */
export interface WorldPosition {
  /** East-West coordinate */
  x: number;
  /** Elevation above ground */
  y: number;
  /** North-South coordinate (negative = north, positive = south) */
  z: number;
}

/** 2-D position on the ground plane (Y omitted — always 0). */
export interface GroundPosition {
  /** East-West coordinate */
  x: number;
  /** North-South coordinate */
  z: number;
}

// ──────────────────────────────────────────────
// Districts
// ──────────────────────────────────────────────

export type UniversityDistrictType =
  | 'academic'
  | 'residential'
  | 'social'
  | 'sports'
  | 'administration'
  | 'religious'
  | 'commercial'
  | 'entrance'
  | 'green-space';

export interface DistrictDefinition {
  id: string;
  name: string;
  type: UniversityDistrictType;
  center: GroundPosition;
  /** Bounding rectangle on the ground plane. */
  bounds: { width: number; depth: number };
  color?: number;
  description?: string;
}

// ──────────────────────────────────────────────
// Buildings / Locations
// ──────────────────────────────────────────────

export type BuildingCategory =
  | 'library'
  | 'lecture-hall'
  | 'hostel'
  | 'cafeteria'
  | 'student-centre'
  | 'chapel'
  | 'mosque'
  | 'stadium'
  | 'sports-centre'
  | 'admin'
  | 'faculty'
  | 'gate'
  | 'security-post'
  | 'shop'
  | 'kiosk'
  | 'bus-stop'
  | 'health-centre'
  | 'generic';

export type BuildingSize = 'landmark' | 'large' | 'medium' | 'small' | 'tiny';

export interface LocationData {
  id: string;
  name: string;
  category: BuildingCategory;
  districtId: string;
  position: GroundPosition;
  /** Dimensions: width (X-axis), height (Y-axis), depth (Z-axis). */
  footprint: { width: number; height: number; depth: number };
  /** Rotation in radians around the Y axis. */
  rotation?: number;
  color: number;
  accentColor?: number;
  roofColor?: number;
  size: BuildingSize;
  isEnterable: boolean;
  interiorScene?: string;
  description?: string;
}

// ──────────────────────────────────────────────
// Lots
// ──────────────────────────────────────────────

export interface MapLot {
  id: string;
  /** ID of the location that occupies this lot (if any). */
  locationId?: string;
  districtId: string;
  position: GroundPosition;
  size: { width: number; depth: number };
  rotation?: number;
  type: 'interactive' | 'decorative';
}

// ──────────────────────────────────────────────
// Roads
// ──────────────────────────────────────────────

export interface RoadSegment {
  id: string;
  name?: string;
  tier: 'main' | 'secondary' | 'path';
  start: GroundPosition;
  end: GroundPosition;
  width: number;
}

// ──────────────────────────────────────────────
// Props / Decorations
// ──────────────────────────────────────────────

export type PropType =
  | 'tree-cluster'
  | 'palm-cluster'
  | 'bench'
  | 'lamp-post'
  | 'fountain'
  | 'statue'
  | 'planter'
  | 'trash-bin'
  | 'notice-board'
  | 'parking-area';

export interface PropPlacement {
  id: string;
  type: PropType;
  position: GroundPosition;
  rotation?: number;
  scale?: number;
  /** How many items in the cluster (tree-cluster / palm-cluster). */
  count?: number;
}

// ──────────────────────────────────────────────
// Water features
// ──────────────────────────────────────────────

export interface WaterFeature {
  id: string;
  name?: string;
  position: GroundPosition;
  size: { width: number; depth: number };
  type: 'lake' | 'pond' | 'fountain' | 'stream';
}

// ──────────────────────────────────────────────
// Ground patches (paved areas, fields, etc.)
// ──────────────────────────────────────────────

export interface GroundPatch {
  id: string;
  position: GroundPosition;
  size: { width: number; depth: number };
  color: number;
  type: 'paved' | 'field' | 'sand' | 'dirt';
}

// ──────────────────────────────────────────────
// Decorative (non-interactive) buildings
// ──────────────────────────────────────────────

export interface DecorativeBuilding {
  id: string;
  position: GroundPosition;
  footprint: { width: number; height: number; depth: number };
  color: number;
  rotation?: number;
}

// ──────────────────────────────────────────────
// Top-level university map
// ──────────────────────────────────────────────

export interface UniversityMap {
  name: string;
  /** Total world dimensions (X × Z). */
  worldSize: { width: number; depth: number };
  districts: DistrictDefinition[];
  locations: LocationData[];
  lots: MapLot[];
  roads: RoadSegment[];
  props: PropPlacement[];
  waterFeatures: WaterFeature[];
  groundPatches: GroundPatch[];
  decorativeBuildings: DecorativeBuilding[];
}
