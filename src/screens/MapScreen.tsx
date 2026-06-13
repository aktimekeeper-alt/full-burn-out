import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../hooks/useLocation';
import { Meet } from '../types';
import MeetCard from '../components/MeetCard';

interface AttendeeLocation {
  userId: string;
  latitude: number;
  longitude: number;
}

export default function MapScreen() {
  const { currentUser } = useAuth();
  const { startWatching, stopWatching, getCurrentLocation, hasPermission } = useLocation();
  const [meets, setMeets] = useState<Meet[]>([]);
  const [attendeeLocations, setAttendeeLocations] = useState<AttendeeLocation[]>([]);
  const [selectedMeet, setSelectedMeet] = useState<Meet | null>(null);
  const [activeMeetId, setActiveMeetId] = useState<string | null>(null);
  const [createVisible, setCreateVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [region, setRegion] = useState({
    latitude: 34.0522,
    longitude: -118.2437,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'meets'), (snapshot) => {
      const data: Meet[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Meet));
      setMeets(data);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!activeMeetId) return;
    const unsubscribe = onSnapshot(
      collection(db, 'meets', activeMeetId, 'attendeeLocations'),
      (snapshot) => {
        const locs: AttendeeLocation[] = snapshot.docs.map((d) => ({
          userId: d.id,
          ...(d.data() as { latitude: number; longitude: number }),
        }));
        setAttendeeLocations(locs);
      }
    );
    return unsubscribe;
  }, [activeMeetId]);

  useEffect(() => {
    (async () => {
      if (hasPermission) {
        const coords = await getCurrentLocation();
        if (coords) {
          setRegion((r) => ({
            ...r,
            latitude: coords.latitude,
            longitude: coords.longitude,
          }));
        }
      }
    })();
  }, [hasPermission]);

  async function handleCreateMeet() {
    if (!title.trim() || !date.trim()) {
      Alert.alert('Error', 'Title and date are required.');
      return;
    }
    if (!currentUser) return;
    setCreating(true);
    try {
      const coords = await getCurrentLocation();
      await addDoc(collection(db, 'meets'), {
        title: title.trim(),
        description: description.trim(),
        date: date.trim(),
        location: {
          lat: coords?.latitude ?? region.latitude,
          lng: coords?.longitude ?? region.longitude,
          address: 'Current Location',
        },
        hostId: currentUser.id,
        attendees: [currentUser.id],
        isActive: true,
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setDescription('');
      setDate('');
      setCreateVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create meet.');
    } finally {
      setCreating(false);
    }
  }

  async function handleJoinMeet(meet: Meet) {
    if (!currentUser) return;
    const isAttending = meet.attendees.includes(currentUser.id);
    const meetRef = doc(db, 'meets', meet.id);

    if (isAttending) {
      // Leave meet
      await updateDoc(meetRef, {
        attendees: meet.attendees.filter((id) => id !== currentUser.id),
      });
      if (activeMeetId === meet.id) {
        stopWatching();
        try {
          await deleteDoc(doc(db, 'meets', meet.id, 'attendeeLocations', currentUser.id));
        } catch {}
        setActiveMeetId(null);
        setAttendeeLocations([]);
      }
      setSelectedMeet(null);
    } else {
      // Join meet
      await updateDoc(meetRef, {
        attendees: arrayUnion(currentUser.id),
      });
      setActiveMeetId(meet.id);
      await startWatching(async (coords) => {
        if (!currentUser) return;
        try {
          await setDoc(doc(db, 'meets', meet.id, 'attendeeLocations', currentUser.id), {
            latitude: coords.latitude,
            longitude: coords.longitude,
            updatedAt: serverTimestamp(),
          });
        } catch {}
      });
      setSelectedMeet(null);
    }
  }

  async function handleStopSharing() {
    if (!activeMeetId || !currentUser) return;
    stopWatching();
    try {
      await deleteDoc(doc(db, 'meets', activeMeetId, 'attendeeLocations', currentUser.id));
    } catch {}
    setActiveMeetId(null);
    setAttendeeLocations([]);
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        mapType="standard"
        userInterfaceStyle="dark"
        showsUserLocation={hasPermission}
      >
        {meets.map((meet) => (
          <Marker
            key={meet.id}
            coordinate={{ latitude: meet.location.lat, longitude: meet.location.lng }}
            onPress={() => setSelectedMeet(meet)}
            pinColor="#FF4500"
            title={meet.title}
            description={meet.date}
          />
        ))}
        {attendeeLocations
          .filter((loc) => loc.userId !== currentUser?.id)
          .map((loc) => (
            <Marker
              key={`attendee-${loc.userId}`}
              coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            >
              <Text style={styles.carEmoji}>🚗</Text>
            </Marker>
          ))}
      </MapView>

      {/* Active sharing banner */}
      {activeMeetId && (
        <View style={styles.sharingBanner}>
          <View style={styles.sharingIndicator} />
          <Text style={styles.sharingText}>Sharing Location</Text>
          <TouchableOpacity style={styles.stopBtn} onPress={handleStopSharing}>
            <Text style={styles.stopBtnText}>Stop</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Create Meet FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setCreateVisible(true)}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Selected Meet Bottom Sheet */}
      {selectedMeet && (
        <View style={styles.bottomSheet}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedMeet(null)}>
            <Ionicons name="close" size={20} color="#888888" />
          </TouchableOpacity>
          <MeetCard
            meet={selectedMeet}
            onJoin={() => handleJoinMeet(selectedMeet)}
            isAttending={selectedMeet.attendees.includes(currentUser?.id ?? '')}
          />
        </View>
      )}

      {/* Create Meet Modal */}
      <Modal visible={createVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Meet</Text>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Friday Night Cars & Coffee"
              placeholderTextColor="#888888"
            />
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]}
              value={description}
              onChangeText={setDescription}
              placeholder="All cars welcome..."
              placeholderTextColor="#888888"
              multiline
            />
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="2024-06-15 7:00 PM"
              placeholderTextColor="#888888"
            />
            <Text style={styles.locationNote}>
              <Ionicons name="location-outline" size={13} color="#888888" /> Meet location will be set to your current location.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setCreateVisible(false);
                  setTitle('');
                  setDescription('');
                  setDate('');
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleCreateMeet} disabled={creating}>
                {creating ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Create</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  map: { flex: 1 },
  carEmoji: { fontSize: 24 },
  sharingBanner: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF4500',
  },
  sharingIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4500',
    marginRight: 10,
  },
  sharingText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', flex: 1 },
  stopBtn: {
    backgroundColor: '#333333',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stopBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF4500',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0D0D0D',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#333333',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 4,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginBottom: 16 },
  label: { color: '#888888', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  input: {
    backgroundColor: '#0D0D0D',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    fontSize: 15,
  },
  locationNote: { color: '#888888', fontSize: 12, marginBottom: 16 },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  cancelText: { color: '#888888', fontSize: 15, fontWeight: '600' },
  saveBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 8,
    backgroundColor: '#FF4500',
    alignItems: 'center',
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
