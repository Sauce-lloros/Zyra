import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '../services/AuthService';
import { chatService } from '../services/ChatService';
import { notificationService } from '../services/NotificationService';

interface BottomNavProps {
  active: 'home' | 'search' | 'create' | 'chats' | 'notifications' | 'profile';
  photoURL?: string;
}

export default function BottomNav({ active }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const [unreadChats, setUnreadChats] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) return;

    const unsubChats = chatService.subscribeToUnreadCount(count => setUnreadChats(count));
    const unsubNotifs = notificationService.subscribeToUnreadCount(count => setUnreadNotifs(count));

    return () => {
      unsubChats();
      unsubNotifs();
    };
  }, []);

  const Badge = ({ count }: { count: number }) => {
    if (count === 0) return null;
    return (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/home' as any)}>
        <Ionicons name={active === 'home' ? 'home' : 'home-outline'} size={22} color={active === 'home' ? '#208c8c' : '#555'} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/search' as any)}>
        <Ionicons name={active === 'search' ? 'search' : 'search-outline'} size={22} color={active === 'search' ? '#208c8c' : '#555'} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/create-post' as any)}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/chats' as any)}>
        <View>
          <Ionicons name={active === 'chats' ? 'chatbubble' : 'chatbubble-outline'} size={22} color={active === 'chats' ? '#208c8c' : '#555'} />
          <Badge count={unreadChats} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/notifications' as any)}>
        <View>
          <Ionicons name={active === 'notifications' ? 'notifications' : 'notifications-outline'} size={22} color={active === 'notifications' ? '#208c8c' : '#555'} />
          <Badge count={unreadNotifs} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#1e1e1e',
    paddingTop: 10,
    backgroundColor: '#111',
  },
  navItem: { alignItems: 'center', justifyContent: 'center', padding: 6 },
  createBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#208c8c',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#208c8c',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#ff3b5c',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#111',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});