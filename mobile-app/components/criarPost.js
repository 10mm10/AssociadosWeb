// Arquivo: components/criarPost.js (Versão Final para ser renderizada por estado)

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // 🚨 Esta linha é a raiz do problema nativo
import Constants from 'expo-constants';
import localStyles from '../assets/styles/criarPostStyles';
import { Feather } from '@expo/vector-icons';


const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL || '';
const POST_API_CREATE_URL = `${BACKEND_URL}/posts`;

// O componente agora recebe onPostCreated e onCancel
export default function CreatePostScreen({ onPostCreated, onCancel }) {
    const [titulo, setTitulo] = useState('');
    const [conteudo, setConteudo] = useState('');
    const [autor, setAutor] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageUri, setImageUri] = useState(null); 

    // ------------------ LÓGICA DE IMAGEM MOBILE ------------------
    const pickImage = async () => {
        // Solicita permissão da galeria (obrigatório no Android/iOS)
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão Negada', 'É necessário ter permissão para acessar a galeria de fotos.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleRemoveImage = () => {
        setImageUri(null);
    };

    // ------------------ LÓGICA DE SUBMISSÃO MOBILE ------------------
    const handleSubmit = async () => {
        if (!titulo.trim() || !conteudo.trim() || !autor.trim()) {
            Alert.alert('Campos Obrigatórios', 'Título, Autor e Conteúdo são obrigatórios.');
            return;
        }

        setLoading(true);

        const slug = titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('conteudo', conteudo);
        formData.append('autor', autor);
        formData.append('slug', slug);

        if (imageUri) {
            const filename = imageUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('imagem', {
                uri: imageUri,
                name: filename,
                type,
            });
        }

        try {
            const res = await fetch(POST_API_CREATE_URL, {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                Alert.alert('Sucesso!', 'Post criado com sucesso!');
                if (onPostCreated) onPostCreated(); // 🟢 Fecha e recarrega
            } else {
                const errorData = await res.json();
                Alert.alert(`Falha`, `Falha ao criar o post: ${errorData.error || res.statusText}`);
            }
        } catch (error) {
            console.error('Erro ao enviar o post:', error);
            Alert.alert('Erro de Conexão', 'Não foi possível se conectar ao servidor.');
        } finally {
            setLoading(false);
        }
    };


    // ------------------ RENDERIZAÇÃO ------------------
    return (
        <ScrollView style={localStyles.container} contentContainerStyle={localStyles.contentContainer}>
            <Text style={localStyles.header}>Criar novo Post</Text>
            
            <View style={localStyles.formGroup}>
                <Text style={localStyles.label}>Título</Text>
                <TextInput
                    style={localStyles.input}
                    value={titulo}
                    onChangeText={setTitulo}
                    placeholder="Digite o título do post"
                />
            </View>

            <View style={localStyles.formGroup}>
                <Text style={localStyles.label}>Autor</Text>
                <TextInput
                    style={localStyles.input}
                    value={autor}
                    onChangeText={setAutor}
                    placeholder="Seu nome"
                />
            </View>

            {/* Seção de Seleção de Imagem */}
            <View style={localStyles.formGroup}>
                <Text style={localStyles.label}>Imagem de Capa (Opcional)</Text>
                
                <TouchableOpacity 
                    style={localStyles.imageSelectButton} 
                    onPress={pickImage}
                    disabled={loading}
                >
                    <Feather name="upload" size={20} color="#fff" />
                    <Text style={localStyles.imageSelectButtonText}>
                        {imageUri ? 'Alterar Imagem' : 'Selecionar na Galeria'}
                    </Text>
                </TouchableOpacity>

                {imageUri && (
                    <View style={localStyles.imagePreviewContainer}>
                        <Image source={{ uri: imageUri }} style={localStyles.imagePreview} />
                        <TouchableOpacity 
                            style={localStyles.removeImageButton}
                            onPress={handleRemoveImage}
                        >
                            <Text style={localStyles.removeImageButtonText}>Remover</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={localStyles.formGroup}>
                <Text style={localStyles.label}>Conteúdo</Text>
                <TextInput
                    style={localStyles.textArea}
                    value={conteudo}
                    onChangeText={setConteudo}
                    placeholder="Digite o corpo do artigo..."
                    multiline={true}
                    numberOfLines={8}
                />
            </View>
            
            {/* Botões de Ação */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                {/* Botão de Voltar/Cancelar */}
                <TouchableOpacity
                    style={[localStyles.submitButton, localStyles.cancelButtonInForm]}
                    onPress={onCancel} 
                    disabled={loading}
                >
                    <Text style={localStyles.submitButtonText}>Voltar</Text>
                </TouchableOpacity>

                {/* Botão de Criar Post */}
                <TouchableOpacity
                    style={[localStyles.submitButton, loading && localStyles.submitButtonDisabled, { marginLeft: 10 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={localStyles.submitButtonText}>Criar Post</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}