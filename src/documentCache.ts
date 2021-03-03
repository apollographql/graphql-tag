import type { default as LRUCache } from 'lru-cache';
import { DocumentNode } from 'graphql/language/ast';

interface CacheClient<K, V> {
    has: (key: K) => boolean;
    set: (key: K, value: V) => void;
    get: (key: K) => V | undefined;
    delete: (key: K) => boolean;
    clear: () => void;
}
type DocCacheClient = CacheClient<string, DocumentNode>;

/**
 *  module-level cache client. Can be swapped out with a different implementation
 */
let docCache: DocCacheClient = new Map<string, DocumentNode>();

/**
 * Empties the existing cache entries and replaces the client
 * with the provided DocCacheClient
 * @param client 
 */
function setCacheClient(client: DocCacheClient): void {
    docCache.clear();
    docCache = client;
}

interface LRUCacheOptions {
    /**
     * Size of cache to use in memory. In bytes.
     * @default (64 * 1024 * 1024) = 64Mb
     */
    sizeInBytes?: number;

    /**
     * Max length of time to leave a document in the cache. In milliseconds.
     * @default: undefined (indefinite)
     */
    maxAgeMs?: number;
}

/**
 * Creates an LRU cache with the specified size and age options then swap it
 * in for the default unbounded Map
 * @param options 
 */
async function useLRUCache(lruOptions: LRUCacheOptions): Promise<void> {
    const LRU = require('lru-cache') as typeof LRUCache;

    const lru = new LRU<string, DocumentNode>({
        max: lruOptions.sizeInBytes || 64 * 1024 * 1024,
        maxAge: lruOptions.maxAgeMs,
        length: (val, key) => sizeOfCacheEntry(key, val)
    });

    const lruDocCache: DocCacheClient = {
        clear: lru.reset,
        delete: (key: string) => { 
            const existed = lru.has(key);
            lru.del(key);
            return existed;
        },
        get: lru.get,
        set: (key: string, value: DocumentNode) => {
            lru.set(key, value);
        },
        has: lru.has
    };

    setCacheClient(lruDocCache);
}

/**
 * Helper for LRUCache: Calculates the memory footprint of a single cache entry
 */
function sizeOfCacheEntry(key?: string, node?: DocumentNode): number {
    const keySize: number = !!key ? (key.length * 2) : 0;
    const nodeSize: number = !!node 
        ?  (node.kind.length * 2) + (node.definitions.reduce((prev, cur) => prev + cur.kind.length * 2, 0))
        : 0;

    return keySize + nodeSize;
}


export { docCache, setCacheClient, useLRUCache, DocCacheClient, sizeOfCacheEntry };