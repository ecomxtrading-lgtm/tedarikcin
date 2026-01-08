import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export const useAuthRedirect = () => {
  const navigate = useNavigate();

  const handleTeklifAlClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Hızlı session kontrolü - getSession() cache'lenmiş session'ı kontrol eder, daha hızlı
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Giriş yapmışsa dashboard'a git
        navigate("/dashboard");
      } else {
        // Giriş yapmamışsa login'e git
        navigate("/login");
      }
    }).catch(() => {
      // Hata durumunda login'e git
      navigate("/login");
    });
  };

  return { handleTeklifAlClick };
};
