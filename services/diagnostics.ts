
export type LogLevel = 'info' | 'warn' | 'error' | 'success';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: string;
}

class DiagnosticsService {
  private logs: LogEntry[] = [];
  private listeners: ((logs: LogEntry[]) => void)[] = [];

  constructor() {
    this.log('info', 'System diagnostics initialized', {
      userAgent: navigator.userAgent,
      location: window.location.href,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Robust circular-safe stringifier to prevent "Converting circular structure to JSON" errors.
   */
  private stringifySafely(obj: any): string {
    const cache = new WeakSet();
    try {
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (cache.has(value)) {
            return '[Circular Reference]';
          }
          cache.add(value);

          // Detect and label internal SDK/Socket objects that cause serialization issues
          const constructorName = value.constructor?.name;
          if (constructorName && (
            constructorName.includes('Socket') || 
            constructorName.includes('Parser') ||
            constructorName.includes('Firebase') ||
            constructorName.includes('Firestore') ||
            constructorName.includes('TLS') ||
            constructorName.includes('HTTP')
          )) {
            return `[Internal System Object: ${constructorName}]`;
          }
        }
        if (value instanceof Error) {
          return { name: value.name, message: value.message, stack: value.stack };
        }
        return value;
      }, 2);
    } catch (err) {
      return `[Serialization Error: ${String(err)}]`;
    }
  }

  log(level: LogLevel, message: string, details?: any) {
    let safeDetails: string | undefined = undefined;

    if (details !== undefined && details !== null) {
      if (typeof details === 'string') {
        safeDetails = details;
      } else {
        safeDetails = this.stringifySafely(details);
      }
    }

    const entry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      details: safeDetails
    };
    
    this.logs.push(entry);
    
    const prefix = `[${level.toUpperCase()}]`;
    if (level === 'error') console.error(prefix, message, details || '');
    else if (level === 'warn') console.warn(prefix, message, details || '');
    else console.log(prefix, message, details || '');

    this.notify();
  }

  getLogs() {
    return this.logs;
  }

  subscribe(callback: (logs: LogEntry[]) => void) {
    this.listeners.push(callback);
    callback(this.logs);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(l => l([...this.logs]));
  }
  
  clear() {
      this.logs = [];
      this.notify();
  }
}

export const diagnostics = new DiagnosticsService();
