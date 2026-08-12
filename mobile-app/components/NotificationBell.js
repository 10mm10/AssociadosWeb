import React from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import PropTypes from 'prop-types';

// O componente agora recebe a prop 'count'
export function NotificationBell({ onPress, count }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.6 : 1,
        },
        styles.container,
      ]}
    >
      <Feather 
        name="bell" 
        size={24} 
        color="white" 
      />

      {/* 🔥 NOVO: O BADGE (Bolinha Vermelha com a contagem) */}
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {/* Limita o número exibido para evitar sobreposição exagerada */}
            {count > 99 ? '99+' : count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// Definição de Propriedades (PropTypes) atualizada
NotificationBell.propTypes = {
  onPress: PropTypes.func.isRequired,
  count: PropTypes.number, // Adicionado a prop count como número
};

const styles = StyleSheet.create({
  container: {
    marginRight: 15,
    // Permite que o badge (bolinha) se posicione sobre o sino
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5, // Ajusta a posição verticalmente acima do sino
    right: 5, // Ajusta a posição horizontalmente à direita do sino
    backgroundColor: '#FF3333', // Vermelho vibrante
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 10, // Garante que fique acima do ícone
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
