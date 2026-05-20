/**
 * Bandera global para indicar que el usuario esta en proceso de registro.
 * Cuando esta activa, los listeners de sesion automatica deben ignorar
 * los cambios de auth para evitar redirects al home antes de tiempo.
 */

let isRegistering = false;

export function setRegistering(value: boolean): void {
  console.log('[RegistrationFlag] isRegistering ->', value);
  isRegistering = value;
}

export function getIsRegistering(): boolean {
  return isRegistering;
}
