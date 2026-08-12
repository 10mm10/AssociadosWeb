'use client';

import { UserProvider } from '@/context/UserContext';
import React from 'react';
import { useIdleTimer } from '../hooks/useIdleTimer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useIdleTimer(600); 

  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
}