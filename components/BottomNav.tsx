import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { authService } from '../services/AuthService';
import { chatService } from '../services/ChatService';

interface BottomNavProps {
  active: 'home' | 'create' | 'search' | 'chats' | 'profile';
  photoURL?: string;
}

export default function BottomNav({ active }: BottomNavProps) {
  const [unreadChats, setUnreadChats] = useState(0);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) return;
    const unsub = chatService.subscribeToUnreadCount(count => {
      setUnreadChats(count);
    });
    return unsub;
  }, []);

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.replace('/home' as any)}
      >
        <Ionicons
          name={active === 'home' ? 'home' : 'home-outline'}
          size={24}
          color={active === 'home' ? '#208c8c' : '#555'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/search' as any)}
      >
        <Ionicons
          name={active === 'search' ? 'search' : 'search-outline'}
          size={24}
          color={active === 'search' ? '#208c8c' : '#555'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => router.push('/create-post' as any)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/chats' as any)}
      >
        <View>
          <Ionicons
            name={active === 'chats' ? 'chatbubble' : 'chatbubble-outline'}
            size={24}
            color={active === 'chats' ? '#208c8c' : '#555'}
          />
          {unreadChats > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadChats > 99 ? '99+' : unreadChats}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/profile' as any)}
      >
        <Ionicons
          name={active === 'profile' ? 'person' : 'person-outline'}
          size={24}
          color={active === 'profile' ? '#208c8c' : '#555'}
        />
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
    paddingBottom: 24,
    paddingTop: 10,
    backgroundColor: '#111',
  },
  navItem: { alignItems: 'center', justifyContent: 'center', padding: 6 },
  createBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#208c8c',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#208c8c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#ff3b5c',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#111',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});