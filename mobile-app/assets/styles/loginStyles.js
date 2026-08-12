import { StyleSheet } from 'react-native';

const modernStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#3498dbba', 
    marginBottom:250,
    borderRadius: 15,
    
  },
  title: {
    fontSize: 30,
    fontStyle:'italic',
    textAlign: 'center',
    marginBottom: 40,
    color: '#555',
  },
  card: {
    width: '100%', // Adiciona uma largura de 100% para o card
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
    width: 0,
    height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 26,
    backgroundColor: '#F8F8F8',
  },
  logo: {
    width: 400,
    height: 150,
    alignSelf: 'center',
    marginBottom: 40,
  },
  button: {
    height: 45,
    borderRadius: 8,
    backgroundColor: '#3498dbba',
    justifyContent: 'center',
    alignItems: 'center',
    width:200,
    marginLeft: 50,
  },
  buttonText: {
    color: '#333',
    fontSize: 20,
    
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
});

export default modernStyles;