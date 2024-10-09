import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';

const LoadingIndicator = () => {
  return (
    <View style={styles.indicatorWrapper}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default LoadingIndicator;

const styles = StyleSheet.create({
  indicatorWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(100, 100, 100, 0.6)',
  },
});
