import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
            staleTime: 30000,
            refetchOnWindowFocus: false,
            retry: (count, err) => (err?.response?.status >= 400 && err?.response?.status < 500 ? false : count < 2),
        },
    },
});
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(MotionConfig, { reducedMotion: "user", children: _jsxs(BrowserRouter, { children: [_jsx(ConfirmProvider, { children: _jsx(App, {}) }), _jsx(Toaster, { position: "top-right", richColors: true, closeButton: true, toastOptions: { style: { fontFamily: '"Bricolage Grotesque Variable", system-ui', borderRadius: 14 } } })] }) }) }) }));
