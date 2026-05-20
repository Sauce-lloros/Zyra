import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { getIsRegistering } from '../utils/registrationFlag';

export function useAuthGuard() {
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('[useAuthGuard] Verificando sesion...');

    const unsub = onAuthStateChanged(auth, user => {
      if (getIsRegistering()) {
        console.log('[useAuthGuard] En proceso de registro, ignorando cambio de sesion');
        setChecking(false);
        return;
      }

      if (user) {
        console.log('[useAuthGuard] Sesion activa -> uid:', user.uid);
        setIsAuthenticated(true);
        setChecking(false);
      } else {
        console.warn('[useAuthGuard] Sin sesion -> redirigiendo a /');
        setIsAuthenticated(false);
        setChecking(false);
        router.replace('/' as any);
      }
    });

    return unsub;
  }, []);

  return { isAuthenticated, checking };
}