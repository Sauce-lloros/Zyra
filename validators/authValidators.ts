import { ValidationResult } from '../types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();

  if (!trimmed) {
    return { valid: false, error: 'El correo es obligatorio' };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: 'Ingresa un correo válido' };
  }
  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, error: 'La contraseña es obligatoria' };
  }
  if (password.length < 6) {
    return { valid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
  }
  if (/\s/.test(password)) {
    return { valid: false, error: 'La contraseña no puede contener espacios' };
  }
  return { valid: true };
}

export function validateUsername(username: string): ValidationResult {
  const trimmed = username.trim();

  if (!trimmed) {
    return { valid: false, error: 'El nombre de usuario es obligatorio' };
  }
  if (trimmed.length < 3) {
    return { valid: false, error: 'El usuario debe tener al menos 3 caracteres' };
  }
  if (/['"]/.test(trimmed)) {
    return { valid: false, error: 'El usuario no puede contener comillas' };
  }
  if (/\s/.test(trimmed)) {
    return { valid: false, error: 'El usuario no puede contener espacios' };
  }
  return { valid: true };
}

export function validateLoginIdentifier(identifier: string): ValidationResult {
  const trimmed = identifier.trim();

  if (!trimmed) {
    return { valid: false, error: 'Ingresa tu correo o usuario' };
  }
  return { valid: true };
}

export function sanitizePassword(text: string): string {
  return text.replace(/\s/g, '');
}

export function sanitizeUsername(text: string): string {
  return text.replace(/['"\s]/g, '');
}