

import { StyleSheet } from 'react-native';

const createPostStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f2f2ff',
    borderRadius:5,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  header: {
    textAlign:'center',
    fontSize: 25,
    color: '#333',
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    textAlign:"center",
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    textAlign:'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    height: 150,
    textAlignVertical: 'top', // Necessário para alinhar o texto no topo do Android
  },
  // --- Estilos de Imagem ---
  imageSelectButton: {
    backgroundColor: '#0A789B', // Sua cor primária
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageSelectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  imagePreviewContainer: {
    marginTop: 15,
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
    marginBottom: 10,
  },
  removeImageButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  removeImageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // --- Estilos do Botão de Envio ---
  submitButton: {
    backgroundColor: '#68d294ff', // Cor de sucesso/envio
    padding: 13,
    borderRadius: 5,
    width:180,
    marginTop: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    textAlign:"center",
    color: '#fff',
    fontSize: 18,
  },
});

export default createPostStyles;