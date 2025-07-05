import React from 'react';

const styles = {
  footer: {
    width: '100%',
    height: '50px',
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderTop: '1px solid #eaeaea',
    flexShrink: 0,
  },
  footerText: {
    marginRight: '8px',
    fontSize: '14px',
    color: '#666666',
  },
  footerImg: {
    height: '24px',
  },
};

export const Footer: React.FC = () => {
  return (
    <footer style={styles.footer}>
      <span style={styles.footerText}>Powered by</span>
      <img
        style={styles.footerImg}
        src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
        alt="IDMerit Logo"
      />
    </footer>
  );
};
