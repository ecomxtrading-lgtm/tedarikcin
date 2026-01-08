import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export const useAuthRedirect = () => {
  const navigate = useNavigate();

  const handleTeklifAlClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Kullanıcı kontrolü yap
      const { data, error } = await supabase.auth.getUser();
      
      if (data?.user && !error) {
        // Giriş yapmışsa dashboard'a git
        navigate("/dashboard");
      } else {
        // Giriş yapmamışsa login'e git
        navigate("/login");
      }
    } catch (err) {
      // Hata durumunda login'e git
      navigate("/login");
    }
  };

  return { handleTeklifAlClick };
};
