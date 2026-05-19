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
import { notificationService } from '../services/NotificationService';
import { Notification } from '../types';
import { timeAgo } from '../utils/timeAgo';

const isWeb = Platform.OS === 'web';

export default function Notifications() {
  const { checking } = useAuthGuard();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = notificationService.subscribeToNotifications(items => {
      setNotifications(items);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      notificationService.markAllAsRead();
    }
  }, [notifications.length]);

  const handlePress = (notif: Notification) => {
    if (notif.type === 'follow') {
      router.push(`/public-profile?username=${notif.senderUsername}` as any);
    } else if (notif.postId) {
      router.push(`/public-profile?username=${notif.senderUsername}` as any);
    }
  };

  const getNotificationText = (notif: Notification): string => {
    switch (notif.type) {
      case 'follow':
        return 'empezó a seguirte';
      case 'like':
        return 'le dio like a tu publicación';
      case 'comment':
        return 'comentó en tu publicación';
      default:
        return 'tiene una nueva actividad';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return { name: 'person-add' as const, color: '#208c8c' };
      case 'like':
        return { name: 'heart' as const, color: '#ff3b5c' };
      case 'comment':
        return { name: 'chatbubble' as const, color: '#4a90e2' };
      default:
        return { name: 'notifications' as const, color: '#888' };
    }
  };

  const headerPadding = isWeb ? '8%' : 16;
  const topPad = isWeb ? 14 : 52;

  if (checking) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingHorizontal: headerPadding as any, paddingTop: topPad }]}>
        <Text style={styles.title}>Notificaciones</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#208c8c" size="large" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContent,
            notifications.length === 0 && { flexGrow: 1, justifyContent: 'center' },
          ]}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={56} color="#333" />
              <Text style={styles.emptyTitle}>No tienes notificaciones</Text>
              <Text style={styles.emptySub}>
                Cuando alguien interactúe contigo aparecerá aquí
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const icon = getNotificationIcon(item.type);
            return (
              <TouchableOpacity
                style={[
                  styles.notifRow,
                  isWeb && { maxWidth: 800, alignSelf: 'center', width: '100%' },
                  !item.read && styles.notifUnread,
                ]}
                onPress={() => handlePress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.avatarWrapper}>
                  <Avatar photoURL={item.senderPhotoURL} fallback={item.senderUsername} size={48} />
                  <View style={[styles.iconBadge, { backgroundColor: icon.color }]}>
                    <Ionicons name={icon.name} size={12} color="#fff" />
                  </View>
                </View>

                <View style={styles.notifInfo}>
                  <Text style={styles.notifText} numberOfLines={2}>
                    <Text style={styles.notifUsername}>@{item.senderUsername}</Text>
                    {' '}
                    {getNotificationText(item)}
                  </Text>
                  {item.postPreview && (
                    <Text style={styles.postPreview} numberOfLines={1}>
                      "{item.postPreview}"
                    </Text>
                  )}
                  <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
                </View>

                {!item.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          }}
        />
      )}

      <BottomNav active="home" />
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
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  notifUnread: {
    backgroundColor: 'rgba(32,140,140,0.04)',
  },
  avatarWrapper: { position: 'relative' },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#111',
  },
  notifInfo: { flex: 1, gap: 3 },
  notifText: { color: '#ddd', fontSize: 14, lineHeight: 20 },
  notifUsername: { fontWeight: '700', color: '#fff' },
  postPreview: { color: '#888', fontSize: 12, fontStyle: 'italic' },
  notifTime: { color: '#666', fontSize: 12, marginTop: 2 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#208c8c',
  },
  empty: { alignItems: 'center', gap: 12, paddingHorizontal: 32 },
  emptyTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  emptySub: { color: '#888', fontSize: 13, textAlign: 'center', lineHeight: 19 },
});
