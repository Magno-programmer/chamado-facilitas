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
  
  // Create password ensuring it contains at least one of each character type
  let password = '';
  
  // Ensure at least one character from each set
  password += upperChars.charAt(Math.floor(Math.random() * upperChars.length));
  password += lowerChars.charAt(Math.floor(Math.random() * lowerChars.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  // Fill the rest with random characters
  for (let i = 4; i < actualLength; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    password += allChars.charAt(randomIndex);
  }
  
  // Shuffle the password to ensure the required characters aren't always at the beginning
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Hashes a string using SHA-256 algorithm with Web Crypto API
 * This function returns a hex string of the hash for compatibility
 * @param text The text to hash
 * @returns A Promise that resolves to the hashed text in hex format
 */
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Creates a simple hash for backward compatibility with old passwords
 * @param password The password to hash
 * @param salt Optional salt to use for the hash
 * @returns A simple hash of the password
 */
function createSimpleHash(password: string, salt: string = ''): string {
  let hash = 0;
  const str = password + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

/**
 * Creates a more secure hash with multiple iterations
 * @param password The password to hash
 * @param salt Optional salt to use for the hash
 * @returns A more secure hash of the password
 */
function createSecureHash(password: string, salt: string = ''): string {
  let hash = 0;
  const str = password + salt;
  const iterations = 10000; // Increase computational cost
  
  for (let j = 0; j < iterations; j++) {
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
  }
  
  return Math.abs(hash).toString(16).padStart(64, '0');
}

/**
 * Hashes a password consistently for both new accounts and verification
 * @param password The password to hash
 * @param salt Optional salt to use for the hash
 * @returns The hashed password
 */
export function hashPassword(password: string, salt: string = ''): string {
  // Use the consistent secure hash for all passwords
  return createSecureHash(password, salt);
}

/**
 * Verifies if a password matches a hash
 * @param password The password to verify
 * @param hash The hash to verify against
 * @param salt Optional salt used in the hash
 * @returns True if the password matches the hash
 */
export function verifyPassword(password: string, hash: string, salt: string = ''): boolean {
  // Normal password hashing flow
  const secureHash = createSecureHash(password, salt);
  if (secureHash === hash) return true;
  
  // Fallback to simple hash for backward compatibility with older passwords
  const simpleHash = createSimpleHash(password, salt);
  return simpleHash === hash;
}
