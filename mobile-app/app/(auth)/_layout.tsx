import { Stack } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native'; // Certifique-se de importar View
import * as SplashScreen from 'expo-splash-screen';

// 1. Impede que a Splash Screen feche automaticamente
// SplashScreen.preventAutoHideAsync();

export default function AuthLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      // Sua lógica de autenticação e carregamento permanece aqui
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); 
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepareApp();
  }, []);

  // Função onLayout permanece a mesma
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Esconde a Splash Screen nativa
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    // Se não estiver pronto, retornamos o View com onLayout, sem o Stack
    return <View onLayout={onLayoutRootView} style={{ flex: 1 }} />;
  }

  // --- A CORREÇÃO ESTÁ AQUI: Envolver o Stack em um View ---
  return (
    // O View recebe o onLayout para esconder o splash
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        {/* O Stack do Router fica dentro */}
        <Stack>
            <Stack.Screen name="login/index" options={{ headerShown: false }} />
            {/* ... outras telas ... */}
        </Stack>
    </View>
  );
}