import { Button } from "@/components/ui/button";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { AnimatedElement } from "@/components/ui/AnimatedElement";
import { 
  Building2, 
  TrendingUp, 
  ClipboardCheck, 
  MessageCircle, 
  Globe,
  ArrowRight,
  Check,
  Play,
  Headphones
} from "lucide-react";

const features = [
  "Çin'de Depo & Operasyon Ağı",
  "Ölçeklenebilir Altyapı",
  "Kalite Kontrol & Raporlama",
  "WhatsApp / WeChat Destek",
  "Dünya Geneli Gönderim",
];

const WhyUsSection = () => {
  const { handleTeklifAlClick } = useAuthRedirect();

  return (
    <section id="why-us" className="py-24 md:py-32 bg-secondary/30">
      <div className="container-main">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Images */}
          <AnimatedElement animation="fade-up" delay={0}>
            {/* Main Image */}
            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80"
                alt="Profesyonel lojistik ekibi"
                className="rounded-2xl shadow-hover w-full max-w-md"
                loading="lazy"
                width={800}
                height={600}
              />
              
              {/* Video Play Button Overlay */}
              <div className="absolute bottom-4 left-4 flex items-center gap-3">
                <button 
                  className="w-16 h-16 rounded-full bg-brand-lime flex items-center justify-center shadow-lg hover:bg-brand-lime-hover transition-colors group"
                  aria-label="Video izle"
                >
                  <Play className="w-6 h-6 text-brand-dark ml-1" fill="currentColor" />
                </button>
                <div className="hidden sm:block">
                  <div className="text-[10px] font-medium text-white/60 tracking-widest" style={{ writingMode: 'vertical-rl' }}>
                    VIDEO İZLE
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Image */}
            <div className="absolute -bottom-8 -right-8 z-20 hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=400&q=80"
                alt="Depo operasyonları"
                className="rounded-2xl shadow-hover w-64"
                loading="lazy"
                width={400}
                height={300}
              />
            </div>

            {/* Stats Card */}
            <div className="absolute -top-6 right-0 md:right-20 z-30 bg-brand-lime rounded-2xl p-6 shadow-lg">
              <div className="text-4xl font-heading font-bold text-brand-dark mb-1">500+</div>
              <div className="text-sm font-medium text-brand-dark/70">Aktif Müşteri</div>
              <div className="flex -space-x-2 mt-3">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-brand-dark/20 border-2 border-brand-lime" />
                ))}
              </div>
            </div>
          </AnimatedElement>

          {/* Right Side - Content */}
          <AnimatedElement animation="slide-in-right" delay={200}>
            <div className="space-y-8">
            {/* Tag */}
            <span className="inline-flex items-center gap-2 text-brand-lime font-semibold">
              <span className="flex gap-1">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 3L4 14h7v7l9-11h-7V3z"/>
                </svg>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 3L4 14h7v7l9-11h-7V3z"/>
                </svg>
              </span>
              Neden Bizi Seçmelisiniz
            </span>

            {/* Heading */}
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground leading-tight">
              Çin Tedarikinde <span className="text-brand-lime">En İyi</span> Partneriniz.
            </h2>

            {/* Description */}
            <p className="text-muted-foreground text-lg leading-relaxed">
              Yılların deneyimi ve güçlü operasyonel ağımızla, Çin'den dünyaya kesintisiz tedarik zinciri sunuyoruz. Size özel çözümlerle işinizi büyütün.
            </p>

            {/* Tabs - Simplified as static content */}
            <div className="flex gap-4">
              <Button variant="dark" size="default">Misyonumuz</Button>
              <Button variant="outline" size="default" className="text-foreground">Yaklaşımımız</Button>
              <Button variant="outline" size="default" className="text-foreground">Vizyonumuz</Button>
            </div>

            {/* Feature Image with Checklist */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative rounded-xl overflow-hidden w-full md:w-48 h-32 flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=400&q=80"
                  alt="Kalite kontrol"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={400}
                  height={200}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <button 
                    className="w-12 h-12 rounded-full bg-brand-lime flex items-center justify-center"
                    aria-label="Kalite kontrol videosu izle"
                  >
                    <Play className="w-5 h-5 text-brand-dark ml-0.5" fill="currentColor" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-lime flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-brand-dark" strokeWidth={3} />
                    </div>
                    <span className="text-foreground font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4">
              <Button 
                variant="lime" 
                size="lg" 
                className="group gap-2"
                onClick={handleTeklifAlClick}
              >
                Teklif Al
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-lime flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-brand-dark" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Bizi Arayın</div>
                  <div className="text-lg font-semibold text-foreground">+90 555 123 4567</div>
                </div>
              </div>
            </div>
            </div>
          </AnimatedElement>
        </div>
      </div>

      {/* Decorative vertical text */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden 2xl:block">
        <span className="text-border font-heading font-bold text-8xl tracking-widest" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
          WHY CHOOSE US
        </span>
      </div>
    </section>
  );
};

export default WhyUsSection;