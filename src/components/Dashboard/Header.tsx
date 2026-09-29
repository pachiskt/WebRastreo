import React from 'react';
import { User, LogOut, Settings, Radio } from 'lucide-react';
import type { UserProfile } from '../../types';

interface HeaderProps {
  user: UserProfile;
  onLogout: () => void;
  onOpenSettings: () => void;
  isFirebaseActive: boolean;
  isLiveSimulating: boolean;
  onToggleSimulation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onOpenSettings,
  isFirebaseActive,
  isLiveSimulating,
  onToggleSimulation
}) => {
  return (
    <header style={styles.header}>
      {/* Brand Logo */}
      <div style={styles.brandSection}>
        <div style={styles.logoIcon}>
          <span style={styles.logoLetter}>S</span>
        </div>
        <span style={styles.brandName}>SierraBim</span>
      </div>

      {/* Right Actions & User Profile */}
      <div style={styles.rightSection}>
        {/* Simulation / Realtime Toggle */}
        <button
          onClick={onToggleSimulation}
          title="Alternar simulación de telemetría GPS en tiempo real"
          style={{
            ...styles.telemetryButton,
            backgroundColor: isLiveSimulating ? '#ecfdf5' : '#f8fafc',
            borderColor: isLiveSimulating ? '#a7f3d0' : '#e2e8f0',
            color: isLiveSimulating ? '#059669' : '#64748b'
          }}
        >
          <Radio size={15} className={isLiveSimulating ? 'pulse-radar' : ''} />
          <span style={styles.telemetryText}>
            {isLiveSimulating ? 'Telemetría: En Vivo' : 'Telemetría: Pausada'}
          </span>
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          title="Configurar Firebase y Google Maps"
          style={styles.settingsButton}
        >
          <Settings size={18} color="#005b8e" />
          <span style={{
            ...styles.badgeDot,
            backgroundColor: isFirebaseActive ? '#10b981' : '#f59e0b'
          }} />
        </button>

        {/* User Card */}
        <div style={styles.userCard}>
          <div style={styles.avatarCircle}>
            <User size={18} color="#005b8e" />
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user.name || 'Sarah Jenkins'}</div>
            <div style={styles.userRole}>{user.role || 'Supervisora de Turno'}</div>
          </div>
        </div>

        {/* Logout Button */}
        <button onClick={onLogout} style={styles.logoutButton}>
          <LogOut size={17} color="#576d82" />
          <span style={styles.logoutText}>Cerrar Sesión</span>
        </button>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    height: 70,
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
  },
  brandSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    backgroundColor: '#005b8e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0, 91, 142, 0.3)'
  },
  logoLetter: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1
  },
  brandName: {
    fontSize: 22,
    fontWeight: 800,
    color: '#0f2438',
    letterSpacing: '-0.3px'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 20
  },
  telemetryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 12px',
    borderRadius: 20,
    border: '1px solid',
    fontSize: 12,
    fontWeight: 600,
    transition: 'all 0.2s ease'
  },
  telemetryText: {
    fontSize: 12,
    fontWeight: 600
  },
  settingsButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f0f5fa',
    border: '1px solid #d9e6f2',
    cursor: 'pointer'
  },
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: '50%',
    border: '1.5px solid #ffffff'
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 8
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    backgroundColor: '#e6f0fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #cbe1f5'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  userName: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0f2438',
    lineHeight: 1.2
  },
  userRole: {
    fontSize: 12,
    color: '#576d82',
    lineHeight: 1.2,
    marginTop: 2
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#576d82',
    fontSize: 13,
    fontWeight: 600,
    padding: '8px 12px',
    borderRadius: 8,
    transition: 'background-color 0.15s',
    cursor: 'pointer'
  },
  logoutText: {
    color: '#576d82'
  }
};
