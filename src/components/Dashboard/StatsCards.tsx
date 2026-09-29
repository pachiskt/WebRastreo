import React from 'react';
import { Truck, TrendingUp, Pause, AlertTriangle } from 'lucide-react';
import type { Vehicle } from '../../types';

interface StatsCardsProps {
  vehicles: Vehicle[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ vehicles }) => {
  const total = vehicles.length;
  const inMovement = vehicles.filter((v) => v.status === 'movement');
  const inMovementCount = inMovement.length;
  const paused = vehicles.filter((v) => v.status === 'paused');
  const pausedCount = paused.length;
  const alerts = vehicles.filter((v) => v.status === 'warning');
  const alertCount = alerts.length;

  const avgSpeed = inMovementCount > 0 
    ? (inMovement.reduce((sum, v) => sum + v.speed, 0) / inMovementCount).toFixed(1)
    : '0.0';

  const alertDetails = alerts.length > 0
    ? `${alerts[0].id} (${alerts[0].deviationInfo || '+300m vía alterna'})`
    : 'Sin desvíos reportados';

  return (
    <div style={styles.gridContainer}>
      {/* Card 1: TOTAL EN MONITOREO */}
      <div style={styles.card}>
        <div style={styles.cardContent}>
          <div style={styles.cardTitle}>TOTAL EN MONITOREO</div>
          <div style={styles.statRow}>
            <span style={styles.statNumber}>{total}</span>
            <span style={styles.activePill}>Activos</span>
          </div>
          <div style={styles.subtext}>100% de la flota conectada</div>
        </div>
        <div style={{ ...styles.iconBox, backgroundColor: '#e6f3fa', color: '#005b8e' }}>
          <Truck size={22} color="#005b8e" />
        </div>
      </div>

      {/* Card 2: EN MOVIMIENTO */}
      <div style={styles.card}>
        <div style={styles.cardContent}>
          <div style={styles.cardTitle}>EN MOVIMIENTO</div>
          <div style={styles.statRow}>
            <span style={styles.statNumber}>{inMovementCount}</span>
            <span style={styles.unitText}>camiones</span>
          </div>
          <div style={styles.subtext}>
            <span style={styles.speedIcon}>📈</span> Vel. prom: <strong>{avgSpeed} km/h</strong>
          </div>
        </div>
        <div style={{ ...styles.iconBox, backgroundColor: '#eef5fc', color: '#0284c7' }}>
          <TrendingUp size={22} color="#0284c7" />
        </div>
      </div>

      {/* Card 3: DETENIDOS / PAUSA */}
      <div style={styles.card}>
        <div style={styles.cardContent}>
          <div style={styles.cardTitle}>DETENIDOS / PAUSA</div>
          <div style={styles.statRow}>
            <span style={styles.statNumber}>{pausedCount}</span>
            <span style={styles.unitText}>en base/reparto</span>
          </div>
          <div style={styles.subtext}>Dentro del tiempo programado</div>
        </div>
        <div style={{ ...styles.iconBox, backgroundColor: '#f1f5f9', color: '#475569' }}>
          <Pause size={22} color="#475569" />
        </div>
      </div>

      {/* Card 4: ALERTAS DE RUTA */}
      <div style={{ ...styles.card, borderColor: alertCount > 0 ? '#fed7aa' : '#e2e8f0' }}>
        <div style={styles.cardContent}>
          <div style={styles.cardTitle}>ALERTAS DE RUTA</div>
          <div style={styles.statRow}>
            <span style={{ ...styles.statNumber, color: alertCount > 0 ? '#b45309' : '#0f2438' }}>
              {alertCount}
            </span>
            {alertCount > 0 ? (
              <span style={styles.alertPill}>Desvío Leve</span>
            ) : (
              <span style={styles.activePill}>Sin Alertas</span>
            )}
          </div>
          <div style={styles.subtext}>{alertDetails}</div>
        </div>
        <div style={{ ...styles.iconBox, backgroundColor: '#fef3c7', color: '#d97706' }}>
          <AlertTriangle size={22} color="#d97706" />
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 18,
    marginBottom: 20
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: '20px 22px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px -2px rgba(15, 36, 56, 0.04)',
    position: 'relative'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#627d98',
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  },
  statRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 10
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 800,
    color: '#0f2438',
    lineHeight: 1
  },
  unitText: {
    fontSize: 13,
    color: '#576d82',
    fontWeight: 600
  },
  activePill: {
    fontSize: 12,
    fontWeight: 700,
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: '2px 8px',
    borderRadius: 12
  },
  alertPill: {
    fontSize: 12,
    fontWeight: 700,
    color: '#b45309',
    backgroundColor: '#fffbeb',
    padding: '2px 8px',
    borderRadius: 12,
    border: '1px solid #fde68a'
  },
  subtext: {
    fontSize: 12,
    color: '#576d82',
    marginTop: 2
  },
  speedIcon: {
    fontSize: 11,
    marginRight: 2
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};
