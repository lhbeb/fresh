/**
 * Development debugging utility
 * Logs detailed error information to console in development mode
 */

export const debugLog = (label: string, data: any, level: 'log' | 'error' | 'warn' = 'log') => {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    const style = level === 'error' 
      ? 'background: #ff0000; color: #ffffff; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
      : level === 'warn'
      ? 'background: #ffa500; color: #000000; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
      : 'background: #0066cc; color: #ffffff; padding: 4px 8px; border-radius: 4px; font-weight: bold;';
    
    console[level](`%c[${timestamp}] ${label}`, style, data);
    
    // Also log to window for global access
    if (typeof window !== 'undefined') {
      (window as any).__debugLogs = (window as any).__debugLogs || [];
      (window as any).__debugLogs.push({
        timestamp,
        label,
        data,
        level,
        stack: new Error().stack
      });
    }
  }
};

export const debugError = (label: string, error: any) => {
  debugLog(label, {
    message: error?.message,
    stack: error?.stack,
    error,
    name: error?.name,
    cause: error?.cause,
  }, 'error');
  
  // Log full error details
  console.group(`🔴 Error: ${label}`);
  console.error('Error Object:', error);
  console.error('Error Message:', error?.message);
  console.error('Error Stack:', error?.stack);
  if (error?.cause) {
    console.error('Error Cause:', error?.cause);
  }
  console.groupEnd();
};

export const debugCart = (action: string, data: any) => {
  debugLog(`🛒 Cart: ${action}`, data);
};

export const debugNavigation = (action: string, data: any) => {
  debugLog(`🧭 Navigation: ${action}`, data);
};

// Expose debugging tools to window for console access
if (typeof window !== 'undefined') {
  (window as any).__debug = {
    logs: () => console.table((window as any).__debugLogs || []),
    clear: () => {
      (window as any).__debugLogs = [];
      console.clear();
    },
    cart: () => {
      try {
        const cart = localStorage.getItem('happydeel_cart');
        console.log('Cart Data:', cart ? JSON.parse(cart) : null);
      } catch (e) {
        console.error('Error reading cart:', e);
      }
    },
  };
  
  console.log('%c🔧 Debug Tools Available', 'background: #0066cc; color: #ffffff; padding: 8px; border-radius: 4px; font-weight: bold;');
  console.log('Use window.__debug.logs() to see all debug logs');
  console.log('Use window.__debug.clear() to clear logs');
  console.log('Use window.__debug.cart() to see cart data');
}

