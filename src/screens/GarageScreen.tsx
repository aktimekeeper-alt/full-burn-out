import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, TextInput,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, Image, FlatList,
} from 'react-native';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';
import { Vehicle, Mod, MaintenanceLog } from '../types';

export default function GarageScreen({ route }: any) {
  const { vehicleId } = route.params as { vehicleId: string };
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  const [modVisible, setModVisible] = useState(false);
  const [modName, setModName] = useState('');
  const [modDate, setModDate] = useState('');
  const [modCost, setModCost] = useState('');
  const [savingMod, setSavingMod] = useState(false);

  const [maintVisible, setMaintVisible] = useState(false);
  const [maintType, setMaintType] = useState('');
  const [maintDate, setMaintDate] = useState('');
  const [maintMileage, setMaintMileage] = useState('');
  const [maintNotes, setMaintNotes] = useState('');
  const [savingMaint, setSavingMaint] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'vehicles', vehicleId), snap => {
      if (snap.exists()) setVehicle({ id: snap.id, ...snap.data() } as Vehicle);
      setLoading(false);
    });
    return unsub;
  }, [vehicleId]);

  async function handleAddMod() {
    if (!modName.trim() || !modDate.trim()) { Alert.alert('Name and date required'); return; }
    setSavingMod(true);
    try {
      await updateDoc(doc(db, 'vehicles', vehicleId), {
        mods: arrayUnion({ id: Date.now().toString(), name: modName.trim(), date: modDate.trim(), cost: parseFloat(modCost) || 0 } as Mod),
      });
      setModName(''); setModDate(''); setModCost(''); setModVisible(false);
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setSavingMod(false); }
  }

  async function handleDeleteMod(modId: string) {
    if (!vehicle) return;
    Alert.alert('Delete Mod', 'Remove this mod?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await updateDoc(doc(db, 'vehicles', vehicleId), { mods: vehicle.mods.filter(m => m.id !== modId) });
        },
      },
    ]);
  }

  async function handleAddMaintenance() {
    if (!maintType.trim() || !maintDate.trim()) { Alert.alert('Type and date required'); return; }
    setSavingMaint(true);
    try {
      await updateDoc(doc(db, 'vehicles', vehicleId), {
        maintenanceLogs: arrayUnion({
          id: Date.now().toString(), type: maintType.trim(), date: maintDate.trim(),
          mileage: parseInt(maintMileage, 10) || 0, notes: maintNotes.trim(),
        } as MaintenanceLog),
      });
      setMaintType(''); setMaintDate(''); setMaintMileage(''); setMaintNotes(''); setMaintVisible(false);
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setSavingMaint(false); }
  }

  async function handleDeleteLog(logId: string) {
    if (!vehicle) return;
    Alert.alert('Delete Entry', 'Remove this log entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await updateDoc(doc(db, 'vehicles', vehicleId), { maintenanceLogs: vehicle.maintenanceLogs.filter(l => l.id !== logId) });
        },
      },
    ]);
  }

  async function handleAddPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
    if (!result.canceled && result.assets.length > 0) {
      await updateDoc(doc(db, 'vehicles', vehicleId), { photos: arrayUnion(result.assets[0].uri) });
    }
  }

  if (loading) return <View style={styles.centered}><ActivityIndicator color="#FF4500" size="large" /></View>;
  if (!vehicle) return <View style={styles.centered}><Text style={styles.emptyText}>Vehicle not found.</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* Specs */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="car-sport" size={24} color="#FF4500" />
          <Text style={styles.cardTitle}>Specs</Text>
        </View>
        {[['Make', vehicle.make], ['Model', vehicle.model], ['Year', String(vehicle.year)], ['Color', vehicle.color]].map(([label, val], i, arr) => (
          <View key={label} style={[styles.specRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
            <Text style={styles.specLabel}>{label}</Text>
            <Text style={styles.specValue}>{val}</Text>
          </View>
        ))}
      </View>

      {/* Mods */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeader}>
            <Ionicons name="construct-outline" size={20} color="#FF4500" />
            <Text style={styles.cardTitle}>Modifications ({vehicle.mods.length})</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModVisible(true)}>
            <Ionicons name="add" size={16} color="#fff" /><Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
        {vehicle.mods.length === 0 ? <Text style={styles.emptyText}>No mods yet.</Text>
          : vehicle.mods.map((mod, i) => (
            <View key={mod.id} style={[styles.listItem, i === vehicle.mods.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listItemTitle}>{mod.name}</Text>
                <Text style={styles.listItemSub}>{mod.date}{mod.cost > 0 ? ` · $${mod.cost.toFixed(0)}` : ''}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteMod(mod.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={16} color="#FF4500" />
              </TouchableOpacity>
            </View>
          ))}
      </View>

      {/* Maintenance */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeader}>
            <Ionicons name="clipboard-outline" size={20} color="#FF4500" />
            <Text style={styles.cardTitle}>Maintenance ({vehicle.maintenanceLogs.length})</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setMaintVisible(true)}>
            <Ionicons name="add" size={16} color="#fff" /><Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
        {vehicle.maintenanceLogs.length === 0 ? <Text style={styles.emptyText}>No logs yet.</Text>
          : vehicle.maintenanceLogs.map((log, i) => (
            <View key={log.id} style={[styles.listItem, i === vehicle.maintenanceLogs.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listItemTitle}>{log.type}</Text>
                <Text style={styles.listItemSub}>{log.date} · {log.mileage.toLocaleString()} mi</Text>
                {log.notes ? <Text style={styles.notesText}>{log.notes}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => handleDeleteLog(log.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={16} color="#FF4500" />
              </TouchableOpacity>
            </View>
          ))}
      </View>

      {/* Photos */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeader}>
            <Ionicons name="images-outline" size={20} color="#FF4500" />
            <Text style={styles.cardTitle}>Photos ({vehicle.photos.length})</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddPhoto}>
            <Ionicons name="add" size={16} color="#fff" /><Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
        {vehicle.photos.length === 0
          ? <Text style={styles.emptyText}>No photos yet. Tap Add to upload.</Text>
          : <FlatList horizontal data={vehicle.photos} keyExtractor={(_, i) => String(i)} contentContainerStyle={{ padding: 12, gap: 10 }} renderItem={({ item }) => <Image source={{ uri: item }} style={styles.photoThumb} />} />}
      </View>

      {/* Add Mod Modal */}
      <Modal visible={modVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Modification</Text>
            <Text style={styles.label}>Mod Name</Text>
            <TextInput style={styles.input} value={modName} onChangeText={setModName} placeholder="Turbo Upgrade" placeholderTextColor="#888" />
            <Text style={styles.label}>Date (MM/DD/YYYY)</Text>
            <TextInput style={styles.input} value={modDate} onChangeText={setModDate} placeholder="01/15/2025" placeholderTextColor="#888" keyboardType="numbers-and-punctuation" />
            <Text style={styles.label}>Cost ($)</Text>
            <TextInput style={styles.input} value={modCost} onChangeText={setModCost} placeholder="1500" placeholderTextColor="#888" keyboardType="decimal-pad" />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setModVisible(false); setModName(''); setModDate(''); setModCost(''); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddMod} disabled={savingMod}>
                {savingMod ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Add</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Maintenance Modal */}
      <Modal visible={maintVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Maintenance Log</Text>
            <Text style={styles.label}>Type</Text>
            <TextInput style={styles.input} value={maintType} onChangeText={setMaintType} placeholder="Oil Change" placeholderTextColor="#888" />
            <Text style={styles.label}>Date (MM/DD/YYYY)</Text>
            <TextInput style={styles.input} value={maintDate} onChangeText={setMaintDate} placeholder="01/15/2025" placeholderTextColor="#888" keyboardType="numbers-and-punctuation" />
            <Text style={styles.label}>Mileage</Text>
            <TextInput style={styles.input} value={maintMileage} onChangeText={setMaintMileage} placeholder="45000" placeholderTextColor="#888" keyboardType="number-pad" />
            <Text style={styles.label}>Notes</Text>
            <TextInput style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]} value={maintNotes} onChangeText={setMaintNotes} placeholder="Synthetic 5W-30..." placeholderTextColor="#888" multiline />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setMaintVisible(false); setMaintType(''); setMaintDate(''); setMaintMileage(''); setMaintNotes(''); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddMaintenance} disabled={savingMaint}>
                {savingMaint ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Add</Text>}
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
  card: { backgroundColor: '#1A1A1A', borderRadius: 12, marginHorizontal: 16, marginTop: 16, borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  specLabel: { color: '#888', fontSize: 14 },
  specValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  listItemTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  listItemSub: { color: '#888', fontSize: 13 },
  notesText: { color: '#ccc', fontSize: 13, marginTop: 4, fontStyle: 'italic' },
  deleteBtn: { padding: 6 },
  emptyText: { color: '#888', fontSize: 14, padding: 16 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FF4500', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  photoThumb: { width: 100, height: 100, borderRadius: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 16 },
  label: { color: '#888', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: '#0D0D0D', color: '#fff', borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14, fontSize: 15 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 13, borderRadius: 8, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  cancelText: { color: '#888', fontSize: 15, fontWeight: '600' },
  saveBtn: { flex: 1, paddingVertical: 13, borderRadius: 8, backgroundColor: '#FF4500', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
