import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Avatar from '../components/Avatar';
import BottomNav from '../components/BottomNav';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { authService } from '../services/AuthService';
import { chatService } from '../services/ChatService';
import { Chat } from '../types';
import { timeAgo } from '../utils/timeAgo';

const isWeb = Platform.OS === 'web';

export default function Chats() {
  const { checking } = useAuthGuard();
  const currentUser = authService.getCurrentUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = chatService.subscribeToChats(newChats => {
      setChats(newChats);
      setLoading(false);
    });
    return unsub;
  }, []);

  const getOtherMember = (chat: Chat) => {
    if (!currentUser) return null;
    const otherUid = chat.members.find(m => m !== currentUser.uid);
    if (!otherUid) return null;
    return {
      uid: otherUid,
      username: chat.memberNames[otherUid] || 'Usuario',
      photoURL: chat.memberPhotos[otherUid] || '',
    };
  };

  const openChat = (chatId: string, otherUid: string, otherUsername: string) => {
    router.push(`/chat-room?chatId=${chatId}&otherUid=${otherUid}&otherUsername=${otherUsername}` as any);
  };

  const headerPadding = isWeb ? '8%' : 16;
  const topPad = isWeb ? 14 : 52;

  if (checking) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingHorizontal: headerPadding as any, paddingTop: topPad }]}>
        <Text style={styles.title}>Mensajes</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#208c8c" size="large" />
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContent,
            chats.length === 0 && { flexGrow: 1, justifyContent: 'center' },
          ]}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={56} color="#333" />
              <Text style={styles.emptyTitle}>Aún no tienes conversaciones</Text>
              <Text style={styles.emptySub}>
                Visita el perfil de un usuario y envíale un mensaje
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const other = getOtherMember(item);
            if (!other) return null;

            const unread = currentUser ? (item.unreadCount?.[currentUser.uid] || 0) : 0;
            const isLastFromMe = item.lastMessageBy === currentUser?.uid;

            return (
              <TouchableOpacity
                style={[styles.chatRow, isWeb && { maxWidth: 800, alignSelf: 'center', width: '100%' }]}
                onPress={() => openChat(item.id, other.uid, other.username)}
                activeOpacity={0.7}
              >
                <Avatar photoURL={other.photoURL} fallback={other.username} size={52} />
                <View style={styles.chatInfo}>
                  <View style={styles.chatTop}>
                    <Text style={styles.username} numberOfLines={1}>@{other.username}</Text>
                    {item.lastMessageAt && (
                      <Text style={styles.time}>{timeAgo(item.lastMessageAt)}</Text>
                    )}
                  </View>
                  <View style={styles.chatBottom}>
                    <Text
                      style={[styles.lastMessage, unread > 0 && !isLastFromMe && styles.lastMessageUnread]}
                      numberOfLines={1}
                    >
                      {isLastFromMe && 'Tú: '}
                      {item.lastMessage || 'Conversación iniciada'}
                    </Text>
                    {unread > 0 && !isLastFromMe && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <BottomNav active="chats" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  header: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
  },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingVertical: 8 },
  divider: { height: 1, backgroundColor: '#1a1a1a', marginHorizontal: 16 },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  chatInfo: { flex: 1, gap: 4 },
  chatTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  username: { color: '#fff', fontWeight: '700', fontSize: 15, flexShrink: 1 },
  time: { color: '#666', fontSize: 12 },
  chatBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  lastMessage: { color: '#888', fontSize: 13, flex: 1 },
  lastMessageUnread: { color: '#fff', fontWeight: '600' },
  badge: {
    backgroundColor: '#208c8c',
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', gap: 12, paddingHorizontal: 32 },
  emptyTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  emptySub: { color: '#888', fontSize: 13, textAlign: 'center', lineHeight: 19 },
});
