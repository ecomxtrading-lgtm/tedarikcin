import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useRef } from "react";

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const navigating = useRef(false);

  const handleTeklifAlClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigating.current) return;
    navigating.current = true;

    console.log("🟢 Teklif tıklandı");

    const { data: { session } } = await supabase.auth.getSession();

    // 🔴 CRITICAL FIX:
    // Navigation'ı auth promise microtask queue dışına çıkarıyoruz
    requestAnimationFrame(() => {
      if (session?.user) {
        console.log("🟢 /dashboard");
        navigate("/dashboard", { replace: true });
      } else {
        console.log("🟡 /login");
        navigate("/login", { replace: true });
      }
    });

    setTimeout(() => {
      navigating.current = false;
    }, 1000);
  };

  return { handleTeklifAlClick };
};
