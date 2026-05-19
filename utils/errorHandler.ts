import { Alert } from 'react-native';

export function translateFirebaseError(error: any): string {
  const code = error?.code || '';
  const message = error?.message || 'Error desconocido';

  const translations: { [key: string]: string } = {
    'auth/email-already-in-use': 'Este correo ya está registrado',
    'auth/invalid-email': 'El correo no es válido',
    'auth/weak-password': 'La contraseña es muy débil (mínimo 6 caracteres)',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/invalid-credential': 'Credenciales inválidas',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/too-many-requests': 'Demasiados intentos, intenta más tarde',
    'auth/network-request-failed': 'Sin conexión a internet',
    'auth/operation-not-allowed': 'Operación no permitida',
    'auth/requires-recent-login': 'Debes iniciar sesión de nuevo',
    'permission-denied': 'No tienes permisos para esta acción',
    'unavailable': 'Servicio no disponible, intenta de nuevo',
    'not-found': 'No se encontró el recurso solicitado',
    'already-exists': 'Este recurso ya existe',
    'resource-exhausted': 'Se ha excedido el límite, intenta más tarde',
    'failed-precondition': 'No se cumplen las condiciones para esta acción',
    'aborted': 'Operación cancelada, intenta de nuevo',
    'out-of-range': 'Valor fuera de rango',
    'unimplemented': 'Función no implementada',
    'internal': 'Error interno del servidor',
    'data-loss': 'Pérdida de datos detectada',
    'unauthenticated': 'Debes iniciar sesión',
    'cancelled': 'Operación cancelada',
    'invalid-argument': 'Datos inválidos',
    'deadline-exceeded': 'La operación tardó demasiado',
  };

  if (translations[code]) {
    return translations[code];
  }

  if (message.includes('Network')) return 'Sin conexión a internet';
  if (message.includes('timeout')) return 'La operación tardó demasiado';

  return message;
}

export function showError(error: any, title: string = 'Error'): void {
  const message = translateFirebaseError(error);
  console.error('[ErrorHandler]', title, '->', message, error);
  Alert.alert(title, message);
}

export function logError(context: string, error: any): void {
  console.error('[ErrorHandler]', context, '->', error?.message || error, error);
}
