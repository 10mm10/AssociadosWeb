import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, Text, TouchableOpacity, ActivityIndicator, Alert, 
    Modal, StyleSheet, ScrollView 
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import * as DocumentPicker from 'expo-document-picker'; 
// 🚨 CORREÇÃO DO CAMINHO: Ajustado para o caminho relativo mais comum (../)
import tableStyles from '../assets/styles/tableStyles'; 
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'; 
import { useLocalSearchParams } from 'expo-router'; 
import * as SecureStore from 'expo-secure-store'; 


// Chave usada no LoginScreen.js
const AUTH_TOKEN_KEY = 'AUTH_TOKEN'; 

const localStyles = StyleSheet.create({
    pickerLabel: {
        fontSize: 16,
        marginBottom: 5,
        marginTop: 10,
        color: '#333',
    },
});

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Se a string já estiver no formato DD/MM/AAAA, usa-a. Caso contrário, formata.
    if (dateString.includes('/')) return dateString.split(' ')[0]; 

    const datePart = dateString.split(' ')[0];
    const parts = datePart.split('-');
    // Formato DD/MM/AAAA
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : datePart;
};

export default function DocumentosTable({ voltar }) {
    const { id_usuario } = useLocalSearchParams(); 
    
    const [documentos, setDocumentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDocs, setSelectedDocs] = useState([]); 

    const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [tipoAcesso, setTipoAcesso] = useState('privado'); 
    const [uploadLoading, setUploadLoading] = useState(false);


    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSelectedDocs([]); 
        
        const backendUrl = Constants.expoConfig?.extra?.BACKEND_URL;

        if (!backendUrl) {
            setError("URL do backend não configurada.");
            setLoading(false);
            return;
        }

        if (!id_usuario) {
            setError("ID do usuário logado ausente. Refaça o login.");
            setLoading(false);
            return;
        }

        let token;
        try {
            token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY); 
        } catch (e) {
            setError("Falha ao ler o token de autenticação seguro.");
            setLoading(false);
            return;
        }
        
        if (!token) {
            setError("Token de autenticação ausente. Faça login novamente.");
            setLoading(false);
            return;
        }

        const url = `${backendUrl}/documentos_corporativos?userId=${id_usuario}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 401 || response.status === 403) {
                    throw new Error("Sessão expirada. Token inválido. Faça login novamente.");
                }
                throw new Error(`Erro ${response.status} ao buscar documentos: ${errorText}`);
            }
            
            const data = await response.json();
            setDocumentos(data);
        } catch (e) {
            setError(String(e.message));
            console.error("Erro em fetchData:", e);
        } finally {
            setLoading(false);
        }
    }, [id_usuario]); 


    useEffect(() => {
        if (id_usuario) {
            fetchData();
        } else {
            setLoading(false); 
        }
    }, [id_usuario, fetchData]);


    const toggleSelectDocument = (docId) => {
        setSelectedDocs(prevSelected => {
            if (prevSelected.includes(docId)) {
                return prevSelected.filter(id => id !== docId);
            } else {
                return [...prevSelected, docId];
            }
        });
    };
    
    const handleDeleteDocuments = async () => {
        if (selectedDocs.length === 0) {
            Alert.alert('Atenção', 'Selecione pelo menos um documento para excluir.');
            return;
        }

        let token;
        try {
            token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY); 
        } catch (e) {
            return Alert.alert('Erro de Autenticação', 'Não foi possível ler o token.');
        }
        if (!token) {
            return Alert.alert('Sessão Expirada', 'Faça login novamente.');
        }


        Alert.alert(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir ${selectedDocs.length} documento(s)?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Excluir', 
                    style: 'destructive', 
                    onPress: async () => {
                        setLoading(true);
                        const backendUrl = Constants.expoConfig?.extra?.BACKEND_URL;

                        try {
                            const response = await fetch(`${backendUrl}/documentos_corporativos/delete`, {
                                method: 'DELETE',
                                headers: { 
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`, 
                                },
                                body: JSON.stringify({ document_ids: selectedDocs, userId: id_usuario }),
                            });

                            if (!response.ok) {
                                const errorText = await response.text();
                                throw new Error(`Erro ao excluir: ${errorText}`);
                            }

                            Alert.alert('Sucesso', 'Documento(s) excluído(s) com sucesso!');
                            setSelectedDocs([]);
                            fetchData(); 
                        } catch (e) {
                            Alert.alert('Falha na Exclusão', String(e.message));
                            setError(String(e.message));
                        } finally {
                            setLoading(false);
                        }
                    }
                },
            ],
            { cancelable: false }
        );
    };
    
    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*', 
                copyToCacheDirectory: true,
            });

            if (result.canceled === false && result.assets && result.assets.length > 0) {
                setSelectedFile(result.assets[0]);
            } else {
                setSelectedFile(null);
            }
        } catch (err) {
            console.error("Erro ao selecionar documento:", err);
            Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            Alert.alert('Atenção', 'Selecione um arquivo para continuar.');
            return;
        }
        
        let token;
        try {
            token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY); 
        } catch (e) {
            return Alert.alert('Erro de Autenticação', 'Não foi possível ler o token.');
        }
        if (!token) {
            return Alert.alert('Sessão Expirada', 'Faça login novamente.');
        }

        setUploadLoading(true);
        const backendUrl = Constants.expoConfig?.extra?.BACKEND_URL;

        const data = new FormData();
        
        data.append('documento', { 
            uri: selectedFile.uri,
            name: selectedFile.name,
            type: selectedFile.mimeType ? String(selectedFile.mimeType) : 'application/octet-stream',
        });

        data.append('id_usuario', String(id_usuario)); 
        data.append('tipo_acesso', tipoAcesso); 
        data.append('nome_original', selectedFile.name); 
        data.append('usuario_upload', "Mobile App"); 

        try {
            const response = await fetch(`${backendUrl}/documentos_corporativos/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, 
                },
                body: data, 
            });

            const responseText = await response.text();
            
            if (response.ok) {
                const result = responseText ? JSON.parse(responseText) : { message: 'Upload bem-sucedido.' };
                Alert.alert('Sucesso', result.message || 'Documento enviado com sucesso!');
                
                fetchData(); 
                setIsUploadModalVisible(false);
                setSelectedFile(null); 
                setTipoAcesso('privado'); 
            } else {
                const errorResult = responseText ? JSON.parse(responseText) : {};
                const errorMessage = errorResult.error || `Status ${response.status}: ${responseText}`;
                Alert.alert('Falha no Upload', `Erro: ${errorMessage}`);
            }
        } catch (error) {
            console.error("Erro na requisição de upload:", error);
            Alert.alert('Erro Inesperado', `Detalhes: ${error.message}. Verifique a URL do backend.`);
        } finally {
            setUploadLoading(false);
        }
    };

    const handleViewDocument = (item) => {
        const backendUrl = Constants.expoConfig?.extra?.BACKEND_URL;
        if (!backendUrl) return Alert.alert('Erro', 'URL do backend não configurada.');

        const urlToOpen = item.url || (item.caminho_arquivo ? `${backendUrl}/uploads/${item.caminho_arquivo}` : null);
        if (!urlToOpen) return Alert.alert('Erro', 'Caminho do documento não encontrado.');

        WebBrowser.openBrowserAsync(urlToOpen);
    };

    const rowPressHandler = (item) => {
        toggleSelectDocument(item.id);
    };

    return (
        <View style={tableStyles.cardContainer}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={tableStyles.titleContainer}>
                    <Text style={tableStyles.titleTabelaDocumentos}>Documentos Corporativos</Text>
                    
                    <TouchableOpacity style={tableStyles.addButton} onPress={() => setIsUploadModalVisible(true)}>
                        <Ionicons name="add" size={30} color="#333" />
                    </TouchableOpacity>
                </View>
                
                <View style={tableStyles.headerRow}>
                    <Text style={[tableStyles.headerCell, { flex: 5 }]}>Arquivo</Text>
                    <Text style={[tableStyles.headerCell, { flex: 2 }]}>Data</Text>
                    <Text style={[tableStyles.headerCell, { flex: 1 }]}>Ver</Text>
                </View>

                {loading && <ActivityIndicator size="large" color="#0A789B" style={{ marginTop: 20 }} />}

                {!loading && error && (
                    <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>{error}</Text>
                )}

                {!loading && !error && documentos.length === 0 && (
                    <Text style={{ textAlign: 'center', marginTop: 20 }}>Nenhum documento encontrado.</Text>
                )}

                {!loading && !error && documentos.length > 0 && (
                    <>
                        {documentos.map((item) => {
                            const isSelected = selectedDocs.includes(item.id);
                            
                            return (
                                <TouchableOpacity
                                    key={String(item.id)}
                                    onPress={() => rowPressHandler(item)} 
                                    style={[
                                        tableStyles.row, 
                                        { justifyContent: 'space-between' },
                                        isSelected ? tableStyles.selectedRow : {} 
                                    ]}
                                >
                                    <Text style={[tableStyles.cell, { flex: 5 }]}>{String(item.nome_original || 'N/A')}</Text>
                                    <Text style={[tableStyles.cell, { flex: 2 }]}>{String(formatDate(item.data_upload))}</Text>
                                    
                                    <TouchableOpacity
                                        onPress={(e) => {
                                            e.stopPropagation(); 
                                            handleViewDocument(item);
                                        }}
                                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <MaterialCommunityIcons name="file-download" size={24} color="#0A789B" />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            );
                        })}
                    </>
                )}
            </ScrollView>

            <View style={tableStyles.actionButtonFooter}>
                <TouchableOpacity onPress={voltar} style={tableStyles.voltarButton}>
                    <Text style={tableStyles.voltarButtonText}>Voltar</Text>
                </TouchableOpacity>
                
                {selectedDocs.length > 0 && (
                    <TouchableOpacity
                        style={tableStyles.deleteButton}
                        onPress={handleDeleteDocuments} 
                        disabled={loading}
                    >
                        {loading ? 
                            <ActivityIndicator color="#FFF" /> : 
                            <Text style={tableStyles.deleteButtonText}>Excluir ({selectedDocs.length})</Text>
                        }
                    </TouchableOpacity>
                )}
            </View>


            {/* MODAL DE UPLOAD */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isUploadModalVisible}
                onRequestClose={() => setIsUploadModalVisible(false)}
            >
                <View style={tableStyles.modalOverlay}>
                    <View style={tableStyles.modalContent}>
                        <Text style={tableStyles.formTitle}>Upload de Documento</Text>
                        
                        <TouchableOpacity 
                            style={tableStyles.formButtonUpload} 
                            onPress={pickDocument}
                            disabled={uploadLoading}
                        >
                            <Text style={tableStyles.formButtonText}>
                                {selectedFile ? `Arquivo Selecionado: ${selectedFile.name}` : 'Selecionar Arquivo'}
                            </Text>
                        </TouchableOpacity>
                        
                        <Text style={localStyles.pickerLabel}>Tipo de Acesso:</Text>
                        <View style={tableStyles.pickerContainer}>
                            <Picker
                                selectedValue={tipoAcesso}
                                onValueChange={(itemValue) => setTipoAcesso(itemValue)}
                                enabled={!uploadLoading}
                            >
                                <Picker.Item label="Público" value="publico" />
                                <Picker.Item label="Privado" value="privado" />
                            </Picker>
                        </View>

                        <View style={tableStyles.formButtonContainer}>
                            <TouchableOpacity 
                                style={[tableStyles.formButton, tableStyles.formCancelButton, { flex: 1, marginRight: 10 }]} 
                                onPress={() => {
                                    setIsUploadModalVisible(false);
                                    setSelectedFile(null); 
                                    setTipoAcesso('privado'); 
                                }}
                                disabled={uploadLoading}
                            >
                                <Text style={tableStyles.formButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[tableStyles.formButton, { flex: 1 }]} 
                                onPress={handleUpload} 
                                disabled={!selectedFile || uploadLoading}
                            >
                                {uploadLoading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={tableStyles.formButtonText}>Enviar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
}