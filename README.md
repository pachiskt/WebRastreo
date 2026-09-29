# SierraBim - Centro de Control y Monitoreo de Flotas (Web Tracking)

Prototipo frontend de alta fidelidad desarrollado con **React**, **TypeScript**, **Vite**, **Google Maps JavaScript API** y conexión a **Firebase (Authentication & Cloud Firestore)**.

---

## 🚀 Inicio Rápido

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

3. **Credenciales de prueba (Modo Demostración):**
   - **Usuario / Correo:** `operador@sierrabim.com`
   - **Contraseña:** cualquier clave (o haz clic en el botón *«Ingreso Rápido con 1 Clic (Demo)»*)

---

## 🛠️ Estructura del Proyecto

```
├── src/
│   ├── components/
│   │   ├── Login/
│   │   │   └── LoginScreen.tsx       # Pantalla de Login (Fiel a la Imagen 1)
│   │   ├── Dashboard/
│   │   │   ├── Header.tsx            # Barra superior con logo SierraBim y perfil
│   │   │   ├── StatsCards.tsx        # 4 Tarjetas KPI (Total, En Movimiento, Pausa, Alertas)
│   │   │   ├── VehicleList.tsx       # Lista de unidades con búsqueda y filtros
│   │   │   ├── MapContainer.tsx      # Contenedor del mapa con Google Maps API y visor satelital
│   │   │   └── Dashboard.tsx         # Vista principal que orquesta el centro de control
│   │   └── Modals/
│   │       └── ConfigModal.tsx       # Modal de configuración de Firebase y Google Maps + Guía
│   ├── data/
│   │   └── mockVehicles.ts           # 12 unidades en Cusco con coordenadas y rutas
│   ├── firebase/
│   │   ├── config.ts                 # Inicialización segura de Firebase SDK
│   │   └── service.ts                # Servicios de Auth, Firestore en tiempo real y Seeding
│   ├── types/
│   │   └── index.ts                  # Interfaces TypeScript (Vehicle, Stats, UserProfile, Config)
│   ├── App.tsx                       # Control de sesión y enrutamiento
│   ├── index.css                     # Sistema de diseño, tokens y estilos globales
│   └── main.tsx                      # Punto de entrada
├── .env.example                      # Plantilla de variables de entorno
└── package.json
```

---

## 📡 Cómo Conectar con Firebase

### 1. Crear Proyecto en Firebase Console
1. Entra a [Firebase Console](https://console.firebase.google.com/) y crea un proyecto.
2. Registra una aplicación web para obtener tus credenciales.

### 2. Habilitar Authentication
- En el menú lateral, ve a **Build → Authentication**.
- Habilita el método **Correo electrónico / Contraseña**.
- Agrega un usuario (ejemplo: `operador@sierrabim.com`).

### 3. Habilitar Cloud Firestore
- Ve a **Build → Firestore Database** y crea la base de datos en modo prueba o define las reglas:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /unidades/{document=**} {
      allow read, write: if true; // O if request.auth != null;
    }
  }
}
```

### 4. Poblar la Base de Datos con 1 Clic
- Dentro de la aplicación, haz clic en el icono de **Ajustes (⚙️)** en el encabezado.
- Ingresa tus credenciales de Firebase y haz clic en **«Subir 12 Unidades» (Seed Firestore)**. Esto creará automáticamente los 12 camiones con sus coordenadas en Cusco, velocidades y estados en tu colección `unidades`.

### 5. Estructura de Datos en Firestore (`unidades`)
Cada documento en la colección `unidades` tiene la siguiente estructura:
```json
{
  "id": "CAM-84",
  "name": "Camión Recolector Centro",
  "status": "movement",
  "statusLabel": "En Movimiento",
  "speed": 24,
  "lat": -13.5218,
  "lng": -71.9779,
  "lastUpdate": "Hace 1 min · 14:38 hrs",
  "routeNormal": true,
  "driver": "Carlos Mendoza",
  "plate": "X3B-894",
  "routeHistory": [
    { "lat": -13.5180, "lng": -71.9890 },
    { "lat": -13.5218, "lng": -71.9779 }
  ]
}
```

La aplicación utiliza `onSnapshot` de Firestore, lo que significa que **cualquier cambio en la base de datos se reflejará instantáneamente en el mapa y en la lista sin recargar la página**.

---

## 🗺️ Cómo Conectar con Google Maps API

1. Ve a [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/overview).
2. Habilita la **Maps JavaScript API**.
3. En la sección **Credenciales**, genera una **Clave de API (API Key)**.
4. Puedes ingresarla de dos formas:
   - **Directamente en la app:** Abre el botón de Ajustes (⚙️) y pégala en el campo *«Google Maps API Key»*.
   - **En el archivo `.env`:** Crea un archivo `.env` en la raíz con:
     ```env
     VITE_GOOGLE_MAPS_API_KEY=AIzaSyTuClaveDeGoogleMapsAqui
     ```
5. Si no cuentas con una API Key en este momento, el sistema incluye un **visor cartográfico interactivo alternativo** con las mismas coordenadas de Cusco (-13.5218, -71.9779), marcadores satelitales, capas de rutas y tarjetas informativas.
