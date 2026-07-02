import { Outlet } from 'react-router-dom';

export default function MerchantLayout() {
  return (
    <div style={styles.layout}>
      <Outlet />
    </div>
  );
}

const styles = {
  layout: {
    minHeight: '100vh',
    background: '#F5F5F7',
  },
};
