import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/Login/LoginScreen';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ConfigModal } from './components/Modals/ConfigModal';
import type { UserProfile } from './types';
import { listenToAuth } from './firebase/service';

export const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToAuth((currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (isAuthChecking) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.spinner} />
        <span style={styles.loadingText}>Iniciando Centro de Control SierraBim...</span>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <Dashboard 
          user={user} 
          onLogout={() => setUser(null)} 
        />
      ) : (
        <LoginScreen
          onLoginSuccess={(loggedInUser) => setUser(loggedInUser)}
          onOpenSettings={() => setIsConfigOpen(true)}
        />
      )}

      {/* Global Config Modal accessible from login or dashboard */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onConfigSaved={() => {
          // Re-trigger if needed
        }}
      />
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  loadingScreen: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f5f9',
    gap: 16
  },
  spinner: {
    width: 36,
    height: 36,
    border: '3px solid #cbd5e1',
    borderTopColor: '#005b8e',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  loadingText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#475569'
  }
};

export default App;
