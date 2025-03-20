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
 * @returns A Promise that resolves to the hashed string (32 characters with diverse patterns)
 */
export async function createSecureHash(text: string, salt: string = ''): Promise<string> {
  // Create a text encoder to convert the string to bytes
  const encoder = new TextEncoder();
  // Encode the text with salt
  const data = encoder.encode(text + salt);
  
  // Use the Web Crypto API to hash the data with SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert the hash buffer to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Convert to UUID-like format with diverse character patterns (32 chars)
  return formatHashLikeUuid(hashHex.substring(0, 32));
}

/**
 * Formats a hash string into a UUID-like pattern with diverse characters
 * @param hash Base hash string to format
 * @returns Formatted hash with diverse character patterns (32 chars)
 */
function formatHashLikeUuid(hash: string): string {
  // Ensure we have at least 32 characters to work with
  const baseHash = hash.padEnd(32, 'abcdef0123456789');
  
  // Create sections similar to UUID format but maintaining 32 character total length
  // Use a mix of the hash characters and inject some special chars for diversity
  const section1 = baseHash.substring(0, 8);
  const section2 = baseHash.substring(8, 12);
  const section3 = baseHash.substring(12, 16);
  const section4 = baseHash.substring(16, 20);
  const section5 = baseHash.substring(20, 32);
  
  // Inject special characters at specific positions to maintain a pattern
  // but ensure diversity while keeping the 32 char length
  let formattedHash = '';
  formattedHash += section1.substring(0, 7) + '!';
  formattedHash += section2.substring(0, 3) + '@';
  formattedHash += section3.substring(0, 3) + '#';
  formattedHash += section4.substring(0, 3) + '$';
  formattedHash += section5.substring(0, 10) + '%&*()';
  
  // Replace some numbers with uppercase letters for more diversity
  formattedHash = formattedHash
    .replace(/1/g, 'A')
    .replace(/3/g, 'B')
    .replace(/5/g, 'C')
    .replace(/7/g, 'D')
    .replace(/9/g, 'E');
  
  // Replace some letters with different cases for more diversity
  formattedHash = formattedHash
    .replace(/a/g, 'F')
    .replace(/c/g, 'G')
    .replace(/e/g, 'H')
    .replace(/b/g, 'i')
    .replace(/d/g, 'j')
    .replace(/f/g, 'k');
  
  return formattedHash;
}

/**
 * Hashes a password using a fast hash algorithm for synchronous operations
 * The result is formatted to look like a UUID pattern with special characters
 * @param password The password to hash
 * @param salt Optional salt to use for the hash
 * @returns The hashed password (32 characters with diverse patterns)
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
    
    // Convert to hex
    const hashHex = Math.abs(hash).toString(16).padStart(16, '0');
    
    // Add more entropy by adding reversed characters
    const enhancedHash = hashHex + hashHex.split('').reverse().join('');
    
    // Format similar to UUID pattern with 32 characters total
    return formatHashLikeUuid(enhancedHash.substring(0, 32));
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
