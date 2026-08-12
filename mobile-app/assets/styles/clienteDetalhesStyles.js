import { StyleSheet } from 'react-native';

const clienteDetalhesStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  actionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  zapsignButton: {
    backgroundColor: '#34A853',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  voltarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  voltarText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#0A789B',
  },
  linkContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#E6F7FF',
    borderRadius: 8,
    alignItems: 'center',
  },
  linkTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  linkUrl: {
    color: '#0A789B',
    textDecorationLine: 'underline',
    marginBottom: 10,
    textAlign: 'center',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  copyButtonText: {
    marginLeft: 5,
    color: '#0A789B',
    fontWeight: 'bold',
  },
});

export default clienteDetalhesStyles;