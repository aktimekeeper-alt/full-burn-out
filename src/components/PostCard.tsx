import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  currentUserId: string;
}

export default function PostCard({ post, onLike, currentUserId }: PostCardProps) {
  const liked = post.likes.includes(currentUserId);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{post.authorUsername.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.username}>@{post.authorUsername}</Text>
      </View>
      {post.photos && post.photos.length > 0 && (
        <Image source={{ uri: post.photos[0] }} style={styles.photo} resizeMode="cover" />
      )}
      {post.content ? <Text style={styles.content}>{post.content}</Text> : null}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onLike(post.id)}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={22}
            color={liked ? '#FF4500' : '#888888'}
          />
          <Text style={[styles.actionText, liked && styles.likedText]}>{post.likes.length}</Text>
        </TouchableOpacity>
        <View style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={20} color="#888888" />
          <Text style={styles.actionText}>{post.comments.length}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#333333',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF4500',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  username: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  photo: { width: '100%', height: 220 },
  content: { color: '#FFFFFF', fontSize: 15, padding: 12 },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    gap: 20,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { color: '#888888', fontSize: 14 },
  likedText: { color: '#FF4500' },
});
