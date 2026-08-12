import { Stack, Redirect } from 'expo-router';
import React from 'react';

// Aqui você deve usar o seu contexto de autenticação ou outra fonte de verdade
const userIsAuthenticated = false;

export default function RootLayout() {
  return (
    <Stack>
      {userIsAuthenticated ? (
        // Se estiver autenticado, mostre a tela de abas.
        // O `Stack.Screen` com a rota `(tabs)` vai renderizar o `_layout.tsx` da pasta `(tabs)`.
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        // Se não estiver autenticado, mostre a tela de login.
        // O `Stack.Screen` com a rota `(auth)` vai renderizar o `_layout.tsx` da pasta `(auth)`.
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}