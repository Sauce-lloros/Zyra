import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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
import FollowButton from '../components/FollowButton';
import { authService } from '../services/AuthService';
import { followService } from '../services/FollowService';
import { userService } from '../services/UserService';
import { User } from '../types';

const isWeb = Platform.OS === 'web';

export default function Connections() {
  const params = useLocalSearchParams<{ uid: string; username: string }>();
  const { uid, username } = params;

  const currentUser = authService.getCurrentUser();
  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  const goToProfile = (targetUsername: string, targetUid: string) => {
    if (currentUser && targetUid === currentUser.uid) {
      router.push('/profile' as any);
    } else {
      router.push(`/public-profile?username=${targetUsername}` as any);
    }
  };

  const headerPadding = isWeb ? '8%' : 16;
  const topPad = isWeb ? 14 : 52;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingHorizontal: headerPadding as any, paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color="#208c8c" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Seguidores de @{username}
          </Text>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="close" size={24} color="#aaa" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#208c8c" size="large" />
        </View>
      ) : (
        <FlatList
          data={followers}
          keyExtractor={item => item.uid}
          contentContainerStyle={[
            styles.listContent,
            followers.length === 0 && { flexGrow: 1, justifyContent: 'center' },
          ]}
          ItemSeparatorComponent={() => <View style={styles.itemDivider} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color="#333" />
              <Text style={styles.emptyText}>Aún no tiene seguidores</Text>
              <Text style={styles.emptySub}>
                {username ? `@${username} no tiene seguidores todavía` : 'Sin seguidores'}
              </Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
  },
  iconBtn: { padding: 4 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700', maxWidth: 240 },
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