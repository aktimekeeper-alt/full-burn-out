import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';
import { Vehicle, Mod, MaintenanceLog } from '../types';

export default function GarageScreen({ route }: any) {
  const { vehicleId } = route.params as { vehicleId: string };
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  // Add Mod modal
  const [modVisible, setModVisible] = useState(false);
  const [modName, setModName] = useState('');
  const [modDate, setModDate] = useState('');
  const [modCost, setModCost] = useState('');
  const [savingMod, setSavingMod] = useState(false);

  // Add Maintenance modal
  const [maintVisible, setMaintVisible] = useState(false);
  const [maintType, setMaintType] = useState('');
  const [maintDate, setMaintDate] = useState('');
  const [maintMileage, setMaintMileage] = useState('');
  const [maintNotes, setMaintNotes] = useState('');
  const [savingMaint, setSavingMaint] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'vehicles', vehicleId), (snapshot) => {
      if (snapshot.exists()) {
        setVehicle({ id: snapshot.id, ...snapshot.data() } as Vehicle);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [vehicleId]);

  async function handleAddMod() {
    if (!modName.trim() || !modDate.trim()) {
      Alert.alert('Error', 'Name and date are required.');
      return;
    }
    setSavingMod(true);
    try {
      const newMod: Mod = {
        id: Date.now().toString(),
        name: modName.trim(),
        date: modDate.trim(),
        cost: parseFloat(modCost) || 0,
      };
      await updateDoc(doc(db, 'vehicles', vehicleId), {
        mods: arrayUnion(newMod),
      });
      setModName('');
      setModDate('');
      setModCost('');
      setModVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to add mod.');
    } finally {
      setSavingMod(false);
    }
  }

  async function handleAddMaintenance() {
    if (!maintType.trim() || !maintDate.trim()) {
      Alert.alert('Error', 'Type and date are required.');
      return;
    }
    setSavingMaint(true);
    try {
      const newLog: MaintenanceLog = {
        id: Date.now().toString(),
        type: maintType.trim(),
        date: maintDate.trim(),
        mileage: parseInt(maintMileage, 10) || 0,
        notes: maintNotes.trim(),
      };
      await updateDoc(doc(db, 'vehicles', vehicleId), {
        maintenanceLogs: arrayUnion(newLog),
      });
      setMaintType('');
      setMaintDate('');
      setMaintMileage('');
      setMaintNotes('');
      setMaintVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to add maintenance log.');
    } finally {
      setSavingMaint(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#FF4500" size="large" />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Vehicle not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Specs Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="car-sport" size={24} color="#FF4500" />
          <Text style={styles.cardTitle}>Specs</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Make</Text>
          <Text style={styles.specValue}>{vehicle.make}</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Model</Text>
          <Text style={styles.specValue}>{vehicle.model}</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Year</Text>
          <Text style={styles.specValue}>{vehicle.year}</Text>
        </View>
        <View style={[styles.specRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.specLabel}>Color</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[styles.colorDot, { backgroundColor: vehicle.color.toLowerCase() }]} />
            <Text style={styles.specValue}>{vehicle.color}</Text>
          </View>
        </View>
      </View>

      {/* Mods Section */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeader}>
            <Ionicons name="construct-outline" size={20} color="#FF4500" />
            <Text style={styles.cardTitle}>Modifications ({vehicle.mods.length})</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModVisible(true)}>
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add Mod</Text>
          </TouchableOpacity>
        </View>
        {vehicle.mods.length === 0 ? (
          <Text style={styles.emptyText}>No mods yet.</Text>
        ) : (
          vehicle.mods.map((mod, index) => (
            <View key={mod.id} style={[styles.listItem, index === vehicle.mods.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listItemTitle}>{mod.name}</Text>
                <Text style={styles.listItemSub}>{mod.date}</Text>
              </View>
              {mod.cost > 0 && (
                <Text style={styles.costText}>${mod.cost.toFixed(2)}</Text>
              )}
            </View>
          ))
        )}
      </View>

      {/* Maintenance Log Section */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeader}>
            <Ionicons name="clipboard-outline" size={20} color="#FF4500" />
            <Text style={styles.cardTitle}>Maintenance ({vehicle.maintenanceLogs.length})</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setMaintVisible(true)}>
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add Entry</Text>
          </TouchableOpacity>
        </View>
        {vehicle.maintenanceLogs.length === 0 ? (
          <Text style={styles.emptyText}>No maintenance logs yet.</Text>
        ) : (
          vehicle.maintenanceLogs.map((log, index) => (
            <View key={log.id} style={[styles.listItem, index === vehicle.maintenanceLogs.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listItemTitle}>{log.type}</Text>
                <Text style={styles.listItemSub}>{log.date} · {log.mileage.toLocaleString()} mi</Text>
                {log.notes ? <Text style={styles.notesText}>{log.notes}</Text> : null}
              </View>
            </View>
          ))
        )}
      </View>

      {/* Photos Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="images-outline" size={20} color="#FF4500" />
          <Text style={styles.cardTitle}>Photos</Text>
        </View>
        <Text style={styles.emptyText}>
          {vehicle.photos.length === 0 ? 'No photos yet.' : `${vehicle.photos.length} photo(s)`}
        </Text>
      </View>

      {/* Add Mod Modal */}
      <Modal visible={modVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Modification</Text>
            <Text style={styles.label}>Mod Name</Text>
            <TextInput
              style={styles.input}
              value={modName}
              onChangeText={setModName}
              placeholder="Turbo Upgrade"
              placeholderTextColor="#888888"
            />
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={modDate}
              onChangeText={setModDate}
              placeholder="2024-01-15"
              placeholderTextColor="#888888"
            />
            <Text style={styles.label}>Cost ($)</Text>
            <TextInput
              style={styles.input}
              value={modCost}
              onChangeText={setModCost}
              placeholder="1500.00"
              placeholderTextColor="#888888"
              keyboardType="decimal-pad"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModVisible(false);
                  setModName('');
                  setModDate('');
                  setModCost('');
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddMod} disabled={savingMod}>
                {savingMod ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Add</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Maintenance Modal */}
      <Modal visible={maintVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Maintenance Log</Text>
            <Text style={styles.label}>Type</Text>
            <TextInput
              style={styles.input}
              value={maintType}
              onChangeText={setMaintType}
              placeholder="Oil Change"
              placeholderTextColor="#888888"
            />
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={maintDate}
              onChangeText={setMaintDate}
              placeholder="2024-01-15"
              placeholderTextColor="#888888"
            />
            <Text style={styles.label}>Mileage</Text>
            <TextInput
              style={styles.input}
              value={maintMileage}
              onChangeText={setMaintMileage}
              placeholder="45000"
              placeholderTextColor="#888888"
              keyboardType="number-pad"
            />
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]}
              value={maintNotes}
              onChangeText={setMaintNotes}
              placeholder="Synthetic 5W-30..."
              placeholderTextColor="#888888"
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setMaintVisible(false);
                  setMaintType('');
                  setMaintDate('');
                  setMaintMileage('');
                  setMaintNotes('');
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddMaintenance} disabled={savingMaint}>
                {savingMaint ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Add</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#333333',
    overflow: 'hidden',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  specLabel: { color: '#888888', fontSize: 14 },
  specValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  colorDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: '#555555' },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  listItemTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  listItemSub: { color: '#888888', fontSize: 13 },
  notesText: { color: '#CCCCCC', fontSize: 13, marginTop: 4, fontStyle: 'italic' },
  costText: { color: '#FF4500', fontSize: 14, fontWeight: '700' },
  emptyText: { color: '#888888', fontSize: 14, padding: 16 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF4500',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginRight: 4,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
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
