import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { StatsCards } from './StatsCards';
import { VehicleList } from './VehicleList';
import { MapContainer } from './MapContainer';
import { ConfigModal } from '../Modals/ConfigModal';
import type { Vehicle, UserProfile } from '../../types';
import { subscribeToFleet, logoutUser } from '../../firebase/service';
import { isFirebaseConfigured, getStoredGoogleMapsApiKey } from '../../firebase/config';

interface DashboardProps {
  user: UserProfile;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [googleMapsKey, setGoogleMapsKey] = useState(getStoredGoogleMapsApiKey());
  const [isLiveSimulating, setIsLiveSimulating] = useState(!isFirebaseConfigured);

  // Subscribe to Fleet from Firebase or local prototype store
  useEffect(() => {
    const unsubscribe = subscribeToFleet((updatedList) => {
      setVehicles(updatedList);
      // If a vehicle was selected, sync its latest state
      setSelectedVehicle((prev) => {
        if (!prev) return updatedList[0] || null; // Select first by default like CAM-84
        const found = updatedList.find((v) => v.id === prev.id);
        return found || prev;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Set default selected vehicle to CAM-84 (matching Screenshot 2)
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) {
      const cam84 = vehicles.find((v) => v.id === 'CAM-84') || vehicles[0];
      setSelectedVehicle(cam84);
    }
  }, [vehicles, selectedVehicle]);

  // Telemetry Simulation (subtly moves moving trucks along their routes so the dashboard feels alive!)
  useEffect(() => {
    if (!isLiveSimulating) return;

    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.status !== 'movement') return v;

          // Tiny GPS jitter / forward movement
          const deltaLat = (Math.random() - 0.48) * 0.0003;
          const deltaLng = (Math.random() - 0.48) * 0.0003;
          const newSpeed = Math.max(15, Math.min(50, Math.round(v.speed + (Math.random() * 4 - 2))));

          const newPoint = { lat: v.lat, lng: v.lng };
          const history = v.routeHistory ? [...v.routeHistory.slice(-15), newPoint] : [newPoint];

          return {
            ...v,
            lat: v.lat + deltaLat,
            lng: v.lng + deltaLng,
            speed: newSpeed,
            routeHistory: history
          };
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveSimulating]);

  const handleSelectVehicle = (vehicle: Vehicle | null) => {
    setSelectedVehicle(vehicle);
  };

  const handleLogoutClick = async () => {
    await logoutUser();
    onLogout();
  };

  const handleConfigSaved = () => {
    setGoogleMapsKey(getStoredGoogleMapsApiKey());
  };

  return (
    <div style={styles.dashboardContainer}>
      {/* Top Header */}
      <Header
        user={user}
        onLogout={handleLogoutClick}
        onOpenSettings={() => setIsConfigOpen(true)}
        isFirebaseActive={isFirebaseConfigured}
        isLiveSimulating={isLiveSimulating}
        onToggleSimulation={() => setIsLiveSimulating(!isLiveSimulating)}
      />

      {/* Main Content Area */}
      <main style={styles.mainContent}>
        {/* KPI Stats Row (4 Cards) */}
        <StatsCards vehicles={vehicles} />

        {/* Main Grid: Left List (35%) & Right Map (65%) */}
        <div style={styles.workspaceGrid}>
          {/* Left Column: Units in Route */}
          <div style={styles.leftColumn}>
            <VehicleList
              vehicles={vehicles}
              selectedVehicleId={selectedVehicle?.id || null}
              onSelectVehicle={handleSelectVehicle}
            />
          </div>

          {/* Right Column: Google Maps & Satellite Tracking */}
          <div style={styles.rightColumn}>
            <MapContainer
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              onSelectVehicle={handleSelectVehicle}
              googleMapsApiKey={googleMapsKey}
              onOpenSettings={() => setIsConfigOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Settings & Firebase / Google Maps Guide Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onConfigSaved={handleConfigSaved}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  dashboardContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f2f5f9'
  },
  mainContent: {
    flex: 1,
    padding: '20px 28px',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 1800,
    margin: '0 auto',
    width: '100%'
  },
  workspaceGrid: {
    display: 'grid',
    gridTemplateColumns: '380px 1fr',
    gap: 20,
    flex: 1,
    minHeight: 0
  },
  leftColumn: {
    height: '100%'
  },
  rightColumn: {
    height: '100%'
  }
};
