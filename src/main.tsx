import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// Register service worker with update handling
// When a new version is deployed, automatically reload to avoid stale JS bundles
const updateSW = registerSW({
  onNeedRefresh() {
    // New version available — reload to get fresh assets
    // This prevents white screens caused by stale cached JS bundles
    updateSW(true);
  },
  onOfflineReady() {
    console.log("[SW] App ready for offline use");
  },
});

createRoot(document.getElementById("root")!).render(<App />);
