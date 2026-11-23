import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource/mrs-saint-delafield/400.css";
import App from "./App";
import { ConfirmProvider } from "./components/ui";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (count, err: any) => (err?.response?.status >= 400 && err?.response?.status < 500 ? false : count < 2),
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <ConfirmProvider>
            <App />
          </ConfirmProvider>
          <Toaster position="top-right" richColors closeButton toastOptions={{ style: { fontFamily: '"Bricolage Grotesque Variable", system-ui', borderRadius: 14 } }} />
        </BrowserRouter>
      </MotionConfig>
    </QueryClientProvider>
  </React.StrictMode>
);
