import { StyleSheet } from 'react-native';

const iconStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  // NOVO ESTILO PARA A IMAGEM
  icone: {
    marginTop:10,
    width: 30, // Ajuste este valor conforme o tamanho da sua imagem
    height: 30, // Ajuste este valor conforme o tamanho da sua imagem
  },
  texto: {
    marginTop: 5,
    fontSize: 15,
    color:'#333',
  },
});

export default iconStyles;