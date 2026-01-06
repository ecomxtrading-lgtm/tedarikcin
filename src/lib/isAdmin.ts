// Vite build sırasında import.meta.env.* kullanımını otomatik olarak replace eder
// Eğer environment variable yoksa boş string olur
const adminEmailsString = import.meta.env.VITE_ADMIN_EMAILS || "";

const adminEmails = adminEmailsString
  .split(",")
  .map((x) => x.trim().toLowerCase())
  .filter(Boolean);

// Debug: Production'da admin email'lerin yüklenip yüklenmediğini kontrol et
if (typeof window !== "undefined" && import.meta.env.MODE === "production") {
  // Sadece production'da ve browser'da çalıştır
  if (adminEmails.length === 0) {
    console.warn("⚠️ VITE_ADMIN_EMAILS environment variable boş veya tanımlı değil!");
  } else {
    console.log("✅ Admin emails loaded:", adminEmails);
  }
}

export const isAdminEmail = (email?: string | null) => {
  if (!email) return false;
  const isAdmin = adminEmails.includes(email.toLowerCase());
  
  // Debug: Production'da admin kontrolü sonucunu logla
  if (typeof window !== "undefined" && import.meta.env.MODE === "production") {
    if (!isAdmin && adminEmails.length > 0) {
      console.log(`❌ Email "${email}" admin listesinde değil. Admin emails:`, adminEmails);
    } else if (isAdmin) {
      console.log(`✅ Email "${email}" admin olarak doğrulandı.`);
    }
  }
  
  return isAdmin;
};
