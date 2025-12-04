import { randomBytes } from 'crypto';

export function generateFileName(size: number = 40) {
  return `${Date.now().toString(16)}-${randomBytes(Math.floor(size / 2)).toString('hex')}`;
}
