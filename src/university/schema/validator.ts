import type { UniversityMap } from './types';

export function validateMapLayout(map: UniversityMap) {
  let warnings = 0;
  
  console.log(`[Map Validation] Checking map: ${map.name}`);

  // Check building bounds against lots
  map.locations.forEach(loc => {
    const lot = map.lots.find(l => l.locationId === loc.id);
    if (lot) {
      if (loc.footprint.width > lot.size.width || loc.footprint.depth > lot.size.depth) {
        console.warn(`[Map] Warning: Location '${loc.id}' is larger than its lot.`);
        warnings++;
      }
      
      const dx = Math.abs(loc.position.x - lot.position.x);
      const dz = Math.abs(loc.position.z - lot.position.z);
      if (dx > lot.size.width/2 || dz > lot.size.depth/2) {
        console.warn(`[Map] Warning: Location '${loc.id}' is outside its lot bounds.`);
        warnings++;
      }
    } else {
        console.warn(`[Map] Warning: Location '${loc.id}' has no associated lot.`);
        warnings++;
    }

    // Check against district
    const district = map.districts.find(d => d.id === loc.districtId);
    if (district) {
       const dx = Math.abs(loc.position.x - district.center.x);
       const dz = Math.abs(loc.position.z - district.center.z);
       if (dx > district.bounds.width/2 || dz > district.bounds.depth/2) {
           console.warn(`[Map] Warning: Location '${loc.id}' is outside its district '${district.id}'.`);
           warnings++;
       }
    }
  });

  // Basic overlap detection for interactive buildings
  for (let i = 0; i < map.locations.length; i++) {
    for (let j = i + 1; j < map.locations.length; j++) {
      const a = map.locations[i];
      const b = map.locations[j];

      const dx = Math.abs(a.position.x - b.position.x);
      const dz = Math.abs(a.position.z - b.position.z);

      // Simple bounding box check
      if (dx < (a.footprint.width + b.footprint.width)/2 && 
          dz < (a.footprint.depth + b.footprint.depth)/2) {
        console.warn(`[Map] Warning: Location '${a.id}' overlaps with '${b.id}'.`);
        warnings++;
      }
    }
  }

  if (warnings === 0) {
    console.log(`[Map Validation] Success! No warnings found.`);
  } else {
    console.log(`[Map Validation] Found ${warnings} warnings.`);
  }
}
