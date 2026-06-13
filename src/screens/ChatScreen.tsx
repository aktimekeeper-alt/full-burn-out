import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { Message } from '../types';

export default function ChatScreen({ route, navigation }: any) {
  const { chatId, chatName } = route.params as { chatId: string; chatName: string };
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({ title: chatName });
  }, [chatName]);

  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Message[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
      setMessages(data);
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return unsubscribe;
  }, [chatId]);

  async function handleSend() {
    if (!text.trim() || !currentUser) return;
    const msgText = text.trim();
    setText('');
    setSending(true);
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        chatId,
        senderId: currentUser.id,
        senderUsername: currentUser.username,
        text: msgText,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: msgText,
        lastMessageTime: serverTimestamp(),
      });
    } catch {}
    finally {
      setSending(false);
    }
  }

  function formatTime(createdAt: any): string {
    if (!createdAt?.seconds) return '';
    return new Date(createdAt.seconds * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function renderMessage({ item }: { item: Message }) {
    const isMe = item.senderId === currentUser?.id;
    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowThem]}>
        {!isMe && (
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>{item.senderUsername.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          {!isMe && (
            <Text style={styles.senderName}>@{item.senderUsername}</Text>
          )}
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingVertical: 12 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No messages yet. Say hello! 👋</Text>
        }
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Message..."
          placeholderTextColor="#888888"
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Ionicons name="send" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' },
  emptyText: { color: '#888888', textAlign: 'center', marginTop: 40, fontSize: 14 },
  messageRow: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  messageRowMe: { justifyContent: 'flex-end' },
  messageRowThem: { justifyContent: 'flex-start' },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF4500',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    flexShrink: 0,
  },
  avatarSmallText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMe: {
    backgroundColor: '#FF4500',
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: '#1A1A1A',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  senderName: { color: '#FF4500', fontSize: 11, fontWeight: '700', marginBottom: 3 },
  messageText: { color: '#FFFFFF', fontSize: 15, lineHeight: 20 },
  timeText: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    backgroundColor: '#0D0D0D',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF4500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#333333' },
});
