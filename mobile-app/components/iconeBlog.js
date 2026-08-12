
import React from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import styles from '../assets/styles/iconStyles';

export default function IconeBlog({ onPress, style }) {
  return (
    <TouchableOpacity 
      style={[styles.container, style]}
      onPress={onPress}
    >
      <Image 
        source={require('../assets/images/blog.png')} // caminho para seu PNG
        style={styles.icone}
      />
      <Text style={styles.texto}>Blog</Text>
    </TouchableOpacity>
  );
}
