import { useGameStore } from '../../application/store/gameStore';
import { demoUniversityMap } from '../../university/data/demo/demoMap';

export function LocationScaffold({ locationId }: { locationId: string }) {
  const location = demoUniversityMap.locations.find(l => l.id === locationId);
  const district = location ? demoUniversityMap.districts.find(d => d.id === location.districtId) : null;
  
  const close = () => useGameStore.getState().setSelectedLocation(null);
  const enter = () => useGameStore.getState().enterLocation(locationId);

  if (!location) return null;

  return (
    <div className="location-scaffold">
      <div className="scaffold-header">
        <h2>{location.name}</h2>
        <button onClick={close} className="close-btn">×</button>
      </div>
      <p className="type-label">
        {location.category.toUpperCase()} • {district?.name.toUpperCase()}
      </p>
      {location.description && <p className="description">{location.description}</p>}
      
      {location.isEnterable ? (
        <button className="enter-btn" onClick={enter}>ENTER</button>
      ) : (
        <p className="coming-soon">Coming soon</p>
      )}
    </div>
  );
}
