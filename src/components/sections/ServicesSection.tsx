import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AnimatedElement } from "@/components/ui/AnimatedElement";
import { 
  Package, 
  Truck, 
  ShoppingCart, 
  Warehouse, 
  Tag, 
  CheckCircle, 
  Palette, 
  Search,
  ArrowRight,
  ArrowUpRight
} from "lucide-react";

const services = [
  {
    icon: Package,
    title: "Dropshipping Fulfillment",
    description: "Tekil siparişlerinizi doğrudan müşterilerinize ulaştırıyoruz. Hızlı, güvenilir ve ölçeklenebilir.",
  },
  {
    icon: Truck,
    title: "Amazon FBA / FBM Hazırlık",
    description: "Amazon standartlarına uygun paketleme, etiketleme ve gönderim. FBA/FBM süreçlerinde tam destek.",
  },
  {
    icon: ShoppingCart,
    title: "Toptan Satın Alma & Tedarik",
    description: "Çin'deki en iyi tedarikçilerden toptan alım. Fiyat pazarlığı ve kalite garantisi.",
  },
  {
    icon: Warehouse,
    title: "Depolama & Konsolidasyon",
    description: "Çin'deki depolarımızda ürünlerinizi saklayın, birleştirin ve toplu gönderim yapın.",
  },
  {
    icon: Tag,
    title: "Paket Yenileme & Etiketleme",
    description: "Özel etiketleme, marka kartları, barkodlama ve profesyonel paketleme hizmetleri.",
  },
  {
    icon: CheckCircle,
    title: "Kalite Kontrol & Numune Denetimi",
    description: "Detaylı kalite kontrol raporları, fotoğraflı inceleme ve numune gönderimi.",
  },
  {
    icon: Palette,
    title: "Ürün Özelleştirme / Üretim",
    description: "OEM/ODM üretim, özel tasarım ve küçük partilerden seri üretime destek.",
  },
  {
    icon: Search,
    title: "Ürün Araştırma",
    description: "Trend analizi, rakip araştırması ve karlı ürün önerileri ile pazarda öne geçin.",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 md:py-32 bg-background">
      <div className="container-main">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-lime text-brand-dark text-sm font-semibold mb-6">
              <span className="flex gap-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 3L4 14h7v7l9-11h-7V3z"/>
                </svg>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 3L4 14h7v7l9-11h-7V3z"/>
                </svg>
              </span>
              Hizmetlerimiz
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
              Çin'den Dünyaya, <span className="text-brand-lime">Uçtan Uca</span> Çözümler
            </h2>
            <p className="text-muted-foreground text-lg">
              İhtiyacınız olan her hizmeti tek çatı altında sunuyoruz. Profesyonel ekibimiz sizin için çalışıyor.
            </p>
          </div>
          <Link to="/login" className="shrink-0">
            <Button variant="dark" size="lg" className="gap-2 group">
              Tüm Hizmetler
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <AnimatedElement
              key={service.title}
              animation="fade-up"
              delay={index * 50}
            >
              <div className="group relative bg-card rounded-2xl p-6 shadow-card hover-lift border border-border/50 h-full flex flex-col">
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-brand-dark flex items-center justify-center mb-5 group-hover:bg-brand-lime transition-colors duration-300">
                <service.icon className="w-7 h-7 text-white group-hover:text-brand-dark transition-colors duration-300" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-heading font-semibold text-foreground mb-3 group-hover:text-brand-dark transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-1">
                {service.description}
              </p>

              {/* Mini CTA */}
              <Link 
                to="/login" 
                className="inline-flex items-center text-brand-dark text-sm font-semibold hover:text-brand-lime transition-colors duration-300 group/link mt-auto"
              >
                Detaylı Bilgi
                <ArrowRight className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" />
              </Link>

              {/* Hover border accent */}
              <div className="absolute inset-0 rounded-2xl border-2 border-brand-lime opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;