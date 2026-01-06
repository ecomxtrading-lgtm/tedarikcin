import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Lock, User as UserIcon, Eye, EyeOff, Phone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

const Login = () => {
  const normalizePhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.startsWith("90")) return digits.slice(2);
    if (digits.startsWith("0")) return digits.slice(1);
    return digits;
  };

  const translateError = (err: unknown) => {
    const message = err instanceof Error ? err.message : "";

    if (message.includes("Password should be at least 6 characters")) {
      return "Şifre en az 6 karakter olmalı.";
    }
    if (message.includes("Invalid login credentials")) {
      return "E-posta veya şifre hatalı.";
    }
    if (message.includes("Email not confirmed")) {
      return "E-posta doğrulaması gerekli. Lütfen e-postanızı kontrol edin.";
    }
    return message || "Bir hata oluştu. Lütfen tekrar deneyin.";
  };

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Customer kaydı Supabase trigger ile otomatik oluşturuluyor, frontend'den ekleme yapmıyoruz

  useEffect(() => {
    // Daha önce "beni hatırla" seçilmiş ve oturum varsa login sayfasını atla.
    const bootstrap = async () => {
      const remember = localStorage.getItem("remember_me") === "true";
      if (!remember) return;
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        navigate("/dashboard");
      }
    };
    void bootstrap();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        // Customer kaydı Supabase trigger ile otomatik oluşturuluyor

        if (rememberMe) {
          localStorage.setItem("remember_me", "true");
        } else {
          localStorage.removeItem("remember_me");
        }

        toast.success("Giriş başarılı! Dashboard'a yönlendiriliyorsunuz.", { position: "top-center", className: "border border-destructive/60" });
        setTimeout(() => navigate("/dashboard"), 800);
      } else {
        if (password !== confirmPassword) {
          toast.error("Şifreler eşleşmiyor. Lütfen aynı şifreyi girin.", { position: "top-center", className: "border border-destructive" });
          setPasswordError(true);
          setLoading(false);
          return;
        }
        const normalizedPhone = normalizePhone(phone);
        if (!normalizedPhone || normalizedPhone.length < 10 || !/^\d+$/.test(normalizedPhone)) {
          toast.error("Telefon numarası en az 10 rakam olmalı ve sadece rakam içermeli.", {
            position: "top-center",
            className: "border border-destructive",
          });
          setLoading(false);
          return;
        }

        // Duplicate check in customers
        const { data: dupData, error: dupError } = await supabase
          .from("customers")
          .select("email, phone")
          .or(`email.eq.${email},phone.eq.${normalizedPhone}`);
        if (dupError) {
          toast.error("Kayıt kontrolü yapılamadı, lütfen tekrar deneyin.", {
            position: "top-center",
            className: "border border-destructive",
          });
          setLoading(false);
          return;
        }
        const emailExists = dupData?.some((r) => r.email === email);
        const phoneExists = dupData?.some((r) => r.phone === normalizedPhone);
        if (emailExists || phoneExists) {
          const msg =
            emailExists && phoneExists
              ? "Sistemde bu e-posta ve telefon zaten kayıtlı."
              : emailExists
              ? "Sistemde bu e-posta zaten kayıtlı."
              : "Sistemde bu telefon zaten kayıtlı.";
          toast.error(msg, { position: "top-center", className: "border border-destructive" });
          setLoading(false);
          return;
        }
        // Email confirmation redirect URL'i dinamik olarak ayarla (base path dahil)
        // Production'da basePath "/tedarikcin/" olacak, development'ta "/"
        const basePath = import.meta.env.BASE_URL || "/";
        // Base path'i normalize et (başında ve sonunda / olmalı)
        const normalizedBasePath = basePath.startsWith("/") ? basePath : `/${basePath}`;
        const finalBasePath = normalizedBasePath.endsWith("/") ? normalizedBasePath : `${normalizedBasePath}/`;
        // Tam URL oluştur - dashboard'a yönlendir
        const confirmRedirectUrl = `${window.location.origin}${finalBasePath}dashboard`;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, phone: normalizedPhone },
            emailRedirectTo: confirmRedirectUrl,
          },
        });

        if (error) {
          throw error;
        }

        // Customer kaydı Supabase trigger ile otomatik oluşturuluyor

        toast.success("Kayıt başarılı! E-posta doğrulamasını kontrol edin.", { position: "top-center", className: "border border-destructive/60" });
        setPasswordError(false);
        setIsLogin(true);
      }
    } catch (err) {
      const message = translateError(err);
      toast.error(message, { position: "top-center", className: "border border-destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Redirect URL'i dinamik olarak ayarla (base path dahil)
      // Production'da basePath "/tedarikcin/" olacak, development'ta "/"
      const basePath = import.meta.env.BASE_URL || "/";
      // Base path'i normalize et (başında ve sonunda / olmalı)
      const normalizedBasePath = basePath.startsWith("/") ? basePath : `/${basePath}`;
      const finalBasePath = normalizedBasePath.endsWith("/") ? normalizedBasePath : `${normalizedBasePath}/`;
      // Tam URL oluştur - dashboard'a yönlendir
      const redirectUrl = `${window.location.origin}${finalBasePath}dashboard`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google ile giriş yapılamadı. Lütfen tekrar deneyin.";
      toast.error(message, { position: "top-center", className: "border border-destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Şifre sıfırlamak için önce e-posta girin.", { position: "top-center", className: "border border-destructive" });
      return;
    }
    setLoading(true);
    try {
      // Password reset redirect URL'i dinamik olarak ayarla (base path dahil)
      // Production'da basePath "/tedarikcin/" olacak, development'ta "/"
      const basePath = import.meta.env.BASE_URL || "/";
      // Base path'i normalize et (başında ve sonunda / olmalı)
      const normalizedBasePath = basePath.startsWith("/") ? basePath : `/${basePath}`;
      const finalBasePath = normalizedBasePath.endsWith("/") ? normalizedBasePath : `${normalizedBasePath}/`;
      // Tam URL oluştur - reset sayfasına yönlendir
      const resetRedirectUrl = `${window.location.origin}${finalBasePath}reset`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetRedirectUrl,
      });
      if (error) throw error;
      toast.success("Şifre sıfırlama bağlantısı e-postanıza gönderildi.", { position: "top-center", className: "border border-destructive/60" });
    } catch (err) {
      const message = translateError(err);
      toast.error(message, { position: "top-center", className: "border border-destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-deep via-brand-primary to-brand-teal" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-2 border-brand-cta" />
          <div className="absolute bottom-40 right-20 w-96 h-96 rounded-full border-2 border-brand-cta" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full border-2 border-brand-cta" />
        </div>

        {/* Content */}
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
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2 justify-center">
              <div className="w-10 h-10 rounded-xl bg-brand-deep flex items-center justify-center">
                <span className="text-brand-cta font-heading font-bold text-xl">CS</span>
              </div>
              <span className="text-foreground font-heading font-semibold text-lg">
                ChinaSource
              </span>
            </Link>
          </div>

          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
              {isLogin ? "Hoş Geldiniz" : "Hesap Oluşturun"}
            </h2>
            <p className="text-muted-foreground">
              {isLogin 
                ? "Devam etmek için giriş yapın" 
                : "Ücretsiz hesabınızı oluşturun"
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-medium">
                    Ad Soyad
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Adınız Soyadınız"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-12 h-12 rounded-xl border-border bg-muted/50 focus:bg-background"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground font-medium">
                    Telefon Numarası
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      pattern="\d*"
                      minLength={10}
                      maxLength={15}
                      placeholder="05xx xxx xx xx"
                      value={phone}
                      onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    setPhone(digits);
                      }}
                      className="pl-12 h-12 rounded-xl border-border bg-muted/50 focus:bg-background"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                E-posta
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-border bg-muted/50 focus:bg-background"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Şifre
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(false);
                  }}
                  className={`pl-12 pr-12 h-12 rounded-xl bg-muted/50 focus:bg-background ${
                    !isLogin && passwordError
                      ? "border border-destructive focus:border-destructive"
                      : "border border-border"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-foreground font-medium">
                  Şifreyi Doğrula
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordError) setPasswordError(false);
                    }}
                    className={`pl-12 h-12 rounded-xl bg-muted/50 focus:bg-background ${
                      passwordError
                        ? "border border-destructive focus:border-destructive"
                        : "border border-border"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Şifreyi göster"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-brand-cta focus:ring-0"
                  />
                  Beni hatırla
                </label>
                <Link
                  to="/forgot"
                  className="text-sm text-brand-primary hover:text-brand-cta transition-colors"
                  onClick={() => {
                    /* no-op */
                  }}
                >
                  Şifremi Unuttum
                </Link>
              </div>
            )}

            <Button type="submit" variant="cta" size="full" className="mt-6">
              {loading ? "İşlem yapılıyor..." : isLogin ? "Giriş Yap" : "Kayıt Ol"}
            </Button>
          </form>

          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="full"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              Google ile devam et
            </Button>
          </div>

          {/* Toggle */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              {isLogin ? "Hesabınız yok mu?" : "Zaten hesabınız var mı?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-brand-primary hover:text-brand-cta font-medium transition-colors"
              >
                {isLogin ? "Kayıt Olun" : "Giriş Yapın"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
