/**
 * Data Sync Service
 * Manages synchronization between PostgreSQL and IndexedDB
 */

import {
    initializeIndexedDB,
    syncDataFromServer,
    syncStoreFromServer,
    getSyncStatus,
} from '../../lib/indexed-db';

export interface SyncConfig {
    autoSync: boolean;
    autoSyncInterval: number; // milliseconds
    onSyncStart?: () => void;
    onSyncComplete?: (status: any) => void;
    onSyncError?: (error: Error) => void;
}

class DataSyncService {
    private syncInterval: NodeJS.Timeout | null = null;
    private isSyncing: boolean = false;
    private config: SyncConfig;

    constructor(config: Partial<SyncConfig> = {}) {
        this.config = {
            autoSync: true,
            autoSyncInterval: 5 * 60 * 1000, // 5 minutes
            ...config,
        };
    }

    /**
     * Initialize data sync service
     */
    async init(): Promise<void> {
        console.log('[DataSync] Initializing...');

        try {
            // Initialize IndexedDB
            await initializeIndexedDB();

            // Start auto-sync if enabled
            if (this.config.autoSync) {
                this.startAutoSync();
            }

            console.log('[DataSync] Initialized successfully');
        } catch (error) {
            console.error('[DataSync] Initialization error:', error);
            if (this.config.onSyncError) {
                this.config.onSyncError(error as Error);
            }
        }
    }

    /**
     * Start automatic sync
     */
    startAutoSync(): void {
        if (this.syncInterval) {
            console.warn('[DataSync] Auto-sync already running');
            return;
        }

        console.log(`[DataSync] Starting auto-sync (every ${this.config.autoSyncInterval}ms)`);

        // Sync immediately on start
        this.sync();

        // Then sync periodically
        this.syncInterval = setInterval(() => {
            this.sync();
        }, this.config.autoSyncInterval);
    }

    /**
     * Stop automatic sync
     */
    stopAutoSync(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('[DataSync] Auto-sync stopped');
        }
    }

    /**
     * Manual sync trigger
     */
    async sync(): Promise<void> {
        if (this.isSyncing) {
            console.warn('[DataSync] Sync already in progress');
            return;
        }

        this.isSyncing = true;

        try {
            if (this.config.onSyncStart) {
                this.config.onSyncStart();
            }

            console.log('[DataSync] Starting manual sync...');
            await syncDataFromServer();

            const status = await getSyncStatus();
            console.log('[DataSync] Sync completed', status);

            if (this.config.onSyncComplete) {
                this.config.onSyncComplete(status);
            }
        } catch (error) {
            console.error('[DataSync] Sync error:', error);
            if (this.config.onSyncError) {
                this.config.onSyncError(error as Error);
            }
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Sync a specific store
     */
    async syncStore(storeName: string): Promise<boolean> {
        try {
            return await syncStoreFromServer(storeName);
        } catch (error) {
            console.error(`[DataSync] Error syncing ${storeName}:`, error);
            if (this.config.onSyncError) {
                this.config.onSyncError(error as Error);
            }
            return false;
        }
    }

    /**
     * Get current sync status
     */
    async getStatus() {
        return await getSyncStatus();
    }

    /**
     * Check if currently syncing
     */
    isCurrentlySyncing(): boolean {
        return this.isSyncing;
    }

    /**
     * Destroy service
     */
    destroy(): void {
        this.stopAutoSync();
        console.log('[DataSync] Service destroyed');
    }
}

// Create singleton instance
let syncService: DataSyncService | null = null;

export function initDataSyncService(config?: Partial<SyncConfig>): DataSyncService {
    if (!syncService) {
        syncService = new DataSyncService(config);
    }
    return syncService;
}

export function getDataSyncService(): DataSyncService | null {
    return syncService;
}

export async function initializeDataSync(config?: Partial<SyncConfig>): Promise<DataSyncService> {
    const service = initDataSyncService(config);
    await service.init();
    return service;
}

export default DataSyncService;
