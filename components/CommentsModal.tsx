import { Ionicons } from '@expo/vector-icons';
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
  View
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '../services/AuthService';
import { postService } from '../services/PostService';
import { userService } from '../services/UserService';
import { Comment, User } from '../types';
import { confirm } from '../utils/confirm';
import { timeAgo } from '../utils/timeAgo';
import Avatar from './Avatar';

interface CommentsModalProps {
  visible: boolean;
  postId: string;
  onClose: () => void;
}

export default function CommentsModal({ visible, postId, onClose }: CommentsModalProps) {
  const currentUser = authService.getCurrentUser();
  const insets = useSafeAreaInsets();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [authors, setAuthors] = useState<{ [uid: string]: User | null }>({});

  useEffect(() => {
    if (!visible || !postId) return;
    setLoading(true);
    const unsub = postService.subscribeToComments(postId, list => {
      setComments(list);
      setLoading(false);
      list.forEach(c => {
        if (!authors[c.authorId]) {
          userService.getById(c.authorId).then(user => {
            setAuthors(prev => ({ ...prev, [c.authorId]: user }));
          });
        }
      });
    });
    return unsub;
  }, [visible, postId]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await postService.addComment(postId, text);
      setText('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    const ok = await confirm({
      title: 'Eliminar comentario',
      message: '¿Estás seguro? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      destructive: true,
    });
    if (!ok) return;
    try {
      await postService.deleteComment(postId, commentId);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>

            <View style={styles.header}>
              <Text style={styles.title}>Comentarios</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#aaa" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.centered}>
                <ActivityIndicator color="#208c8c" />
              </View>
            ) : (
              <FlatList
                data={comments}
                keyExtractor={c => c.id}
                contentContainerStyle={comments.length === 0 && styles.emptyContainer}
                ListEmptyComponent={
                  <View style={styles.empty}>
                    <Ionicons name="chatbubble-outline" size={40} color="#333" />
                    <Text style={styles.emptyText}>Aún no hay comentarios</Text>
                    <Text style={styles.emptySub}>¡Sé el primero en comentar!</Text>
                  </View>
                }
                renderItem={({ item }) => {
                  const author = authors[item.authorId];
                  const isOwner = item.authorId === currentUser?.uid;
                  return (
                    <View style={styles.commentRow}>
                      <Avatar
                        photoURL={author?.photoURL}
                        fallback={author?.username || item.authorEmail}
                        size={34}
                      />
                      <View style={styles.commentBody}>
                        <View style={styles.commentHeader}>
                          <Text style={styles.commentUser}>
                            @{author?.username || item.authorEmail}
                          </Text>
                          <Text style={styles.commentTime}>{timeAgo(item.createdAt)}</Text>
                          {isOwner && (
                            <TouchableOpacity
                              onPress={() => handleDelete(item.id)}
                              style={styles.deleteBtn}
                            >
                              <Ionicons name="trash-outline" size={14} color="#ff6b6b" />
                            </TouchableOpacity>
                          )}
                        </View>
                        <Text style={styles.commentText}>{item.content}</Text>
                      </View>
                    </View>
                  );
                }}
              />
            )}

            <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 12) }]}>
              <TextInput
                style={styles.input}
                value={text}
                onChangeText={setText}
                placeholder="Escribe un comentario..."
                placeholderTextColor="#555"
                multiline
                maxLength={300}
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={!text.trim() || sending}
                style={[styles.sendBtn, (!text.trim() || sending) && { opacity: 0.4 }]}
              >
                {sending
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Ionicons name="send" size={18} color="#fff" />
                }
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: { color: '#fff', fontSize: 17, fontWeight: '700' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  emptyText: { color: '#555', fontSize: 15, fontWeight: '600' },
  emptySub: { color: '#444', fontSize: 12 },
  commentRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
  },
  commentBody: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  commentUser: { color: '#fff', fontWeight: '700', fontSize: 13 },
  commentTime: { color: '#666', fontSize: 11 },
  deleteBtn: { marginLeft: 'auto', padding: 4 },
  commentText: { color: '#ddd', fontSize: 14, lineHeight: 19 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#222',
    backgroundColor: '#1a1a1a',
  },
  input: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
    minHeight: 40,
  },
  sendBtn: {
    backgroundColor: '#208c8c',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});