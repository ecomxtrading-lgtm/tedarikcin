// Vite build sırasında import.meta.env.* kullanımını otomatik olarak replace eder
// Eğer environment variable yoksa boş string olur
const adminEmailsString = import.meta.env.VITE_ADMIN_EMAILS || "";

const adminEmails = adminEmailsString
  .split(",")
  .map((x) => x.trim().toLowerCase())
  .filter(Boolean);

export const isAdminEmail = (email?: string | null) => {
  if (!email) {
    return false;
  }
  return adminEmails.includes(email.toLowerCase());
};
