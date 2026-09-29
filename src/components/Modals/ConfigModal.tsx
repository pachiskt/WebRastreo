import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Map, 
  Key, 
  CheckCircle, 
  HelpCircle, 
  UploadCloud, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import type { FirebaseConfigParams } from '../../types';
import { getStoredFirebaseConfig, getStoredGoogleMapsApiKey, saveAppSettings, isFirebaseConfigured } from '../../firebase/config';
import { seedFirestore } from '../../firebase/service';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'guide'>('config');

  // Form states
  const [gmapsKey, setGmapsKey] = useState(getStoredGoogleMapsApiKey());
  const [firebaseParams, setFirebaseParams] = useState<FirebaseConfigParams>(getStoredFirebaseConfig());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    saveAppSettings(firebaseParams, gmapsKey);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onConfigSaved();
        onClose();
        window.location.reload(); // Reload to re-initialize SDKs cleanly
      }, 800);
    }, 400);
  };

  const handleSeedData = async () => {
    setSeedStatus('Poblando colección "unidades" en Firestore...');
    try {
      const result = await seedFirestore();
      setSeedStatus(`¡Éxito! Se cargaron ${result.count} unidades con coordenadas en Firestore.`);
    } catch (err: unknown) {
      const error = err as Error;
      setSeedStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modalBox}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitleRow}>
            <div style={styles.iconCircle}>
              <Database size={20} color="#005b8e" />
            </div>
            <div>
              <h2 style={styles.modalTitle}>Configuración Firebase & Google Maps</h2>
              <p style={styles.modalSubtitle}>
                Conecta tu backend de Firebase Firestore y tu API Key de Google Maps
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={18} color="#576d82" />
          </button>
        </div>

        {/* Tabs */}
        <div style={styles.tabNav}>
          <button
            onClick={() => setActiveTab('config')}
            style={{
              ...styles.tabNavItem,
              ...(activeTab === 'config' ? styles.tabNavItemActive : {})
            }}
          >
            <Key size={14} />
            <span>Credenciales y Conexión</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            style={{
              ...styles.tabNavItem,
              ...(activeTab === 'guide' ? styles.tabNavItemActive : {})
            }}
          >
            <HelpCircle size={14} />
            <span>Guía de Configuración Paso a Paso</span>
          </button>
        </div>

        {/* Tab 1: Config Form */}
        {activeTab === 'config' ? (
          <form onSubmit={handleSave} style={styles.contentBody}>
            {/* Status Indicator */}
            <div style={{
              ...styles.statusBanner,
              backgroundColor: isFirebaseConfigured ? '#ecfdf5' : '#fef3c7',
              borderColor: isFirebaseConfigured ? '#a7f3d0' : '#fde68a'
            }}>
              <div style={{
                ...styles.pulseDot,
                backgroundColor: isFirebaseConfigured ? '#10b981' : '#f59e0b'
              }} />
              <div style={styles.statusBannerText}>
                <strong>Estado actual: </strong>
                {isFirebaseConfigured 
                  ? 'Firebase inicializado y listo para sincronizar en tiempo real.' 
                  : 'Modo Prototipo local. Ingresa tus claves para activar Firebase y Google Maps en vivo.'}
              </div>
            </div>

            {/* Google Maps Section */}
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <Map size={17} color="#005b8e" />
                <h3 style={styles.sectionTitle}>1. Google Maps JavaScript API</h3>
              </div>
              <p style={styles.sectionDesc}>
                Introduce tu API Key de Google Cloud con la <em>Maps JavaScript API</em> habilitada:
              </p>
              <div style={styles.fieldRow}>
                <label style={styles.fieldLabel}>GOOGLE MAPS API KEY</label>
                <input
                  type="text"
                  placeholder="AIzaSy..."
                  value={gmapsKey}
                  onChange={(e) => setGmapsKey(e.target.value)}
                  style={styles.inputField}
                />
              </div>
            </div>

            {/* Firebase Section */}
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <Database size={17} color="#005b8e" />
                <h3 style={styles.sectionTitle}>2. Firebase SDK Config (Firestore & Auth)</h3>
              </div>
              <p style={styles.sectionDesc}>
                Copia estos valores desde la consola de Firebase (Project Settings → General → Tus apps → Web):
              </p>

              <div style={styles.gridFields}>
                <div style={styles.fieldRow}>
                  <label style={styles.fieldLabel}>API KEY</label>
                  <input
                    type="text"
                    placeholder="AIzaSy..."
                    value={firebaseParams.apiKey}
                    onChange={(e) => setFirebaseParams({ ...firebaseParams, apiKey: e.target.value })}
                    style={styles.inputField}
                  />
                </div>

                <div style={styles.fieldRow}>
                  <label style={styles.fieldLabel}>AUTH DOMAIN</label>
                  <input
                    type="text"
                    placeholder="tu-proyecto.firebaseapp.com"
                    value={firebaseParams.authDomain}
                    onChange={(e) => setFirebaseParams({ ...firebaseParams, authDomain: e.target.value })}
                    style={styles.inputField}
                  />
                </div>

                <div style={styles.fieldRow}>
                  <label style={styles.fieldLabel}>PROJECT ID</label>
                  <input
                    type="text"
                    placeholder="tu-proyecto-id"
                    value={firebaseParams.projectId}
                    onChange={(e) => setFirebaseParams({ ...firebaseParams, projectId: e.target.value })}
                    style={styles.inputField}
                  />
                </div>

                <div style={styles.fieldRow}>
                  <label style={styles.fieldLabel}>STORAGE BUCKET</label>
                  <input
                    type="text"
                    placeholder="tu-proyecto.appspot.com"
                    value={firebaseParams.storageBucket}
                    onChange={(e) => setFirebaseParams({ ...firebaseParams, storageBucket: e.target.value })}
                    style={styles.inputField}
                  />
                </div>

                <div style={styles.fieldRow}>
                  <label style={styles.fieldLabel}>MESSAGING SENDER ID</label>
                  <input
                    type="text"
                    placeholder="1234567890"
                    value={firebaseParams.messagingSenderId}
                    onChange={(e) => setFirebaseParams({ ...firebaseParams, messagingSenderId: e.target.value })}
                    style={styles.inputField}
                  />
                </div>

                <div style={styles.fieldRow}>
                  <label style={styles.fieldLabel}>APP ID</label>
                  <input
                    type="text"
                    placeholder="1:1234567890:web:abcdef"
                    value={firebaseParams.appId}
                    onChange={(e) => setFirebaseParams({ ...firebaseParams, appId: e.target.value })}
                    style={styles.inputField}
                  />
                </div>
              </div>
            </div>

            {/* Seed Firestore Tool */}
            {isFirebaseConfigured && (
              <div style={styles.seedSection}>
                <div style={styles.seedLeft}>
                  <UploadCloud size={18} color="#005b8e" />
                  <div>
                    <div style={styles.seedTitle}>Poblar Realtime Database con la Flota Inicial</div>
                    <div style={styles.seedDesc}>
                      Sube los 12 camiones con coordenadas y atributos al nodo <code>/camiones</code>.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSeedData}
                  style={styles.seedButton}
                >
                  <Sparkles size={14} />
                  <span>Subir 12 Unidades</span>
                </button>
              </div>
            )}

            {seedStatus && (
              <div style={styles.seedStatusMessage}>
                {seedStatus}
              </div>
            )}

            {/* Footer Buttons */}
            <div style={styles.footerRow}>
              <button type="button" onClick={onClose} style={styles.cancelBtn}>
                Cancelar
              </button>
              <button type="submit" disabled={isSaving} style={styles.saveBtn}>
                {saveSuccess ? (
                  <>
                    <CheckCircle size={16} />
                    <span>¡Guardado! Recargando...</span>
                  </>
                ) : (
                  <span>Guardar y Aplicar</span>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: Step-by-Step Guide */
          <div style={styles.guideContainer}>
            <div style={styles.guideStep}>
              <div style={styles.stepNum}>1</div>
              <div style={styles.stepContent}>
                <h4 style={styles.stepTitle}>Crear Proyecto en Firebase</h4>
                <p style={styles.stepText}>
                  Ve a <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" style={styles.link}>Firebase Console <ExternalLink size={11} /></a> y crea un nuevo proyecto (ej. <em>sierrabim-rastreo</em>).
                </p>
              </div>
            </div>

            <div style={styles.guideStep}>
              <div style={styles.stepNum}>2</div>
              <div style={styles.stepContent}>
                <h4 style={styles.stepTitle}>Habilitar Firestore Database</h4>
                <p style={styles.stepText}>
                  En el menú lateral de Firebase:
                </p>
                <ul style={styles.stepList}>
                  <li>Ve a <strong>Build → Firestore Database</strong> y haz clic en <strong>Crear base de datos</strong>.</li>
                  <li>Selecciona modo de prueba o configura las reglas para permitir lectura/escritura a operadores autenticados:</li>
                </ul>
                <div style={styles.codeSnippet}>
                  <code>{`rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /unidades/{document=**} {\n      allow read, write: if true; // o if request.auth != null;\n    }\n  }\n}`}</code>
                </div>
              </div>
            </div>

            <div style={styles.guideStep}>
              <div style={styles.stepNum}>3</div>
              <div style={styles.stepContent}>
                <h4 style={styles.stepTitle}>Habilitar Firebase Authentication</h4>
                <p style={styles.stepText}>
                  Ve a <strong>Build → Authentication → Sign-in method</strong>, habilita <strong>Correo electrónico/Contraseña</strong> y crea el usuario <code>operador@sierrabim.com</code>.
                </p>
              </div>
            </div>

            <div style={styles.guideStep}>
              <div style={styles.stepNum}>4</div>
              <div style={styles.stepContent}>
                <h4 style={styles.stepTitle}>Obtener API Key de Google Maps</h4>
                <p style={styles.stepText}>
                  Ve a <a href="https://console.cloud.google.com/google/maps-apis/overview" target="_blank" rel="noreferrer" style={styles.link}>Google Cloud Console <ExternalLink size={11} /></a>:
                </p>
                <ul style={styles.stepList}>
                  <li>Habilita la <strong>Maps JavaScript API</strong>.</li>
                  <li>En <em>Credenciales</em>, copia tu <strong>Clave de API</strong> y pégala en la pestaña <em>Credenciales y Conexión</em> o en el archivo <code>.env</code>.</li>
                </ul>
              </div>
            </div>

            <div style={styles.guideStep}>
              <div style={styles.stepNum}>5</div>
              <div style={styles.stepContent}>
                <h4 style={styles.stepTitle}>Configurar en archivo .env (Opcional)</h4>
                <p style={styles.stepText}>
                  Puedes crear un archivo <code>.env</code> en la raíz del proyecto para que las claves se carguen automáticamente:
                </p>
                <div style={styles.codeSnippet}>
                  <code>{`VITE_GOOGLE_MAPS_API_KEY=AIzaSy...\nVITE_FIREBASE_API_KEY=AIzaSy...\nVITE_FIREBASE_AUTH_DOMAIN=tu-app.firebaseapp.com\nVITE_FIREBASE_PROJECT_ID=tu-app\nVITE_FIREBASE_STORAGE_BUCKET=tu-app.appspot.com\nVITE_FIREBASE_MESSAGING_SENDER_ID=123456789\nVITE_FIREBASE_APP_ID=1:123456789:web:abcdef`}</code>
                </div>
              </div>
            </div>

            <div style={styles.footerRow}>
              <button onClick={() => setActiveTab('config')} style={styles.saveBtn}>
                Ir a Configuración
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 36, 56, 0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 680,
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    padding: '20px 24px 16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #f1f5f9'
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#e6f2f8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0f2438'
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#627d98',
    marginTop: 2
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  tabNav: {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    padding: '0 24px'
  },
  tabNavItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    fontSize: 13,
    fontWeight: 600,
    color: '#627d98',
    borderBottom: '2px solid transparent',
    cursor: 'pointer'
  },
  tabNavItemActive: {
    color: '#005b8e',
    borderBottomColor: '#005b8e',
    backgroundColor: '#ffffff'
  },
  contentBody: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 18
  },
  statusBanner: {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0
  },
  statusBannerText: {
    fontSize: 12,
    color: '#334e68',
    lineHeight: 1.4
  },
  sectionCard: {
    backgroundColor: '#fbfcfd',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '16px 18px'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0f2438'
  },
  sectionDesc: {
    fontSize: 12,
    color: '#627d98',
    marginBottom: 12
  },
  gridFields: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12
  },
  fieldRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#627d98',
    letterSpacing: '0.4px',
    textTransform: 'uppercase'
  },
  inputField: {
    padding: '9px 12px',
    borderRadius: 7,
    border: '1px solid #cbd5e1',
    fontSize: 13,
    color: '#0f2438',
    backgroundColor: '#ffffff',
    outline: 'none'
  },
  seedSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f7fc',
    border: '1px solid #cbe1f3',
    padding: '14px 16px',
    borderRadius: 10
  },
  seedLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  seedTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#005b8e'
  },
  seedDesc: {
    fontSize: 11,
    color: '#576d82',
    marginTop: 2
  },
  seedButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    backgroundColor: '#005b8e',
    color: '#ffffff',
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer'
  },
  seedStatusMessage: {
    padding: '8px 12px',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    fontSize: 12,
    color: '#334e68'
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 10
  },
  cancelBtn: {
    padding: '10px 18px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer'
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 22px',
    borderRadius: 8,
    backgroundColor: '#005b8e',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer'
  },
  guideContainer: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  guideStep: {
    display: 'flex',
    gap: 14,
    alignItems: 'flex-start'
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: '#005b8e',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0
  },
  stepContent: {
    flex: 1
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0f2438',
    marginBottom: 4
  },
  stepText: {
    fontSize: 12,
    color: '#576d82',
    lineHeight: 1.5
  },
  stepList: {
    fontSize: 12,
    color: '#576d82',
    lineHeight: 1.6,
    paddingLeft: 18,
    marginTop: 4
  },
  link: {
    color: '#0284c7',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    textDecoration: 'none'
  },
  codeSnippet: {
    backgroundColor: '#0f2438',
    color: '#f8fafc',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 8,
    whiteSpace: 'pre-wrap',
    overflowX: 'auto'
  }
};
