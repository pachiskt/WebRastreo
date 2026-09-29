import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { 
  ref, 
  onValue, 
  set, 
  update 
} from 'firebase/database';
import { firebaseAuth, firebaseRtdb, isFirebaseConfigured } from './config';
import type { Vehicle, UserProfile } from '../types';
import { INITIAL_VEHICLES } from '../data/mockVehicles';

const RTDB_NODE_NAME = 'camiones';

// Auth State Listener
export const listenToAuth = (callback: (user: UserProfile | null) => void) => {
  if (isFirebaseConfigured && firebaseAuth) {
    return onAuthStateChanged(firebaseAuth, (user: FirebaseUser | null) => {
      if (user) {
        callback({
          email: user.email || 'operador@sierrabim.com',
          name: user.displayName || 'Sarah Jenkins',
          role: 'Supervisora de Turno'
        });
      } else {
        callback(null);
      }
    });
  } else {
    // Check local session in prototype mode
    const storedUser = localStorage.getItem('sierrabim_user_session');
    if (storedUser) {
      try {
        callback(JSON.parse(storedUser));
      } catch {
        callback(null);
      }
    } else {
      callback(null);
    }
    return () => {};
  }
};

// Login function (supports real Firebase Auth and predefined MVP operator credentials)
export const loginUser = async (email: string, password: string): Promise<UserProfile> => {
  const cleanEmail = email.trim();
  const cleanPassword = password.trim();

  if (!cleanEmail || !cleanPassword) {
    throw new Error('Por favor ingresa tu correo y contraseña.');
  }

  // 1. Try Firebase Authentication if configured
  if (isFirebaseConfigured && firebaseAuth) {
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, cleanEmail, cleanPassword);
      const profile: UserProfile = {
        email: cred.user.email || cleanEmail,
        name: cred.user.displayName || 'Sarah Jenkins',
        role: 'Supervisora de Turno'
      };
      localStorage.setItem('sierrabim_user_session', JSON.stringify(profile));
      return profile;
    } catch {
      // 2. Allow MVP operator login credentials
      if (
        (cleanEmail === 'operador@sierrabim.com' && cleanPassword === 'Control2026!') ||
        (cleanEmail === 'admin@sierrabim.com' && cleanPassword === 'Sierrabim2026!')
      ) {
        const profile: UserProfile = {
          email: cleanEmail,
          name: 'Sarah Jenkins',
          role: 'Supervisora de Turno'
        };
        localStorage.setItem('sierrabim_user_session', JSON.stringify(profile));
        return profile;
      }

      throw new Error('Credenciales inválidas. Usa: operador@sierrabim.com / Control2026!');
    }
  } else {
    if (
      cleanPassword === 'Control2026!' ||
      cleanPassword === 'Sierrabim2026!' ||
      cleanEmail === 'operador@sierrabim.com'
    ) {
      const profile: UserProfile = {
        email: cleanEmail,
        name: 'Sarah Jenkins',
        role: 'Supervisora de Turno'
      };
      localStorage.setItem('sierrabim_user_session', JSON.stringify(profile));
      return profile;
    }
    throw new Error('Credenciales inválidas. Usa: operador@sierrabim.com / Control2026!');
  }
};

// Logout function
export const logoutUser = async (): Promise<void> => {
  if (isFirebaseConfigured && firebaseAuth) {
    try {
      await signOut(firebaseAuth);
    } catch (e) {
      console.warn('Error signing out:', e);
    }
  }
  localStorage.removeItem('sierrabim_user_session');
};

interface RtdbCamionRaw {
  id?: string;
  nombre?: string;
  name?: string;
  latitud?: number | string;
  longitud?: number | string;
  lat?: number | string;
  lng?: number | string;
  velocidad?: number | string;
  speed?: number | string;
  timestamp?: number | string;
  desvio?: boolean | string;
  placa?: string;
  plate?: string;
}

