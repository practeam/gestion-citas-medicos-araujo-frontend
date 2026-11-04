import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts";
import { I18nProvider } from "@/i18n";
import { AuthProvider } from "@/modules/auth";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <HelmetProvider>
          <I18nProvider>
            <TooltipProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </TooltipProvider>
          </I18nProvider>
        </HelmetProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
