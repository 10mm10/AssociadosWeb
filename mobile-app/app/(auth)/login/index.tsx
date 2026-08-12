import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import styles from '../../../assets/styles/loginStyles.js';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

// 🎯 URL centralizada para evitar repetição
// ✅ CERTO
const BACKEND_URL =
  process.env.BACKEND_URL ||
  Constants.expoConfig?.extra?.BACKEND_URL;



const AUTH_TOKEN_KEY = 'AUTH_TOKEN';
const BIOMETRICS_ENABLED_KEY = 'BIOMETRICS_ENABLED';
const USER_DATA_KEY = 'USER_DATA';

export default function LoginScreen() {
    const router = useRouter();
    const [nome_usuario, setNomeUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigateToHome = (nomeUsuario: string, idUsuario: number) => {
        router.replace({ 
            pathname: '/(tabs)/home/inicial', 
            params: { nome_usuario: nomeUsuario, id_usuario: idUsuario } 
        });
    };

    const handleBiometricAuth = async () => {
        setLoading(true);
        try {
            const biometricsActive = await SecureStore.getItemAsync(BIOMETRICS_ENABLED_KEY);
            if (biometricsActive !== 'true') return false;

            const authResult = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Login Rápido com Biometria',
                cancelLabel: 'Usar Senha',
            });

            if (authResult.success) {
                const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
                const userDataString = await SecureStore.getItemAsync(USER_DATA_KEY);
                
                if (token && userDataString) {
                    const userData = JSON.parse(userDataString);
                    navigateToHome(userData.nome, userData.userId);
                    return true;
                }
            }
        } catch (e) {
            console.error("Erro biometria:", e);
        } finally {
            setLoading(false);
        }
        return false;
    };
    
    useEffect(() => {
        handleBiometricAuth();
    }, []);

    const askForBiometrics = async (token: string, nome: string, id: number) => {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
        await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify({ userId: id, nome }));

        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();

        if (!compatible || !enrolled) {
            navigateToHome(nome, id);
            return;
        }
        
        Alert.alert(
            "Login Rápido",
            "Deseja usar sua biometria para as próximas vezes?",
            [
                { text: "Não", onPress: () => navigateToHome(nome, id), style: 'cancel' },
                { 
                    text: "Sim!", 
                    onPress: async () => {
                        await SecureStore.setItemAsync(BIOMETRICS_ENABLED_KEY, 'true');
                        navigateToHome(nome, id);
                    } 
                },
            ]
        );
    };

    const handleLogin = async () => {
        
        if (!nome_usuario || !senha) {
            setError("Preencha todos os campos.");
            return;
        }

        if (!BACKEND_URL) {
            setError("Erro interno: URL do servidor não encontrada.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${BACKEND_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome_usuario, senha }),
            });

            const data = await response.json();

            if (response.ok) {
                await askForBiometrics(data.token, data.nome, data.userId); 
            } else {
                setError(data.error || "Usuário ou senha inválidos.");
            }
        } catch (e) {
            setError("Falha na conexão. Verifique sua internet ou servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Image source={require('../../../assets/images/Interagir.png')} style={styles.logo} resizeMode="contain"/>
            <Text style={styles.title}>Faça seu login</Text>

            <View style={styles.card}>
                <TextInput
                    placeholder="Usuário"
                    style={styles.input}
                    autoCapitalize="none"
                    value={nome_usuario}
                    onChangeText={setNomeUsuario}
                />
                <TextInput
                    placeholder="Senha"
                    secureTextEntry
                    style={styles.input}
                    value={senha}
                    onChangeText={setSenha}
                />
                {error && <Text style={styles.errorText}>{error}</Text>}
                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}