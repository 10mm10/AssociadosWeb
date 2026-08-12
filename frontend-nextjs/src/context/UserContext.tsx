'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  userName: string;
  setUserName: (name: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState<string>(() => {
    // Tenta carregar o nome de usuário do localStorage na inicialização
    if (typeof window !== 'undefined') {
      const storedUserName = localStorage.getItem('userName');
      return storedUserName || '';
    }
    return '';
  });

  useEffect(() => {
    // Salva o nome de usuário no localStorage sempre que ele muda
    if (typeof window !== 'undefined') {
      localStorage.setItem('userName', userName);
    }
  }, [userName]);

  return (
    <UserContext.Provider value={{ userName, setUserName }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}