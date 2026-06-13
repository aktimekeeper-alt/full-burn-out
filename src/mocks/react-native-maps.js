// Web stub for react-native-maps — map features only work on iOS/Android
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Stub = ({ children, style }) => (
  <View style={[styles.stub, style]}>
    <Text style={styles.icon}>🗺️</Text>
    <Text style={styles.text}>Map view is available on iOS & Android</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  stub: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1A1A' },
  icon: { fontSize: 48, marginBottom: 12 },
  text: { color: '#888', fontSize: 15 },
});

export default Stub;
export const Marker = ({ children }) => children ?? null;
export const Callout = ({ children }) => children ?? null;
export const PROVIDER_GOOGLE = 'google';
