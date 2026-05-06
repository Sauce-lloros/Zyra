import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Avatar from '../components/Avatar';
import BottomNav from '../components/BottomNav';
import CommentsModal from '../components/CommentsModal';
import ImagePickerButton from '../components/ImagePickerButton';
import PostImagesGrid from '../components/PostImagesGrid';
import { authService } from '../services/AuthService';
import { ImageFolders, imageService } from '../services/ImageService';
import { postService } from '../services/PostService';
import { userService } from '../services/UserService';
import { Post } from '../types';
import { confirm } from '../utils/confirm';
import { getPostImages } from '../utils/postImages';
import { formatDate } from '../utils/timeAgo';

const isWeb = Platform.OS === 'web';

export default function Profile() {
  const user = authService.getCurrentUser();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [tempBio, setTempBio] = useState('');
  const [msg, setMsg] = useState('');
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    userService.getById(user.uid).then(profile => {
      if (profile) {
        setUsername(profile.username || '');
        setBio(profile.bio || '');
        setPhotoURL(profile.photoURL || '');
      }
    });

    const unsub = postService.subscribeToUserPosts(user.uid, newPosts => {
      setPosts(newPosts);
      setLoadingPosts(false);
    });

    return unsub;
  }, []);

  const handlePhotoPicked = async (image: any) => {
    if (!user) return;
    setUploadingPhoto(true);
    try {
      const url = await imageService.upload(image, ImageFolders.AVATARS);
      setPhotoURL(url);
      await userService.updatePhoto(user.uid, url);
    } catch {
      Alert.alert('Error', 'No se pudo subir la foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const openEditModal = () => {
    setTempUsername(username);
    setTempBio(bio);
    setMsg('');
    setEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!tempUsername.trim()) {
      setMsg('El usuario no puede estar vacío');
      return;
    }

    setSaving(true);
    try {
      await userService.updateProfile(user.uid, {
        username: tempUsername.trim(),
        bio: tempBio.trim(),
      });
      setUsername(tempUsername.trim());
      setBio(tempBio.trim());
      setEditModal(false);
    } catch {
      setMsg('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    const ok = await confirm({
      title: 'Eliminar publicación',
      message: '¿Estás seguro? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      destructive: true,
    });
    if (!ok) return;

    try {
      await postService.delete(postId);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;
    const ok = await confirm({
      title: 'Eliminar foto de perfil',
      message: '¿Estás seguro? Volverás a tener la imagen por defecto.',
      confirmText: 'Eliminar',
      destructive: true,
    });
    if (!ok) return;

    try {
      await userService.updatePhoto(user.uid, '');
      setPhotoURL('');
    } catch {
      Alert.alert('Error', 'No se pudo eliminar la foto');
    }
  };

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Cerrar sesión',
      message: '¿Estás seguro que deseas salir de tu cuenta?',
      confirmText: 'Cerrar sesión',
      destructive: true,
    });
    if (!ok) return;

    await authService.logout();
    router.replace('/' as any);
  };

  const handleLike = async (postId: string) => {
    try {
      await postService.toggleLike(postId);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const fallback = username || user?.email || '?';
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
              <Text style={styles.topTitle}>Mi Perfil</Text>
              <View style={[styles.topActions, { right: headerPadding as any, top: topPad - 4 }]}>
                <TouchableOpacity style={styles.topBtn} onPress={openEditModal}>
                  <Ionicons name="pencil-outline" size={22} color="#208c8c" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.topBtn} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={22} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Avatar + info */}
            <View style={styles.profileSection}>
              <ImagePickerButton
                onPick={handlePhotoPicked}
                allowsEditing
                aspect={[1, 1]}
                disabled={uploadingPhoto}
              >
                <View>
                  <Avatar photoURL={photoURL} fallback={fallback} size={90} />
                  <View style={styles.cameraBtn}>
                    {uploadingPhoto
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Ionicons name="camera" size={14} color="#fff" />
                    }
                  </View>
                </View>
              </ImagePickerButton>

              {photoURL ? (
                <TouchableOpacity onPress={handleRemovePhoto} style={styles.removePhotoBtn}>
                  <Ionicons name="trash-outline" size={12} color="#ff6b6b" />
                  <Text style={styles.removePhotoText}>Eliminar foto</Text>
                </TouchableOpacity>
              ) : null}

              <Text style={styles.username}>@{username || 'usuario'}</Text>
              {bio ? <Text style={styles.bio}>{bio}</Text> : null}
              <Text style={styles.email}>{user?.email}</Text>
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
          const userLiked = !!(user && item.likedBy?.includes(user.uid));
          return (
            <View style={styles.postCard}>
              <View style={[styles.postInner, isWeb && { maxWidth: 800, alignSelf: 'center', width: '100%' }]}>
                <View style={styles.postCardHeader}>
                  <Text style={styles.postTime}>{formatDate(item.createdAt)}</Text>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                      onPress={() => router.push(`/edit-post?postId=${item.id}` as any)}
                    >
                      <Ionicons name="pencil-outline" size={18} color="#208c8c" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeletePost(item.id)}>
                      <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
                    </TouchableOpacity>
                  </View>
                </View>
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
          !loadingPosts ? (
            <View style={styles.empty}>
              <Ionicons name="camera-outline" size={40} color="#333" />
              <Text style={styles.emptyText}>Aún no tienes publicaciones</Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <ActivityIndicator color="#208c8c" />
            </View>
          )
        }
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />

      {/* Modal de comentarios */}
      <CommentsModal
        visible={!!commentsPostId}
        postId={commentsPostId || ''}
        onClose={() => setCommentsPostId(null)}
      />

      <Modal visible={editModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar perfil</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close" size={24} color="#aaa" />
              </TouchableOpacity>
            </View>

            {msg ? <Text style={styles.modalError}>{msg}</Text> : null}

            <Text style={styles.modalLabel}>Nombre de usuario</Text>
            <TextInput
              style={styles.modalInput}
              value={tempUsername}
              onChangeText={setTempUsername}
              placeholder="@tunombre"
              placeholderTextColor="#555"
              autoCapitalize="none"
            />

            <Text style={styles.modalLabel}>Biografía</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={tempBio}
              onChangeText={setTempBio}
              placeholder="Cuéntanos algo de ti..."
              placeholderTextColor="#555"
              multiline
            />

            <TouchableOpacity
              style={[styles.modalSaveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.modalSaveBtnText}>Guardar</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNav active="profile" photoURL={photoURL} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
    position: 'relative',
  },
  topTitle: { color: '#fff', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  topActions: { flexDirection: 'row', gap: 8, position: 'absolute' },
  topBtn: { padding: 8 },
  profileSection: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 24 },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#208c8c',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#111',
  },
  username: { fontSize: 20, fontWeight: '800', color: '#fff', marginTop: 12 },
  removePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  removePhotoText: { color: '#ff6b6b', fontSize: 11, fontWeight: '600' },
  bio: { fontSize: 14, color: '#aaa', textAlign: 'center', marginTop: 6, lineHeight: 20, paddingHorizontal: 20 },
  email: { fontSize: 12, color: '#555', marginTop: 6 },
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
  postCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  postTime: { color: '#555', fontSize: 12 },
  postContent: { color: '#ddd', fontSize: 15, lineHeight: 22, marginBottom: 10 },
  postActions: { flexDirection: 'row', gap: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionCount: { color: '#555', fontSize: 12 },
  empty: { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyText: { color: '#555', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  modalError: { color: '#ff6b6b', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  modalLabel: { color: '#208c8c', fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  modalInput: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
  },
  modalTextArea: { minHeight: 80, textAlignVertical: 'top' },
  modalSaveBtn: {
    backgroundColor: '#208c8c',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  modalSaveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});