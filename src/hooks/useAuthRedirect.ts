import { supabase } from "@/lib/supabaseClient";

export const useAuthRedirect = () => {
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
        console.log("🔵 [useAuthRedirect] window.location.href kullanılıyor (sayfa ilk açıldığında daha güvenilir)");
        
        // Sayfa ilk açıldığında React Router henüz hazır olmayabilir
        // Bu yüzden direkt window.location.href kullanıyoruz - her zaman çalışır
        window.location.href = targetPath;
      } else {
        const targetPath = `${normalizedBase}/login`;
        console.log("🔵 [useAuthRedirect] ❌ Kullanıcı giriş yapmamış, /login'e yönlendiriliyor");
        console.log("🔵 [useAuthRedirect] Target path:", targetPath);
        console.log("🔵 [useAuthRedirect] window.location.href kullanılıyor (sayfa ilk açıldığında daha güvenilir)");
        
        // Sayfa ilk açıldığında React Router henüz hazır olmayabilir
        // Bu yüzden direkt window.location.href kullanıyoruz - her zaman çalışır
        window.location.href = targetPath;
      }
    }).catch((error) => {
      console.error("🔵 [useAuthRedirect] ❌ Hata oluştu:", error);
      const basePath = import.meta.env.BASE_URL || "/tedarikcin";
      const normalizedBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
      const targetPath = `${normalizedBase}/login`;
      
      console.log("🔵 [useAuthRedirect] Hata durumunda /login'e yönlendiriliyor");
      // Hata durumunda login'e git
      window.location.href = targetPath;
    });
  };

  return { handleTeklifAlClick };
};
