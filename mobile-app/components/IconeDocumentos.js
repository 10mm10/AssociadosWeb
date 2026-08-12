// Arquivo: IconeClientes.js

import React from 'react';
import { TouchableOpacity, Text, Image } from 'react-native';
import styles from '../assets/styles/iconStyles';

// Altere esta linha para aceitar a propriedade 'style'
export default function IconeClientes({ onPress, style }) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
    >
      <Image
        source={require('../assets/images/documentos.png')}
        style={styles.icone}
      />
      <Text style={styles.texto}>Documentos</Text>
    </TouchableOpacity>
  );
}