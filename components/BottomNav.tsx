import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface BottomNavProps {
  active: 'home' | 'create' | 'search' | 'profile';
  photoURL?: string;
}

export default function BottomNav({ active, photoURL }: BottomNavProps) {
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
        style={styles.createBtn}
        onPress={() => router.push('/create-post' as any)}
      >
        <Ionicons name="add" size={28} color="#fff" />
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
        style={styles.navItem}
        onPress={() => router.push('/profile' as any)}
      >
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.navAvatar} />
        ) : (
          <Ionicons
            name={active === 'profile' ? 'person' : 'person-outline'}
            size={24}
            color={active === 'profile' ? '#208c8c' : '#555'}
          />
        )}
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
  navAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#208c8c',
  },
});