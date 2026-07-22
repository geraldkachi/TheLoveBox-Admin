import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Layout from "./components/Layout";
import { useAuthStore } from "./lib/authStore";
function Protected({ children }) {
    const token = useAuthStore((s) => s.token);
    return token ? children : _jsx(Navigate, { to: "/login", replace: true });
}
export default function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsxs(Route, { path: "/", element: _jsx(Protected, { children: _jsx(Layout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "categories", element: _jsx(Categories, {}) }), _jsx(Route, { path: "products", element: _jsx(Products, {}) }), _jsx(Route, { path: "orders", element: _jsx(Orders, {}) })] })] }));
}
