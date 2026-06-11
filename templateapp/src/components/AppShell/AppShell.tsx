import React from 'react';
import { NavSidebar } from '../NavSidebar/NavSidebar';
import { customerConfig } from '../../config/customer.config';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fff' }}>
      <header style={{
        height: 48,
        backgroundColor: customerConfig.brandColor,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>
          {customerConfig.appTitle}
        </span>
        <span style={{ color: '#fff', fontSize: 14 }}>User: John Doe</span>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <NavSidebar />
        <main style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
