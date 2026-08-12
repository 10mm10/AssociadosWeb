import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import tableStyles from '../assets/styles/tableStyles';

const ProcuracaoList = ({ procuracoes, onSelectProcuracao, loading }) => {
  if (loading) {
    return <ActivityIndicator size="large" color="#0A789B" style={{ marginTop: 20 }} />;
  }

  return (
    <View style={tableStyles.procuracaoListContainer}>
      <Text style={tableStyles.listTitle}>Selecione uma procuração:</Text>
      {procuracoes.map((doc) => (
        <TouchableOpacity 
          key={doc.id}
          style={tableStyles.procuracaoButton}
          onPress={() => onSelectProcuracao(doc.nome_original)}
        >
          <Text style={tableStyles.procuracaoButtonText}>{doc.nome_original}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ProcuracaoList;