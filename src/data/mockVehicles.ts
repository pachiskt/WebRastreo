import type { Vehicle } from '../types';

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'CAM-84',
    name: 'Camión Recolector Centro',
    status: 'movement',
    statusLabel: 'En Movimiento',
    speed: 24,
    lat: -13.5218,
    lng: -71.9779,
    lastUpdate: 'Hace 1 min · 14:38 hrs',
    routeNormal: true,
    driver: 'Carlos Mendoza',
    plate: 'X3B-894',
    routeHistory: [
      { lat: -13.5180, lng: -71.9890 },
      { lat: -13.5195, lng: -71.9840 },
      { lat: -13.5210, lng: -71.9805 },
      { lat: -13.5218, lng: -71.9779 }
    ]
  },
  {
    id: 'CAM-01',
    name: 'Camión Cisterna Norte',
    status: 'movement',
    statusLabel: 'En Movimiento',
    speed: 38,
    lat: -13.5150,
    lng: -71.9820,
    lastUpdate: 'Hace 2 min · 14:37 hrs',
    routeNormal: true,
    driver: 'Jorge Huamán',
    plate: 'W1A-101',
    routeHistory: [
      { lat: -13.5080, lng: -71.9900 },
      { lat: -13.5115, lng: -71.9860 },
      { lat: -13.5150, lng: -71.9820 }
    ]
  },
  {
    id: 'CAM-02',
    name: 'Camión Reparto Wanchaq',
    status: 'warning',
    statusLabel: 'Desvío Leve',
    speed: 18,
    lat: -13.5280,
    lng: -71.9680,
    lastUpdate: 'Hace 3 min · 14:36 hrs',
    routeNormal: false,
    deviationInfo: 'CAM-02 (+300m vía alterna)',
    driver: 'Mario Quispe',
    plate: 'V4K-302',
    routeHistory: [
      { lat: -13.5220, lng: -71.9750 },
      { lat: -13.5250, lng: -71.9710 },
      { lat: -13.5280, lng: -71.9680 }
    ]
  },
  {
    id: 'CAM-07',
    name: 'Camión Volquete San Jerónimo',
    status: 'paused',
    statusLabel: 'Estacionado',
    speed: 0,
    lat: -13.5350,
    lng: -71.9540,
    lastUpdate: 'Hace 12 min · 14:26 hrs',
    routeNormal: true,
    driver: 'Raúl Condori',
    plate: 'Z8P-707',
    routeHistory: [
      { lat: -13.5348, lng: -71.9545 },
      { lat: -13.5350, lng: -71.9540 }
    ]
  },
  {
    id: 'CAM-12',
    name: 'Camión Tolva Santiago',
    status: 'movement',
    statusLabel: 'En Movimiento',
    speed: 31,
    lat: -13.5255,
    lng: -71.9730,
    lastUpdate: 'Hace 4 min · 14:35 hrs',
    routeNormal: true,
    driver: 'Luis Alberto Gómez',
    plate: 'T2X-912',
    routeHistory: [
      { lat: -13.5300, lng: -71.9790 },
      { lat: -13.5275, lng: -71.9755 },
      { lat: -13.5255, lng: -71.9730 }
    ]
  },
  {
    id: 'CAM-03',
    name: 'Camión Furgón San Sebastián',
    status: 'movement',
    statusLabel: 'En Movimiento',
    speed: 29,
    lat: -13.5305,
    lng: -71.9420,
    lastUpdate: 'Hace 5 min · 14:34 hrs',
    routeNormal: true,
    driver: 'Víctor Morales',
    plate: 'U5M-303',
    routeHistory: [
      { lat: -13.5350, lng: -71.9480 },
      { lat: -13.5320, lng: -71.9440 },
      { lat: -13.5305, lng: -71.9420 }
    ]
  },
  {
    id: 'CAM-05',
    name: 'Camión Compactador Poroy',
    status: 'movement',
    statusLabel: 'En Movimiento',
    speed: 22,
    lat: -13.5090,
    lng: -72.0100,
    lastUpdate: 'Hace 6 min · 14:33 hrs',
    routeNormal: true,
    driver: 'Héctor Cáceres',
    plate: 'P9R-505',
    routeHistory: [
      { lat: -13.5040, lng: -72.0150 },
      { lat: -13.5090, lng: -72.0100 }
    ]
  },
  {
    id: 'CAM-06',
    name: 'Camión Plataforma Saylla',
    status: 'paused',
    statusLabel: 'En Base',
    speed: 0,
    lat: -13.5510,
    lng: -71.8900,
    lastUpdate: 'Hace 45 min · 13:54 hrs',
    routeNormal: true,
    driver: 'Esteban Cusi',
    plate: 'B3N-606',
    routeHistory: []
  },
  {
    id: 'CAM-08',
    name: 'Camión de Auxilio Mecánico',
    status: 'paused',
    statusLabel: 'En Taller',
    speed: 0,
    lat: -13.5240,
    lng: -71.9610,
    lastUpdate: 'Hace 1 hr · 13:38 hrs',
    routeNormal: true,
    driver: 'Damián Flores',
    plate: 'A7V-808',
    routeHistory: []
  },
  {
    id: 'CAM-09',
    name: 'Camión Cisterna Sur',
    status: 'movement',
    statusLabel: 'En Movimiento',
    speed: 34,
    lat: -13.5420,
    lng: -71.9320,
    lastUpdate: 'Hace 3 min · 14:36 hrs',
    routeNormal: true,
    driver: 'Fabián Luna',
    plate: 'C1Q-909',
    routeHistory: [
      { lat: -13.5490, lng: -71.9250 },
      { lat: -13.5450, lng: -71.9290 },
      { lat: -13.5420, lng: -71.9320 }
    ]
  },
  {
    id: 'CAM-10',
    name: 'Camión Reparto Larapa',
    status: 'movement',
    statusLabel: 'En Movimiento',
    speed: 27,
    lat: -13.5270,
    lng: -71.9150,
    lastUpdate: 'Hace 2 min · 14:37 hrs',
    routeNormal: true,
    driver: 'Andrés Valdivia',
    plate: 'D4S-010',
    routeHistory: [
      { lat: -13.5290, lng: -71.9190 },
      { lat: -13.5270, lng: -71.9150 }
    ]
  },
  {
    id: 'CAM-11',
    name: 'Camión Residuos Peligrosos',
    status: 'movement',
    statusLabel: 'En Movimiento',
    speed: 19,
    lat: -13.5180,
    lng: -71.9890,
    lastUpdate: 'Hace 4 min · 14:35 hrs',
    routeNormal: true,
    driver: 'Nelson Palma',
    plate: 'E9T-111',
    routeHistory: [
      { lat: -13.5140, lng: -71.9930 },
      { lat: -13.5180, lng: -71.9890 }
    ]
  }
];
