import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
}

export default function VehicleCard({ vehicle, onPress }: VehicleCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconWrap}>
        <Ionicons name="car-sport" size={32} color="#FF4500" />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{vehicle.year} {vehicle.make} {vehicle.model}</Text>
        <View style={styles.row}>
          <View style={[styles.colorDot, { backgroundColor: vehicle.color.toLowerCase() }]} />
          <Text style={styles.subtitle}>{vehicle.color}</Text>
          <Text style={styles.dot}> · </Text>
          <Text style={styles.subtitle}>{vehicle.mods.length} mod{vehicle.mods.length !== 1 ? 's' : ''}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#888888" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#333333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  info: { flex: 1 },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#555555',
  },
  subtitle: { color: '#888888', fontSize: 13 },
  dot: { color: '#888888' },
});
