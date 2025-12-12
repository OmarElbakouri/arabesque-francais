/**
 * Device Fingerprint Utility
 * Generates a unique device fingerprint for tracking devices
 */

// Simple fingerprint generator (fallback if FingerprintJS not available)
function generateSimpleFingerprint(): string {
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    navigator.platform,
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// Detect device type from user agent
export function detectDeviceType(): 'PHONE' | 'TABLET' | 'LAPTOP' | 'DESKTOP' | 'OTHER' {
  const ua = navigator.userAgent.toLowerCase();
  
  // Check for mobile phones
  if (/iphone|android.*mobile|windows phone|blackberry/i.test(ua)) {
    return 'PHONE';
  }
  
  // Check for tablets
  if (/ipad|android(?!.*mobile)|tablet/i.test(ua)) {
    return 'TABLET';
  }
  
  // Check for desktop/laptop (harder to distinguish)
  if (/macintosh|windows|linux/i.test(ua)) {
    // Could be desktop or laptop - default to LAPTOP for portables
    return 'LAPTOP';
  }
  
  return 'OTHER';
}

// Get device name
export function getDeviceName(): string {
  const ua = navigator.userAgent;
  
  // Try to extract device name
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Macintosh/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows PC';
  if (/Android/i.test(ua)) {
    // Try to get Android device model
    const match = ua.match(/Android.*?;\s*([^)]+)\)/);
    if (match && match[1]) {
      return match[1].split('Build')[0].trim();
    }
    return 'Android Device';
  }
  if (/Linux/i.test(ua)) return 'Linux PC';
  
  return 'Unknown Device';
}

// Get or generate device fingerprint
export async function getDeviceFingerprint(): Promise<string> {
  // Check if we already have a fingerprint stored
  const storedFingerprint = localStorage.getItem('device_fingerprint');
  if (storedFingerprint) {
    return storedFingerprint;
  }
  
  // Generate new fingerprint
  let fingerprint: string;
  
  try {
    // Try to use more sophisticated fingerprinting
    // Combine multiple factors for uniqueness
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Device Fingerprint', 2, 15);
    }
    
    const canvasData = canvas.toDataURL();
    
    const components = [
      navigator.userAgent,
      navigator.language,
      navigator.languages?.join(',') || '',
      screen.width.toString(),
      screen.height.toString(),
      screen.colorDepth.toString(),
      new Date().getTimezoneOffset().toString(),
      navigator.hardwareConcurrency?.toString() || '',
      navigator.platform,
      canvasData.slice(-50), // Last 50 chars of canvas data
      // WebGL info
      (() => {
        try {
          const gl = document.createElement('canvas').getContext('webgl');
          if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
              return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }
          }
        } catch {
          // Ignore
        }
        return '';
      })(),
    ].join('|||');
    
    // Generate hash from components
    let hash = 0;
    for (let i = 0; i < components.length; i++) {
      const char = components.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    fingerprint = Math.abs(hash).toString(16).padStart(8, '0') + 
                  '-' + Date.now().toString(36).slice(-4);
    
  } catch {
    // Fallback to simple fingerprint
    fingerprint = generateSimpleFingerprint();
  }
  
  // Store the fingerprint
  localStorage.setItem('device_fingerprint', fingerprint);
  return fingerprint;
}

// Clear device fingerprint (for testing or device reset)
export function clearDeviceFingerprint(): void {
  localStorage.removeItem('device_fingerprint');
}

export const deviceFingerprint = {
  getFingerprint: getDeviceFingerprint,
  getDeviceType: detectDeviceType,
  getDeviceName,
  clear: clearDeviceFingerprint,
};
