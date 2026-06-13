import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Meet } from '../types';

interface MeetCardProps {
  meet: Meet;
  onJoin: () => void;
  isAttending: boolean;
}

export default function MeetCard({ meet, onJoin, isAttending }: MeetCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons name="flag" size={18} color="#FF4500" style={{ marginRight: 8 }} />
        <Text style={styles.title}>{meet.title}</Text>
      </View>
      {meet.description ? <Text style={styles.description}>{meet.description}</Text> : null}
      <View style={styles.meta}>
        <Ionicons name="calendar-outline" size={14} color="#888888" />
        <Text style={styles.metaText}>{meet.date}</Text>
        <Ionicons name="location-outline" size={14} color="#888888" style={{ marginLeft: 12 }} />
        <Text style={styles.metaText}>{meet.location.address || 'See map'}</Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.attendees}>
          <Ionicons name="people-outline" size={16} color="#888888" />
          <Text style={styles.metaText}>{meet.attendees.length} attending</Text>
        </View>
        <TouchableOpacity
          style={[styles.joinBtn, isAttending && styles.leaveBtn]}
          onPress={onJoin}
        >
          <Text style={styles.joinBtnText}>{isAttending ? 'Leave' : 'Join'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  title: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', flex: 1 },
  description: { color: '#CCCCCC', fontSize: 13, marginBottom: 10 },
  meta: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 4 },
  metaText: { color: '#888888', fontSize: 13, marginLeft: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attendees: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  joinBtn: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  leaveBtn: { backgroundColor: '#333333' },
  joinBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
