import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Avatar from '../components/Avatar';
import BottomNav from '../components/BottomNav';
import CommentsModal from '../components/CommentsModal';
import PostImagesGrid from '../components/PostImagesGrid';
import { authService } from '../services/AuthService';
import { postService } from '../services/PostService';
import { userService } from '../services/UserService';
import { Post, User } from '../types';
import { getPostImages } from '../utils/postImages';
import { formatDate } from '../utils/timeAgo';

const isWeb = Platform.OS === 'web';

export default function PublicProfile() {
  const { username } = useLocalSearchParams();
  const currentUser = authService.getCurrentUser();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    const loadProfile = async () => {
      const user = await userService.getByUsername(username as string);
      if (!user) {
        setError('Usuario no encontrado');
        setLoading(false);
        return;
      }

      setProfile(user);

      unsub = postService.subscribeToUserPosts(user.uid, newPosts => {
        setPosts(newPosts);
        setLoading(false);
      });
    };

    loadProfile();

    return () => { if (unsub) unsub(); };
  }, [username]);

  const handleLike = async (postId: string) => {
    try {
      await postService.toggleLike(postId);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#208c8c" size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="person-outline" size={48} color="#333" />
        <Text style={styles.errorTitle}>Usuario no encontrado</Text>
        <Text style={styles.errorSub}>@{username} no existe en Zyra</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const headerPadding = isWeb ? '8%' : 16;
  const topPad = isWeb ? 14 : 52;

  return (
    <View style={styles.container}>
      <FlatList
        style={{ flex: 1 }}
        data={posts}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View>
            {/* Top bar */}
            <View style={[styles.topBar, { paddingHorizontal: headerPadding as any, paddingTop: topPad }]}>
              <Text style={styles.topTitle}>Perfil</Text>
            </View>

            {/* Perfil */}
            <View style={styles.profileSection}>
              <Avatar
                photoURL={profile?.photoURL}
                fallback={profile?.username}
                size={90}
              />
              <Text style={styles.username}>@{profile?.username}</Text>
              {profile?.bio ? (
                <Text style={styles.bio}>{profile.bio}</Text>
              ) : (
                <Text style={styles.emptyBio}>Sin biografía</Text>
              )}
            </View>

            {/* Header publicaciones */}
            <View style={styles.postsHeader}>
              <Ionicons name="grid-outline" size={18} color="#208c8c" />
              <Text style={styles.postsHeaderText}>Publicaciones</Text>
            </View>
            <View style={styles.divider} />
          </View>
        }
        renderItem={({ item }) => {
          const userLiked = !!(currentUser && item.likedBy?.includes(currentUser.uid));
          return (
            <View style={styles.postCard}>
              <View style={[styles.postInner, isWeb && { maxWidth: 800, alignSelf: 'center', width: '100%' }]}>
                <Text style={styles.postTime}>{formatDate(item.createdAt)}</Text>
                <Text style={styles.postContent}>{item.content}</Text>
                <PostImagesGrid images={getPostImages(item)} />
                <View style={styles.postActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(item.id)} activeOpacity={0.6}>
                    <Ionicons
                      name={userLiked ? 'heart' : 'heart-outline'}
                      size={18}
                      color={userLiked ? '#ff3b5c' : '#555'}
                    />
                    <Text style={[styles.actionCount, userLiked && { color: '#ff3b5c' }]}>
                      {item.likes || 0}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => setCommentsPostId(item.id)} activeOpacity={0.6}>
                    <Ionicons name="chatbubble-outline" size={18} color="#555" />
                    <Text style={styles.actionCount}>{item.comments || 0}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="camera-outline" size={40} color="#333" />
            <Text style={styles.emptyText}>Este usuario no ha publicado nada</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />

      {/* Modal de comentarios */}
      <CommentsModal
        visible={!!commentsPostId}
        postId={commentsPostId || ''}
        onClose={() => setCommentsPostId(null)}
      />

      <BottomNav active="search" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  centered: { flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', gap: 12 },
  topBar: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  topTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  profileSection: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 24, gap: 12 },
  username: { fontSize: 20, fontWeight: '800', color: '#fff' },
  bio: { fontSize: 14, color: '#aaa', textAlign: 'center', lineHeight: 20 },
  emptyBio: { fontSize: 13, color: '#444', fontStyle: 'italic' },
  postsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  postsHeaderText: { color: '#208c8c', fontWeight: '700', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: '#1e1e1e' },
  postCard: { paddingHorizontal: 16, paddingVertical: 14 },
  postInner: {},
  postTime: { color: '#555', fontSize: 12, marginBottom: 6 },
  postContent: { color: '#ddd', fontSize: 15, lineHeight: 22, marginBottom: 10 },
  postActions: { flexDirection: 'row', gap: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionCount: { color: '#555', fontSize: 12 },
  empty: { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyText: { color: '#555', fontSize: 14 },
  errorTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  errorSub: { color: '#666', fontSize: 13 },
  backBtn: { backgroundColor: '#208c8c', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  backBtnText: { color: '#fff', fontWeight: '700' },
});