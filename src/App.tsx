import React from 'react';
import { KYCFlow } from './components/KYCFlow';

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    position: 'fixed' as const,
    top: 0,
    left: 0,
  },
  content: {
    flex: 1,
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kycFlowWrapper: {
    width: '100%',
    height: '100%',
  },
};

function App() {
  return (
    <div style={styles.appContainer}>
      <main style={styles.content}>
        <div style={styles.kycFlowWrapper}>
          <KYCFlow />
        </div>
      </main>
    </div>
  );
}

export default App;