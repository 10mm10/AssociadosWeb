// Arquivo: components/blog.js (Versão Final com React.lazy/Suspense)

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Share,
} from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import { Feather } from '@expo/vector-icons';
import localStyles from '../assets/styles/blogStyles';


// 🟢 CARREGAMENTO LENTO (LAZY LOADING) para evitar o erro nativo imediato
const CriarPostComponent = lazy(() => import('./criarPost'));

// ------------------ CONFIGURAÇÕES GERAIS ------------------
const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL || '';
const POST_API_LIST_URL = `${BACKEND_URL}/posts`;
const POST_API_DETAIL_BASE_URL = `${BACKEND_URL}/posts/`;
const PREVIEW_LENGTH = 100;

// ------------------ COMPONENTE PRINCIPAL ------------------
export default function BlogScreen() {
    
    // ESTADOS
    const [posts, setPosts] = useState([]);
    const [postDetalhe, setPostDetalhe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [error, setError] = useState(null);
    const [isCreatingPost, setIsCreatingPost] = useState(false); // 🟢 Estado de controle

    // -------- BUSCAR LISTA DE POSTS --------
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(POST_API_LIST_URL);
            setPosts(response.data);
        } catch (err) {
            console.error('Erro ao buscar lista de posts:', err);
            setError('Não foi possível carregar os posts. Verifique a conexão ou a URL da API.');
        } finally {
            setLoading(false);
        }
    }, []);

    // 🟢 FUNÇÕES: CALLBACKS DE CRIAÇÃO
    const handlePostCreated = () => {
        setIsCreatingPost(false);
        fetchPosts();
    };
    
    const handleCancelCreation = () => {
        setIsCreatingPost(false);
    };

    // -------- COMPARTILHAR POST --------
    const sharePost = async (slug, title) => {
        const realPostUrl = `${BACKEND_URL}/posts/${slug}`;
        try {
            await Share.share({
                message: `Confira este artigo: ${title} - ${realPostUrl}`,
                url: realPostUrl,
                title,
            });
        } catch (error) {
            Alert.alert('Erro ao compartilhar', error.message);
        }
    };

    // -------- FAVORITAR (LIKE) --------
    const toggleFavorite = async (id) => {
        if (!id) return;
        try {
            const urlLike = `${BACKEND_URL}/posts/${id}/like`;
            const response = await axios.post(urlLike, {});

            if (response.status === 200) {
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === id
                            ? { ...post, likes_count: (post.likes_count || 0) + 1 }
                            : post
                    )
                );

                if (postDetalhe && postDetalhe.id === id) {
                    setPostDetalhe((prevDetalhe) => ({
                        ...prevDetalhe,
                        likes_count: (prevDetalhe.likes_count || 0) + 1,
                    }));
                }
            } else {
                Alert.alert('Erro', 'O servidor não registrou o "Gostei". Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao tentar registrar like no mobile:', error);
            Alert.alert('Erro de Conexão', 'Não foi possível curtir o post. Verifique sua conexão.');
        }
    };

    // -------- BUSCAR DETALHE DO POST --------
    const fetchPostDetail = async (slug) => {
        if (!slug) return;
        setLoadingDetail(true);
        try {
            const response = await axios.get(`${POST_API_DETAIL_BASE_URL}${slug}`);
            setPostDetalhe(response.data);
        } catch (err) {
            console.error('Erro ao buscar detalhes do post:', err);
            Alert.alert('Erro', 'Não foi possível carregar o conteúdo completo do post.');
        } finally {
            setLoadingDetail(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // -------- ITEM DA LISTA --------
    const renderPostItem = ({ item }) => {
        // 🔧 ÚNICA ALTERAÇÃO AQUI (URL DA IMAGEM)
        const imageUrl = item.imagem_url
            ? item.imagem_url.startsWith('http')
                ? item.imagem_url
                : `${BACKEND_URL}/${item.imagem_url.replace(/^\/+/, '')}`
            : undefined;

        const previewText =
            item.conteudo && item.conteudo.length > PREVIEW_LENGTH
                ? `${item.conteudo.substring(0, PREVIEW_LENGTH)}...`
                : item.conteudo;

        const formattedDate = item.data_publicacao
            ? new Date(item.data_publicacao).toLocaleDateString('pt-BR')
            : '';

        return (
            <TouchableOpacity
                style={localStyles.itemContainer}
                onPress={() => fetchPostDetail(item.slug)}
            >
                <View style={localStyles.itemContentWrapper}>
                    {imageUrl && (
                        <Image
                            source={{ uri: imageUrl }}
                            style={localStyles.itemFloatingImage}
                        />
                    )}
                    <View style={localStyles.titleAndPreviewWrapper}>
                        <Text style={localStyles.itemTitle}>{item.titulo}</Text>
                        <Text style={localStyles.itemPreview}>{previewText}</Text>
                    </View>
                </View>

                <View style={localStyles.itemMetaContainer}>
                    <Text style={localStyles.itemMetaText}>
                        Publicado em:{' '}
                        <Text style={{ fontWeight: 'bold' }}>{formattedDate}</Text>
                    </Text>
                    <Text style={localStyles.itemMetaText}>
                        Por: <Text style={{ fontWeight: 'bold' }}>{item.autor}</Text>
                    </Text>
                </View>

                <View style={localStyles.verMaisActions}>
                    <View style={localStyles.verMaisContainer}>
                        <Text style={localStyles.verMaisText}>Ver Mais</Text>
                        <Feather name="arrow-right" />
                    </View>

                    <View style={localStyles.actionButtonsContainer}>
                        <TouchableOpacity
                            style={localStyles.actionButton}
                            onPress={() => sharePost(item.slug, item.titulo)}
                        >
                            <Feather name="share-2" size={20} color="#0A789B" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={localStyles.likeButtonMobile}
                            onPress={() => toggleFavorite(item.id)}
                        >
                            <Text style={localStyles.likeButtonText}>
                                Gostei ({item.likes_count || 0})
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // -------- LOADING / ERRO --------
    if (loading || loadingDetail) {
        return (
            <View style={localStyles.fullScreenCenter}>
                <ActivityIndicator size="large" color="#0A789B" />
                <Text style={{ marginTop: 10 }}>
                    {loadingDetail ? 'Carregando artigo...' : 'Carregando posts...'}
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={localStyles.fullScreenCenter}>
                <Text style={localStyles.errorText}>{error}</Text>
                <TouchableOpacity onPress={fetchPosts} style={localStyles.button}>
                    <Text style={localStyles.buttonText}>Tentar Novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // -------- CRIAÇÃO --------
    if (isCreatingPost) {
        return (
            <Suspense
                fallback={
                    <View style={localStyles.fullScreenCenter}>
                        <ActivityIndicator size="large" color="#0A789B" />
                        <Text>Carregando formulário...</Text>
                    </View>
                }
            >
                <View style={{ flex: 1, backgroundColor: '#fff', padding: 15 }}>
                    <CriarPostComponent
                        onCancel={handleCancelCreation}
                        onPostCreated={handlePostCreated}
                    />
                </View>
            </Suspense>
        );
    }

    // -------- DETALHE --------
    if (postDetalhe) {
        // 🔧 ÚNICA ALTERAÇÃO AQUI (URL DA IMAGEM)
        const fullImageUrl = postDetalhe.imagem_url
            ? postDetalhe.imagem_url.startsWith('http')
                ? postDetalhe.imagem_url
                : `${BACKEND_URL}/${postDetalhe.imagem_url.replace(/^\/+/, '')}`
            : undefined;

        const safeContent = postDetalhe.conteudo
            ? String(postDetalhe.conteudo)
            : '';

        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <ScrollView contentContainerStyle={localStyles.detailContentContainer}>
                    {fullImageUrl && (
                        <Image
                            source={{ uri: fullImageUrl }}
                            style={localStyles.detailImage}
                        />
                    )}

                    <View style={{ paddingHorizontal: 15 }}>
                        <View style={localStyles.detailActionsContainer}>
                            <TouchableOpacity
                                style={localStyles.detailActionButton}
                                onPress={() =>
                                    Share.share({
                                        message: `${postDetalhe.titulo || ''} | ${BACKEND_URL}/blog/${postDetalhe.slug || ''}`,
                                    })
                                }
                            >
                                <Feather name="share-2" size={20} color="#0A789B" />
                                <Text style={localStyles.detailActionText}>
                                    Compartilhar
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={localStyles.likeButtonMobileDetail}
                                onPress={() => toggleFavorite(postDetalhe.id)}
                            >
                                <Text style={localStyles.likeButtonText}>
                                    Gostei ({postDetalhe.likes_count || 0})
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={localStyles.separator} />
                        <Text style={localStyles.detailTitle}>
                            {postDetalhe.titulo || ''}
                        </Text>
                        <Text style={localStyles.detailContent}>{safeContent}</Text>
                        <View style={{ height: 80 }} />
                    </View>
                </ScrollView>

                <TouchableOpacity
                    onPress={() => setPostDetalhe(null)}
                    style={localStyles.backButtonFixed}
                >
                    <Feather name="arrow-left" size={20} color="#fff" />
                    <Text style={localStyles.backButtonTextFixed}>
                        Voltar para Lista
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    // -------- LISTA --------
    return (
        <View style={localStyles.listContainer}>
            <View style={localStyles.headerWrapper}>
                <Text style={localStyles.headerTitle}>Últimos Artigos</Text>

                <TouchableOpacity
                    style={localStyles.addButton}
                    onPress={() => setIsCreatingPost(true)}
                >
                    <Feather name="plus" size={35} color="#0A789B" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={posts}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderPostItem}
                contentContainerStyle={localStyles.listContent}
                ListEmptyComponent={
                    <Text style={localStyles.emptyText}>
                        Nenhum post encontrado.
                    </Text>
                }
            />
        </View>
    );
}
