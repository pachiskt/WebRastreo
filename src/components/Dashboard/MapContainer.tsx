import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Crosshair, 
  MapPin, 
  X, 
  Plus, 
  Minus 
} from 'lucide-react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import L from 'leaflet';
import type { Vehicle } from '../../types';

interface MapContainerProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  onSelectVehicle: (vehicle: Vehicle | null) => void;
  googleMapsApiKey: string;
  onOpenSettings: () => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  googleMapsApiKey,
  onOpenSettings
}) => {
  const mapElementRef = useRef<HTMLDivElement>(null);
  
  // Map Type state: 'roadmap' | 'satellite'
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  
  // Real Google Maps state vs Leaflet interactive fallback
  const [isUsingGoogleMaps, setIsUsingGoogleMaps] = useState(false);
  const [mapsStatusNotice, setMapsStatusNotice] = useState<string | null>(null);

  // References to keep map instances
  const googleMapInstance = useRef<google.maps.Map | null>(null);
  const googleMarkers = useRef<Map<string, google.maps.Marker>>(new Map());
  const googlePolyline = useRef<google.maps.Polyline | null>(null);

  const leafletMapInstance = useRef<L.Map | null>(null);
  const leafletMarkers = useRef<Map<string, L.Marker>>(new Map());
  const leafletPolyline = useRef<L.Polyline | null>(null);
  const leafletTileLayer = useRef<L.TileLayer | null>(null);

  const defaultCenter = { lat: -13.5218, lng: -71.9779 }; // Cusco Center

  // Center on Fleet callback
  const handleCenterOnFleet = useCallback(() => {
    if (isUsingGoogleMaps && googleMapInstance.current) {
      if (vehicles.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        vehicles.forEach(v => bounds.extend({ lat: v.lat, lng: v.lng }));
        googleMapInstance.current.fitBounds(bounds, 50);
      } else {
        googleMapInstance.current.setCenter(defaultCenter);
        googleMapInstance.current.setZoom(14);
      }
    } else if (leafletMapInstance.current) {
      if (vehicles.length > 0) {
        const latLngs = vehicles.map(v => [v.lat, v.lng] as [number, number]);
        const bounds = L.latLngBounds(latLngs);
        leafletMapInstance.current.fitBounds(bounds, { padding: [50, 50] });
      } else {
        leafletMapInstance.current.setView([defaultCenter.lat, defaultCenter.lng], 14);
      }
    }
  }, [isUsingGoogleMaps, vehicles]);

  // Center on Selected Vehicle
  useEffect(() => {
    if (!selectedVehicle) return;

    if (isUsingGoogleMaps && googleMapInstance.current) {
      googleMapInstance.current.panTo({ lat: selectedVehicle.lat, lng: selectedVehicle.lng });
      googleMapInstance.current.setZoom(15);
    } else if (leafletMapInstance.current) {
      leafletMapInstance.current.panTo([selectedVehicle.lat, selectedVehicle.lng], { animate: true });
      leafletMapInstance.current.setZoom(15);
    }
  }, [selectedVehicle, isUsingGoogleMaps]);

  // Handle Zoom In / Zoom Out
  const handleZoom = (delta: number) => {
    if (isUsingGoogleMaps && googleMapInstance.current) {
      const currentZoom = googleMapInstance.current.getZoom() || 14;
      googleMapInstance.current.setZoom(currentZoom + delta);
    } else if (leafletMapInstance.current) {
      leafletMapInstance.current.setZoom(leafletMapInstance.current.getZoom() + delta);
    }
  };

  // Toggle Map Type (Roadmap / Satellite)
  const handleMapTypeChange = (type: 'roadmap' | 'satellite') => {
    setMapType(type);
    if (isUsingGoogleMaps && googleMapInstance.current) {
      googleMapInstance.current.setMapTypeId(
        type === 'roadmap' ? google.maps.MapTypeId.ROADMAP : google.maps.MapTypeId.HYBRID
      );
    } else if (leafletMapInstance.current && leafletTileLayer.current) {
      leafletMapInstance.current.removeLayer(leafletTileLayer.current);
      const newUrl = type === 'roadmap'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      
      const newLayer = L.tileLayer(newUrl, {
        attribution: '&copy; SierraBim Satellite / CartoDB / Esri'
      }).addTo(leafletMapInstance.current);
      
      leafletTileLayer.current = newLayer;
    }
  };

  // Initialize Map: Try Google Maps if API key is provided and valid, else Leaflet interactive fallback
  useEffect(() => {
    if (!mapElementRef.current) return;

    let isSubscribed = true;

    if (googleMapsApiKey && googleMapsApiKey.trim().length > 15 && !googleMapsApiKey.includes('YOUR_')) {
      try {
        setOptions({
          key: googleMapsApiKey,
          v: 'weekly'
        });

        Promise.all([
          importLibrary('maps') as Promise<google.maps.MapsLibrary>,
          importLibrary('marker') as Promise<google.maps.MarkerLibrary>
        ]).then(([mapsLib]) => {
          if (!isSubscribed || !mapElementRef.current) return;

          // Cleanup leaflet if it was mounted
          if (leafletMapInstance.current) {
            leafletMapInstance.current.remove();
            leafletMapInstance.current = null;
          }

          const map = new mapsLib.Map(mapElementRef.current, {
            center: defaultCenter,
            zoom: 14,
            disableDefaultUI: true,
            mapTypeId: mapType === 'roadmap' ? google.maps.MapTypeId.ROADMAP : google.maps.MapTypeId.HYBRID
          });

          googleMapInstance.current = map;
          setIsUsingGoogleMaps(true);
          setMapsStatusNotice('Google Maps API cargada exitosamente');
        }).catch((err: unknown) => {
          console.warn('Google Maps API failed, falling back to interactive Leaflet:', err);
          if (isSubscribed) {
            setMapsStatusNotice('No se pudo autenticar Google Maps API. Mostrando visor alternativo.');
            initLeaflet();
          }
        });
      } catch (err: unknown) {
        console.warn('Error configuring Google Maps loader:', err);
        initLeaflet();
      }
    } else {
      initLeaflet();
    }

    function initLeaflet() {
      if (!mapElementRef.current) return;
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
      }

      setIsUsingGoogleMaps(false);

      const map = L.map(mapElementRef.current, {
        center: [defaultCenter.lat, defaultCenter.lng],
        zoom: 14,
        zoomControl: false
      });

      const initialUrl = mapType === 'roadmap'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

      const tileLayer = L.tileLayer(initialUrl, {
        attribution: '&copy; SierraBim Fleet Tracking'
      }).addTo(map);

      leafletTileLayer.current = tileLayer;
      leafletMapInstance.current = map;
    }

    return () => {
      isSubscribed = false;
    };
  }, [googleMapsApiKey]);

  // Sync Markers and Polylines on Vehicles Update
  useEffect(() => {
    // 1. If using Google Maps
    if (isUsingGoogleMaps && googleMapInstance.current) {
      const currentIds = new Set(vehicles.map(v => v.id));
      googleMarkers.current.forEach((marker, id) => {
        if (!currentIds.has(id)) {
          marker.setMap(null);
          googleMarkers.current.delete(id);
        }
      });

      vehicles.forEach(vehicle => {
        const isWarning = vehicle.status === 'warning';
        const isPaused = vehicle.status === 'paused';
        const fillColor = isWarning ? '#d97706' : isPaused ? '#475569' : '#005b8e';

        if (googleMarkers.current.has(vehicle.id)) {
          const marker = googleMarkers.current.get(vehicle.id)!;
          marker.setPosition({ lat: vehicle.lat, lng: vehicle.lng });
        } else {
          const svgIcon = {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="${fillColor}" stroke="#ffffff" stroke-width="2.5"/>
                <path d="M11 20h2.5m7 0h3.5l2-3.5H23V14h-9v6zm-1 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm10 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              </svg>
            `)}`,
            scaledSize: new google.maps.Size(36, 36),
            anchor: new google.maps.Point(18, 18)
          };

          const marker = new google.maps.Marker({
            position: { lat: vehicle.lat, lng: vehicle.lng },
            map: googleMapInstance.current,
            icon: svgIcon,
            title: `${vehicle.id} - ${vehicle.name}`
          });

          marker.addListener('click', () => {
            onSelectVehicle(vehicle);
          });

          googleMarkers.current.set(vehicle.id, marker);
        }
      });

      if (googlePolyline.current) {
        googlePolyline.current.setMap(null);
        googlePolyline.current = null;
      }

      if (selectedVehicle && selectedVehicle.routeHistory && selectedVehicle.routeHistory.length > 0) {
        const path = [
          ...selectedVehicle.routeHistory,
          { lat: selectedVehicle.lat, lng: selectedVehicle.lng }
        ];

        googlePolyline.current = new google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: selectedVehicle.status === 'warning' ? '#d97706' : '#0284c7',
          strokeOpacity: 0.85,
          strokeWeight: 4,
          map: googleMapInstance.current
        });
      }
    }

    // 2. If using Leaflet fallback
    if (!isUsingGoogleMaps && leafletMapInstance.current) {
      const map = leafletMapInstance.current;

      const currentIds = new Set(vehicles.map(v => v.id));
      leafletMarkers.current.forEach((marker, id) => {
        if (!currentIds.has(id)) {
          map.removeLayer(marker);
          leafletMarkers.current.delete(id);
        }
      });

      vehicles.forEach(vehicle => {
        const isWarning = vehicle.status === 'warning';
        const isPaused = vehicle.status === 'paused';
        const bgBadge = isWarning ? '#d97706' : isPaused ? '#475569' : '#005b8e';
        const pulseEffect = vehicle.status === 'movement' ? 'box-shadow: 0 0 0 5px rgba(0, 91, 142, 0.25);' : '';

        const customHtml = `
          <div style="position: relative;">
            <div class="truck-label-pill ${isWarning ? 'warning' : ''}">
              ${vehicle.id}
            </div>
            <div style="width: 38px; height: 38px; border-radius: 50%; background: ${bgBadge}; border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; ${pulseEffect}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: customHtml,
          className: 'custom-truck-marker',
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        });

        if (leafletMarkers.current.has(vehicle.id)) {
          const marker = leafletMarkers.current.get(vehicle.id)!;
          marker.setLatLng([vehicle.lat, vehicle.lng]);
          marker.setIcon(customIcon);
        } else {
          const marker = L.marker([vehicle.lat, vehicle.lng], { icon: customIcon }).addTo(map);
          marker.on('click', () => {
            onSelectVehicle(vehicle);
          });
          leafletMarkers.current.set(vehicle.id, marker);
        }
      });

      if (leafletPolyline.current) {
        map.removeLayer(leafletPolyline.current);
        leafletPolyline.current = null;
      }

      if (selectedVehicle && selectedVehicle.routeHistory && selectedVehicle.routeHistory.length > 0) {
        const latLngs: [number, number][] = [
          ...selectedVehicle.routeHistory.map(p => [p.lat, p.lng] as [number, number]),
          [selectedVehicle.lat, selectedVehicle.lng]
        ];

        leafletPolyline.current = L.polyline(latLngs, {
          color: selectedVehicle.status === 'warning' ? '#d97706' : '#0284c7',
          weight: 4,
          opacity: 0.85,
          dashArray: selectedVehicle.status === 'warning' ? '6, 8' : undefined
        }).addTo(map);
      }
    }
  }, [vehicles, selectedVehicle, isUsingGoogleMaps, onSelectVehicle]);

  return (
    <div style={styles.container}>
      {/* Top Map Overlays matching Screenshot 2 */}
      <div style={styles.topControlBar}>
        {/* Left: Map / Satellite segmented control */}
        <div style={styles.segmentedToggle}>
          <button
            onClick={() => handleMapTypeChange('roadmap')}
            style={{
              ...styles.segmentButton,
              ...(mapType === 'roadmap' ? styles.segmentButtonActive : styles.segmentButtonInactive)
            }}
          >
            Mapa
          </button>
          <button
            onClick={() => handleMapTypeChange('satellite')}
            style={{
              ...styles.segmentButton,
              ...(mapType === 'satellite' ? styles.segmentButtonActive : styles.segmentButtonInactive)
            }}
          >
            Satélite
          </button>
        </div>

        {/* Region Location Tag */}
        <div style={styles.locationBadge}>
          <MapPin size={13} color="#005b8e" />
          <span>Región Cusco (-13.5218, -71.9779)</span>
        </div>

        {/* Center on Fleet Button */}
        <button onClick={handleCenterOnFleet} style={styles.centerButton}>
          <Crosshair size={14} color="#005b8e" />
          <span>Centrar en Flota</span>
        </button>

        {/* GPS Signal Status */}
        <div style={styles.gpsBadge}>
          <span style={styles.greenPulseDot} />
          <span>Señal GPS Óptima</span>
        </div>
      </div>

      {/* Notice if Google Maps is fallback or has info */}
      {!isUsingGoogleMaps && (
        <div style={styles.mapsStatusBanner}>
          <span>
            {mapsStatusNotice || 'Mostrando mapa satelital/vial alternativo. Puedes ingresar tu Google Maps API Key oficial en Ajustes.'}
          </span>
          <button onClick={onOpenSettings} style={styles.apiConfigButton}>
            Configurar API Key
          </button>
        </div>
      )}

      {/* Main Map Canvas */}
      <div ref={mapElementRef} style={styles.mapCanvas} />

      {/* Floating InfoWindow Card over Selected Truck matching Screenshot 2 */}
      {selectedVehicle && (
        <div style={styles.infoCardWrapper}>
          <div style={styles.infoCard}>
            {/* Header */}
            <div style={styles.infoCardHeader}>
              <div style={styles.infoBadgeGroup}>
                <span style={styles.infoIdBadge}>{selectedVehicle.id}</span>
                <span style={{
                  ...styles.infoStatusPill,
                  backgroundColor: selectedVehicle.status === 'warning' ? '#fffbeb' : '#ecfdf5',
                  color: selectedVehicle.status === 'warning' ? '#b45309' : '#059669',
                  borderColor: selectedVehicle.status === 'warning' ? '#fde68a' : '#a7f3d0'
                }}>
                  {selectedVehicle.statusLabel}
                </span>
              </div>
              <button 
                onClick={() => onSelectVehicle(null)} 
                style={styles.closeCardButton}
                title="Cerrar detalle"
              >
                <X size={15} color="#576d82" />
              </button>
            </div>

            {/* Vehicle Name */}
            <div style={styles.infoVehicleName}>
              {selectedVehicle.name}
            </div>

            {/* Two Columns: Speed & Coordinates */}
            <div style={styles.infoStatsGrid}>
              <div style={styles.statColumn}>
                <div style={styles.statColLabel}>VELOCIDAD</div>
                <div style={styles.statColValueSpeed}>{selectedVehicle.speed} km/h</div>
              </div>

              <div style={styles.statColumn}>
                <div style={styles.statColLabel}>COORDENADAS</div>
                <div style={styles.statColValueCoords}>
                  {selectedVehicle.lat.toFixed(4)}, {selectedVehicle.lng.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={styles.infoCardFooter}>
              <div style={styles.infoTimeText}>
                🕒 {selectedVehicle.lastUpdate}
              </div>
              <div style={{
                ...styles.infoRouteState,
                backgroundColor: selectedVehicle.routeNormal ? '#f0fdf4' : '#fffbeb',
                color: selectedVehicle.routeNormal ? '#15803d' : '#b45309'
              }}>
                {selectedVehicle.routeNormal ? 'Ruta Normal' : selectedVehicle.deviationInfo || 'Desvío Leve'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Zoom Controls bottom-right */}
      <div style={styles.zoomControls}>
        <button onClick={() => handleZoom(1)} style={styles.zoomButton} title="Acercar">
          <Plus size={16} color="#0f2438" />
        </button>
        <button onClick={() => handleZoom(-1)} style={styles.zoomButton} title="Alejar">
          <Minus size={16} color="#0f2438" />
        </button>
      </div>

      {/* Bottom Status Footer matching Screenshot 2 */}
      <div style={styles.bottomFooterBar}>
        <div style={styles.bottomLeft}>
          <span style={styles.greenPulseDot} />
          <span>Conexión Satelital GLONASS/GPS activa</span>
        </div>

        <div style={styles.bottomCenter}>
          <span>Centro: {defaultCenter.lat}, {defaultCenter.lng}</span>
          <span style={styles.dividerPipe}>|</span>
          <span>Escala: 1:25,000</span>
        </div>

        <div style={styles.bottomRight}>
          <span>Último reporte global: 14:38:22</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    height: '100%',
    maxHeight: 'calc(100vh - 215px)',
    backgroundColor: '#e5e7eb',
    borderRadius: 14,
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 2px 8px -2px rgba(15, 36, 56, 0.04)'
  },
  topControlBar: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    zIndex: 400,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    pointerEvents: 'none'
  },
  segmentedToggle: {
    display: 'flex',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 3,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
    pointerEvents: 'auto'
  },
  segmentButton: {
    padding: '6px 14px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 700,
    transition: 'all 0.15s ease'
  },
  segmentButtonActive: {
    backgroundColor: '#005b8e',
    color: '#ffffff'
  },
  segmentButtonInactive: {
    backgroundColor: 'transparent',
    color: '#475569'
  },
  locationBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    padding: '6px 12px',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
    fontSize: 12,
    fontWeight: 600,
    color: '#475569',
    pointerEvents: 'auto'
  },
  centerButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    padding: '6px 14px',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
    fontSize: 12,
    fontWeight: 700,
    color: '#005b8e',
    pointerEvents: 'auto',
    cursor: 'pointer'
  },
  gpsBadge: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    padding: '6px 12px',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
    fontSize: 12,
    fontWeight: 600,
    color: '#059669',
    pointerEvents: 'auto'
  },
  greenPulseDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#10b981',
    display: 'inline-block'
  },
  mapsStatusBanner: {
    position: 'absolute',
    top: 60,
    left: 14,
    zIndex: 390,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(6px)',
    border: '1px solid #e2e8f0',
    padding: '4px 12px',
    borderRadius: 6,
    fontSize: 11,
    color: '#627d98',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
  },
  apiConfigButton: {
    color: '#005b8e',
    fontWeight: 700,
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: 11
  },
  mapCanvas: {
    width: '100%',
    height: '100%',
    minHeight: 520
  },
  infoCardWrapper: {
    position: 'absolute',
    top: '32%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 500,
    pointerEvents: 'auto',
    animation: 'fadeIn 0.2s ease-out'
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    backdropFilter: 'blur(12px)',
    width: 320,
    borderRadius: 14,
    padding: '16px 18px',
    boxShadow: '0 16px 36px -4px rgba(15, 36, 56, 0.2), 0 4px 12px rgba(15, 36, 56, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.8)'
  },
  infoCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  infoBadgeGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  infoIdBadge: {
    backgroundColor: '#005b8e',
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 800,
    padding: '3px 8px',
    borderRadius: 6,
    letterSpacing: '0.4px'
  },
  infoStatusPill: {
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 10,
    border: '1px solid'
  },
  closeCardButton: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  infoVehicleName: {
    fontSize: 15,
    fontWeight: 700,
    color: '#0f2438',
    marginBottom: 12
  },
  infoStatsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    padding: '10px 12px',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    marginBottom: 12
  },
  statColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3
  },
  statColLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#829ab1',
    letterSpacing: '0.4px',
    textTransform: 'uppercase'
  },
  statColValueSpeed: {
    fontSize: 16,
    fontWeight: 800,
    color: '#0284c7'
  },
  statColValueCoords: {
    fontSize: 12,
    fontWeight: 600,
    color: '#334e68'
  },
  infoCardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4
  },
  infoTimeText: {
    fontSize: 11,
    color: '#829ab1'
  },
  infoRouteState: {
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 8
  },
  zoomControls: {
    position: 'absolute',
    bottom: 46,
    right: 14,
    zIndex: 400,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden'
  },
  zoomButton: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer'
  },
  bottomFooterBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(8px)',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    fontSize: 11,
    color: '#627d98',
    zIndex: 380
  },
  bottomLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontWeight: 600,
    color: '#059669'
  },
  bottomCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontWeight: 500,
    color: '#475569'
  },
  dividerPipe: {
    color: '#cbd5e1'
  },
  bottomRight: {
    fontWeight: 500,
    color: '#627d98'
  }
};
