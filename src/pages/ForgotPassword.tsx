import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email) {
      toast.error("Lütfen e-posta adresinizi girin.", { position: "top-center", className: "border border-destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Bir hata oluştu. Lütfen tekrar deneyin.";
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
              Şifremi Unuttum
            </h2>
            <p className="text-muted-foreground">
              E-posta adresinizi girin, sıfırlama bağlantısını gönderelim.
            </p>
          </div>

          {!sent ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="reset-email" className="text-foreground font-medium text-sm">
                  E-posta
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="button" size="full" onClick={handleSend} disabled={loading}>
                {loading ? "Gönderiliyor..." : "Sıfırlama bağlantısını gönder"}
              </Button>
            </div>
          ) : (
            <div className="bg-popover border border-border rounded-2xl p-6 text-center space-y-3">
              <div className="text-lg font-heading text-foreground">
                Sıfırlama bağlantınız mail adresinize gönderildi.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
