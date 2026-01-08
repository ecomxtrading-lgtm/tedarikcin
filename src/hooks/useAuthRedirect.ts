import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export const useAuthRedirect = () => {
  const navigate = useNavigate();

  const handleTeklifAlClick = (e: React.MouseEvent) => {
    console.log("🔵 [useAuthRedirect] Buton tıklandı!");
    e.preventDefault();
    e.stopPropagation();
    console.log("🔵 [useAuthRedirect] Event preventDefault ve stopPropagation yapıldı");

    // Hızlı session kontrolü - getSession() cache'lenmiş session'ı kontrol eder, daha hızlı
    console.log("🔵 [useAuthRedirect] getSession() çağrılıyor...");
    const startTime = performance.now();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      const endTime = performance.now();
      console.log(`🔵 [useAuthRedirect] getSession() tamamlandı (${(endTime - startTime).toFixed(2)}ms)`);
      console.log("🔵 [useAuthRedirect] Session:", session ? "Var" : "Yok");
      console.log("🔵 [useAuthRedirect] User:", session?.user ? session.user.email : "Yok");
      
      if (session?.user) {
        console.log("🔵 [useAuthRedirect] ✅ Kullanıcı giriş yapmış, /dashboard'a yönlendiriliyor");
        navigate("/dashboard");
      } else {
        console.log("🔵 [useAuthRedirect] ❌ Kullanıcı giriş yapmamış, /login'e yönlendiriliyor");
        navigate("/login");
      }
    }).catch((error) => {
      console.error("🔵 [useAuthRedirect] ❌ Hata oluştu:", error);
      // Hata durumunda login'e git
      navigate("/login");
    });
  };

  return { handleTeklifAlClick };
};
