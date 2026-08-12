import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Modal, Button, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tableStyles from '../assets/styles/tableStyles'; // Caminho assumido como correto
import Constants from 'expo-constants';
import AddClientes from './AddClientes';
import * as Clipboard from 'expo-clipboard';
import ProcuracaoList from './ProcuracaoList';
import PdfTable from './PdfTable';
import { useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as SecureStore from 'expo-secure-store';


// Chave usada no LoginScreen.js
const AUTH_TOKEN_KEY = 'AUTH_TOKEN';

export default function ClientesTable({ voltar, onSelectClient, clienteSelecionado }) {
    const { id_usuario } = useLocalSearchParams();

    // -----------------------------------------------------
    // NOVOS ESTADOS PARA O MODAL DE UPLOAD
    // -----------------------------------------------------
    const [isPdfUploadModalVisible, setIsPdfUploadModalVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    // -----------------------------------------------------

    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tipoCliente, setTipoCliente] = useState('fisica');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [generatedLink, setGeneratedLink] = useState(null);
    const [linkLoading, setLinkLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [zapsignLoading, setZapsignLoading] = useState(false);
    const [procuracoes, setProcuracoes] = useState([]);
    const [isLinkTypeSelectionVisible, setIsLinkTypeSelectionVisible] = useState(false);
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [pdfRefreshKey, setPdfRefreshKey] = useState(0);

    // 🚨 FUNÇÃO AUXILIAR PARA OBTER O TOKEN
    const getAuthToken = async () => {
        let token;
        try {
            token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        } catch (e) {
            Alert.alert("Erro de Autenticação", "Falha ao ler o token de acesso.");
            return null;
        }
        if (!token) {
            Alert.alert("Sessão Expirada", "Token de autenticação ausente. Faça login novamente.");
            return null;
        }
        return token;
    };

    // 🚨 fetchData CORRIGIDA: Adicionando Autenticação
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
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

        const token = await getAuthToken(); // 🚨 Leitura do token
        if (!token) {
            setLoading(false);
            return;
        }

        const url = `${backendUrl}/clientes?tipo=${tipoCliente}&userId=${id_usuario}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // 🚨 Envio do token
                },
            });

            if (!response.ok) {
                let errorMsg = 'Erro ao buscar clientes.';
                // ... (lógica de tratamento de erro mantida)
                try {
                    const errorBody = await response.json();
                    errorMsg = errorBody.error || errorMsg;
                } catch {
                    errorMsg = `Erro ao buscar clientes: ${response.statusText}`;
                }
                throw new Error(errorMsg);
            }
            const data = await response.json();
            setClientes(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [tipoCliente, id_usuario]);

    const fetchClientAndPdfs = async (clientId) => {
        setLoading(true);
        const backendUrl = Constants.expoConfig?.extra?.BACKEND_URL;

        const token = await getAuthToken(); // 🚨 Leitura do token
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/clientes/${clientId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // 🚨 Envio do token
                },
            });
            const updatedClient = await response.json();
            onSelectClient(updatedClient);
            setPdfRefreshKey(prev => prev + 1);
        } catch {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id_usuario) fetchData();
    }, [tipoCliente, id_usuario, fetchData]); // Adicionado fetchData nas dependências

    const handleSelectClient = (cliente) => {
        onSelectClient(cliente);
        setGeneratedLink(null);
        setIsLinkTypeSelectionVisible(false);
        setSelectedPdf(null);
        setProcuracoes([]);
        fetchClientAndPdfs(cliente.id); // Força refresh e busca os PDFs
    };

    const handleGoBack = () => {
        onSelectClient(null);
        setGeneratedLink(null);
        setIsLinkTypeSelectionVisible(false);
        setSelectedPdf(null);
        setProcuracoes([]);
        fetchData();
        setPdfRefreshKey(prev => prev + 1);
    };

    // 🚨 fetchProcuracoes CORRIGIDA: Adicionando Autenticação
    const fetchProcuracoes = async () => {
        setLinkLoading(true);
        const backendUrl = Constants.expoConfig?.extra?.BACKEND_URL;

        const token = await getAuthToken(); // 🚨 Leitura do token
        if (!token) {
            setLinkLoading(false);
            return;
        }

        const url = `${backendUrl}/documentos/procuracao?userId=${id_usuario}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // 🚨 Envio do token
                },
            });
            if (!response.ok) throw new Error('Erro ao buscar a lista de procurações.');
            const data = await response.json();
            setProcuracoes(data);
        } catch (error) {
            alert(`Erro ao carregar procurações: ${error.message}`);
        } finally {
            setLinkLoading(false);
            setIsLinkTypeSelectionVisible(false);
        }
    };

    // 🚨 handleGenerateProcuracao CORRIGIDA: Adicionando Autenticação
    const handleGenerateProcuracao = async (documentoNome) => {
        if (!clienteSelecionado) return;
        setLinkLoading(true);
        const backendUrl = Constants.expoConfig?.extra?.BACKEND_URL;

        const token = await getAuthToken(); // 🚨 Leitura do token
        if (!token) {
            setLinkLoading(false);
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/gerar-procuracao`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // 🚨 Envio do token
                },
                body: JSON.stringify({
                    clienteId: clienteSelecionado.id,
                    documentoNome,
                    userId: id_usuario
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Erro ao gerar a procuração');

            Alert.alert('Sucesso', 'Procuração gerada com sucesso!', [{ text: 'OK' }]);
            setProcuracoes([]);
            await fetchClientAndPdfs(clienteSelecionado.id);
        } catch (error) {
            Alert.alert('Erro', `Erro: ${error.message}`, [{ text: 'OK' }]);
        } finally {
            setLinkLoading(false);
        }
    };

    // 🚨 handleSendToZapsign CORRIGIDA: Adicionando Autenticação
    const handleSendToZapsign = async () => {
        if (!selectedPdf || !clienteSelecionado) return;
        setZapsignLoading(true);
        const backendUrl = Constants.expoConfig?.extra?.BACKEND_URL;

        const token = await getAuthToken(); // 🚨 Leitura do token
        if (!token) {
            setZapsignLoading(false);
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/enviar-para-zapsign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // 🚨 Envio do token
                },
                body: JSON.stringify({
                    clienteId: clienteSelecionado.id,
                    documentoNome: selectedPdf.nome_arquivo,
                    userId: id_usuario
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Erro ao enviar para o Zapsign.');

            setGeneratedLink(result.zapsignUrl);
            Alert.alert('Sucesso', 'Documento enviado para o Zapsign com sucesso!', [{ text: 'OK' }]);
            setSelectedPdf(null);
            await fetchClientAndPdfs(clienteSelecionado.id);
        } catch (error) {
            Alert.alert('Erro', `Erro: ${error.message}`, [{ text: 'OK' }]);
        } finally {
            setZapsignLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (generatedLink) {
            await Clipboard.setStringAsync(generatedLink);
            Alert.alert('Sucesso', 'Link copiado para a área de transferência!', [{ text: 'OK' }]);
        }
    };

    const handleLinkTypeSelect = (linkType) => {
        if (linkType === 'cadastro') handleGenerateCadastroLink();
        else fetchProcuracoes();
    };

    // 🚨 handleGenerateCadastroLink CORRIGIDA: Adicionando Autenticação
    const handleGenerateCadastroLink = async () => {
        if (!clienteSelecionado) return;
        setLinkLoading(true);
        const backendUrl = Constants.expoConfig?.extra?.BACKEND_URL;

        const token = await getAuthToken(); // 🚨 Leitura do token
        if (!token) {
            setLinkLoading(false);
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/gerar-link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // 🚨 Envio do token
                },
                body: JSON.stringify({ clienteId: clienteSelecionado.id, userId: id_usuario }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Erro ao gerar o link de cadastro');

            setGeneratedLink(result.link);
            Alert.alert('Sucesso', 'Link de cadastro gerado com sucesso!', [{ text: 'OK' }]);
        } catch (error) {
            Alert.alert('Erro', `Erro: ${error.message}`, [{ text: 'OK' }]);
        } finally {
            setLinkLoading(false);
            setIsLinkTypeSelectionVisible(false);
        }
    };

    // handleDeletePdf não precisava de token pois o userId já era enviado na URL. Mantido o código original.
    const handleDeletePdf = async () => {
        if (!selectedPdf) return;
        if (!id_usuario) {
            Alert.alert('Erro', 'ID do usuário logado não encontrado.', [{ text: 'OK' }]);
            return;
        }

        Alert.alert(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir o arquivo: ${selectedPdf.nome_arquivo}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        setDeleteLoading(true);
                        const backendUrl = Constants.expoConfig?.extra?.BACKEND_URL;

                        try {
                            // 1. Busca o token usando a função que você já tem no arquivo
                            const tokenRaw = await getAuthToken();
                            if (!tokenRaw) {
                                setDeleteLoading(false);
                                return; // O getAuthToken já exibe o alerta se não houver token
                            }

                            // Limpeza de aspas (garantia sênior)
                            const token = tokenRaw.replace(/^["'](.+)["']$/, '$1');

                            const deleteUrl = `${backendUrl}/pdfs/${selectedPdf.id}?userId=${id_usuario}`;

                            const response = await fetch(deleteUrl, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}` // 2. Injeta o token aqui
                                },
                            });

                            if (!response.ok) {
                                const errorText = await response.text();
                                try {
                                    const errorJson = JSON.parse(errorText);
                                    throw new Error(errorJson.error || `Erro: ${response.status}`);
                                } catch {
                                    throw new Error(`Erro ao excluir: ${response.statusText}`);
                                }
                            }

                            Alert.alert('Sucesso', 'Documento excluído com sucesso!', [{ text: 'OK' }]);
                            await fetchClientAndPdfs(clienteSelecionado.id);
                            setSelectedPdf(null);
                            setPdfRefreshKey(prev => prev + 1);
                        } catch (e) {
                            Alert.alert('Falha na Exclusão', e.message, [{ text: 'OK' }]);
                            console.error(e);
                        } finally {
                            setDeleteLoading(false);
                        }
                    }
                },
            ],
            { cancelable: false }
        );
    };

    const handleAddPdfPress = () => {
        if (!clienteSelecionado || !clienteSelecionado.id) {
            Alert.alert("Atenção", "Selecione um cliente antes de adicionar um PDF.");
            return;
        }
        setIsPdfUploadModalVisible(true);
    };

    const handleSelectFile = async () => {
    try {
        // Limpa a seleção anterior para evitar conflito de estado
        setSelectedFile(null);

        const result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true, // Obrigatório para evitar erros de permissão de leitura
        });

        if (result.canceled) {
            console.log("Usuário cancelou a seleção");
            return;
        }

        if (result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            
            // Log para conferir o que o sistema está devolvendo
            console.log("Arquivo selecionado:", asset.name, "Mime:", asset.mimeType);

            setSelectedFile({ 
                uri: asset.uri, 
                name: asset.name, 
                mimeType: asset.mimeType || "application/octet-stream" 
            });
        }
    } catch (error) {
        console.error("DEBUG PICKER:", error); // Olhe o terminal do VS Code para ver o erro real
        Alert.alert("Erro", "Ocorreu um erro ao acessar a pasta de arquivos.");
    }
};

    // 🚨 handleUploadConfirm CORRIGIDA: Adicionando Autenticação
    const handleUploadConfirm = async () => {
    if (!selectedFile || !clienteSelecionado?.id) return;

    setIsPdfUploadModalVisible(false);
    setLoading(true);

    const token = await getAuthToken();
    if (!token) {
        setLoading(false);
        return;
    }

    // 🚀 TRATAMENTO DE URI SÊNIOR
    // No Android, a URI pode vir com prefixos que o FormData não entende bem
    const fileUri = Platform.OS === 'android' 
        ? selectedFile.uri 
        : selectedFile.uri.replace('file://', '');

    const formData = new FormData();

    // Importante: O objeto dentro do append DEVE ter exatamente essas 3 chaves
    formData.append("pdf_file", {
        uri: fileUri,
        name: selectedFile.name || "arquivo_upload",
        type: selectedFile.mimeType || "application/octet-stream", // Fallback seguro
    });

    formData.append("id_usuario", id_usuario.toString());

    const backendUrl = Constants.expoConfig?.extra?.BACKEND_URL;
    const url = `${backendUrl}/clientes/${clienteSelecionado.id}`;

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                // ❌ NUNCA coloque 'Content-Type': 'multipart/form-data' aqui!
                // O fetch faz isso sozinho ao detectar o FormData.
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro do servidor: ${response.status} - ${errorText}`);
        }

        Alert.alert("Sucesso", "Arquivo enviado com sucesso!");
        await fetchClientAndPdfs(clienteSelecionado.id);
        
    } catch (error) {
        console.error("DETALHE DO ERRO NO FETCH:", error);
        Alert.alert("Erro", "Falha ao enviar arquivo para o servidor.");
    } finally {
        setSelectedFile(null);
        setLoading(false);
    }
};


    const renderClientList = () => {
        if (loading) return <ActivityIndicator size="large" color="#0A789B" style={{ marginTop: 20 }} />;
        if (error) return <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>Erro: {error}</Text>;
        if (clientes.length === 0) return <Text style={{ textAlign: 'center', marginTop: 20 }}>Nenhum cliente encontrado.</Text>;

        const clientesToShow = clienteSelecionado ? [clienteSelecionado] : clientes;

        return (
            <View>
                {clientesToShow.map((item) => (
                    <TouchableOpacity
                        key={item.id.toString()}
                        onPress={() => handleSelectClient(item)}
                        style={[tableStyles.row, item.id === clienteSelecionado?.id && tableStyles.selectedRow]}
                    >
                        <Text style={tableStyles.cell}>{item.nome}</Text>
                        <Text style={tableStyles.cell}>{item.celular}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <View style={tableStyles.cardContainer}>
            <View style={tableStyles.titleContainer}>
                <Text style={tableStyles.titleTabelaClientes}>Tabela de Clientes</Text>
                {clienteSelecionado ? (
                    <TouchableOpacity
                        style={tableStyles.addButton}
                        onPress={() => setIsLinkTypeSelectionVisible(!isLinkTypeSelectionVisible)}
                    >
                        <Text style={tableStyles.addButtonText}>Link</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={tableStyles.addButton} onPress={() => setIsFormVisible(true)}>
                        <Ionicons name="add" size={30} color="#333" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={tableStyles.filterContainer}>
                <TouchableOpacity
                    style={[tableStyles.filterButton, tipoCliente === 'fisica' && tableStyles.filterButtonActive]}
                    onPress={() => setTipoCliente('fisica')}
                >
                    <Text style={[tableStyles.filterButtonText, tipoCliente === 'fisica' && tableStyles.filterButtonTextActive]}>
                        Pessoa Física
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[tableStyles.filterButton, tipoCliente === 'juridica' && tableStyles.filterButtonActive]}
                    onPress={() => setTipoCliente('juridica')}
                >
                    <Text style={[tableStyles.filterButtonText, tipoCliente === 'juridica' && tableStyles.filterButtonTextActive]}>
                        Pessoa Jurídica
                    </Text>
                </TouchableOpacity>
            </View>

            {isFormVisible ? (
                <AddClientes
                    tipoCliente={tipoCliente}
                    onCancel={() => setIsFormVisible(false)}
                    onClientAdded={() => { fetchData(); setIsFormVisible(false); }}
                />
            ) : (
                <View>
                    <View style={tableStyles.headerRow}>
                        <Text style={tableStyles.headerCell}>Nome</Text>
                        <Text style={tableStyles.headerCell}>Celular</Text>
                    </View>
                    {renderClientList()}

                    {clienteSelecionado && (
                        <View style={tableStyles.selectedClientDetailsContainer}>
                            {generatedLink ? (
                                <View style={tableStyles.linkContainer}>
                                    <Text style={tableStyles.linkText}>Link Gerado:</Text>
                                    <Text style={tableStyles.linkUrl}>{generatedLink}</Text>
                                    <TouchableOpacity style={tableStyles.copyButton} onPress={copyToClipboard}>
                                        <Ionicons name="copy" size={20} color="#0A789B" />
                                        <Text style={tableStyles.copyButtonText}>Copiar Link</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : isLinkTypeSelectionVisible ? (
                                <View style={tableStyles.linkTypeButtonContainer}>
                                    <TouchableOpacity style={tableStyles.linkTypeButton} onPress={() => handleLinkTypeSelect('cadastro')}>
                                        <Text style={tableStyles.linkTypeButtonText}>Link de Cadastro</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={tableStyles.linkTypeButton} onPress={() => handleLinkTypeSelect('procuracao')}>
                                        <Text style={tableStyles.linkTypeButtonText}>Link de Procuração</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : procuracoes.length > 0 ? (
                                <ProcuracaoList
                                    procuracoes={procuracoes}
                                    onSelectProcuracao={handleGenerateProcuracao}
                                    loading={linkLoading}
                                />
                            ) : (
                                <PdfTable
                                    key={pdfRefreshKey}
                                    cliente={clienteSelecionado}
                                    setPdfSelecionado={setSelectedPdf}
                                    pdfSelecionado={selectedPdf}
                                    onAddPdfPress={handleAddPdfPress}
                                    pdfRefreshKey={pdfRefreshKey}
                                />
                            )}

                            <View style={tableStyles.actionButtonFooter}>
                                <TouchableOpacity onPress={handleGoBack} style={tableStyles.voltarButton}>
                                    <Text style={tableStyles.voltarButtonText}>Voltar</Text>
                                </TouchableOpacity>

                                {selectedPdf && (
                                    <TouchableOpacity
                                        style={[tableStyles.deleteButton]}
                                        onPress={handleDeletePdf}
                                        disabled={deleteLoading || zapsignLoading}
                                    >
                                        {deleteLoading ? (
                                            <ActivityIndicator color="#FFF" />
                                        ) : (
                                            <Text style={tableStyles.deleteButtonText}>Excluir</Text>
                                        )}
                                    </TouchableOpacity>
                                )}

                                {selectedPdf && (
                                    <TouchableOpacity
                                        style={tableStyles.zapsignButton}
                                        onPress={handleSendToZapsign}
                                        disabled={deleteLoading || zapsignLoading}
                                    >
                                        {zapsignLoading ? (
                                            <ActivityIndicator color="#FFF" />
                                        ) : (
                                            <Text style={tableStyles.zapsignButtonText}>Zapsign</Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            )}

            {/* ------------------------------------------------ */}
            {/* NOVO COMPONENTE MODAL DE UPLOAD */}
            {/* ------------------------------------------------ */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isPdfUploadModalVisible}
                onRequestClose={() => {
                    setIsPdfUploadModalVisible(false);
                    setSelectedFile(null);
                }}
            >
                <View style={tableStyles.centeredView}>
                    <View style={tableStyles.modalView}>
                        <Text style={tableStyles.modalTitle}>Anexar PDF a {clienteSelecionado?.nome}</Text>

                        {/* Botão para abrir o seletor nativo */}
                        <TouchableOpacity
                            style={tableStyles.selectFileButton}
                            onPress={handleSelectFile}
                        >
                            <Text style={tableStyles.selectFileButtonText}>Selecionar Arquivo PDF</Text>
                        </TouchableOpacity>

                        {selectedFile ? (
                            <Text style={tableStyles.fileNameText}>
                                Arquivo: <Text style={{ fontWeight: 'bold' }}>{selectedFile.name}</Text>
                            </Text>
                        ) : (
                            <Text style={tableStyles.fileNameText}>Nenhum arquivo selecionado.</Text>
                        )}

                        <View style={tableStyles.modalButtonContainer}>
                            {/* Botão Cancelar */}
                            <TouchableOpacity
                                style={[tableStyles.modalButton, tableStyles.cancelButton]}
                                onPress={() => {
                                    setIsPdfUploadModalVisible(false);
                                    setSelectedFile(null);
                                }}
                            >
                                <Text style={tableStyles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            {/* Botão Enviar (disabilitado se não houver arquivo) */}
                            <TouchableOpacity
                                style={[tableStyles.modalButton, selectedFile ? tableStyles.sendButton : tableStyles.disabledButton]}
                                disabled={!selectedFile}
                                onPress={handleUploadConfirm}
                            >
                                <Text style={tableStyles.sendButtonText}>
                                    {loading ? <ActivityIndicator color="#FFF" /> : "Enviar"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}