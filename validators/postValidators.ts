import { ValidationResult } from '../types';

const MAX_CONTENT_LENGTH = 500;

export function validatePostContent(content: string): ValidationResult {
  const trimmed = content.trim();

  if (!trimmed) {
    return { valid: false, error: 'Escribe algo antes de publicar' };
  }
  if (trimmed.length > MAX_CONTENT_LENGTH) {
    return {
      valid: false,
      error: `El contenido no puede superar los ${MAX_CONTENT_LENGTH} caracteres`,
    };
  }
  return { valid: true };
}

export const POST_CONTENT_MAX_LENGTH = MAX_CONTENT_LENGTH;
