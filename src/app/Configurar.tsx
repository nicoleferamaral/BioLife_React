import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Configurar() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf6e3',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
});

