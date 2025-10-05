/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * Provides a developer-friendly, promise-based wrapper for IndexedDB to implement a
 * hierarchical key-value store.
 *
 * This abstraction simplifies local data persistence by offering an intuitive API (`get`,
 * `set`, `delete`, `list`) that handles database connections, transactions, and hierarchical
 * key management (using arrays as keys). It serves as a robust, local-first data layer,
 * enabling the application to work seamlessly offline and reducing the complexity of direct
 * IndexedDB interaction.
 */

export type HierarchicalKey = (string | number)[];

const DB_NAME = 'CloudCounterDB';
const STORE_NAME = 'HierarchicalStore';
const DB_VERSION = 1;

/**
 * A wrapper for IndexedDB that provides a hierarchical key-value store.
 * Keys are arrays of strings/numbers, e.g., ['books', 'book1', 'povs', 'pov1'].
 * This allows for structured data storage and efficient querying of sub-trees.
 */
export class IDBStore {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(DB_NAME, DB_VERSION);

      openRequest.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          // Using out-of-line keys since the value can be anything.
          // IndexedDB can use arrays as keys directly, which is perfect for hierarchies.
          db.createObjectStore(STORE_NAME);
        }
      };

      openRequest.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      openRequest.onerror = (event) => {
        console.error('IndexedDB setup error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  private getStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
      return this.dbPromise.then(db => {
          const transaction = db.transaction(STORE_NAME, mode);
          return transaction.objectStore(STORE_NAME);
      });
  }

  /**
   * Retrieves a value by its hierarchical key.
   * @param key The hierarchical key array, e.g., ['app', 'count'].
   * @returns The stored value, or undefined if not found.
   */
  public async get<T>(key: HierarchicalKey): Promise<T | undefined> {
    const store = await this.getStore('readonly');
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result as T | undefined);
      request.onerror = (e) => reject(request.error);
    });
  }

  /**
   * Sets a value for a given hierarchical key.
   * @param key The hierarchical key array.
   * @param value The value to store.
   */
  public async set(key: HierarchicalKey, value: any): Promise<void> {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Deletes a value by its hierarchical key.
   * @param key The hierarchical key array.
   */
  public async delete(key: HierarchicalKey): Promise<void> {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieves all key-value pairs that exist under a given hierarchical path.
   * For example, `list(['books', 'book1'])` would retrieve all POVs and entries for that book.
   * @param parentKey The parent key path to search under.
   * @returns A Map of full hierarchical keys to their values.
   */
  public async list<T>(parentKey: HierarchicalKey): Promise<Map<HierarchicalKey, T>> {
    const store = await this.getStore('readonly');
    const results = new Map<HierarchicalKey, T>();

    // Creates a range that includes all keys that start with the parentKey array.
    // E.g., for `['books', 'book1']`, we want `['books', 'book1', ...]`.
    const range = IDBKeyRange.bound(parentKey, [...parentKey, '\uffff'], false, true);

    return new Promise((resolve, reject) => {
        const request = store.openCursor(range);
        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
                // Ensure the key is a valid array (which it should be).
                if (Array.isArray(cursor.key)) {
                    // FIX: Cast cursor.key to HierarchicalKey. The native IDBValidKey type is
                    // too broad, but we can safely assert the type we expect to be stored.
                    results.set(cursor.key as HierarchicalKey, cursor.value);
                }
                cursor.continue();
            } else {
                // End of cursor
                resolve(results);
            }
        };
        request.onerror = () => reject(request.error);
    });
  }
}