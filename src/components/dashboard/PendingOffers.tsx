import { Button } from "@/components/ui/button";
import { Calendar, Hash, Eye, Package } from "lucide-react";
import { ProductFormData } from "./AddProductModal";

export interface ProductDetail {
  id: string;
  name: string;
  explanation: string;
  count: number;
  serviceType: string;
  productWidth?: number | null;
  productLength?: number | null;
  productHeight?: number | null;
  productWeight?: number | null;
  productPackage?: string | null;
  boxWidth?: number | null;
  boxLength?: number | null;
  boxHeight?: number | null;
  boxWeight?: number | null;
  boxVolumetricWeight?: number | null;
  boxUnits?: number | null;
  boxCount?: number | null;
  unitPrice?: number | null;
  currency?: string | null;
  pickUpFee?: number | null;
  extraNotes?: string | null;
  imageUrls: string[];
}

export interface Offer {
  id: string;
  createdAt: Date;
  status: string;
  products: ProductDetail[];
  pickUpFee?: number | null;
}

interface PendingOffersProps {
  offers: Offer[];
  onViewProducts: (offer: Offer) => void;
}

const PendingOffers = ({ offers, onViewProducts }: PendingOffersProps) => {
  if (offers.length === 0) {
    return (
      <div className="bg-popover rounded-2xl border border-border p-8 md:p-12 text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-brand-lime/20 flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-brand-lime" />
        </div>
        <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-2">
          Henüz Bekleyen Teklif Yok
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Ürün ekleyerek teklif almaya başlayın. Teklifleriniz burada listelenecektir.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
      {offers.map((offer) => {
        const normalizedStatus = (offer.status || "").toLowerCase().trim();
        const showPreparing = normalizedStatus === "teklif hazırlanıyor";
        const badgeText = offer.status || "Beklemede";

        return (
          <div
            key={offer.id}
            className="bg-popover rounded-2xl border border-border p-6 hover:shadow-hover transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Left Section - Info */}
              <div className="flex flex-wrap items-center gap-6">
                {/* Offer Number */}
                <div className="flex items-center gap-2 text-brand-lime">
                  <Hash className="w-5 h-5" />
                  <span className="font-heading font-bold text-lg">Teklif #{offer.id.slice(0, 8)}</span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {offer.createdAt.toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Product Count */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="w-4 h-4" />
                  <span className="text-sm">{offer.products.length} ürün</span>
                </div>

                {/* Status Badge */}
                <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold capitalize">
                  {badgeText}
                </div>
              </div>

              {/* Right Section - Button */}
              <Button
                onClick={() => onViewProducts(offer)}
                className="gap-2 bg-brand-lime text-brand-dark border border-brand-lime hover:bg-brand-lime-hover hover:text-brand-dark shrink-0"
              >
                <Eye className="w-4 h-4" />
                {normalizedStatus === "hazır" ? "Teklifi Gör" : "Ürünleri Gör"}
              </Button>
            </div>
            {showPreparing && (
              <p className="mt-3 text-sm text-muted-foreground">
                Uzmanlarımız şu an sizin için en iyi seçenekleri araştırıyor. Sizin için en uygun teklifler
                3 iş günü içinde hazırlanacaktır. Bu süreçte iletişim WhatsApp veya mail yoluyla bize
                ulaşabilirsiniz.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PendingOffers;