let isRegistering = false;

export function setRegistering(value: boolean): void {
  console.log('[RegistrationFlag] isRegistering ->', value);
  isRegistering = value;
}

export function getIsRegistering(): boolean {
  return isRegistering;
}
