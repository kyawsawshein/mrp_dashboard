import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from 'sonner';
import { initializeDataSync } from '../services/dataSync';

// MRP Dashboard Application
export default function App() {
  useEffect(() => {
    // Initialize data sync on app load
    initializeDataSync({
      autoSync: true,
      autoSyncInterval: 5 * 60 * 1000, // Sync every 5 minutes
      onSyncStart: () => {
        console.log('[App] Data sync started');
      },
      onSyncComplete: (status) => {
        console.log('[App] Data sync completed', status);
      },
      onSyncError: (error) => {
        console.error('[App] Data sync error:', error);
      },
    }).catch(error => {
      console.error('[App] Failed to initialize data sync:', error);
    });
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  );
}