import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Modal,
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
import { useAuthGuard } from '../hooks/useAuthGuard';
import { authService } from '../services/AuthService';
import { followService } from '../services/FollowService';
import { FeedOrder, postService } from '../services/PostService';
import { userService } from '../services/UserService';
import { Post } from '../types';

const isWeb = Platform.OS === 'web';
type TabType = 'para_ti' | 'siguiendo';

export default function Home() {
  const { checking } = useAuthGuard();

  const user = authService.getCurrentUser();
  const [username, setUsername] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('para_ti');
  const [order, setOrder] = useState<FeedOrder>('desc');
  const [orderModal, setOrderModal] = useState(false);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [followingLoaded, setFollowingLoaded] = useState(false);
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
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = followService.subscribeToFollowing(user.uid, ids => {
      setFollowingIds(ids);
      setFollowingLoaded(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    if (activeTab === 'para_ti') {
      setLoading(true);
      unsub = postService.subscribeToFeed(newPosts => {
        setPosts(newPosts);
        setLoading(false);
        setRefreshing(false);
      }, order);
    } else {
      if (!followingLoaded) {
        setLoading(true);
        return;
      }
      setLoading(true);
      unsub = postService.subscribeToFollowingFeed(followingIds, newPosts => {
        setPosts(newPosts);
        setLoading(false);
        setRefreshing(false);
      }, order);
    }

    return () => {
      if (unsub) unsub();
    };
  }, [activeTab, followingIds, followingLoaded, order]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const switchTab = (tab: TabType) => {
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

  const goToSearch = () => {
    router.push('/search' as any);
  };

  const selectOrder = (newOrder: FeedOrder) => {
    setOrder(newOrder);
    setOrderModal(false);
  };

  const indicatorLeft = tabIndicator.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  const fallback = username || user?.email || '?';
  const headerPadding = isWeb ? '8%' : 16;
  const topPad = isWeb ? 14 : 52;
  const noFollowingYet = activeTab === 'siguiendo' && followingLoaded && followingIds.length === 0;

  if (checking) return null;

  return (
    <View style={styles.container}>

      <View style={[styles.topBar, { paddingHorizontal: headerPadding as any, paddingTop: topPad }]}>
        <View style={styles.logoRow}>
          <Image
            source={require('../assets/images/LOGO_ZYRA_AZUL.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />
          <Text style={styles.appName}>ZYRA</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile' as any)} activeOpacity={0.7}>
          <Avatar photoURL={photoURL} fallback={fallback} size={32} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity style={styles.tab} onPress={() => switchTab('para_ti')}>
          <Text style={[styles.tabText, activeTab === 'para_ti' && styles.tabTextActive]}>Para ti</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => switchTab('siguiendo')}>
          <Text style={[styles.tabText, activeTab === 'siguiendo' && styles.tabTextActive]}>Siguiendo</Text>
        </TouchableOpacity>
        <Animated.View style={[styles.tabIndicator, { left: indicatorLeft }]} />
      </View>

      {!noFollowingYet && (
        <View style={[styles.orderBar, { paddingHorizontal: headerPadding as any }]}>
          <TouchableOpacity style={styles.orderIconBtn} onPress={() => setOrderModal(true)} activeOpacity={0.7}>
            <Ionicons name="swap-vertical" size={18} color="#208c8c" />
          </TouchableOpacity>
        </View>
      )}

      {noFollowingYet ? (
        <View style={styles.emptyContainer}>
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={56} color="#333" />
            <Text style={styles.emptyTitle}>Aún no sigues a nadie</Text>
            <Text style={styles.emptyText}>Sigue a otros usuarios para ver sus publicaciones aquí</Text>
            <TouchableOpacity style={styles.findUsersBtn} onPress={goToSearch} activeOpacity={0.85}>
              <Ionicons name="search" size={18} color="#fff" />
              <Text style={styles.findUsersBtnText}>Buscar usuarios</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#208c8c" size="large" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PostCard post={item} currentUserId={user?.uid} onEdit={handleEdit} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="newspaper-outline" size={48} color="#333" />
              <Text style={styles.emptyText}>
                {activeTab === 'siguiendo' ? 'Las personas que sigues aún no han publicado' : 'No hay publicaciones aún'}
              </Text>
              {activeTab === 'para_ti' && <Text style={styles.emptySubText}>¡Sé el primero en publicar!</Text>}
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#208c8c"
            />
          }
          contentContainerStyle={posts.length === 0 && styles.emptyContainer}
        />
      )}

      <Modal visible={orderModal} transparent animationType="fade" onRequestClose={() => setOrderModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOrderModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ordenar por</Text>
            <TouchableOpacity
              style={[styles.orderOption, order === 'desc' && styles.orderOptionActive]}
              onPress={() => selectOrder('desc')}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-down" size={20} color={order === 'desc' ? '#208c8c' : '#888'} />
              <Text style={[styles.orderOptionText, order === 'desc' && styles.orderOptionTextActive]}>Más recientes</Text>
              {order === 'desc' && <Ionicons name="checkmark" size={20} color="#208c8c" style={{ marginLeft: 'auto' }} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.orderOption, order === 'asc' && styles.orderOptionActive]}
              onPress={() => selectOrder('asc')}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-up" size={20} color={order === 'asc' ? '#208c8c' : '#888'} />
              <Text style={[styles.orderOptionText, order === 'asc' && styles.orderOptionTextActive]}>Más antiguos</Text>
              {order === 'asc' && <Ionicons name="checkmark" size={20} color="#208c8c" style={{ marginLeft: 'auto' }} />}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
  orderBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  orderIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#222',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12, paddingHorizontal: 32 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 4 },
  emptyText: { color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  emptySubText: { color: '#444', fontSize: 13 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  findUsersBtn: {
    flexDirection: 'row',
    backgroundColor: '#208c8c',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  findUsersBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: '#222',
  },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  orderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#222',
    marginBottom: 8,
  },
  orderOptionActive: {
    backgroundColor: 'rgba(32,140,140,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(32,140,140,0.4)',
  },
  orderOptionText: { color: '#888', fontSize: 14, fontWeight: '600' },
  orderOptionTextActive: { color: '#fff' },
});