// Vite otomatik olarak import.meta.env.* kullanımını replace eder
const getAdminEmails = () => {
  try {
    const envValue = import.meta.env.VITE_ADMIN_EMAILS || "";
    return envValue
      .split(",")
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean);
  } catch (error) {
    // Fallback: Eğer import.meta kullanılamıyorsa boş array döndür
    return [];
  }
};

const adminEmails = getAdminEmails();

export const isAdminEmail = (email?: string | null) =>
  !!email && adminEmails.includes(email.toLowerCase());
