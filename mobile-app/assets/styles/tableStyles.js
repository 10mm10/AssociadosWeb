import { StyleSheet } from 'react-native';

const tableStyles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        margin: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    titleTabelaDocumentos: {
        color: '#333',
        fontSize: 20,
        marginBottom: 15,
        textAlign: 'center',
    },
    titleTabelaClientes: {
        color: '#333',
        fontSize: 20,
        marginBottom: 15,
        marginLeft: 80,
    },
    addButton: {
        backgroundColor: '#3498dbba',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#333',
        fontSize: 15,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        backgroundColor: '#eee',
        marginHorizontal: 5,
    },
    filterButtonActive: {
        backgroundColor: '#3498dbba',
    },
    filterButtonText: {
        color: '#000',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: '#EFEFEF',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#cccccc',
    },
    headerCell: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    cell: {
        flex: 1,
        color: '#333',
        fontSize: 13,
    },
    selectedRow: {
        backgroundColor: '#3498db89',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 20,
    },
    // Estilos do formulário de adição (Base)
    formContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginTop: 20,
    },
    formTitle: {
        fontSize: 20,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    // Estilos de Botão do Formulário (CORRIGIDOS PARA 50/50)
    formButtonUpload: {
        backgroundColor: '#3498db', // Cor diferente para destacar o "Selecionar"
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10, // Adiciona um pequeno espaço acima dele
        width: '100%', // Ocupa a largura total
    },
    formButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    formButton: {
        backgroundColor: '#0A789B',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1, // Garante que ocupe o espaço disponível
        // marginHorizontal: 5, <-- Removido para funcionar com flex: 1
        alignItems: 'center',
    },
    formButtonText: {
        color: '#fff',
        
    },
    formCancelButton: {
        backgroundColor: '#ccc',
        marginRight: 10, // Adiciona o espaçamento entre Salvar e Cancelar
    },
    // Estilos de Cancelar/Voltar (Antigos)
    cancelButton: {
        backgroundColor: '#D9534F',
        borderRadius: 20,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },

    // Estilos de link e botões de ação
    linkContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f0f8ff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#0A789B',
    },
    linkText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    linkUrl: {
        fontSize: 12,
        color: '#0A789B',
        marginTop: 5,
        marginBottom: 10,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        backgroundColor: '#e6f7ff',
        borderRadius: 5,
    },
    copyButtonText: {
        fontSize: 12,
        color: '#0A789B',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    linkTypeButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    linkTypeButton: {
        backgroundColor: '#0A789B',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    linkTypeButtonText: {
        color: '#FFF',
    },
    procuracaoListContainer: {
        marginTop: 20,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    procuracaoButton: {
        backgroundColor: '#E0E0E0',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    procuracaoButtonText: {
        color: '#0a799bff',
    },

    // Estilos de FOOTER e BOTÃO DE EXCLUIR
    actionButtonFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 5,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        marginTop: 10,
    },
    voltarButton: {
        backgroundColor: '#0a799b8b',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        flex: 1,
        marginRight: 5,
    },
    voltarButtonText: {
        color: 'white',
    },
    zapsignButton: {
        backgroundColor: '#ff7f50',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    zapsignButtonText: {
        color: 'white',
    },
    deleteButton: {
        backgroundColor: '#e74d3cf4',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        marginRight: 5,
    },
    deleteButtonText: {
        color: '#FFF',
    },
    // Estilos de Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 25,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    // Estilos de Picker
    pickerLabel: {
        fontSize: 18,
        color: '#333',
        marginTop: 15,
        marginBottom: 5,
    },
    pickerContainer: {
        height: 50,
        width: '50%',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        justifyContent: 'center',
        overflow: 'hidden',
    },

    centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Fundo escurecido
},
modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%', 
    maxWidth: 400,
},
modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
},
selectFileButton: {
    backgroundColor: '#0A789B',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
},
selectFileButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
},
fileNameText: {
    marginBottom: 20,
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    minHeight: 20, // Garante espaço mesmo sem arquivo
},
modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
},
modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '48%', 
    alignItems: 'center',
    justifyContent: 'center',
},
cancelButton: {
    backgroundColor: '#CCC',
},
cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
},
sendButton: {
    backgroundColor: '#28a745', // Verde
},
sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
},
disabledButton: {
    backgroundColor: '#a2a2a2', // Cinza para desabilitado
}
});

// Exportação nomeada para os estilos de Rádio (Corrigido da etapa anterior)
export const radioStyles = StyleSheet.create({
    radioGroupTitle: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
    },
    radioGroupContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    radioButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    radioCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#0A789B',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 5,
    },
    selectedRb: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#0A789B',
    },
    radioText: {
        fontSize: 14,
        color: '#333',
    },
});


export default tableStyles;