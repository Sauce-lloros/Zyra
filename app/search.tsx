import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Avatar from '../components/Avatar';
import { userService } from '../services/UserService';
import { User } from '../types';

export default function Search() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<any>(null);

  const handleSearch = async () => {
    const term = search.trim();
    if (!term) return;
    setLoading(true);
    setSearched(true);
    try {
      const users = await userService.search(term);
      setResults(users);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearch('');
    setResults([]);
    setSearched(false);
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#208c8c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buscar usuarios</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#555" />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder="Busca por nombre de usuario"
          placeholderTextColor="#555"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoFocus
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <Ionicons name="close-circle" size={18} color="#555" />
          </TouchableOpacity>
        )}
      </View>

      {/* Botón buscar */}
      <TouchableOpacity
        style={[styles.searchBtn, !search.trim() && styles.searchBtnDisabled]}
        onPress={handleSearch}
        disabled={!search.trim() || loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={styles.searchBtnText}>Buscar</Text>
        }
      </TouchableOpacity>

      {/* Resultados */}
      {searched && !loading && (
        <FlatList
          data={results}
          keyExtractor={item => item.uid}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="person-outline" size={48} color="#333" />
              <Text style={styles.emptyText}>Usuario no encontrado</Text>
              <Text style={styles.emptySub}>Verifica el nombre de usuario</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userCard}
              onPress={() => router.push(`/public-profile?username=${item.username}` as any)}
              activeOpacity={0.8}
            >
              <Avatar photoURL={item.photoURL} fallback={item.username} size={48} />
              <View style={styles.userInfo}>
                <Text style={styles.username}>@{item.username}</Text>
                {item.bio ? (
                  <Text style={styles.bio} numberOfLines={1}>{item.bio}</Text>
                ) : (
                  <Text style={styles.noBio}>Sin biografía</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#333" />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Estado inicial */}
      {!searched && (
        <View style={styles.initial}>
          <Ionicons name="search" size={56} color="#1e1e1e" />
          <Text style={styles.initialText}>Busca a alguien en Zyra</Text>
        </View>
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
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
  },
  searchBtn: {
    backgroundColor: '#208c8c',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchBtnDisabled: { opacity: 0.4 },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  listContent: { paddingHorizontal: 16 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    gap: 12,
  },
  userInfo: { flex: 1 },
  username: { color: '#fff', fontWeight: '700', fontSize: 15 },
  bio: { color: '#666', fontSize: 13, marginTop: 2 },
  noBio: { color: '#444', fontSize: 13, marginTop: 2, fontStyle: 'italic' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptySub: { color: '#555', fontSize: 13 },
  initial: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  initialText: { color: '#333', fontSize: 15 },
});