// Helper to convert Android Realtime Database item to standard Vehicle
const mapRtdbToVehicle = (key: string, data: RtdbCamionRaw): Vehicle => {
  const rawId = data.id || key;
  const rawName = data.nombre || data.name || `Camión ${rawId}`;
  
  // Parse coordinates with support for both positive/negative Cusco values
  let lat = Number(data.latitud ?? data.lat ?? -13.5218);
  let lng = Number(data.longitud ?? data.lng ?? -71.9779);
  
  // Correct typical sign issues (Cusco Peru is in southern and western hemisphere: -13.xx, -71.xx)
  if (lat > 0 && lat < 20) lat = -lat;
  if (lng > 0 && lng > 60) lng = -lng;

  const speed = Number(data.velocidad ?? data.speed ?? 0);
  
  // Format timestamp
  let lastUpdate = 'Hace unos momentos';
  if (data.timestamp) {
    const timeNum = Number(data.timestamp);
    if (!isNaN(timeNum)) {
      const date = new Date(timeNum);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      lastUpdate = `Hoy · ${hours}:${minutes} hrs`;
    }
  }

  // Determine status
  const isWarning = Boolean(data.desvio) || rawId === 'CAM-02' || rawId.toLowerCase().includes('alerta');
  const isPaused = speed === 0;

  return {
    id: rawId,
    name: rawName,
    lat,
    lng,
    speed,
    status: isWarning ? 'warning' : isPaused ? 'paused' : 'movement',
    statusLabel: isWarning ? 'Desvío Leve' : isPaused ? 'Estacionado' : 'En Movimiento',
    lastUpdate,
    routeNormal: !isWarning,
    deviationInfo: isWarning ? '+300m vía alterna' : undefined,
    plate: data.placa || data.plate,
    routeHistory: [
      { lat: lat - 0.001, lng: lng - 0.001 },
      { lat, lng }
    ]
  };
};

// Realtime Vehicles Listener from Firebase Realtime Database (/camiones)
export const subscribeToFleet = (
  onVehiclesUpdate: (vehicles: Vehicle[]) => void,
  onError?: (err: Error) => void
): (() => void) => {
  if (isFirebaseConfigured && firebaseRtdb) {
    try {
      const camionesRef = ref(firebaseRtdb, RTDB_NODE_NAME);

      const unsubscribe = onValue(
        camionesRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val() as Record<string, RtdbCamionRaw>;
            const liveVehicles: Vehicle[] = [];

            Object.entries(data).forEach(([key, val]) => {
              if (val && typeof val === 'object') {
                liveVehicles.push(mapRtdbToVehicle(key, val));
              }
            });

            // Sort live vehicles by ID
            liveVehicles.sort((a, b) => a.id.localeCompare(b.id));

            console.log(`[SierraBim] ${liveVehicles.length} camiones en vivo recibidos desde Realtime Database /camiones:`, liveVehicles);
            
            // Deliver ONLY the real vehicles from Firebase Realtime Database!
            onVehiclesUpdate(liveVehicles);
          } else {
            console.log('Nodo /camiones vacío en Realtime Database');
            onVehiclesUpdate([]);
          }
        },
        (error) => {
          console.error('Error al escuchar Realtime Database:', error);
          if (onError) onError(error);
          onVehiclesUpdate(INITIAL_VEHICLES);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('Fallback a datos simulados debido a error en RTDB:', e);
      onVehiclesUpdate(INITIAL_VEHICLES);
      return () => {};
    }
  } else {
    // Prototype mode
    onVehiclesUpdate(INITIAL_VEHICLES);
    return () => {};
  }
};

// Seed Realtime Database with initial 12 vehicles (1 click setup)
export const seedRealtimeDatabase = async (): Promise<{ count: number }> => {
  if (!isFirebaseConfigured || !firebaseRtdb) {
    throw new Error('Firebase no está configurado. Por favor ingresa tus credenciales en Ajustes.');
  }

  const camionesPayload: Record<string, RtdbCamionRaw> = {};

  INITIAL_VEHICLES.forEach((v) => {
    camionesPayload[v.id] = {
      id: v.id,
      nombre: v.name,
      latitud: v.lat,
      longitud: v.lng,
      velocidad: v.speed,
      timestamp: Date.now(),
      desvio: v.status === 'warning'
    };
  });

  const camionesRef = ref(firebaseRtdb, RTDB_NODE_NAME);
  await set(camionesRef, camionesPayload);

  return { count: INITIAL_VEHICLES.length };
};

// Seed Firestore (alias for compatibility)
export const seedFirestore = seedRealtimeDatabase;

// Update Vehicle Position in Realtime Database
export const updateVehiclePositionInFirestore = async (
  vehicleId: string,
  lat: number,
  lng: number,
  speed: number
) => {
  if (isFirebaseConfigured && firebaseRtdb) {
    const vehicleRef = ref(firebaseRtdb, `${RTDB_NODE_NAME}/${vehicleId}`);
    await update(vehicleRef, {
      latitud: lat,
      longitud: lng,
      velocidad: speed,
      timestamp: Date.now()
    });
  }
};
