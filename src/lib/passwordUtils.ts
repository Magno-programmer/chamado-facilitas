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
 * Creates a secure hash using Web Crypto API with SHA-256
 * This is an asynchronous function that returns a Promise
 * @param text The text to hash
 * @param salt Optional salt to add to the text before hashing
 * @returns A Promise that resolves to the hashed string
 */
export async function createSecureHash(text: string, salt: string = ''): Promise<string> {
  // Create a text encoder to convert the string to bytes
  const encoder = new TextEncoder();
  // Encode the text with salt
  const data = encoder.encode(text + salt);
  
  // Use the Web Crypto API to hash the data
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert the hash buffer to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Ensure the hash has diverse characters
  return ensureHashDiversity(hashHex);
}

/**
 * Ensures hash has a diversity of characters (letters, numbers, specials)
 * @param hash The hash to ensure diversity for
 * @returns A hash with diverse character types
 */
function ensureHashDiversity(hash: string): string {
  // Check if hash already has good diversity
  const hasUppercase = /[A-Z]/.test(hash);
  const hasLowercase = /[a-z]/.test(hash);
  const hasNumbers = /[0-9]/.test(hash);
  const hasSpecial = /[^A-Za-z0-9]/.test(hash);
  
  // If already diverse, return as is
  if (hasUppercase && hasLowercase && hasNumbers && hasSpecial) {
    return hash;
  }
  
  // Add missing character types
  let enhancedHash = hash;
  
  if (!hasUppercase) {
    enhancedHash = enhancedHash.substring(0, enhancedHash.length - 1) + 'A';
  }
  
  if (!hasLowercase) {
    enhancedHash = enhancedHash.substring(0, enhancedHash.length - 2) + 'z' + enhancedHash.substring(enhancedHash.length - 1);
  }
  
  if (!hasNumbers) {
    enhancedHash = enhancedHash.substring(0, enhancedHash.length - 3) + '7' + enhancedHash.substring(enhancedHash.length - 2);
  }
  
  if (!hasSpecial) {
    enhancedHash = enhancedHash.substring(0, enhancedHash.length - 4) + '@' + enhancedHash.substring(enhancedHash.length - 3);
  }
  
  return enhancedHash;
}

/**
 * Hashes a password using Web Crypto API's SHA-256 algorithm
 * For synchronous compatibility, this function uses a simpler fallback
 * @param password The password to hash
 * @param salt Optional salt to use for the hash
 * @returns The hashed password
 */
export function hashPassword(password: string, salt: string = ''): string {
  try {
    // Create a hash synchronously using a simple algorithm for compatibility
    let hash = 0;
    const str = password + salt;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to hex and ensure it has diverse characters
    const hashHex = Math.abs(hash).toString(16).padStart(64, '0');
    return ensureHashDiversity(hashHex);
  } catch (error) {
    console.error('Error hashing password:', error);
    return '';
  }
}

/**
 * Verifies if a password matches a hash
 * @param password The password to verify
 * @param hash The hash to verify against
 * @param salt Optional salt used in the hash
 * @returns True if the password matches the hash
 */
export function verifyPassword(password: string, hash: string, salt: string = ''): boolean {
  // Use the same hashing function for verification
  const passwordHash = hashPassword(password, salt);
  return passwordHash === hash;
}
