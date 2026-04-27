import { Injectable } from '@angular/core';

interface SharedMessage {
  key: string;
  data: any;
  timestamp: number;
  expires?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SharedCommunication {
  private readonly channel: BroadcastChannel;
  private readonly dbPromise: Promise<IDBDatabase>;
  private localStorageKeys: string[] = [];

  constructor() {
    this.channel = new BroadcastChannel('my-shared-channel');
    this.dbPromise = this.openDB();
  }

  // -------------------------
  //  Public API
  // -------------------------

  /**
   * Send data (to tabs or optionally persist in localStorage)
   */
  public send(key: string, data: any, persist = false, ttlMs: number | null = null): void {
    const message: SharedMessage = { key, data, timestamp: Date.now() };

    if (!persist) {
      this.channel.postMessage(message);
    }

    if (persist) {
      this.localStorageKeys.push(key);
      localStorage.setItem('localStorageKeys', JSON.stringify(this.localStorageKeys));

      if (ttlMs) {
        message.expires = Date.now() + ttlMs;
      }

      localStorage.setItem(key, JSON.stringify(message));
    }
  }

  /**
   * Listen for updates (BroadcastChannel + storage events + immediate load)
   */
  public on(key: string, callback: (data: any) => void): void {
    // BroadcastChannel listener
    this.channel.onmessage = (event: MessageEvent<SharedMessage>) => {
      if (event.data.key === key) {
        callback(event.data.data);
      }
    };

    // Storage listener (reload/fallback)
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        const parsed: SharedMessage = JSON.parse(event.newValue);
        callback(parsed.data);
      }
    });

    // Immediate load from localStorage (if not expired)
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed: SharedMessage = JSON.parse(saved);

        if (parsed.expires && Date.now() > parsed.expires) {
          localStorage.removeItem(key);

          return;
        }

        callback(parsed.data);
      }
    } catch {
      return;
    }
  }

  /**
   * Clear all persisted keys from localStorage
   */
  public clearLocalStorage(): void {
    try {
      this.localStorageKeys = JSON.parse(localStorage.getItem('localStorageKeys') || '[]');
      this.localStorageKeys.forEach(key => localStorage.removeItem(key));
      this.localStorageKeys = [];
      localStorage.removeItem('localStorageKeys');
    } catch {
      // ignore
    }
  }

  // -------------------------
  //  IndexedDB helpers
  // -------------------------

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SharedDB', 1);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('sharedStore')) {
          db.createObjectStore('sharedStore', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event: Event) => resolve((event.target as IDBOpenDBRequest).result);
      request.onerror = (event: Event) => reject((event.target as IDBOpenDBRequest).error);
    });
  }

  public async writeToDB(key: string, value: any): Promise<void> {
    const db = await this.dbPromise;

    return new Promise((resolve, reject) => {
      const tx = db.transaction('sharedStore', 'readwrite');
      const store = tx.objectStore('sharedStore');
      store.put({ key, value });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async readFromDB<T = any>(key: string): Promise<T | null> {
    const db = await this.dbPromise;

    return new Promise((resolve, reject) => {
      const tx = db.transaction('sharedStore', 'readonly');
      const store = tx.objectStore('sharedStore');
      const request = store.get(key);
      request.onsuccess = () => {
        resolve(request.result ? (request.result.value as T) : null);
      };
      request.onerror = () => reject(request.error);
    });
  }
}
