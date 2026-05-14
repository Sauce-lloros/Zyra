import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { authService } from '../services/AuthService';
import { postService } from '../services/PostService';
import { userService } from '../services/UserService';
import { Post, User } from '../types';
import { getPostImages } from '../utils/postImages';
import { timeAgo } from '../utils/timeAgo';
import Avatar from './Avatar';
import CommentsModal from './CommentsModal';
import PostImagesGrid from './PostImagesGrid';

const isWeb = Platform.OS === 'web';

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onEdit?: (postId: string) => void;
}

export default function PostCard({ post, currentUserId, onEdit }: PostCardProps) {
  const [author, setAuthor] = useState<User | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const isOwner = post.authorId === currentUserId;

  const currentUser = authService.getCurrentUser();
  const userLiked = !!(currentUser && post.likedBy?.includes(currentUser.uid));

  useEffect(() => {
    if (post.authorId) {
      userService.getById(post.authorId).then(setAuthor);
    }
  }, [post.authorId]);

  const handleLike = async () => {
    if (!currentUser) return;
    try {
      await postService.toggleLike(post.id);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleAuthorPress = () => {
    if (!author) return;
    if (isOwner) {
      router.push('/profile' as any);
    } else {
      router.push(`/public-profile?username=${author.username}` as any);
    }
  };

  const fallback = author?.username || post.authorEmail;

  return (
    <View style={styles.card}>
      <View style={[styles.inner, isWeb && { maxWidth: 800, alignSelf: 'center', width: '100%' }]}>
        {/* Header: avatar, username (clickeable), tiempo, botón editar */}
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={styles.authorRow}
            onPress={handleAuthorPress}
            activeOpacity={0.7}
            disabled={!author}
          >
            <Avatar photoURL={author?.photoURL} fallback={fallback} size={40} />
            <View>
              <Text style={styles.username}>
                @{author?.username || post.authorEmail}
              </Text>
              <Text style={styles.time}>{timeAgo(post.createdAt)}</Text>
            </View>
          </TouchableOpacity>
          {isOwner && onEdit && (
            <TouchableOpacity onPress={() => onEdit(post.id)}>
              <Ionicons name="pencil-outline" size={20} color="#208c8c" />
            </TouchableOpacity>
          )}
        </View>

        {/* Contenido del post */}
        <Text style={styles.content}>{post.content}</Text>

        {/* Imagen si tiene */}
        <PostImagesGrid images={getPostImages(post)} />

        {/* Acciones: likes y comentarios */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleLike} activeOpacity={0.6}>
            <Ionicons
              name={userLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={userLiked ? '#ff3b5c' : '#666'}
            />
            <Text style={[styles.actionCount, userLiked && { color: '#ff3b5c' }]}>
              {post.likes || 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setCommentsOpen(true)} activeOpacity={0.6}>
            <Ionicons name="chatbubble-outline" size={20} color="#666" />
            <Text style={styles.actionCount}>{post.comments || 0}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de comentarios */}
      <CommentsModal
        visible={commentsOpen}
        postId={post.id}
        onClose={() => setCommentsOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inner: {},
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  username: { color: '#fff', fontWeight: '700', fontSize: 14 },
  time: { color: '#555', fontSize: 12, marginTop: 1 },
  content: { color: '#ddd', fontSize: 15, lineHeight: 22, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 20 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionCount: { color: '#666', fontSize: 13 },
});