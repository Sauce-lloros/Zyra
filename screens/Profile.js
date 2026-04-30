import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../config/firebase';

export default function Profile({ navigation }) {
  const user = auth.currentUser;

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user?.email?.[0].toUpperCase()}</Text>
      </View>
      <Text style={styles.title}>Mi Perfil</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Correo electrónico</Text>
        <Text style={styles.value}>{user?.email}</Text>
        <Text style={styles.label}>ID de Usuario</Text>
        <Text style={styles.valueSmall}>{user?.uid}</Text>
      </View>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff', alignItems: 'center', justifyContent: 'center', padding: 24 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#3b5bdb', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 40, color: '#fff', fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#222', marginBottom: 24 },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 24, elevation: 3 },
  label: { fontSize: 12, color: '#888', textTransform: 'uppercase', marginBottom: 4 },
  value: { fontSize: 18, color: '#222', fontWeight: '600', marginBottom: 16 },
  valueSmall: { fontSize: 12, color: '#444' },
  backBtn: { padding: 10 },
  backText: { color: '#3b5bdb', fontWeight: 'bold' }
});