'use client';

import { useUser } from '@/context/UserContext';
import React, { useState, useEffect } from 'react';

export default function UserInfo() {
  const { userName } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <span className="user-name">
      {isClient ? userName : ''}
    </span>
  );
}