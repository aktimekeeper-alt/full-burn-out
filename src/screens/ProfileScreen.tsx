import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
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
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { Vehicle } from '../types';
import VehicleCard from '../components/VehicleCard';

export default function ProfileScreen({ navigation }: any) {
  const { currentUser, logout } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile modal
  const [editVisible, setEditVisible] = useState(false);
  const [editUsername, setEditUsername] = useState(currentUser?.username ?? '');
  const [editBio, setEditBio] = useState(currentUser?.bio ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Add Vehicle modal
  const [vehicleVisible, setVehicleVisible] = useState(false);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [addingVehicle, setAddingVehicle] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'vehicles'), where('ownerId', '==', currentUser.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Vehicle[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Vehicle));
      setVehicles(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [currentUser]);

  async function handleSaveProfile() {
    if (!currentUser) return;
    if (!editUsername.trim()) {
      Alert.alert('Error', 'Username cannot be empty.');
      return;
    }
    setSavingProfile(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.id), {
        username: editUsername.trim(),
        bio: editBio.trim(),
      });
      setEditVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAddVehicle() {
    if (!make.trim() || !model.trim() || !year.trim() || !color.trim()) {
      Alert.alert('Error', 'Please fill in all vehicle fields.');
      return;
    }
    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum) || yearNum < 1886 || yearNum > new Date().getFullYear() + 1) {
      Alert.alert('Error', 'Please enter a valid year.');
      return;
    }
    if (!currentUser) return;
    setAddingVehicle(true);
    try {
      await addDoc(collection(db, 'vehicles'), {
        ownerId: currentUser.id,
        make: make.trim(),
        model: model.trim(),
        year: yearNum,
        color: color.trim(),
        mods: [],
        photos: [],
        maintenanceLogs: [],
        createdAt: serverTimestamp(),
      });
      setMake('');
      setModel('');
      setYear('');
      setColor('');
      setVehicleVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to add vehicle.');
    } finally {
      setAddingVehicle(false);
    }
  }

  async function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  }

  if (!currentUser) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{currentUser.username.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.username}>@{currentUser.username}</Text>
          <Text style={styles.email}>{currentUser.email}</Text>
          {currentUser.bio ? <Text style={styles.bio}>{currentUser.bio}</Text> : null}
          <View style={styles.headerBtns}>
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditVisible(true)}>
              <Ionicons name="pencil-outline" size={16} color="#FF4500" />
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={16} color="#888888" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Garage Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Garage</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setVehicleVisible(true)}>
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.addBtnText}>Add Vehicle</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator color="#FF4500" style={{ marginTop: 20 }} />
          ) : vehicles.length === 0 ? (
            <Text style={styles.emptyText}>No vehicles yet. Add your first ride!</Text>
          ) : (
            vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onPress={() => navigation.navigate('GarageScreen', { vehicleId: vehicle.id })}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={editUsername}
              onChangeText={setEditUsername}
              placeholder="Username"
              placeholderTextColor="#888888"
              autoCapitalize="none"
            />
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Tell the community about yourself..."
              placeholderTextColor="#888888"
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Vehicle Modal */}
      <Modal visible={vehicleVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Vehicle</Text>
            <Text style={styles.label}>Make</Text>
            <TextInput
              style={styles.input}
              value={make}
              onChangeText={setMake}
              placeholder="Toyota"
              placeholderTextColor="#888888"
            />
            <Text style={styles.label}>Model</Text>
            <TextInput
              style={styles.input}
              value={model}
              onChangeText={setModel}
              placeholder="Supra"
              placeholderTextColor="#888888"
            />
            <Text style={styles.label}>Year</Text>
            <TextInput
              style={styles.input}
              value={year}
              onChangeText={setYear}
              placeholder="2023"
              placeholderTextColor="#888888"
              keyboardType="number-pad"
            />
            <Text style={styles.label}>Color</Text>
            <TextInput
              style={styles.input}
              value={color}
              onChangeText={setColor}
              placeholder="Midnight Black"
              placeholderTextColor="#888888"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setVehicleVisible(false);
                  setMake('');
                  setModel('');
                  setYear('');
                  setColor('');
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddVehicle} disabled={addingVehicle}>
                {addingVehicle ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Add</Text>
                )}
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
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF4500',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold' },
  username: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  email: { color: '#888888', fontSize: 14, marginBottom: 8 },
  bio: { color: '#CCCCCC', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  headerBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF4500',
  },
  editBtnText: { color: '#FF4500', fontSize: 14, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  logoutText: { color: '#888888', fontSize: 14 },
  section: { paddingHorizontal: 0 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF4500',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  emptyText: { color: '#888888', textAlign: 'center', marginTop: 20, fontSize: 14, paddingHorizontal: 16 },
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
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
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
