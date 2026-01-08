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
      
      const basePath = import.meta.env.BASE_URL || "/tedarikcin";
      const normalizedBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
      
      if (session?.user) {
        const targetPath = `${normalizedBase}/dashboard`;
        console.log("🔵 [useAuthRedirect] ✅ Kullanıcı giriş yapmış, /dashboard'a yönlendiriliyor");
        console.log("🔵 [useAuthRedirect] Target path:", targetPath);
        console.log("🔵 [useAuthRedirect] navigate() çağrılıyor...");
        
        // Hem navigate() hem de window.location.href kullan (daha güvenilir)
        navigate("/dashboard", { replace: false });
        console.log("🔵 [useAuthRedirect] navigate() çağrıldı");
        
        // Eğer navigate çalışmazsa window.location.href ile yönlendir
        setTimeout(() => {
          if (window.location.pathname !== `${normalizedBase}/dashboard` && !window.location.pathname.includes("/dashboard")) {
            console.log("🔵 [useAuthRedirect] navigate() çalışmadı, window.location.href kullanılıyor");
            window.location.href = targetPath;
          }
        }, 100);
      } else {
        const targetPath = `${normalizedBase}/login`;
        console.log("🔵 [useAuthRedirect] ❌ Kullanıcı giriş yapmamış, /login'e yönlendiriliyor");
        console.log("🔵 [useAuthRedirect] Target path:", targetPath);
        console.log("🔵 [useAuthRedirect] navigate() çağrılıyor...");
        
        // Hem navigate() hem de window.location.href kullan (daha güvenilir)
        navigate("/login", { replace: false });
        console.log("🔵 [useAuthRedirect] navigate() çağrıldı");
        
        // Eğer navigate çalışmazsa window.location.href ile yönlendir
        setTimeout(() => {
          if (window.location.pathname !== `${normalizedBase}/login` && !window.location.pathname.includes("/login")) {
            console.log("🔵 [useAuthRedirect] navigate() çalışmadı, window.location.href kullanılıyor");
            window.location.href = targetPath;
          }
        }, 100);
      }
    }).catch((error) => {
      console.error("🔵 [useAuthRedirect] ❌ Hata oluştu:", error);
      const basePath = import.meta.env.BASE_URL || "/tedarikcin";
      const normalizedBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
      const targetPath = `${normalizedBase}/login`;
      
      // Hata durumunda login'e git
      navigate("/login", { replace: false });
      setTimeout(() => {
        if (window.location.pathname !== `${normalizedBase}/login` && !window.location.pathname.includes("/login")) {
          window.location.href = targetPath;
        }
      }, 100);
    });
  };

  return { handleTeklifAlClick };
};
