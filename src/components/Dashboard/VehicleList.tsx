import React, { useState, useMemo } from 'react';
import { 
  ListFilter, 
  Search, 
  Gauge, 
  MapPin, 
  Clock, 
  ArrowRight,
  AlertTriangle 
} from 'lucide-react';
import type { Vehicle } from '../../types';

interface VehicleListProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

type FilterTab = 'all' | 'movement' | 'paused';

export const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // Tab filter
      if (activeTab === 'movement' && v.status !== 'movement') return false;
      if (activeTab === 'paused' && v.status !== 'paused') return false;

      // Search term filter
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesId = v.id.toLowerCase().includes(query);
        const matchesName = v.name.toLowerCase().includes(query);
        const matchesPlate = v.plate?.toLowerCase().includes(query);
        return matchesId || matchesName || matchesPlate;
      }
      return true;
    });
  }, [vehicles, activeTab, searchTerm]);

  const countAll = vehicles.length;
  const countMovement = vehicles.filter((v) => v.status === 'movement').length;
  const countPaused = vehicles.filter((v) => v.status === 'paused').length;

  return (
    <div style={styles.container}>
      {/* Title Header */}
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <ListFilter size={19} color="#005b8e" />
          <h2 style={styles.title}>Unidades en Ruta</h2>
        </div>
        <div style={styles.countBadge}>
          {filteredVehicles.length} / {vehicles.length} mostrados
        </div>
      </div>

      {/* Search Input */}
      <div style={styles.searchContainer}>
        <Search size={16} color="#829ab1" style={styles.searchIcon} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por ID (ej. CAM-04) o nombre del camión..."
          style={styles.searchInput}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} style={styles.clearSearch}>
            ✕
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={styles.tabsRow}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'all' ? styles.tabButtonActive : styles.tabButtonInactive)
          }}
        >
          Todos ({countAll})
        </button>
        <button
          onClick={() => setActiveTab('movement')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'movement' ? styles.tabButtonActive : styles.tabButtonInactive)
          }}
        >
          En movimiento ({countMovement})
        </button>
        <button
          onClick={() => setActiveTab('paused')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'paused' ? styles.tabButtonActive : styles.tabButtonInactive)
          }}
        >
          Detenidos ({countPaused})
        </button>
      </div>

      {/* Scrollable Vehicle Cards List */}
      <div style={styles.listScroll}>
        {filteredVehicles.length === 0 ? (
          <div style={styles.emptyState}>
            No se encontraron unidades con los filtros seleccionados.
          </div>
        ) : (
          filteredVehicles.map((vehicle) => {
            const isSelected = vehicle.id === selectedVehicleId;
            const isWarning = vehicle.status === 'warning';
            const isPaused = vehicle.status === 'paused';

            return (
              <div
                key={vehicle.id}
                onClick={() => onSelectVehicle(vehicle)}
                style={{
                  ...styles.vehicleCard,
                  borderColor: isSelected 
                    ? '#005b8e' 
                    : isWarning 
                    ? '#fcd34d' 
                    : '#e2e8f0',
                  backgroundColor: isSelected ? '#f8fbfd' : '#ffffff',
                  boxShadow: isSelected 
                    ? '0 0 0 1.5px #005b8e, 0 4px 12px rgba(0, 91, 142, 0.1)' 
                    : isWarning
                    ? '0 2px 8px rgba(245, 158, 11, 0.08)'
                    : '0 2px 6px rgba(15, 36, 56, 0.03)'
                }}
              >
                {/* Top Row: Badges & Speed */}
                <div style={styles.cardTopRow}>
                  <div style={styles.badgeGroup}>
                    {/* ID Badge */}
                    <span style={{
                      ...styles.idBadge,
                      backgroundColor: isWarning ? '#fef3c7' : '#e6f0fa',
                      color: isWarning ? '#b45309' : '#005b8e'
                    }}>
                      {vehicle.id}
                    </span>

                    {/* Status Pill */}
                    {isWarning ? (
                      <span style={styles.warningPill}>
                        <AlertTriangle size={12} color="#b45309" />
                        <span>{vehicle.statusLabel}</span>
                      </span>
                    ) : isPaused ? (
                      <span style={styles.pausedPill}>
                        <span style={styles.grayDot}>•</span>
                        <span>{vehicle.statusLabel}</span>
                      </span>
                    ) : (
                      <span style={styles.movementPill}>
                        <span style={styles.greenDot}>•</span>
                        <span>{vehicle.statusLabel}</span>
                      </span>
                    )}
                  </div>

                  {/* Speed */}
                  <div style={styles.speedDisplay}>
                    <Gauge size={14} color="#627d98" />
                    <span style={styles.speedText}>{vehicle.speed} km/h</span>
                  </div>
                </div>

                {/* Middle: Name & Coordinates */}
                <div style={styles.cardMiddle}>
                  <div style={styles.vehicleName}>{vehicle.name}</div>
                  <div style={styles.coordsRow}>
                    <MapPin size={13} color="#829ab1" />
                    <span>Lat: {vehicle.lat.toFixed(4)}, Lon: {vehicle.lng.toFixed(4)}</span>
                  </div>
                </div>

                {/* Bottom Row: Timestamp & "Ver en Mapa ->" */}
                <div style={styles.cardBottomRow}>
                  <div style={styles.timeRow}>
                    <Clock size={12} color="#829ab1" />
                    <span>{vehicle.lastUpdate}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVehicle(vehicle);
                    }}
                    style={styles.viewOnMapButton}
                  >
                    <span>Ver en Mapa</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    maxHeight: 'calc(100vh - 215px)',
    boxShadow: '0 2px 8px -2px rgba(15, 36, 56, 0.04)',
    overflow: 'hidden'
  },
  header: {
    padding: '18px 20px 14px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #f1f5f9'
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: '#0f2438'
  },
  countBadge: {
    fontSize: 12,
    fontWeight: 600,
    color: '#627d98',
    backgroundColor: '#f1f5f9',
    padding: '4px 10px',
    borderRadius: 12
  },
  searchContainer: {
    position: 'relative',
    margin: '14px 18px 10px 18px',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: 12
  },
  searchInput: {
    width: '100%',
    padding: '10px 32px 10px 36px',
    backgroundColor: '#f4f7fa',
    border: '1px solid #d9e2ec',
    borderRadius: 8,
    fontSize: 13,
    color: '#0f2438',
    outline: 'none',
    transition: 'border-color 0.15s'
  },
  clearSearch: {
    position: 'absolute',
    right: 10,
    fontSize: 12,
    color: '#829ab1',
    cursor: 'pointer'
  },
  tabsRow: {
    display: 'flex',
    gap: 8,
    padding: '4px 18px 14px 18px',
    borderBottom: '1px solid #f1f5f9'
  },
  tabButton: {
    padding: '6px 14px',
    borderRadius: 18,
    fontSize: 12,
    fontWeight: 600,
    transition: 'all 0.15s ease'
  },
  tabButtonActive: {
    backgroundColor: '#005b8e',
    color: '#ffffff',
    boxShadow: '0 2px 6px rgba(0, 91, 142, 0.25)'
  },
  tabButtonInactive: {
    backgroundColor: '#ffffff',
    color: '#576d82',
    border: '1px solid #d9e2ec'
  },
  listScroll: {
    flex: 1,
    overflowY: 'auto',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  emptyState: {
    padding: 30,
    textAlign: 'center',
    color: '#829ab1',
    fontSize: 13
  },
  vehicleCard: {
    borderRadius: 10,
    border: '1.5px solid #e2e8f0',
    padding: '14px 14px 12px 14px',
    cursor: 'pointer',
    transition: 'all 0.18s ease'
  },
  cardTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  badgeGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  idBadge: {
    fontSize: 11,
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: 6,
    letterSpacing: '0.3px'
  },
  movementPill: {
    fontSize: 11,
    fontWeight: 600,
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: '2px 8px',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 4
  },
  greenDot: {
    fontSize: 14,
    lineHeight: 1,
    color: '#10b981'
  },
  pausedPill: {
    fontSize: 11,
    fontWeight: 600,
    color: '#475569',
    backgroundColor: '#f1f5f9',
    padding: '2px 8px',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 4
  },
  grayDot: {
    fontSize: 14,
    lineHeight: 1,
    color: '#64748b'
  },
  warningPill: {
    fontSize: 11,
    fontWeight: 700,
    color: '#b45309',
    backgroundColor: '#fef3c7',
    padding: '2px 8px',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    border: '1px solid #fde68a'
  },
  speedDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    fontWeight: 600,
    color: '#475569'
  },
  speedText: {
    color: '#0f2438'
  },
  cardMiddle: {
    marginBottom: 10
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0f2438',
    marginBottom: 3
  },
  coordsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: '#627d98'
  },
  cardBottomRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTop: '1px solid #f1f5f9'
  },
  timeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    color: '#829ab1'
  },
  viewOnMapButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    fontWeight: 700,
    color: '#005b8e',
    cursor: 'pointer'
  }
};
