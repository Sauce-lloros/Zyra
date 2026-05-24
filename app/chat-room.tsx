import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Avatar from '../components/Avatar';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { authService } from '../services/AuthService';
import { chatService } from '../services/ChatService';
import { userService } from '../services/UserService';
import { Message, User } from '../types';

const isWeb = Platform.OS === 'web';

export default function ChatRoom() {
  const { checking } = useAuthGuard();
  const { chatId, otherUid, otherUsername } = useLocalSearchParams<{
    chatId: string;
    otherUid: string;
    otherUsername: string;
  }>();

  const currentUser = authService.getCurrentUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!otherUid) return;
    userService.getById(otherUid).then(setOtherUser);
  }, [otherUid]);

  useEffect(() => {
    if (!chatId) return;
    const unsub = chatService.subscribeToMessages(chatId, newMessages => {
      setMessages(newMessages);
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return unsub;
  }, [chatId]);

  useEffect(() => {
    if (chatId) chatService.markAsRead(chatId);
  }, [chatId, messages.length]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/chats' as any);
    }
  };

  const goToProfile = () => {
    if (!otherUsername) return;
    router.push(`/public-profile?username=${otherUsername}` as any);
  };

  const headerPadding = isWeb ? '8%' : 16;
  const topPad = isWeb ? 14 : 52;

  if (checking) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingHorizontal: headerPadding as any, paddingTop: topPad }]}>
        <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={26} color="#208c8c" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerInfo} onPress={goToProfile} activeOpacity={0.7}>
          <Avatar photoURL={otherUser?.photoURL} fallback={otherUsername} size={36} />
          <Text style={styles.headerUsername} numberOfLines={1}>@{otherUsername}</Text>
        </TouchableOpacity>
        <View style={{ width: 32 }} />
      </View>

      {/* KeyboardAvoidingView de react-native-keyboard-controller — funciona en Android */}
      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color="#208c8c" size="large" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={item => item.id}
            contentContainerStyle={[
              styles.messagesList,
              messages.length === 0 && { flexGrow: 1, justifyContent: 'center' },
            ]}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color="#333" />
                <Text style={styles.emptyText}>No hay mensajes aún</Text>
                <Text style={styles.emptySub}>Envía el primer mensaje</Text>
              </View>
            }
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                isMine={item.senderId === currentUser?.uid}
                chatId={chatId || ''}
              />
            )}
          />
        )}
        <MessageInput chatId={chatId || ''} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  keyboardArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
    backgroundColor: '#0a0a0a',
  },
  iconBtn: { padding: 4 },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
  },
  headerUsername: { color: '#fff', fontSize: 16, fontWeight: '700' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messagesList: { paddingVertical: 10, paddingBottom: 16 },
  empty: { alignItems: 'center', gap: 10, paddingHorizontal: 24 },
  emptyText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptySub: { color: '#666', fontSize: 13 },
});