import { Link } from "react-router-dom";
import { MessageCircle, Mail } from "lucide-react";

const Footer = () => {
  const footerLinks = [
    { href: "#services", label: "Hizmetler" },
    { href: "#how-it-works", label: "Sistem" },
    { href: "/login", label: "Teklif Al", isRoute: true },
    { href: "/login", label: "Giriş Yap", isRoute: true },
  ];

  return (
    <footer className="bg-brand-soft py-12 md:py-16">
      <div className="container-main">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-brand-deep flex items-center justify-center">
                <span className="text-brand-cta font-heading font-bold text-xl">CS</span>
              </div>
              <span className="text-brand-deep font-heading font-semibold text-lg">
                ChinaSource
              </span>
            </div>
            <p className="text-brand-secondary text-sm leading-relaxed">
              Çin'deki güvenilir satın alma ve lojistik ortağınız. Dropshipping'den Amazon FBA'ya, 
              her adımda yanınızdayız.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-brand-deep font-heading font-semibold">Hızlı Bağlantılar</h4>
            <nav className="flex flex-col gap-2">
              {footerLinks.map((link) =>
                link.isRoute ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-brand-secondary hover:text-brand-primary transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-brand-secondary hover:text-brand-primary transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                )
              )}
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-brand-deep font-heading font-semibold">İletişim</h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-brand-secondary hover:text-brand-primary transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-deep/10 flex items-center justify-center">
                  <MessageCircle size={20} className="text-brand-primary" />
                </div>
                <span>WhatsApp</span>
              </a>
              <a
                href="weixin://dl/chat?wechat_id=example"
                className="flex items-center gap-3 text-brand-secondary hover:text-brand-primary transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-deep/10 flex items-center justify-center">
                  <MessageCircle size={20} className="text-brand-primary" />
                </div>
                <span>WeChat</span>
              </a>
              <a
                href="mailto:info@chinasource.com"
                className="flex items-center gap-3 text-brand-secondary hover:text-brand-primary transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-deep/10 flex items-center justify-center">
                  <Mail size={20} className="text-brand-primary" />
                </div>
                <span>info@chinasource.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-brand-secondary/20 text-center">
          <p className="text-brand-secondary text-sm">
            © 2024 ChinaSource. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
