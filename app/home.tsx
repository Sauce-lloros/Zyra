import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Avatar from '../components/Avatar';
import BottomNav from '../components/BottomNav';
import PostCard from '../components/PostCard';
import { authService } from '../services/AuthService';
import { postService } from '../services/PostService';
import { userService } from '../services/UserService';
import { Post } from '../types';

const isWeb = Platform.OS === 'web';

export default function Home() {
  const user = authService.getCurrentUser();
  const [username, setUsername] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'para_ti' | 'siguiendo'>('para_ti');
  const tabIndicator = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user) {
      userService.getById(user.uid).then(profile => {
        if (profile) {
          setUsername(profile.username || '');
          setPhotoURL(profile.photoURL || '');
        }
      });
    }

    const unsub = postService.subscribeToFeed(newPosts => {
      setPosts(newPosts);
      setLoading(false);
      setRefreshing(false);
    });

    return unsub;
  }, []);

  const switchTab = (tab: 'para_ti' | 'siguiendo') => {
    setActiveTab(tab);
    Animated.timing(tabIndicator, {
      toValue: tab === 'para_ti' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleEdit = (postId: string) => {
    router.push(`/edit-post?postId=${postId}` as any);
  };

  const indicatorLeft = tabIndicator.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  const fallback = username || user?.email || '?';
  const headerPadding = isWeb ? '8%' : 16;
  const topPad = isWeb ? 14 : 52;

  return (
    <View style={styles.container}>

      {/* Top bar */}
      <View style={[styles.topBar, { paddingHorizontal: headerPadding as any, paddingTop: topPad }]}>
        <View style={styles.logoRow}>
          <Image
            source={require('../assets/images/LOGO_ZYRA_AZUL.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />
          <Text style={styles.appName}>ZYRA</Text>
        </View>
        <Avatar photoURL={photoURL} fallback={fallback} size={32} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={styles.tab} onPress={() => switchTab('para_ti')}>
          <Text style={[styles.tabText, activeTab === 'para_ti' && styles.tabTextActive]}>
            Para ti
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => switchTab('siguiendo')}>
          <Text style={[styles.tabText, activeTab === 'siguiendo' && styles.tabTextActive]}>
            Siguiendo
          </Text>
        </TouchableOpacity>
        <Animated.View style={[styles.tabIndicator, { left: indicatorLeft }]} />
      </View>

      {/* Feed */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#208c8c" size="large" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              currentUserId={user?.uid}
              onEdit={handleEdit}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="newspaper-outline" size={48} color="#333" />
              <Text style={styles.emptyText}>No hay publicaciones aún</Text>
              <Text style={styles.emptySubText}>¡Sé el primero en publicar!</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => setRefreshing(true)}
              tintColor="#208c8c"
            />
          }
          contentContainerStyle={posts.length === 0 && styles.emptyContainer}
        />
      )}

      <BottomNav active="home" photoURL={photoURL} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoImg: { width: 24, height: 24, tintColor: '#208c8c' },
  appName: { fontSize: 18, fontWeight: '900', color: '#208c8c', letterSpacing: 4 },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
    position: 'relative',
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText: { color: '#555', fontSize: 15, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '50%',
    height: 2,
    backgroundColor: '#208c8c',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { color: '#555', fontSize: 16, fontWeight: '600' },
  emptySubText: { color: '#333', fontSize: 13 },
  emptyContainer: { flexGrow: 1 },
});