import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants'; 
import messaging from '@react-native-firebase/messaging';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});


function setupNotificationListeners(onNotificationReceived) {
   
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
        console.log('--- NOTIFICAÇÃO RECEBIDA EM PRIMEIRO PLANO (FCM) ---');
        
        const eventType = remoteMessage.data?.tipo_evento;

        if (eventType === 'procuracao_assinada' && onNotificationReceived) {
            console.log('Evento de procuração assinada detectado. Incrementando contador.');
            onNotificationReceived(); 
        }

        if (remoteMessage.notification) {
            Notifications.scheduleNotificationAsync({
                content: {
                    title: remoteMessage.notification.title || 'Nova Notificação',
                    body: remoteMessage.notification.body || 'Você tem uma mensagem nova.',
                    data: remoteMessage.data, 
                },
                trigger: null, 
            });
        }
    });

    return () => {
        unsubscribeForeground();
    };
}



async function handleStartupNotification(onNotificationReceived) {
    console.log('DEBUG: handleStartupNotification chamado.'); 
    
    const remoteMessage = await messaging().getInitialNotification();

    if (remoteMessage) {
        console.log('DEBUG: Notificação Inicial ENCONTRADA. O app foi aberto por notificação.'); 
        
        if (onNotificationReceived) {
            console.log('DEBUG: Forçando busca da contagem real do sininho.'); 
            onNotificationReceived();
        }

    } else {
        console.log('DEBUG: getInitialNotification retornou NULL (app não foi aberto por notificação).'); 
    }
}

async function registerForPushNotificationsAsync() {
    let token;
    
    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Permissão para notificação negada pelo usuário!');
            return;
        }

        // 2. Obtém o Token do Firebase Cloud Messaging (FCM)
        try {
            const fcmToken = await messaging().getToken(); 
            if (fcmToken) {
                token = fcmToken;
                console.log('--- TOKEN OBTIDO (FCM) ---'); 
                console.log('--------------------------'); 
            }
        } catch (e) {
            console.warn("Falha ao obter token FCM. Tentando Expo Token como fallback...", e);
            
            const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.expoConfig?.extra?.projectId;
            
            if (!projectId) {
                console.error("ID do projeto não encontrado. Não é possível obter token Expo.");
            } else {
                token = (await Notifications.getExpoPushTokenAsync({
                    projectId: projectId, 
                })).data;
                
                if (token) {
                    console.log('--- TOKEN OBTIDO (EXPO - FALLBACK) ---'); 
                    console.log('--------------------------------------'); 
                }
            }
        }

    } else {
        console.log('Notificações Push só funcionam em dispositivos físicos ou emulador.');
    }

    return token;
}

export { setupNotificationListeners, registerForPushNotificationsAsync, handleStartupNotification };