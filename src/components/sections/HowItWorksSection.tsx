import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  Upload, 
  FileText, 
  ShoppingBag, 
  Package, 
  BarChart3,
  ArrowRight,
  Plus
} from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Kayıt Ol ve Giriş Yap",
    description: "Hızlı kayıt ile sisteme erişin ve kişisel dashboard'unuza ulaşın. Ücretsiz hesap oluşturun.",
  },
  {
    icon: Upload,
    step: "02",
    title: "Ürün Bilgilerini Yükle",
    description: "Dashboard'dan ürün detaylarını, linkleri ve miktarları kolayca girin veya Excel ile yükleyin.",
  },
  {
    icon: FileText,
    step: "03",
    title: "Teklif & Lojistik Planı",
    description: "Size özel fiyat teklifi ve detaylı gönderim planı 24 saat içinde hazırlanır.",
  },
  {
    icon: ShoppingBag,
    step: "04",
    title: "Satın Alma & Depo Kabul",
    description: "Ürünler sizin adınıza satın alınır, depoya teslim edilir ve detaylı kontrol yapılır.",
  },
  {
    icon: Package,
    step: "05",
    title: "Paketleme & Gönderim",
    description: "Profesyonel paketleme, özel etiketleme ve dünya geneline güvenli gönderim.",
  },
  {
    icon: BarChart3,
    step: "06",
    title: "Takip & Raporlama",
    description: "Gerçek zamanlı kargo takibi, fotoğraflı raporlar ve 7/24 müşteri desteği.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-secondary/50">
      <div className="container-main">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-lime text-brand-dark text-sm font-semibold mb-6">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" stroke="currentColor" fill="none"/>
            </svg>
            Süreç Adımları
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
            6 Adımda <span className="text-brand-lime">Kolay</span> Süreç
          </h2>
          <p className="text-muted-foreground text-lg">
            Karmaşık tedarik süreçlerini sizin için basitleştirdik.
          </p>
        </div>

        {/* Steps Grid - 2x3 Layout matching reference image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16 mb-16">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className="group relative animate-fade-up opacity-0"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
            >
              <div className="flex gap-6">
                {/* Left: Step Number Badge */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-brand-olive flex flex-col items-center justify-center shadow-lg group-hover:bg-brand-lime transition-colors duration-300">
                      <span className="text-3xl font-heading font-bold text-white group-hover:text-brand-dark transition-colors duration-300">{step.step}</span>
                    </div>
                    {/* Small label under number */}
                    <div className="absolute -bottom-6 left-0 right-0 text-center">
                      <span className="text-[10px] font-semibold text-brand-olive uppercase tracking-wider">ADIM</span>
                    </div>
                  </div>
                </div>

                {/* Right: Card Content */}
                <div className="flex-1 relative">
                  {/* Icon Badge - Top Right of Card */}
                  <div className="absolute -top-4 right-4 z-10">
                    <div className="w-14 h-14 rounded-xl bg-brand-olive flex items-center justify-center shadow-lg group-hover:bg-brand-lime transition-colors duration-300">
                      <step.icon className="w-7 h-7 text-white group-hover:text-brand-dark transition-colors duration-300" />
                    </div>
                  </div>

                  {/* Card Body - Speech Bubble Style */}
                  <div className="step-card pt-6 pb-6 px-6 min-h-[160px]">
                    {/* Title with Plus Icon */}
                    <div className="flex items-center gap-2 mb-3 pr-16">
                      <Plus className="w-4 h-4 text-brand-lime flex-shrink-0" />
                      <h3 className="text-lg font-heading font-bold text-foreground group-hover:text-brand-olive transition-colors duration-300">
                        {step.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/dashboard">
            <Button variant="lime" size="xl" className="group gap-2">
              Hemen Teklif Al
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;