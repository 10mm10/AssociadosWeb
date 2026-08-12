

import { StyleSheet, Dimensions } from 'react-native';

const localStyles = StyleSheet.create({
    // Contêineres de Tela e Carregamento
    fullScreenCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    listContainer: { 
        flex: 1, 
        backgroundColor: '#f1e9d2ff', 
    },
    listContent: { 
        paddingHorizontal: 0, 
        marginHorizontal: 0, 
        paddingBottom: 20,
    },
    headerTitle: { 
        fontSize: 22, // Ligeiramente menor para caber melhor na linha
        fontWeight: 'bold', // Adicionado para dar mais destaque
        color: '#333',
        fontFamily: 'serif',
        fontStyle:'italic',
        
        // REMOVIDOS: textAlign, borderBottomWidth, marginBottom e paddingHorizontal, pois serão controlados pelo headerWrapper
    },

headerWrapper: {
    flexDirection: 'row', // Alinha o título e o botão lado a lado
    justifyContent: 'space-between', // CRUCIAL: Empurra o título para a esquerda e o botão para a direita
    alignItems: 'center', // Alinha verticalmente no centro
    paddingHorizontal: 80, // Mantém o padding da tela
    paddingTop: 15, // Ocupa o lugar do marginTop do headerTitle antigo
    paddingBottom: 10, 
    borderBottomWidth: 1,
    borderBottomColor: '#ccc', // Linha de separação, mais adequada no wrapper
},

// 🚨 NOVO: Estilos do botão + 
addButton: {
    padding: 5,
    borderRadius: 5,
    // Pode adicionar um fundo sutil se quiser, mas deixaremos transparente por padrão
},
    
    // --- ESTILOS DO ITEM DE JORNAL (COLUNA ÚNICA) ---
    itemContainer: { 
        marginBottom: 15, 
        paddingVertical: 10, 
        paddingHorizontal: 15,
        backgroundColor: ' #f4f1ea', 
        overflow: 'hidden',
        borderBottomWidth: 1, 
        borderBottomColor: '#ccc', 
        
    },
    itemContentWrapper: { 
        flexDirection: 'row',     
        flexWrap: 'wrap', 
        alignItems: 'flex-start',
    },
    itemFloatingImage: { 
        width: 80,  
        height: 80, 
        marginRight: 10, 
        marginBottom: 5,
        borderRadius: 5,
    },
    
    titleAndPreviewWrapper: {
        flex: 1, 
        flexDirection: 'column',
    },
    itemTitle: { 
        fontSize: 20, 
        fontWeight: '500', 
        color: '#333',
        marginBottom: 3,
    },

    itemPreview: { 
        fontSize: 14, 
        color: '#333',
        lineHeight: 20,
        textAlign: 'justify',
        marginTop: 5,
        width: '100%',
    },
    
    verMaisContainer: { 
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end', 
        paddingHorizontal: 8,
        marginTop: 5,
    },
    verMaisText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#0A789B',
        textTransform: 'uppercase',
    },
    
    // --- ESTILOS DE DETALHE ---
    detailContentContainer: { 
        paddingBottom: 0, 
    },
    detailImage: { 
        width: '100%', 
        height: 300, 
        resizeMode: 'contain', 
        marginBottom: 30,
        marginTop:30, 
    },
    detailTitle: { 
        fontSize: 25, 
        marginBottom: 15, 
        color: '#333',
        textAlign:'center',
    
    },
    detailContent: { 
        fontSize: 16, 
        lineHeight: 24, 
        color: '#555',
        textAlign: 'justify' 
    },
    
    // CHAVE: ESTILOS FIXOS PARA O BOTÃO VOLTAR
    backButtonFixed: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 15, 
        backgroundColor:  '#3498dbc3', // Cor do Botão
        width: '100%',
        position: 'absolute', // CHAVE: Fixa o elemento
        bottom: 0,           // CHAVE: Fixa na parte inferior
        zIndex: 10,          // Garante que fique acima de outros elementos
    },
    backButtonTextFixed: { 
        marginLeft: 8, 
        fontSize: 16, 
        color: '#fff', // Texto branco para contraste
    },

    // Estilos de Feedback e Loading
    fullScreenCenter: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 
    },

    // NOVO: Contêiner que engloba 'Ver Mais' e os Ícones
verMaisActions: {
    flexDirection: 'row',
    // CHAVE: Alinha "Ver Mais" para um lado e os Ícones para o outro
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 8,
    alignSelf: 'stretch', 
},

// Estilo do texto "Ver Mais" (mantido, mas agora está dentro de verMaisActions)
verMaisContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
},
verMaisText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A789B',
    textTransform: 'uppercase',
},

// NOVO: Contêiner que agrupa os ícones (Coração e Compartilhar)
actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
},
actionButton: {
    marginLeft: 15, // Espaçamento entre os ícones
    padding: 3, // Área de toque para o ícone
},
    errorText: { color: 'red', marginBottom: 10 },
    button: { backgroundColor: '#0A789B', padding: 10, borderRadius: 5, marginTop: 10 },
    buttonText: { color: '#fff', textAlign: 'center' },
    
    itemMetaContainer: {
        flexDirection: 'row', // Coloca autor e data lado a lado
        justifyContent: 'space-between', // Espaçamento máximo entre eles
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#f1e9d2b6', // Fundo leve para destaque
        borderRadius: 5,
        marginHorizontal: 15, // Alinha com o conteúdo
        marginBottom: 10, // Espaçamento antes da linha de ação
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },

    itemMetaText: {
        fontSize: 13, // Tamanho menor e discreto
        color: '#333',
    },
    likeButtonMobile: {
        backgroundColor: '#2bc091', // Cor vermelha de like
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 30, // Espaçamento entre o Compartilhar e o Gostei
    },

    likeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    detailActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start', // Alinha os botões à esquerda
        alignItems: 'center',
        paddingVertical: 5,
    },

    // Estilo para o TouchableOpacity de Compartilhar (o cinza)
    detailActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        marginRight: 10, // Espaçamento entre os botões
    },
    
    // Estilo para o texto do botão Compartilhar
    detailActionText: {
        fontSize: 14,
        color: '#0A789B', // Uma cor de link/ação
    },
    
    // Estilo adaptado para o botão de like (o vermelho)
    likeButtonMobileDetail: {
        backgroundColor: '#2bc091', 
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // Linha divisória
    separator: {
        height: 1, 
        backgroundColor: '#eee', 
        marginVertical: 10 
    },

    
});

export default localStyles;