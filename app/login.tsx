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
import { sanitizePassword, validateLoginIdentifier, validatePassword } from '../validators/authValidators';

const { height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    setError('');
    const idCheck = validateLoginIdentifier(identifier);
    if (!idCheck.valid) { setError(idCheck.error!); shake(); return; }
    const passCheck = validatePassword(password);
    if (!passCheck.valid) { setError(passCheck.error!); shake(); return; }
    setLoading(true);
    try {
      await authService.login({ identifier, password });
      router.replace('/home' as any);
    } catch (e: any) {
      setError(e.message);
      shake();
    } finally {
      setLoading(false);
    }
  };

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
            <Text style={styles.title}>Iniciar sesión</Text>
            <Text style={styles.subtitle}>Bienvenido de vuelta</Text>
          </View>

          {error ? (
            <Animated.View style={[styles.errorBox, { transform: [{ translateX: shakeAnim }] }]}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </Animated.View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo o usuario</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@correo.com o tunombre"
              placeholderTextColor="#999"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Tu contraseña"
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
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>{loading ? 'Ingresando...' : 'Ingresar'}</Text>
          </TouchableOpacity>

          <View style={styles.linkRow}>
            <Text style={styles.linkText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/register' as any)}>
              <Text style={styles.link}>Regístrate</Text>
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
    height: height * 0.32,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroImage: { width: '85%', height: '100%' },
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
});