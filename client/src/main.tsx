import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Toaster } from "sonner";
import App from "./app.tsx";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
    <Toaster duration={5000} position="top-right" richColors theme="dark" />
  </StrictMode>
);
