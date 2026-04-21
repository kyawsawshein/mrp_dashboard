"use client";

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register(
            "/service-worker.js", 
            { type: "module" }
          );

          console.log("📦 Service Worker registered:", registration);

          registration.addEventListener("updatefound", () => {
            console.log("🔄 New Service Worker update found...");
          });

          const swReg = await navigator.serviceWorker.ready;
          console.log("📡 Service Worker Ready:", swReg);

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('📨 Message from Service Worker:', event.data);
          });

        } catch (error) {
          console.error("❌ Service Worker registration failed:", error);
        }
      } else {
        console.log("❌ Service Workers are not supported in this browser");
      }
    };

    registerServiceWorker();
  }, []);

  return null; // This component doesn't render anything
}
