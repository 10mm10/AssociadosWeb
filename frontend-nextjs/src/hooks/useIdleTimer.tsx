'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export const useIdleTimer = (timeoutInSeconds: number) => {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

  const resetTimer = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      // Redireciona para a tela inicial
      router.push('/');
      console.log('Sessão inativa. Redirecionando para a tela inicial.');
    }, timeoutInSeconds * 100000);
  };

  useEffect(() => {
    // Adiciona os event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Inicia o timer na montagem do componente
    resetTimer();

    // Limpa o timer e os event listeners na desmontagem do componente
    return () => {
      clearTimeout(timer.current);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);
};
