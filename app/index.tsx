import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../config/firebase';
import { getIsRegistering } from '../utils/registrationFlag';

const { width, height } = Dimensions.get('window');

export default function Welcome() {
  const [showSplash, setShowSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const buttonSlide = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.spring(logoScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        setShowSplash(false);

        Animated.parallel([
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.spring(buttonSlide, {
            toValue: 0,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 2500);

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Delay para asegurar que la bandera esté actualizada
        setTimeout(() => {
          if (!getIsRegistering()) {
            console.log('[index] Sesion activa -> redirigiendo a home');
            router.replace('/home' as any);
          } else {
            console.log('[index] Registro en proceso, ignorando onAuthStateChanged');
          }
        }, 200);
      }
    });

    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, []);

  if (showSplash) {
    return (
      <Animated.View style={[styles.splash, { opacity: splashOpacity }]}>
        <Animated.Image
          source={require('../assets/images/LOGO_ZYRA_AZUL.png')}
          style={[styles.splashLogo, { transform: [{ scale: logoScale }] }]}
          resizeMode="contain"
        />
        <Text style={styles.splashTitle}>ZYRA</Text>
        <Text style={styles.splashSub}>Tu red social</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: contentOpacity }]}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/images/welcome-image.png')}
          style={styles.welcomeImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.bottomContent}>
        <Image
          source={require('../assets/images/LOGO_ZYRA_AZUL.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>ZYRA</Text>
        <Text style={styles.subtitle}>Te damos la bienvenida</Text>
        <Text style={styles.description}>
          Conéctate con personas que comparten tus intereses
        </Text>

        <Animated.View style={[styles.buttons, { transform: [{ translateY: buttonSlide }] }]}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/register' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Registrarse</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/login' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#208c8c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogo: {
    width: 120,
    height: 120,
    tintColor: '#fff',
    marginBottom: 16,
  },
  splashTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 8,
  },
  splashSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 3,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  container: { flex: 1, backgroundColor: '#111' },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  welcomeImage: {
    width: width * 0.85,
    height: height * 0.4,
  },
  bottomContent: {
    paddingHorizontal: 28,
    paddingBottom: 48,
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    tintColor: '#208c8c',
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#208c8c',
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  buttons: { width: '100%', gap: 12 },
  primaryBtn: {
    backgroundColor: '#208c8c',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  secondaryBtn: {
    backgroundColor: '#222',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  secondaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});