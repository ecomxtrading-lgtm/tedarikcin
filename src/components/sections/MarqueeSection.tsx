const MarqueeSection = () => {
  const items = [
    { text: "GLOBAL TEDARİK", outline: false },
    { text: "BREAKING BARRIERS", outline: true },
    { text: "KALİTE GARANTİSİ", outline: false },
    { text: "HIZLI GÖNDERİM", outline: true },
    { text: "7/24 DESTEK", outline: false },
    { text: "GÜVEN", outline: true },
  ];

  return (
    <section className="py-8 bg-background overflow-hidden border-y border-border">
      <div className="relative">
        <div className="flex marquee">
          {/* First set */}
          {items.map((item, index) => (
            <div key={index} className="flex items-center shrink-0">
              <span
                className={`text-4xl md:text-6xl font-heading font-bold px-8 whitespace-nowrap ${
                  item.outline
                    ? "text-transparent bg-clip-text"
                    : "text-brand-dark"
                }`}
                style={item.outline ? {
                  WebkitTextStroke: '2px hsl(var(--brand-dark))',
                } : {}}
              >
                {item.text}
              </span>
              <svg className="w-8 h-8 md:w-12 md:h-12 text-brand-lime mx-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L9 9L2 12L9 15L12 22L15 15L22 12L15 9L12 2Z" />
              </svg>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {items.map((item, index) => (
            <div key={`dup-${index}`} className="flex items-center shrink-0">
              <span
                className={`text-4xl md:text-6xl font-heading font-bold px-8 whitespace-nowrap ${
                  item.outline
                    ? "text-transparent"
                    : "text-brand-dark"
                }`}
                style={item.outline ? {
                  WebkitTextStroke: '2px hsl(var(--brand-dark))',
                } : {}}
              >
                {item.text}
              </span>
              <svg className="w-8 h-8 md:w-12 md:h-12 text-brand-lime mx-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L9 9L2 12L9 15L12 22L15 15L22 12L15 9L12 2Z" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarqueeSection;