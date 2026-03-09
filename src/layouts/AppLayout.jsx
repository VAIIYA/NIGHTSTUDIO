import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import RightPanel from '../components/RightPanel';
import { useMediaQuery } from '../hooks/useMediaQuery';
import BottomNav from '../components/BottomNav';

export default function AppLayout() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

  return (
    <div className="flex min-h-screen bg-white">
      {!isMobile && <Sidebar />}
      
      <main className="flex-1 overflow-y-auto min-h-screen" style={{ 
        padding: isMobile ? '16px' : '24px 32px',
        maxWidth: isMobile ? '100%' : 'auto'
      }}>
        <Outlet />
      </main>

      {!isMobile && !isTablet && <RightPanel />}
      
      {isMobile && <BottomNav />}
    </div>
  );
}
