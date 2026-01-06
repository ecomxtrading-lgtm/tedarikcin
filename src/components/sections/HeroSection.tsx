import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80"
      >
        <source
          src="https://cdn.coverr.co/videos/coverr-shipping-containers-at-a-port-2367/1080p.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 gradient-hero-overlay" />

      {/* Decorative Elements */}
      <div className="absolute right-0 top-1/4 w-64 h-64 opacity-20">
        <svg viewBox="0 0 200 200" className="w-full h-full text-brand-lime">
          <path fill="currentColor" d="M100 0L120 80L200 100L120 120L100 200L80 120L0 100L80 80Z" opacity="0.3"/>
        </svg>
      </div>

      {/* Vertical Text */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden xl:block">
        <span className="text-white/10 font-heading font-bold text-8xl tracking-widest" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
          LOGISTICS
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 container-main">
        <div className="max-w-4xl space-y-8">
          {/* Tag */}
          <div className="animate-fade-up opacity-0">
            <span className="inline-flex items-center gap-3 text-brand-lime font-medium">
              <span className="flex items-center gap-1">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 3L4 14h7v7l9-11h-7V3z"/>
                </svg>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 3L4 14h7v7l9-11h-7V3z"/>
                </svg>
              </span>
              Çin'deki Satın Alma ve Lojistik Ortağınız
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="animate-fade-up opacity-0 stagger-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-[1.1]">
            Dünya Standartlarında{" "}
            <span className="text-highlight inline-block">Tedarik</span>{" "}
            Çözümleri
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-up opacity-0 stagger-2 text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
            Dropshipping, Amazon FBA/FBM, toptan alım, kalite kontrol ve depolama. Ürünü söyleyin, gerisini bize bırakın.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-up opacity-0 stagger-3 flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/login">
              <Button variant="lime" size="xl" className="group gap-2">
                Ücretsiz Teklif Al
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="xl" className="border-white/30 text-black hover:bg-white/10 hover:border-white/50 hover:text-white transition-colors">
                Nasıl Çalışır?
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 rounded-full bg-brand-lime animate-pulse" />
        </div>
      </div>

      {/* Decorative lines */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-lime/50 to-transparent" />
    </section>
  );
};

export default HeroSection;