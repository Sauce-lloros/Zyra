import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Avatar from '../components/Avatar';
import FollowButton from '../components/FollowButton';
import { authService } from '../services/AuthService';
import { followService } from '../services/FollowService';
import { userService } from '../services/UserService';
import { User } from '../types';

const isWeb = Platform.OS === 'web';
type TabType = 'followers' | 'following';

export default function Connections() {
  const params = useLocalSearchParams<{ uid: string; username: string; tab?: string }>();
  const { uid, username } = params;
  const initialTab: TabType = params.tab === 'following' ? 'following' : 'followers';

  const currentUser = authService.getCurrentUser();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(true);

  const tabIndicator = useRef(new Animated.Value(initialTab === 'followers' ? 0 : 1)).current;

  useEffect(() => {
    if (!uid) return;
    console.log('[Connections] Cargando seguidores -> uid:', uid);
    const unsub = followService.subscribeToFollowers(uid, async followerIds => {
      const usersFetched: User[] = [];
      for (const id of followerIds) {
        const user = await userService.getById(id);
        if (user) usersFetched.push(user);
      }
      setFollowers(usersFetched);
      setLoadingFollowers(false);
    });
    return unsub;
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    console.log('[Connections] Cargando seguidos -> uid:', uid);
    const unsub = followService.subscribeToFollowing(uid, async followingIds => {
      const usersFetched: User[] = [];
      for (const id of followingIds) {
        const user = await userService.getById(id);
        if (user) usersFetched.push(user);
      }
      setFollowing(usersFetched);
      setLoadingFollowing(false);
    });
    return unsub;
  }, [uid]);

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    Animated.timing(tabIndicator, {
      toValue: tab === 'followers' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const goToProfile = (targetUsername: string, targetUid: string) => {
    if (currentUser && targetUid === currentUser.uid) {
      router.push('/profile' as any);
    } else {
      router.push(`/public-profile?username=${targetUsername}` as any);
    }
  };

  const indicatorLeft = tabIndicator.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  const headerPadding = isWeb ? '8%' : 16;
  const topPad = isWeb ? 14 : 52;

  const currentList = activeTab === 'followers' ? followers : following;
  const currentLoading = activeTab === 'followers' ? loadingFollowers : loadingFollowing;

  const emptyConfig = activeTab === 'followers'
    ? {
        icon: 'people-outline' as const,
        title: 'Aún no tiene seguidores',
        sub: username ? `@${username} no tiene seguidores todavía` : 'Sin seguidores',
      }
    : {
        icon: 'person-add-outline' as const,
        title: 'Aún no sigue a nadie',
        sub: username ? `@${username} no sigue a nadie todavía` : 'Sin seguidos',
      };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingHorizontal: headerPadding as any, paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color="#208c8c" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            @{username}
          </Text>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="close" size={24} color="#aaa" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity style={styles.tab} onPress={() => switchTab('followers')} activeOpacity={0.7}>
          <Text style={[styles.tabText, activeTab === 'followers' && styles.tabTextActive]}>
            Seguidores <Text style={styles.tabCount}>{followers.length}</Text>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => switchTab('following')} activeOpacity={0.7}>
          <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>
            Siguiendo <Text style={styles.tabCount}>{following.length}</Text>
          </Text>
        </TouchableOpacity>
        <Animated.View style={[styles.tabIndicator, { left: indicatorLeft }]} />
      </View>

      {currentLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#208c8c" size="large" />
        </View>
      ) : (
        <FlatList
          data={currentList}
          keyExtractor={item => item.uid}
          contentContainerStyle={[
            styles.listContent,
            currentList.length === 0 && { flexGrow: 1, justifyContent: 'center' },
          ]}
          ItemSeparatorComponent={() => <View style={styles.itemDivider} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name={emptyConfig.icon} size={48} color="#333" />
              <Text style={styles.emptyText}>{emptyConfig.title}</Text>
              <Text style={styles.emptySub}>{emptyConfig.sub}</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMe = currentUser?.uid === item.uid;
            return (
              <View style={[styles.userRow, isWeb && { maxWidth: 800, alignSelf: 'center', width: '100%' }]}>
                <TouchableOpacity
                  style={styles.userInfo}
                  onPress={() => goToProfile(item.username, item.uid)}
                  activeOpacity={0.7}
                >
                  <Avatar photoURL={item.photoURL} fallback={item.username} size={48} />
                  <View style={styles.userText}>
                    <View style={styles.usernameRow}>
                      <Text style={styles.username} numberOfLines={1}>@{item.username}</Text>
                      {isMe && (
                        <View style={styles.meBadge}>
                          <Text style={styles.meBadgeText}>Tú</Text>
                        </View>
                      )}
                    </View>
                    {item.bio ? (
                      <Text style={styles.bio} numberOfLines={1}>{item.bio}</Text>
                    ) : (
                      <Text style={styles.noBio}>Sin biografía</Text>
                    )}
                  </View>
                </TouchableOpacity>

                {!isMe && (
                  <FollowButton
                    targetUid={item.uid}
                    targetUsername={item.username}
                    size="small"
                  />
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    gap: 8,
  },
  iconBtn: { padding: 4 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700', maxWidth: 240 },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
    position: 'relative',
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabText: { color: '#666', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  tabCount: { fontWeight: '800' },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '50%',
    height: 2.5,
    backgroundColor: '#208c8c',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  itemDivider: { height: 1, backgroundColor: '#1a1a1a', marginHorizontal: 16 },
  listContent: { paddingVertical: 8 },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  userInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  userText: { flex: 1 },
  usernameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  username: { color: '#fff', fontWeight: '700', fontSize: 15, flexShrink: 1 },
  meBadge: {
    backgroundColor: '#222',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2e2e2e',
  },
  meBadgeText: { color: '#aaa', fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  bio: { color: '#888', fontSize: 13, marginTop: 2 },
  noBio: { color: '#444', fontSize: 13, marginTop: 2, fontStyle: 'italic' },
  empty: { alignItems: 'center', gap: 10, paddingHorizontal: 24 },
  emptyText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptySub: { color: '#666', fontSize: 13, textAlign: 'center' },
});