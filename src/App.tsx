import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

// GitHub Pages SPA routing handler - ?/path formatını düzelt
const SPAHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // URL'de ?/ formatı varsa (GitHub Pages SPA routing)
    // Örnek: /?/dashboard#access_token=... veya /?/admin
    const search = window.location.search;
    const pathname = window.location.pathname;
    
    // Eğer pathname base path ise ve search ?/ ile başlıyorsa
    if (search.startsWith("?/")) {
      // ?/admin formatından admin kısmını al
      let spaPath = search.substring(2); // "?/" kısmını atla
      
      // Eğer query string'de & varsa, ilk &'den öncesini al (path kısmı)
      const andIndex = spaPath.indexOf("&");
      if (andIndex !== -1) {
        spaPath = spaPath.substring(0, andIndex);
      }
      
      // ~and~ karakterlerini &'ye çevir
      spaPath = spaPath.replace(/~and~/g, "&");
      
      // Path / ile başlamalı
      if (!spaPath.startsWith("/")) {
        spaPath = "/" + spaPath;
      }
      
      // Hash'i koru
      const hash = window.location.hash;
      
      // Navigate et (replace: true ile URL'i temizle)
      navigate(spaPath + hash, { replace: true });
      return;
    }
    
    // Eğer pathname sadece base path ise (örn: /tedarikcin/) ve location.pathname farklıysa
    // Bu durumda React Router'ın pathname'ini kontrol et
    const basePath = import.meta.env.BASE_URL || "/tedarikcin";
    const normalizedBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
    
    if (pathname === normalizedBase || pathname === normalizedBase + "/") {
      // Eğer React Router'ın location'ı farklıysa, onu kullan
      if (location.pathname !== pathname) {
        navigate(location.pathname + location.search + location.hash, { replace: true });
      }
    }
  }, [location, navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        basename={import.meta.env.BASE_URL || "/tedarikcin"}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <SPAHandler />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
