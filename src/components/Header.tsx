import React from 'react';

const styles = {
  header: {
    width: '100%',
    height: '50px', // reduced from 60px
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottom: '1px solid #eaeaea',
    flexShrink: 0,
  },
  logo: {
    height: '32px', // reduced from 40px
  },
};

export const Header: React.FC = () => {
  return (
    <header style={styles.header}>
      <img
        style={styles.logo}
        src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
        alt="IDMerit Logo"
      />
    </header>
  );
};
