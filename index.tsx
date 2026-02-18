import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("🌱 CLS Restoration: Initializing stable mount...");

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("✅ CLS Restoration: Application mounted successfully.");
} else {
  console.error("❌ CLS Restoration: Failed to find root element.");
}