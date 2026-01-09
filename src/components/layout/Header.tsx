import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, ChevronDown } from "lucide-react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { handleTeklifAlClick } = useAuthRedirect();

  useEffect(() => {
    const handleScroll = () => {
      // Get hero section height (100vh)
      const heroHeight = window.innerHeight;
      const scrollY = window.scrollY;
      
      // Switch when scrolled past hero section
      setIsScrolled(scrollY > heroHeight - 100);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, anchorId: string) => {
    e.preventDefault();
    const element = document.getElementById(anchorId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { href: "#services", label: "Hizmetler", anchorId: "services" },
    { href: "#how-it-works", label: "Nasıl Çalışır", anchorId: "how-it-works" },
    { href: "#why-us", label: "Neden Biz", anchorId: "why-us" },
    { href: "#testimonials", label: "Referanslar", anchorId: "testimonials" },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white shadow-md" 
          : "bg-brand-dark/98 backdrop-blur-md"
      }`}
    >
      <div className="container-main">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isScrolled ? "bg-brand-dark" : "bg-brand-lime"
            }`}>
              <svg viewBox="0 0 24 24" className={`w-6 h-6 ${isScrolled ? "text-brand-lime" : "text-brand-dark"}`} fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" stroke="currentColor" fill="none"/>
              </svg>
            </div>
            <span className={`font-heading font-bold text-xl tracking-tight ${
              isScrolled ? "text-brand-dark" : "text-white"
            }`}>
              CHINA<span className={isScrolled ? "text-brand-lime" : "text-brand-lime"}>SOURCE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.anchorId)}
                className={`transition-colors duration-300 font-medium text-sm flex items-center gap-1 ${
                  isScrolled 
                    ? "text-brand-dark/90 hover:text-brand-lime" 
                    : "text-white/95 hover:text-brand-lime"
                }`}
              >
                {link.label}
                <ChevronDown className="w-4 h-4 opacity-50" />
              </a>
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Ara..."
                className={`w-40 h-10 pl-4 pr-10 rounded-lg border text-sm focus:outline-none transition-all duration-300 ${
                  isScrolled 
                    ? "bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-brand-lime" 
                    : "bg-white/10 border-white/10 text-white placeholder:text-white/50 focus:border-brand-lime/50"
                }`}
              />
              <button 
                className={`absolute right-0 top-0 h-10 w-10 flex items-center justify-center rounded-r-lg transition-colors ${
                isScrolled 
                  ? "bg-brand-lime text-brand-dark hover:bg-brand-lime-hover" 
                  : "bg-brand-lime text-brand-dark hover:bg-brand-lime-hover"
                }`}
                aria-label="Ara"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
            
            {/* CTA Button */}
            <Button 
              variant="lime" 
              size="lg" 
              className="gap-2"
              onClick={handleTeklifAlClick}
            >
                Ücretsiz Teklif Al
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              isScrolled 
                ? "text-brand-dark hover:bg-muted" 
                : "text-white hover:bg-white/10"
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`lg:hidden py-6 border-t animate-fade-in ${
            isScrolled ? "border-border" : "border-white/10"
          }`}>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.anchorId)}
                  className={`transition-all duration-300 font-medium py-3 px-4 rounded-lg ${
                    isScrolled 
                      ? "text-brand-dark/90 hover:text-brand-lime hover:bg-muted" 
                      : "text-white/95 hover:text-brand-lime hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <Button 
                variant="lime" 
                size="lg" 
                className="w-full mt-4"
                onClick={handleTeklifAlClick}
              >
                  Ücretsiz Teklif Al
                </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;