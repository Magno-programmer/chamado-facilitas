
import { createHash, randomBytes } from 'crypto';

/**
 * Generates a secure random password of specified length with special characters
 * @param length The length of the password to generate (minimum 20)
 * @returns A randomly generated secure password
 */
export function generateSecurePassword(length: number = 20): string {
  // Ensure minimum length of 20
  const actualLength = Math.max(length, 20);
  
  // Character sets
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  // Combine all characters
  const allChars = upperChars + lowerChars + numbers + specialChars;
  
  // Generate random bytes
  const randomBytesBuffer = randomBytes(actualLength * 2);
  
  // Create password ensuring it contains at least one of each character type
  let password = '';
  
  // Ensure at least one character from each set
  password += upperChars.charAt(Math.floor(Math.random() * upperChars.length));
  password += lowerChars.charAt(Math.floor(Math.random() * lowerChars.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  // Fill the rest with random characters
  for (let i = 4; i < actualLength; i++) {
    const randomIndex = randomBytesBuffer[i] % allChars.length;
    password += allChars.charAt(randomIndex);
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Hashes a password using SHA-256
 * @param password The password to hash
 * @param salt Optional salt to use for the hash
 * @returns The hashed password
 */
export function hashPassword(password: string, salt: string = ''): string {
  return createHash('sha256')
    .update(password + salt)
    .digest('hex');
}

/**
 * Verifies if a password matches a hash
 * @param password The password to verify
 * @param hash The hash to verify against
 * @param salt Optional salt used in the hash
 * @returns True if the password matches the hash
 */
export function verifyPassword(password: string, hash: string, salt: string = ''): boolean {
  const passwordHash = hashPassword(password, salt);
  return passwordHash === hash;
}
