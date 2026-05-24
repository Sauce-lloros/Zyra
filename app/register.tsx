import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { authService } from '../services/AuthService';
import { setRegistering } from '../utils/registrationFlag';
import {
  sanitizePassword,
  sanitizeUsername,
  validateEmail,
  validatePassword,
  validateUsername,
} from '../validators/authValidators';

const { height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [registered, setRegistered] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleRegister = async () => {
    setError('');
    const userCheck = validateUsername(username);
    if (!userCheck.valid) { setError(userCheck.error!); shake(); return; }
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) { setError(emailCheck.error!); shake(); return; }
    const passCheck = validatePassword(password);
    if (!passCheck.valid) { setError(passCheck.error!); shake(); return; }
    setLoading(true);
    try {
      setRegistering(true);
      await authService.register({ username, email, password });
      setRegistered(true);
    } catch (e: any) {
      setRegistering(false);
      setError(e.message);
      shake();
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    setRegistering(false);
    router.replace('/login' as any);
  };

  if (registered) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#208c8c" />
          </View>
          <Text style={styles.successTitle}>¡Cuenta creada!</Text>
          <Text style={styles.successSub}>Bienvenido a Zyra, @{username}</Text>
          <Text style={styles.successDesc}>
            Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión.
          </Text>
          <TouchableOpacity style={styles.successBtn} onPress={handleGoToLogin} activeOpacity={0.85}>
            <Text style={styles.successBtnText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {isWeb && (
        <style>{`
          input[type="password"]::-ms-reveal,
          input[type="password"]::-ms-clear,
          input[type="password"]::-webkit-contacts-auto-fill-button,
          input[type="password"]::-webkit-credentials-auto-fill-button {
            display: none !important;
            visibility: hidden;
            pointer-events: none;
          }
        `}</style>
      )}

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.imageSection}>
          <Image
            source={require('../assets/images/welcome-image.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
          <View style={styles.overlay} />
        </View>

        <View style={styles.formSection}>
          <View style={styles.header}>
            <Image
              source={require('../assets/images/LOGO_ZYRA_AZUL.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>Únete a Zyra hoy</Text>
          </View>

          {error ? (
            <Animated.View style={[styles.errorBox, { transform: [{ translateX: shakeAnim }] }]}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </Animated.View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre de usuario</Text>
            <TextInput
              style={styles.input}
              placeholder="@tunombre"
              placeholderTextColor="#999"
              value={username}
              onChangeText={text => setUsername(sanitizeUsername(text))}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@correo.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Mínimo 6 caracteres, sin espacios"
                placeholderTextColor="#999"
                value={password}
                onChangeText={text => setPassword(sanitizePassword(text))}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={20} color="#888" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>{loading ? 'Creando cuenta...' : 'Crear cuenta'}</Text>
          </TouchableOpacity>

          <View style={styles.linkRow}>
            <Text style={styles.linkText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/login' as any)}>
              <Text style={styles.link}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  scroll: { flexGrow: 1 },
  imageSection: {
    height: height * 0.28,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroImage: { width: '80%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(17,17,17,0.10)' },
  formSection: {
    flex: 1,
    backgroundColor: '#111',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 40,
  },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 44, height: 44, tintColor: '#208c8c', marginBottom: 10 },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  errorBox: {
    backgroundColor: 'rgba(255,60,60,0.12)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,60,60,0.3)',
  },
  errorText: { color: '#ff6b6b', fontSize: 14, textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  label: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    color: '#111',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  passwordInput: { flex: 1, padding: 16, color: '#111', fontSize: 15 },
  eyeBtn: { paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center' },
  primaryBtn: {
    backgroundColor: '#208c8c',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  linkText: { color: '#666', fontSize: 14 },
  link: { color: '#208c8c', fontSize: 14, fontWeight: '700' },
  successContainer: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  successCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#222',
  },
  successIcon: { marginBottom: 20 },
  successTitle: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 8, letterSpacing: 1 },
  successSub: { fontSize: 16, color: '#208c8c', fontWeight: '700', marginBottom: 12 },
  successDesc: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  successBtn: {
    backgroundColor: '#208c8c',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
  },
  successBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
});