import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from 'sonner';

// MRP Dashboard Application
export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  );
}