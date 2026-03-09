'use client';
import { useMediaQuery } from '../hooks/useMediaQuery';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import BottomNav from './BottomNav';

export default function LayoutShell({ children }) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
      {!isMobile && <Sidebar collapsed={isTablet} />}
      <main style={{
        flex: 1, padding: isMobile ? '16px 12px 80px' : '0 24px',
        minWidth: 0, width: '100%', position: 'relative', zIndex: 1,
      }}>
        {children}
      </main>
      {!isMobile && !isTablet && <RightSidebar />}
      {isMobile && <BottomNav />}
    </div>
  );
}
