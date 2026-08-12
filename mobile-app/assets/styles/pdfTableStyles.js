import { StyleSheet } from 'react-native';

const pdfTableStyles = StyleSheet.create({
  pdfTitle: {
    color: '#333',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  pdfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingHorizontal: 10,
  },
  pdfCell: {
    fontSize: 13,
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  iconButton: {
    padding: 5,
  },
  selectionContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedRow: {
    backgroundColor: '#3498db89', // Cor para a linha selecionada
  },
});

export default pdfTableStyles;