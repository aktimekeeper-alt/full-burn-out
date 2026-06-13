import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Modal,
  TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Post, Comment } from '../types';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  currentUserId: string;
  currentUsername: string;
}

function timeAgo(ts: any): string {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function PostCard({ post, onLike, currentUserId, currentUsername }: PostCardProps) {
  const liked = post.likes.includes(currentUserId);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [saving, setSaving] = useState(false);

  async function submitComment() {
    if (!commentText.trim()) return;
    setSaving(true);
    const newComment: Comment = {
      id: Date.now().toString(),
      authorId: currentUserId,
      authorUsername: currentUsername,
      text: commentText.trim(),
      createdAt: new Date() as any,
    };
    await updateDoc(doc(db, 'posts', post.id), { comments: arrayUnion(newComment) });
    setCommentText('');
    setSaving(false);
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{post.authorUsername.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>@{post.authorUsername}</Text>
          <Text style={styles.timestamp}>{timeAgo(post.createdAt)}</Text>
        </View>
      </View>

      {post.photos && post.photos.length > 0 && (
        <Image source={{ uri: post.photos[0] }} style={styles.photo} resizeMode="cover" />
      )}
      {post.content ? <Text style={styles.content}>{post.content}</Text> : null}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onLike(post.id)}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? '#FF4500' : '#888'} />
          <Text style={[styles.actionText, liked && styles.likedText]}>{post.likes.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setCommentsOpen(true)}>
          <Ionicons name="chatbubble-outline" size={20} color="#888" />
          <Text style={styles.actionText}>{post.comments.length}</Text>
        </TouchableOpacity>
      </View>

      {/* Comments Bottom Sheet */}
      <Modal visible={commentsOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Comments</Text>

            <FlatList
              data={post.comments}
              keyExtractor={c => c.id}
              style={styles.commentList}
              ListEmptyComponent={<Text style={styles.emptyComments}>No comments yet. Be first.</Text>}
              renderItem={({ item }) => (
                <View style={styles.commentRow}>
                  <Text style={styles.commentAuthor}>@{item.authorUsername}</Text>
                  <Text style={styles.commentText}>{item.text}</Text>
                </View>
              )}
            />

            <View style={styles.inputRow}>
              <TextInput
                style={styles.commentInput}
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Add a comment..."
                placeholderTextColor="#555"
              />
              <TouchableOpacity style={styles.sendBtn} onPress={submitComment} disabled={saving}>
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Ionicons name="send" size={18} color="#fff" />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setCommentsOpen(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A', borderRadius: 12, marginHorizontal: 16,
    marginVertical: 8, borderWidth: 1, borderColor: '#333', overflow: 'hidden',
  },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  avatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF4500',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  username: { color: '#fff', fontWeight: '600', fontSize: 15 },
  timestamp: { color: '#666', fontSize: 11, marginTop: 1 },
  photo: { width: '100%', height: 220 },
  content: { color: '#fff', fontSize: 15, padding: 12 },
  actions: {
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#333', gap: 20,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { color: '#888', fontSize: 14 },
  likedText: { color: '#FF4500' },
  // Sheet
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#1A1A1A', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '75%',
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: '#444',
    alignSelf: 'center', marginBottom: 14,
  },
  sheetTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 12 },
  commentList: { flexGrow: 0, maxHeight: 280, marginBottom: 12 },
  emptyComments: { color: '#555', fontSize: 14, textAlign: 'center', paddingVertical: 20 },
  commentRow: { marginBottom: 12 },
  commentAuthor: { color: '#FF4500', fontWeight: '700', fontSize: 13, marginBottom: 2 },
  commentText: { color: '#ddd', fontSize: 14 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  commentInput: {
    flex: 1, backgroundColor: '#2A2A2A', color: '#fff', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
  },
  sendBtn: {
    backgroundColor: '#FF4500', borderRadius: 10, width: 42,
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtn: { alignItems: 'center', paddingVertical: 8 },
  closeBtnText: { color: '#666', fontSize: 14 },
});
