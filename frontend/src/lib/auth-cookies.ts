/**
 * Authentication Cookie Management
 * Handles secure storage of auth tokens in cookies
 * Used by middleware for authentication checks
 */

/**
 * Set authentication token in a cookie
 * Used by middleware to verify authentication
 * @param token JWT token from API
 */
export function setAuthCookie(token: string): void {
  if (typeof document === 'undefined') return; // Skip if not in browser

  // Set cookie with token
  // In production, use secure flag (HTTPS only)
  const isProduction = process.env.NEXT_PUBLIC_APP_ENV === 'production';
  const secure = isProduction ? 'Secure;' : '';
  const sameSite = 'SameSite=Strict';

  // Set cookie that expires in 7 days (matching JWT expiration)
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);

  document.cookie = `auth-token=${token}; ${secure} ${sameSite}; Path=/; expires=${expirationDate.toUTCString()}`;
}

/**
 * Remove authentication token from cookies
 * Called during logout
 */
export function clearAuthCookie(): void {
  if (typeof document === 'undefined') return; // Skip if not in browser

  // Delete cookie by setting expiration to past
  document.cookie = 'auth-token=; SameSite=Strict; Path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
}

/**
 * Get authentication token from cookies
 * Used for API requests
 * @returns JWT token or null if not found
 */
export function getAuthCookie(): string | null {
  if (typeof document === 'undefined') return null; // Skip if not in browser

  const name = 'auth-token=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');

  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }

  return null;
}
