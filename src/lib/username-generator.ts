/**
 * Generates a consistent random username based on user ID
 * Format: "Player" + 4-digit hash-based suffix
 */
export function generateRandomUsername(userId: string, fallbackEmail?: string): string {
  // Generate a hash from user ID for consistency
  let hash = 0;
  const text = userId || fallbackEmail || 'anonymous';
  
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Ensure positive number and get 4 digits
  const suffix = Math.abs(hash) % 10000;
  return `Player${suffix.toString().padStart(4, '0')}`;
}

/**
 * Gets display name or generates a consistent random username
 */
export function getDisplayName(displayName?: string | null, userId?: string, email?: string): string {
  if (displayName && displayName.trim()) {
    return displayName.trim();
  }
  
  if (userId) {
    return generateRandomUsername(userId, email);
  }
  
  if (email) {
    return generateRandomUsername('', email);
  }
  
  return 'Anonymous';
}