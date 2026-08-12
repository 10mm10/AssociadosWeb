import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, Image, ScrollView, Alert, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import styles from '../../../../assets/styles/inicialStyles.js';
import { useLocalSearchParams } from 'expo-router';
import IconeClientes from '../../../../components/IconeClientes';
import IconeDocumentos from '../../../../components/IconeDocumentos';
import ClientesTable from '../../../../components/ClientesTable';
import { NotificationBell } from '../../../../components/NotificationBell.js';
import DocumentosTable from '../../../../components/DocumentosTable.js';
import { registerForPushNotificationsAsync, setupNotificationListeners, handleStartupNotification } from '../../../../hooks/useNotifications.js';
import axios from 'axios';
import Constants from 'expo-constants';
import { Feather } from '@expo/vector-icons';
import BlogScreen from '../../../../components/blog.js';
import IconeBlog from '../../../../components/iconeBlog';
import LogoInteragir from '@/assets/images/LogoInteragir.png';





interface HomeScreenParams {
  nome_usuario?: string;
  id_usuario?: number;
}

interface Cliente {
  id: number;
  nome: string;
  celular: string;
}

interface Notificacao {
  id: number;
  titulo: string;
  corpo: string;
  data_criacao: string;
  lida: number;
}

interface NotificationsModalProps {
  isVisible: boolean;
  onClose: () => void;
  userId: number | undefined;
  onMarkAsRead: () => void;
}

const NotificationsModal = ({ isVisible, onClose, userId, onMarkAsRead }: NotificationsModalProps) => {
  const [notifications, setNotifications] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL;

  const fetchNotifications = async () => {
    if (!isVisible || userId === undefined || !BACKEND_URL) return;
    setLoading(true);
    try {
      const response = await axios.get<Notificacao[]>(`${BACKEND_URL}/api/notificacoes/lista?id_usuario=${userId}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      Alert.alert('Erro', 'Não foi possível carregar as notificações.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    if (userId === undefined) {
      onClose();
      return;
    }

    if (notifications.some(n => n.lida === 0)) {
      try {
        await axios.post(`${BACKEND_URL}/api/notificacoes/marcar-lidas`, { id_usuario: userId });
        onMarkAsRead();
      } catch (error) {
        console.error('Erro ao marcar como lidas:', error);
      }
    }
    onClose();
  };

  useEffect(() => {
    fetchNotifications();
  }, [isVisible, userId]);

  if (!isVisible) return null;

  return (
    <Modal animationType="slide" transparent visible={isVisible} onRequestClose={handleClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Notificações</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#0A789B" style={{ marginTop: 20 }} />
          ) : notifications.length === 0 ? (
            <Text style={styles.emptyText}>Você não tem notificações.</Text>
          ) : (
            <ScrollView style={styles.listContainer}>
              {notifications.map(item => (
                <View
                  key={item.id}
                  style={[styles.listItem, !item.lida && styles.unreadItem]}
                >
                  <Text style={styles.itemTitle}>{item.titulo}</Text>
                  <Text style={styles.itemBody}>{item.corpo}</Text>
                  <Text style={styles.itemDate}>{new Date(item.data_criacao).toLocaleString()}</Text>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity
            style={[styles.button, styles.buttonClose]}
            onPress={handleClose}
            disabled={loading}
          >
            <Text style={styles.textStyle}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const WelcomeCard = ({ nome_usuario }: { nome_usuario?: string }) => (
  <View style={styles.welcomeCardContainer}>
    <Text style={styles.welcomeCardTitle}>Bem-vindo(a),</Text>
    <Text style={styles.welcomeCardName}>{nome_usuario || 'Usuário'}</Text>
    <Text style={styles.welcomeCardText}>Selecione uma opção acima para continuar.</Text>
    <Image source={LogoInteragir} style={styles.imageInicial} resizeMode="contain"/>
  </View>
);

export default function HomeScreen() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const params = useLocalSearchParams() as HomeScreenParams;
  const { nome_usuario, id_usuario } = params;

  const [telaAtiva, setTelaAtiva] = useState<'inicial' | 'clientes' | 'documentos' | 'blog'>('inicial');
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);

  const incrementNotificationCount = useCallback(() => {
    setNotificationCount(prevCount => prevCount + 1);
  }, []);

  const fetchInitialCount = useCallback(async () => {
    if (!id_usuario) return;
    const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL;
    try {
      const response = await axios.get<Notificacao[]>(`${BACKEND_URL}/api/notificacoes/lista?id_usuario=${id_usuario}`);
      const notifications = response.data;
      const unreadCount = Array.isArray(notifications)
        ? notifications.filter(n => n.lida === 0).length
        : 0;
      setNotificationCount(unreadCount);
    } catch (error) {
      console.error('Erro ao buscar contagem inicial:', error);
      setNotificationCount(0);
    }
  }, [id_usuario]);

  useEffect(() => {
    fetchInitialCount();
    handleStartupNotification(fetchInitialCount);
    const cleanup = setupNotificationListeners(incrementNotificationCount);
    return () => cleanup && cleanup();
  }, [fetchInitialCount, incrementNotificationCount]);

  useEffect(() => {
    const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL;
    if (!id_usuario || !BACKEND_URL) return;

    const sendToken = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (!token) return;
        const type = token.startsWith('ExponentPushToken') ? 'expo' : 'fcm';
        setExpoPushToken(token);
        await axios.post(`${BACKEND_URL}/save-token`, {
          token,
          id: id_usuario,
          token_type: type,
        });
      } catch (e: any) {
        console.error('Erro ao salvar token no backend:', e.message || e);
      }
    };

    sendToken();
  }, [id_usuario]);

  const renderContent = () => {
    switch (telaAtiva) {
      case 'clientes':
        return (
          <ClientesTable voltar={() => setTelaAtiva('inicial')}
            onSelectClient={(cliente: Cliente) => setClienteSelecionado(cliente)}
            clienteSelecionado={clienteSelecionado}
          />
        );
      case 'documentos':
        return <DocumentosTable voltar={() => setTelaAtiva('inicial')} />;
      case 'blog':
        return <BlogScreen />; 
      default:
        return <WelcomeCard nome_usuario={nome_usuario} />;
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image source={require('../../../../assets/images/Interagir.png')} style={styles.headerIcon} />
          
        </View>
        <NotificationBell onPress={() => setIsNotificationsVisible(true)} count={notificationCount} />
      </View>

      <NotificationsModal
        isVisible={isNotificationsVisible}
        onClose={() => setIsNotificationsVisible(false)}
        userId={id_usuario}
        onMarkAsRead={() => setNotificationCount(0)}
      />

      <View style={styles.iconesContainer}>
        <IconeClientes
          onPress={() => setTelaAtiva('clientes')}
          style={telaAtiva === 'clientes' ? styles.activeBorder : undefined}
        />
        <IconeDocumentos
          onPress={() => setTelaAtiva('documentos')}
          style={telaAtiva === 'documentos' ? styles.activeBorder : undefined}
        />
        <IconeBlog
          onPress={() => setTelaAtiva('blog')}
          style={telaAtiva === 'blog' ? styles.activeBorder : undefined}
        />
      </View>

      {/* CHAVE DE CORREÇÃO: Remove a ScrollView se a tela for o Blog (para evitar aninhamento de scroll) */}
      {telaAtiva === 'blog' ? (
        <View style={{ flex: 1 }}>
          {renderContent()}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent} style={{ flex: 1 }}>
          {renderContent()}
        </ScrollView>
      )}
      {/* FIM DA CHAVE DE CORREÇÃO */}
    </View>
  );
}