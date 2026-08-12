// app/index.tsx
import { Redirect } from 'expo-router';

// Este arquivo só existe para redirecionar para a tela inicial real
export default function Index() {
  return <Redirect href="/(auth)/login/" />; 
}