import { signOut } from 'firebase/auth';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../config/firebase';

export default function Home({ navigation }) {
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zyra</Text>
      <Text style={styles.welcome}>¡Hola! 👋</Text>
      <Text style={styles.email}>{user?.email}</Text>
      
      <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
        <Text style={styles.profileBtnText}>Ver mi perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff', justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 42, fontWeight: 'bold', color: '#3b5bdb', marginBottom: 20 },
  welcome: { fontSize: 26, fontWeight: '700', color: '#222', marginBottom: 8 },
  email: { fontSize: 16, color: '#3b5bdb', marginBottom: 30 },
  profileBtn: { backgroundColor: '#3b5bdb', borderRadius: 10, padding: 15, width: '100%', alignItems: 'center', marginBottom: 12 },
  profileBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutBtn: { padding: 15 },
  logoutText: { color: '#ff4444', fontWeight: 'bold' }
});