import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase recovery link arrives with access_token & refresh_token in the hash
    const params = new URLSearchParams(window.location.hash.replace("#", ""));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const type = params.get("type");

    if (type !== "recovery" || !access_token || !refresh_token) {
      toast.error("Geçersiz veya eksik şifre sıfırlama bağlantısı.", {
        position: "top-center",
        className: "border border-destructive",
      });
      return;
    }

    const setSession = async () => {
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (error) {
        toast.error("Oturum kurulamadı. Lütfen bağlantıyı yeniden kullanın.", {
          position: "top-center",
          className: "border border-destructive",
        });
        return;
      }
      setSessionReady(true);
    };

    void setSession();
  }, []);

  const handleUpdate = async () => {
    if (!sessionReady) {
      toast.error("Oturum doğrulanmadı. Lütfen maildeki bağlantıyı tekrar kullanın.", {
        position: "top-center",
        className: "border border-destructive",
      });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error("Şifre en az 6 karakter olmalı.", {
        position: "top-center",
        className: "border border-destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Şifreler eşleşmiyor. Lütfen aynı şifreyi girin.", {
        position: "top-center",
        className: "border border-destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Şifreniz güncellendi. Giriş yapabilirsiniz.", {
        position: "top-center",
        className: "border border-destructive/60",
      });
      setTimeout(() => navigate("/login"), 600);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Şifre güncellenemedi. Lütfen tekrar deneyin.";
      toast.error(msg, { position: "top-center", className: "border border-destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-deep via-brand-primary to-brand-teal" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-2 border-brand-cta" />
          <div className="absolute bottom-40 right-20 w-96 h-96 rounded-full border-2 border-brand-cta" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full border-2 border-brand-cta" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-12 h-12 rounded-xl bg-brand-cta flex items-center justify-center">
              <span className="text-brand-deep font-heading font-bold text-2xl">CS</span>
            </div>
            <span className="text-primary-foreground font-heading font-semibold text-xl">
              ChinaSource
            </span>
          </Link>
          <h1 className="text-4xl lg:text-5xl font-heading font-bold text-primary-foreground mb-6 leading-tight">
            Çin'den Dünyaya,
            <br />
            <span className="text-brand-cta">Güvenilir</span> Köprünüz
          </h1>
          <p className="text-[#D9F042] text-lg max-w-md leading-relaxed">
            Dropshipping, Amazon FBA, toptan alım ve daha fazlası için tek adres. 
            Hemen başlayın, işinizi büyütün.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md">
          <Link to="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Giriş sayfasına dön
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
              Yeni Şifre Belirle
            </h2>
            <p className="text-muted-foreground">
              Yeni şifrenizi girin ve onaylayın.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-foreground font-medium text-sm">
                Yeni Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Yeni şifreyi göster"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-foreground font-medium text-sm">
                Şifreyi Doğrula
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Şifreyi doğrula alanını göster"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="button" size="full" onClick={handleUpdate} disabled={loading || !sessionReady}>
              {loading ? "Güncelleniyor..." : "Parolamı Değiştir"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
