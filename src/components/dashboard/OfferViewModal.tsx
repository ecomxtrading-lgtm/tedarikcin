import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Package, X } from "lucide-react";
import { Offer, ProductDetail } from "./PendingOffers";

interface OfferViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: Offer | null;
}

const OfferViewModal = ({ isOpen, onClose, offer }: OfferViewModalProps) => {
  if (!offer) return null;

  const formatNumber = (value: number | null | undefined, unit: string = "") => {
    if (value === null || value === undefined) return "-";
    return `${value} ${unit}`.trim();
  };

  const formatDimensions = (width: number | null | undefined, length: number | null | undefined, height: number | null | undefined, unit: string = "cm") => {
    if (width === null || width === undefined || length === null || length === undefined || height === null || height === undefined) {
      return "-";
    }
    return `${width} x ${length} x ${height} ${unit}`;
  };

  const calculateTotalPrice = (product: ProductDetail, productIndex: number) => {
    const count = product.count || 0;
    const unitPrice = product.unitPrice || 0;
    // Pick-up fee sadece ilk ürün için eklenir (teklif başına bir kez)
    // pick_up_fee products tablosunda, ilk ürünün pick_up_fee'sini kullan
    const pickUpFee = productIndex === 0 ? (product.pickUpFee || offer.pickUpFee || 0) : 0;
    return count * unitPrice + pickUpFee;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-popover">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-lime" />
            Teklif Detayları
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {offer.products.map((product, index) => {
            const totalPrice = calculateTotalPrice(product, index);
            const currency = product.currency || "USD";
            const showPickUpFee = index === 0; // Sadece ilk ürün için göster

            // Debug: product_package kontrolü
            console.log("🔍 Product Package Debug:", {
              productName: product.name,
              productPackage: product.productPackage,
              productPackageType: typeof product.productPackage,
            });

            return (
              <div
                key={product.id || index}
                className="border border-border rounded-xl p-6 bg-muted/30 space-y-4"
              >
                {/* Ürün Adı ve Ek Açıklama */}
                <div className="border-b border-border pb-3 space-y-2">
                  <h3 className="text-lg font-heading font-bold text-foreground">
                    {product.name || `Ürün ${index + 1}`}
                  </h3>
                  {product.explanation && product.explanation.trim() && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {product.explanation}
                    </p>
                  )}
                  {product.extraNotes && product.extraNotes.trim() && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs font-semibold text-foreground mb-1">Ek Notlar:</p>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {product.extraNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Ürün Görselleri */}
                {product.imageUrls && product.imageUrls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {product.imageUrls.map((url, imgIndex) => (
                      <div
                        key={imgIndex}
                        className="relative aspect-square border border-border rounded-lg overflow-hidden bg-muted"
                      >
                        <img
                          src={url}
                          alt={`${product.name} görsel ${imgIndex + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.35em' fill='%23999' font-size='12'%3EGörsel Yok%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Ürün Bilgileri */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Sol Taraf - Ürün Ölçüleri */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">Ürün Ölçüleri:</h4>
                      <span className="text-sm font-medium">
                        {formatDimensions(product.productWidth, product.productLength, product.productHeight, "cm")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Ürün Ağırlığı:</span>
                      <span className="font-medium">
                        {formatNumber(product.productWeight, "kg")}
                      </span>
                    </div>
                  </div>

                  {/* Sağ Taraf - Kutu Ölçüleri */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">Kutu Ölçüleri:</h4>
                      <span className="text-sm font-medium">
                        {formatDimensions(product.boxWidth, product.boxLength, product.boxHeight, "cm")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Kutu Ağırlığı:</span>
                      <span className="font-medium">
                        {formatNumber(product.boxWeight, "kg")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Hacimsel Ağırlık:</span>
                      <span className="font-medium">
                        {formatNumber(product.boxVolumetricWeight, "kg")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fiyat ve Miktar Bilgileri */}
                <div className="grid md:grid-cols-4 gap-4 md:gap-6 pt-4 border-t border-border">
                  {/* 1. Sütun: Toplam Ürün Sayısı ve Kutudaki Ürün Sayısı (Alt Alta) */}
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Toplam Ürün Sayısı:</span>
                      <span className="font-medium">{formatNumber(product.count)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Kutudaki Ürün Sayısı:</span>
                      <span className="font-medium">{formatNumber(product.boxUnits)}</span>
                    </div>
                  </div>

                  {/* 2. Sütun: Toplam Kutu Sayısı ve Ürün Paketi (Alt Alta) */}
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Toplam Kutu Sayısı:</span>
                      <span className="font-medium">{formatNumber(product.boxCount)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Ürün Paketi:</span>
                      <span className="font-medium">{product.productPackage || "-"}</span>
                    </div>
                  </div>

                  {/* 3. Sütun: Ürün Birim Fiyatı ve Pick-up Fee (Alt Alta) */}
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Ürün Birim Fiyatı:</span>
                      <span className="font-medium">
                        {formatNumber(product.unitPrice, currency)}
                      </span>
                    </div>
                    {showPickUpFee && (
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Pick-up Fee:</span>
                        <span className="font-medium">
                          {formatNumber(product.pickUpFee || offer.pickUpFee, currency)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 4. Sütun: Toplam Fiyat (Sağda) */}
                  <div className="flex items-center justify-end md:justify-end">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-1">Toplam Fiyat</div>
                      <div className="text-2xl font-heading font-bold text-brand-lime">
                        {totalPrice.toFixed(2)} {currency}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OfferViewModal;
