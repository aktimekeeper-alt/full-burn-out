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
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { Post } from '../types';
import PostCard from '../components/PostCard';

export default function FeedScreen() {
  const { currentUser, userProfile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Post[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
      setPosts(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  }

  async function handlePost() {
    if (!caption.trim() && !selectedImage) {
      Alert.alert('Error', 'Please add a caption or image.');
      return;
    }
    if (!currentUser) return;
    setPosting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        authorId: currentUser.id,
        authorUsername: currentUser.username,
        content: caption.trim(),
        photos: selectedImage ? [selectedImage] : [],
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
      });
      setCaption('');
      setSelectedImage(null);
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to post.');
    } finally {
      setPosting(false);
    }
  }

  async function handleLike(postId: string) {
    if (!currentUser) return;
    const postRef = doc(db, 'posts', postId);
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    if (post.likes.includes(currentUser.id)) {
      await updateDoc(postRef, { likes: arrayRemove(currentUser.id) });
    } else {
      await updateDoc(postRef, { likes: arrayUnion(currentUser.id) });
    }
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
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            currentUserId={currentUser?.uid ?? ''}
            currentUsername={userProfile?.username ?? 'anonymous'}
          />
        )}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No posts yet. Be the first to post!</Text>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Post</Text>
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />
            )}
            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
              <Ionicons name="image-outline" size={20} color="#FF4500" />
              <Text style={styles.imagePickerText}>
                {selectedImage ? 'Change Photo' : 'Add Photo'}
              </Text>
            </TouchableOpacity>
            <TextInput
              style={styles.captionInput}
              value={caption}
              onChangeText={setCaption}
              placeholder="What's on your mind? #burnout"
              placeholderTextColor="#888888"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  setCaption('');
                  setSelectedImage(null);
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postBtn} onPress={handlePost} disabled={posting}>
                {posting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.postBtnText}>Post</Text>
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
  previewImage: { width: '100%', height: 180, borderRadius: 10, marginBottom: 12 },
  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    marginBottom: 12,
  },
  imagePickerText: { color: '#FF4500', fontSize: 15, fontWeight: '600' },
  captionInput: {
    backgroundColor: '#0D0D0D',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 90,
    marginBottom: 16,
  },
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
  postBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 8,
    backgroundColor: '#FF4500',
    alignItems: 'center',
  },
  postBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
