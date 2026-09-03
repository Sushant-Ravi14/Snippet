import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/config';

const EmptyState = ({ message = 'Nothing here yet', subMessage = '' }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {subMessage ? <Text style={styles.subMessage}>{subMessage}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  message: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subMessage: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default EmptyState;
