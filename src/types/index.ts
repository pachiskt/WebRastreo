export type VehicleStatus = 'movement' | 'paused' | 'warning';

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface Vehicle {
  id: string; // e.g. "CAM-84"
  name: string; // e.g. "Camión Recolector Centro"
  status: VehicleStatus; // 'movement' | 'paused' | 'warning'
  statusLabel: string; // "En Movimiento" | "Estacionado" | "Desvío Leve" | "En Base"
  speed: number; // in km/h
  lat: number;
  lng: number;
  lastUpdate: string; // e.g. "Hace 1 min · 14:38 hrs"
  routeNormal: boolean;
  deviationInfo?: string; // e.g. "+300m vía alterna"
  driver?: string;
  plate?: string;
  routeHistory?: RoutePoint[];
}

export interface FleetStats {
  total: number;
  activeCount: number;
  inMovement: number;
  avgSpeed: number;
  paused: number;
  alertCount: number;
  alertSummary: string;
}

export interface UserProfile {
  email: string;
  name: string;
  role: string;
}

export interface FirebaseConfigParams {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  databaseURL?: string;
}

export interface AppSettings {
  googleMapsApiKey: string;
  firebaseConfig: FirebaseConfigParams;
  isFirebaseConnected: boolean;
  isGoogleMapsLoaded: boolean;
}
