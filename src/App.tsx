import { MapCanvas } from './ui/map/MapCanvas';
import { useGameStore } from './application/store/gameStore';
import { LocationScaffold } from './ui/location/LocationScaffold';

function App() {
  const currentScene = useGameStore((state) => state.currentScene);
  const selectedLocationId = useGameStore((state) => state.selectedLocationId);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {currentScene === 'map' && <MapCanvas />}
      
      {currentScene === 'interior' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#222', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <h1>Interior View: {selectedLocationId}</h1>
            <button 
              onClick={() => useGameStore.getState().returnToMap()} 
              style={{ 
                padding: '14px 24px', 
                marginTop: '20px', 
                cursor: 'pointer',
                backgroundColor: '#007aff',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              Return to Map
            </button>
          </div>
        </div>
      )}

      {currentScene === 'map' && selectedLocationId && (
        <LocationScaffold locationId={selectedLocationId} />
      )}
    </div>
  );
}

export default App;
