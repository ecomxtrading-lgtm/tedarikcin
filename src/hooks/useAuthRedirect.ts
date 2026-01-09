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
      
      // Mevcut pathname'i kaydet (navigate çalışıp çalışmadığını kontrol etmek için)
      const currentPathname = window.location.pathname;
      const currentSearch = window.location.search;
      const currentHash = window.location.hash;
      
      if (session?.user) {
        const targetPath = "/dashboard";
        const fullTargetPath = `${normalizedBase}${targetPath}`;
        console.log("🔵 [useAuthRedirect] ✅ Kullanıcı giriş yapmış, /dashboard'a yönlendiriliyor");
        console.log("🔵 [useAuthRedirect] Target path:", fullTargetPath);
        
        // Önce navigate() kullan (sayfa yenilenmez, daha hızlı)
        console.log("🔵 [useAuthRedirect] navigate() çağrılıyor...");
        navigate(targetPath, { replace: false });
        console.log("🔵 [useAuthRedirect] navigate() çağrıldı");
        
        // Eğer navigate() çalışmazsa (sayfa değişmezse) window.location.href kullan
        // Bu sadece sayfa ilk açıldığında React Router hazır değilse gerekli
        setTimeout(() => {
          const newPathname = window.location.pathname;
          const newSearch = window.location.search;
          
          // Eğer pathname değişmediyse veya hala aynı sayfadaysak
          if (newPathname === currentPathname && newSearch === currentSearch) {
            console.log("🔵 [useAuthRedirect] navigate() çalışmadı, window.location.href kullanılıyor (fallback)");
            window.location.href = fullTargetPath;
          } else {
            console.log("🔵 [useAuthRedirect] ✅ navigate() başarılı, sayfa değişti");
          }
        }, 150); // 150ms sonra kontrol et
      } else {
        const targetPath = "/login";
        const fullTargetPath = `${normalizedBase}${targetPath}`;
        console.log("🔵 [useAuthRedirect] ❌ Kullanıcı giriş yapmamış, /login'e yönlendiriliyor");
        console.log("🔵 [useAuthRedirect] Target path:", fullTargetPath);
        
        // Önce navigate() kullan (sayfa yenilenmez, daha hızlı)
        console.log("🔵 [useAuthRedirect] navigate() çağrılıyor...");
        navigate(targetPath, { replace: false });
        console.log("🔵 [useAuthRedirect] navigate() çağrıldı");
        
        // Eğer navigate() çalışmazsa (sayfa değişmezse) window.location.href kullan
        // Bu sadece sayfa ilk açıldığında React Router hazır değilse gerekli
        setTimeout(() => {
          const newPathname = window.location.pathname;
          const newSearch = window.location.search;
          
          // Eğer pathname değişmediyse veya hala aynı sayfadaysak
          if (newPathname === currentPathname && newSearch === currentSearch) {
            console.log("🔵 [useAuthRedirect] navigate() çalışmadı, window.location.href kullanılıyor (fallback)");
            window.location.href = fullTargetPath;
          } else {
            console.log("🔵 [useAuthRedirect] ✅ navigate() başarılı, sayfa değişti");
          }
        }, 150); // 150ms sonra kontrol et
      }
    }).catch((error) => {
      console.error("🔵 [useAuthRedirect] ❌ Hata oluştu:", error);
      const basePath = import.meta.env.BASE_URL || "/tedarikcin";
      const normalizedBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
      const targetPath = "/login";
      const fullTargetPath = `${normalizedBase}${targetPath}`;
      
      console.log("🔵 [useAuthRedirect] Hata durumunda /login'e yönlendiriliyor");
      
      // Hata durumunda önce navigate() dene
      navigate(targetPath, { replace: false });
      
      // Fallback olarak window.location.href kullan
      setTimeout(() => {
        const currentPathname = window.location.pathname;
        if (!currentPathname.includes("/login")) {
          window.location.href = fullTargetPath;
        }
      }, 150);
    });
  };

  return { handleTeklifAlClick };
};
