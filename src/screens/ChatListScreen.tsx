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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { Chat } from '../types';

export default function ChatListScreen({ navigation }: any) {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [memberUsernames, setMemberUsernames] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'chats'),
      where('members', 'array-contains', currentUser.id)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Chat[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Chat));
      // Sort by lastMessageTime desc
      data.sort((a, b) => {
        const aTime = a.lastMessageTime?.seconds ?? 0;
        const bTime = b.lastMessageTime?.seconds ?? 0;
        return bTime - aTime;
      });
      setChats(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [currentUser]);

  async function handleCreateChat() {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Group name is required.');
      return;
    }
    if (!currentUser) return;
    setCreating(true);
    try {
      // Resolve member usernames to user IDs
      const usernameList = memberUsernames
        .split(',')
        .map((u) => u.trim())
        .filter(Boolean);

      const memberIds: string[] = [currentUser.id];
      for (const uname of usernameList) {
        const snap = await getDocs(
          query(collection(db, 'users'), where('username', '==', uname))
        );
        if (!snap.empty) {
          const uid = snap.docs[0].id;
          if (!memberIds.includes(uid)) {
            memberIds.push(uid);
          }
        }
      }

      await addDoc(collection(db, 'chats'), {
        name: groupName.trim(),
        members: memberIds,
        isGroup: memberIds.length > 2,
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      setGroupName('');
      setMemberUsernames('');
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create chat.');
    } finally {
      setCreating(false);
    }
  }

  function formatTime(lastMessageTime: any): string {
    if (!lastMessageTime?.seconds) return '';
    const date = new Date(lastMessageTime.seconds * 1000);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }

  function renderChatItem({ item }: { item: Chat }) {
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('ChatScreen', { chatId: item.id, chatName: item.name })}
        activeOpacity={0.7}
      >
        <View style={styles.chatAvatar}>
          <Ionicons
            name={item.isGroup ? 'people' : 'person'}
            size={22}
            color="#FF4500"
          />
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatTopRow}>
            <Text style={styles.chatName}>{item.name}</Text>
            <Text style={styles.chatTime}>{formatTime(item.lastMessageTime)}</Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || 'No messages yet'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#FF4500" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No chats yet. Start a conversation!</Text>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="chatbubble-ellipses-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Chat</Text>
            <Text style={styles.label}>Group Name</Text>
            <TextInput
              style={styles.input}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="e.g. JDM Crew"
              placeholderTextColor="#888888"
            />
            <Text style={styles.label}>Members (usernames, comma-separated)</Text>
            <TextInput
              style={styles.input}
              value={memberUsernames}
              onChangeText={setMemberUsernames}
              placeholder="speed_demon, drift_king, turbo_tony"
              placeholderTextColor="#888888"
              autoCapitalize="none"
            />
            <Text style={styles.hint}>You'll be added automatically.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  setGroupName('');
                  setMemberUsernames('');
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleCreateChat} disabled={creating}>
                {creating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Create</Text>
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#333333',
  },
  chatInfo: { flex: 1 },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  chatTime: { color: '#888888', fontSize: 12 },
  lastMessage: { color: '#888888', fontSize: 13 },
  separator: { height: 1, backgroundColor: '#1A1A1A', marginLeft: 78 },
  emptyText: { color: '#888888', textAlign: 'center', marginTop: 60, fontSize: 15 },
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
  hint: { color: '#888888', fontSize: 12, marginBottom: 16 },
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
