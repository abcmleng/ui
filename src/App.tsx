import React from 'react';
import { KYCFlow } from './components/KYCFlow';

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    overflowY: 'hidden' as const,
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kycFlowWrapper: {
    width: '100%',
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
