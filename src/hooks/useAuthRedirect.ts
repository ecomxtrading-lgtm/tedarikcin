import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const isRouterReady = useRef(false);

  // React Router'ın hazır olduğunu kontrol et
  useEffect(() => {
    // Router hazır olduğunda flag'i set et
    isRouterReady.current = true;
  }, []);

  const handleTeklifAlClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Login sonrası nereye gideceğini burada saklıyoruz
    sessionStorage.setItem("postAuthRedirect", "/dashboard");

    // Router hazır değilse kısa bir süre bekle
    if (!isRouterReady.current) {
      setTimeout(() => {
        navigate("/login", { replace: false });
      }, 50);
      return;
    }

    // Router hazırsa direkt navigate et
    try {
      navigate("/login", { replace: false });
    } catch (error) {
      // Eğer navigate başarısız olursa fallback
      console.warn("Navigate failed, using window.location:", error);
      const basePath = import.meta.env.BASE_URL || "/tedarikcin";
      const normalizedBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
      window.location.href = `${normalizedBase}/login`;
    }
  };

  return { handleTeklifAlClick };
};
