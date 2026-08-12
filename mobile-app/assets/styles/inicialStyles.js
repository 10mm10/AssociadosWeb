import { StyleSheet, Dimensions } from 'react-native';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#3498db6b',
  },
  header: {
    height: 60, // Ajustado para dar espaço ao sino
    flexDirection: 'row', // Alinha itens na horizontal
    justifyContent: 'space-between', // Essencial! Separa o conteúdo (esquerda) do sino (direita)
    alignItems: 'center',
    paddingHorizontal: 15, // Adiciona respiro nas laterais
    marginLeft: 20,
    marginRight: 20,
    borderBottomWidth: 1, 
    borderBottomColor: '#eee', 
  },
  // NOVO ESTILO: Agrupa a imagem e o texto "AssociadosWeb"
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 25,
    color: '#fff',
    marginLeft: 10,
  },
  scrollViewContent: {
    flexGrow: 1,
  },

  welcomeCardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginLeft: 10,
    marginRight: 10,
  },
  welcomeCardTitle: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#3498dbe8',
    marginBottom: 5,
  },
  welcomeCardName: {
    fontSize: 20,
    color: '#333333d7',
    marginBottom: 10,
  },
  welcomeCardText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
  },

   headerIcon: {
    marginTop:10,
    width:200,
    height: 60,
  },

  imageInicial:{
    width:350,
    height:200,

  },
 
  contentContainer: {
    flex: 1,
    backgroundColor: '#ffffffff',
    borderRadius: 5,
    padding: 5,
    marginHorizontal: 5,
    marginBottom: 5,
  },
  placeholderText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#ccc',
  },
  backButton: {
  backgroundColor: '#007bff',
  padding: 10,
  borderRadius: 5,
  alignItems: 'center',
  marginTop: 10,
},
backButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},


  // AJUSTADO: REMOVIDO PADDING VERTICAL GRANDE
  welcomeContainer: {
    paddingVertical: 5, // Reduzi de 10 para 5
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 15,
    fontWeight: 'normal',
    color: '#fff',
  },

  // AJUSTADO: REMOVIDO MARGIN GRANDE DO TOPO
  iconesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 5, // Reduzi de 20 para 5 para aproximar
  },

  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contentText: {
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  activeBorder: {
    borderBottomWidth: 2,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  /* --- NOVOS ESTILOS PARA O MODAL DE NOTIFICAÇÕES --- */

centeredView: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.6)' 
},
modalView: { 
    margin: 20, 
    backgroundColor: 'white', 
    borderRadius: 10, 
    padding: 20, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 4, 
    elevation: 5, 
    width: '90%', 
    maxHeight: '80%' 
},
modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    color: '#333' 
},
listContainer: { 
    width: '100%', 
    maxHeight: '70%', 
    marginTop: 5 
},
listItem: { 
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee', 
    backgroundColor: '#fff', 
    borderRadius: 5, 
    marginBottom: 8 
},
unreadItem: { 
    backgroundColor: '#e6f7ff', 
    borderLeftWidth: 4, 
    borderLeftColor: '#0A789B' 
},
itemTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#0A789B', 
    marginBottom: 3 
},
itemBody: { 
    fontSize: 14, 
    color: '#555', 
    marginBottom: 5 
},
itemDate: { 
    fontSize: 10, 
    color: '#aaa', 
    alignSelf: 'flex-end' 
},
emptyText: { 
    textAlign: 'center', 
    padding: 20, 
    color: '#777', 
    fontSize: 16 
},
button: { 
    borderRadius: 5, 
    padding: 10, 
    elevation: 2, 
    marginTop: 20 
},
buttonClose: { 
    backgroundColor: '#0A789B' 
},
textStyle: { 
    color: 'white', 
    fontWeight: 'bold', 
    textAlign: 'center' 
},


});


export default styles;