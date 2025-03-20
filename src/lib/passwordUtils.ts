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
 * Creates a cryptographically secure hash using PBKDF2 with SHA-512
 * Format: pbkdf2:iterations:salt$hash
 * @param text The text to hash
 * @param salt Optional salt; a random one will be generated if not provided
 * @returns The hash string in a format similar to scrypt
 */
export async function createSecureHash(text: string, salt?: string): Promise<string> {
  // Generate a secure random salt if not provided
  const actualSalt = salt || generateRandomString(16);
  
  // Use Web Crypto API with PBKDF2
  const encoder = new TextEncoder();
  const iterations = 100000; // High number of iterations for security
  
  // Create the key material from the password
  const textEncoded = encoder.encode(text);
  const saltEncoded = encoder.encode(actualSalt);
  
  // Import the password as a key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textEncoded,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  // Derive bits using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltEncoded,
      iterations,
      hash: 'SHA-512'
    },
    keyMaterial,
    512 // 512 bits = 64 bytes
  );
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Format similar to the scrypt example: algorithm:iterations:keylen$salt$hash
  return `pbkdf2:${iterations}:16$${actualSalt}$${hashHex}`;
}

/**
 * Generates a cryptographically secure random string
 * @param length The length of the string to generate
 * @returns A random string
 */
function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').slice(0, length);
}

/**
 * Verifies if a password matches a hash
 * @param password The password to verify
 * @param hashString The hash to compare against (in pbkdf2:iterations:keylen$salt$hash format)
 * @returns Promise<boolean> True if the password matches
 */
export async function verifySecureHash(password: string, hashString: string): Promise<boolean> {
  try {
    // Parse the hash string
    const [algorithm, iterations, keylen, salt, storedHash] = hashString
      .replace(/\$/g, ':')
      .split(':');
    
    console.log('Verificando hash seguro:', { algorithm, iterations, salt });
    console.log('Hash armazenado:', storedHash);
    
    // Verify using the same algorithm and salt
    const computedHash = await createSecureHash(password, salt);
    console.log('Hash computado completo:', computedHash);
    
    const computedHashParts = computedHash.replace(/\$/g, ':').split(':');
    const newHash = computedHashParts[computedHashParts.length - 1];
    console.log('Parte do hash computado para comparação:', newHash);
    
    return newHash === storedHash;
  } catch (error) {
    console.error('Error verifying hash:', error);
    return false;
  }
}

/**
 * Legacy hash function for backward compatibility (synchronous)
 * @param password The password to hash
 * @param salt Optional salt to use
 * @returns A hash string (not as secure as createSecureHash)
 */
export function hashPassword(password: string, salt: string = ''): string {
  try {
    // Generate a random salt if not provided
    const actualSalt = salt || generateRandomString(16);
    
    // Create a simple hash for backward compatibility
    let hash = 0;
    const str = password + actualSalt;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to hex and format like the secure hash
    const hashHex = Math.abs(hash).toString(16).padStart(16, '0');
    return `legacy:1:16$${actualSalt}$${hashHex}`;
  } catch (error) {
    console.error('Error hashing password:', error);
    return '';
  }
}

/**
 * Verifies if a password matches a hash (supports both new and legacy formats)
 * @param password The password to verify
 * @param hashString The hash to compare against
 * @returns Promise<boolean> True if the password matches
 */
export async function verifyPassword(password: string, hashString: string): Promise<boolean> {
  try {
    console.log('Verificando senha, formato do hash:', hashString);
    
    // Check for the format to determine which verification to use
    if (hashString.startsWith('pbkdf2:')) {
      console.log('Usando verificação de hash PBKDF2');
      return await verifySecureHash(password, hashString);
    } else if (hashString.startsWith('legacy:')) {
      console.log('Usando verificação de hash legado');
      // Parse the legacy hash
      const [_, __, ___, salt, storedHash] = hashString
        .replace(/\$/g, ':')
        .split(':');
      
      // Generate hash with the same salt
      const newHashString = hashPassword(password, salt);
      const [____, _____, ______, _______, newHash] = newHashString
        .replace(/\$/g, ':')
        .split(':');
      
      console.log('Hash legado computado:', newHash);
      console.log('Hash legado armazenado:', storedHash);
      
      return newHash === storedHash;
    } else {
      // Old format without algorithm prefix (backward compatibility)
      console.log('Usando verificação de hash sem prefixo (antigo)');
      const legacyHash = hashPassword(password);
      return hashString === legacyHash;
    }
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}
