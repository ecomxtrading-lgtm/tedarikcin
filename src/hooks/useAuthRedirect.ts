import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export const useAuthRedirect = () => {
  const navigate = useNavigate();

  const handleTeklifAlClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("🟢 Teklif butonuna tıklandı");

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        console.log("🟢 Kullanıcı giriş yapmış → /dashboard");
        navigate("/dashboard", { replace: true });
      } else {
        console.log("🟡 Kullanıcı yok → /login");
        navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error("🔴 Session kontrol hatası:", err);
      navigate("/login", { replace: true });
    }
  };

  return { handleTeklifAlClick };
};
