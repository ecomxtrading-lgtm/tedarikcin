// Vite build sırasında import.meta.env.* kullanımını otomatik olarak replace eder
// Eğer environment variable yoksa boş string olur
const adminEmailsString = import.meta.env.VITE_ADMIN_EMAILS || "";

const adminEmails = adminEmailsString
  .split(",")
  .map((x) => x.trim().toLowerCase())
  .filter(Boolean);

// Debug: Her zaman logla (production ve development)
if (typeof window !== "undefined") {
  if (adminEmails.length === 0) {
    console.warn("⚠️ VITE_ADMIN_EMAILS environment variable boş veya tanımlı değil!", {
      rawValue: import.meta.env.VITE_ADMIN_EMAILS,
      mode: import.meta.env.MODE,
    });
  } else {
    console.log("✅ Admin emails loaded:", adminEmails, {
      rawValue: import.meta.env.VITE_ADMIN_EMAILS,
      mode: import.meta.env.MODE,
    });
  }
}

export const isAdminEmail = (email?: string | null) => {
  if (!email) {
    console.warn("⚠️ isAdminEmail: email parametresi yok");
    return false;
  }
  const isAdmin = adminEmails.includes(email.toLowerCase());
  
  // Debug: Her zaman logla
  if (typeof window !== "undefined") {
    if (!isAdmin && adminEmails.length > 0) {
      console.log(`❌ Email "${email}" admin listesinde değil. Admin emails:`, adminEmails);
    } else if (isAdmin) {
      console.log(`✅ Email "${email}" admin olarak doğrulandı.`);
    } else if (adminEmails.length === 0) {
      console.warn(`⚠️ Admin email listesi boş! Email: "${email}"`);
    }
  }
  
  return isAdmin;
};
