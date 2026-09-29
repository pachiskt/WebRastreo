import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Building2, ArrowRight, ShieldCheck } from 'lucide-react';
import { loginUser } from '../../firebase/service';
import { isFirebaseConfigured } from '../../firebase/config';
import type { UserProfile } from '../../types';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  onOpenSettings: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onOpenSettings }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await loginUser(email, password);
      onLoginSuccess(user);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error logging in:', error);
      setErrorMessage(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Top status banner */}
      <div style={styles.topBar}>
        <div style={styles.badgeConnection}>
          <span style={{
            ...styles.indicatorDot,
            backgroundColor: isFirebaseConfigured ? '#10b981' : '#f59e0b'
          }} />
          <span style={styles.connectionText}>
            {isFirebaseConfigured ? 'Firebase: Conectado a Firestore' : 'Modo Prototipo / Simulación'}
          </span>
        </div>
        <button onClick={onOpenSettings} style={styles.settingsLink}>
          ⚙️ Ajustes Firebase & Google Maps
        </button>
      </div>

      {/* Main Login Card matching Screenshot 1 */}
      <div style={styles.cardWrapper}>
        <div style={styles.card}>
          {/* Top Logo placeholder */}
          <div style={styles.logoSection}>
            <div style={styles.logoPlaceholderBox}>
              <div style={styles.logoInnerSquare} />
            </div>

            <div style={styles.sierraBimChip}>
              <span style={styles.chipDot}>•</span>
              <span style={styles.chipText}>SIERRABIM</span>
            </div>
          </div>

          {/* Heading */}
          <div style={styles.headerTextSection}>
            <h1 style={styles.title}>Acceso al Centro de Control</h1>
            <p style={styles.subtitle}>
              Monitoreo de Flotas, Telemetría y Gestión de Rutas en Tiempo Real
            </p>
          </div>

          {/* Error display if any */}
          {errorMessage && (
            <div style={styles.errorAlert}>
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Input 1: Usuario o Correo */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>USUARIO O CORREO CORPORATIVO</label>
              <div style={styles.inputContainer}>
                <Building2 size={18} color="#627d98" style={styles.inputIcon} />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operador@sierrabim.com"
                  required
                  style={styles.textInput}
                />
              </div>
            </div>

            {/* Input 2: Contraseña */}
            <div style={styles.fieldGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>CONTRASEÑA</label>
                <a 
                  href="#recuperar" 
                  onClick={(e) => { e.preventDefault(); alert('Instrucción: Contacta al administrador del sistema SierraBim para restablecer tu clave.'); }} 
                  style={styles.forgotLink}
                >
                  ¿Olvidó su contraseña?
                </a>
              </div>
              <div style={styles.inputContainer}>
                <Lock size={18} color="#627d98" style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={styles.textInput}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} color="#627d98" /> : <Eye size={18} color="#627d98" />}
                </button>
              </div>
            </div>

            {/* Checkbox: Recordar datos */}
            <div style={styles.checkboxRow}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={styles.checkboxInput}
                />
                <span style={styles.checkboxText}>Recordar datos</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                ...styles.submitButton,
                opacity: isLoading ? 0.7 : 1
              }}
            >
              <span>{isLoading ? 'Autenticando...' : 'Iniciar sesión'}</span>
              <ArrowRight size={18} style={{ marginLeft: 6 }} />
            </button>
          </form>
        </div>

        {/* Security watermark */}
        <div style={styles.securityWatermark}>
          <ShieldCheck size={14} color="#94a3b8" />
          <span>Sistema Seguro de Monitoreo Satelital · SierraBim v2.4</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f3f6fa',
    backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    position: 'relative'
  },
  topBar: {
    position: 'absolute',
    top: 16,
    left: 24,
    right: 24,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  badgeConnection: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#ffffff',
    padding: '6px 14px',
    borderRadius: 20,
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    border: '1px solid #e2e8f0'
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block'
  },
  connectionText: {
    fontSize: 12,
    fontWeight: 500,
    color: '#475569'
  },
  settingsLink: {
    fontSize: 13,
    fontWeight: 600,
    color: '#005b8e',
    background: '#ffffff',
    padding: '6px 14px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    cursor: 'pointer'
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 440,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: '40px 36px 32px 36px',
    boxShadow: '0 12px 32px -4px rgba(15, 36, 56, 0.08), 0 4px 12px -2px rgba(15, 36, 56, 0.03)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  logoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20
  },
  logoPlaceholderBox: {
    width: 68,
    height: 68,
    backgroundColor: '#e6eff8',
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
  },
  logoInnerSquare: {
    width: 32,
    height: 32,
    backgroundColor: '#cbdced',
    borderRadius: 8
  },
  sierraBimChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e6f0fa',
    padding: '4px 14px',
    borderRadius: 20,
    border: '1px solid #d0e2f5'
  },
  chipDot: {
    color: '#005b8e',
    fontSize: 14,
    lineHeight: 1
  },
  chipText: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    color: '#005b8e'
  },
  headerTextSection: {
    textAlign: 'center',
    marginBottom: 28
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: '#0f2438',
    marginBottom: 8,
    letterSpacing: '-0.3px'
  },
  subtitle: {
    fontSize: 13,
    color: '#576d82',
    lineHeight: 1.45,
    maxWidth: 320,
    margin: '0 auto'
  },
  errorAlert: {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 8,
    color: '#dc2626',
    fontSize: 13,
    marginBottom: 18,
    textAlign: 'center'
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 7
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: '#475569',
    letterSpacing: '0.4px',
    textTransform: 'uppercase'
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  forgotLink: {
    fontSize: 12,
    fontWeight: 600,
    color: '#0284c7',
    textDecoration: 'none'
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    border: '1px solid #d9e2ec',
    borderRadius: 9,
    transition: 'all 0.2s ease'
  },
  inputIcon: {
    position: 'absolute',
    left: 14
  },
  textInput: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    fontSize: 14,
    color: '#0f2438',
    fontWeight: 500
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 4
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    marginTop: -4
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer'
  },
  checkboxInput: {
    width: 16,
    height: 16,
    accentColor: '#005b8e',
    cursor: 'pointer'
  },
  checkboxText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: 500
  },
  submitButton: {
    width: '100%',
    padding: '13px 20px',
    backgroundColor: '#005b8e',
    color: '#ffffff',
    borderRadius: 9,
    fontSize: 15,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 91, 142, 0.25)',
    transition: 'background-color 0.2s, transform 0.1s',
    marginTop: 4
  },
  demoBar: {
    width: '100%',
    marginTop: 20,
    paddingTop: 16,
    borderTop: '1px dashed #e2e8f0',
    display: 'flex',
    justifyContent: 'center'
  },
  quickDemoButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
    color: '#005b8e',
    background: '#f0f7fc',
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid #cbe1f3',
    transition: 'all 0.15s ease'
  },
  securityWatermark: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
    fontSize: 12,
    color: '#94a3b8'
  }
};
