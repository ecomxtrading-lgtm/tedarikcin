import { Button } from "@/components/ui/button";
import { Quote, Star, ArrowRight, MessageSquare } from "lucide-react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const testimonials = [
  {
    name: "Ahmet Yılmaz",
    role: "E-Ticaret Girişimcisi",
    content: "Dropshipping işimizi ChinaSource ile tamamen dönüştürdük. Kalite kontrol raporları sayesinde müşteri iade oranımız %80 düştü.",
    rating: 5,
  },
  {
    name: "Elif Kara",
    role: "Amazon FBA Satıcısı",
    content: "FBA hazırlık süreçlerinde profesyonellik ve hız beklentilerimi fazlasıyla karşıladı. Artık tüm gönderimlerimi burada yapıyorum.",
    rating: 5,
  },
  {
    name: "Mehmet Demir",
    role: "Toptan Alıcı",
    content: "Çin tedarikçileriyle iletişim ve fiyat pazarlığında büyük kolaylık sağladılar. Güvenilir ve şeffaf bir süreç yaşadım.",
    rating: 5,
  },
  {
    name: "Zeynep Aksoy",
    role: "Marka Sahibi",
    content: "Özel etiketleme ve paketleme hizmetleri markamızın profesyonel görünmesini sağladı. Müşteri geri dönüşleri muhteşem.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  const { handleTeklifAlClick } = useAuthRedirect();

  return (
    <section id="testimonials" className="py-20 md:py-28 bg-brand-soft/30">
      <div className="container-main">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-cta/20 text-brand-primary text-sm font-medium mb-4">
            <MessageSquare className="w-4 h-4" />
            Müşterilerimiz Ne Diyor?
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            Başarı <span className="text-brand-primary">Hikayeleri</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Yüzlerce mutlu müşterimizden bazı yorumlar.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="group relative bg-popover rounded-2xl p-8 shadow-card hover-lift border border-border/50 animate-fade-up opacity-0"
              style={{ animationDelay: `${index * 0.15}s`, animationFillMode: 'forwards' }}
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6">
                <Quote className="w-10 h-10 text-brand-cta/30" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-brand-cta text-brand-cta" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground leading-relaxed mb-6 text-lg">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-deep flex items-center justify-center">
                  <span className="text-brand-cta font-heading font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            variant="cta" 
            size="lg" 
            className="group"
            onClick={handleTeklifAlClick}
          >
            Hemen Teklif Al
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
